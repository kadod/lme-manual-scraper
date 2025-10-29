'use server'

/**
 * Billing and Subscription Server Actions
 * Stripe integration for subscription and payment management
 *
 * Security:
 * - Only organization owners can manage billing
 * - All Stripe operations are server-side only
 * - Customer IDs and subscription IDs are stored securely
 *
 * Features:
 * - Subscription management (create, update, cancel, reactivate)
 * - Payment method management (add, set default, remove)
 * - Usage limit checking and tracking
 * - Invoice management and PDF downloads
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  stripe,
  getPriceIdForPlan,
  createStripeCustomer,
  createCheckoutSession as createStripeCheckoutSession,
  updateSubscriptionPlan,
  cancelSubscriptionAtPeriodEnd,
  reactivateSubscription as reactivateStripeSubscription,
  attachPaymentMethod,
  setDefaultPaymentMethod as setStripeDefaultPaymentMethod,
  detachPaymentMethod,
  listCustomerPaymentMethods,
  listCustomerInvoices,
  getPlanLimits
} from '@/lib/stripe/client'
import type {
  Subscription,
  UsageLimits,
  PaymentMethod,
  Invoice,
  PlanType,
  CreateCheckoutSessionResult,
  ChangePlanParams,
  AddPaymentMethodParams,
  SetDefaultPaymentMethodParams,
  RemovePaymentMethodParams
} from '@/types/billing'

/**
 * Helper: Get current user's organization with role check
 */
async function getUserOrganization(requireOwner: boolean = false) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized: User not authenticated')
  }

  const { data: userOrg, error: userOrgError } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single()

  if (userOrgError || !userOrg) {
    throw new Error('Organization not found')
  }

  if (requireOwner && userOrg.role !== 'owner') {
    throw new Error('Permission denied: Only organization owners can manage billing')
  }

  return { organizationId: userOrg.organization_id, role: userOrg.role, userId: user.id }
}

/**
 * Get current subscription details
 * Accessible by all organization members
 */
export async function getSubscription(): Promise<Subscription | null> {
  const { organizationId } = await getUserOrganization()
  const supabase = await createClient()

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return subscription as Subscription
}

/**
 * Get usage limits and current usage
 * Accessible by all organization members
 */
export async function getUsageLimits(): Promise<UsageLimits | null> {
  const subscription = await getSubscription()

  if (!subscription) {
    return null
  }

  const limits = subscription.limits
  const usage = subscription.usage

  // Calculate remaining and percentages
  const remaining: Record<string, number> = {}
  const percentages: Record<string, number> = {}

  Object.keys(limits).forEach((key) => {
    const limit = limits[key as keyof typeof limits]
    const used = usage[key as keyof typeof usage]

    if (limit === -1) {
      // Unlimited
      remaining[key] = -1
      percentages[key] = 0
    } else {
      remaining[key] = Math.max(0, limit - used)
      percentages[key] = limit > 0 ? (used / limit) * 100 : 0
    }
  })

  return {
    limits,
    usage,
    remaining: remaining as UsageLimits['remaining'],
    percentages: percentages as UsageLimits['percentages']
  }
}

/**
 * Check if resource usage is within limits
 * @param resource - The resource type to check
 * @returns true if resource is available, false if limit exceeded
 */
export async function checkUsageLimit(
  resource: keyof UsageLimits['limits']
): Promise<boolean> {
  const usageLimits = await getUsageLimits()

  if (!usageLimits) {
    return false
  }

  const limit = usageLimits.limits[resource]
  const usage = usageLimits.usage[resource]

  // -1 means unlimited
  if (limit === -1) {
    return true
  }

  return usage < limit
}

/**
 * Create Stripe checkout session for plan upgrade
 * Only accessible by organization owners
 */
export async function createCheckoutSession(params: {
  plan: PlanType
  success_url: string
  cancel_url: string
}): Promise<CreateCheckoutSessionResult> {
  const { organizationId, userId } = await getUserOrganization(true)
  const supabase = await createClient()

  if (params.plan === 'free') {
    throw new Error('Cannot create checkout session for free plan')
  }

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', organizationId)
    .single()

  let customerId = subscription?.stripe_customer_id

  if (!customerId) {
    // Get organization and user details
    const { data: org } = await supabase
      .from('organizations')
      .select('name, contact_email')
      .eq('id', organizationId)
      .single()

    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    // Create Stripe customer
    const customer = await createStripeCustomer({
      email: org?.contact_email || user?.email || '',
      name: org?.name || 'Organization',
      organizationId
    })

    customerId = customer.id

    // Update subscription with customer ID
    await supabase
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('organization_id', organizationId)
  }

  // Get price ID for plan
  const priceId = getPriceIdForPlan(params.plan)

  // Create checkout session
  const session = await createStripeCheckoutSession({
    customerId,
    priceId,
    successUrl: params.success_url,
    cancelUrl: params.cancel_url,
    organizationId
  })

  return {
    sessionId: session.id,
    url: session.url || ''
  }
}

/**
 * Change subscription plan
 * Only accessible by organization owners
 */
export async function changePlan(params: ChangePlanParams): Promise<{ success: boolean }> {
  const { organizationId } = await getUserOrganization(true)
  const supabase = await createClient()

  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (fetchError || !subscription) {
    throw new Error('Subscription not found')
  }

  // Handle downgrade to free
  if (params.plan === 'free') {
    if (subscription.stripe_subscription_id) {
      // Cancel Stripe subscription at period end
      await cancelSubscriptionAtPeriodEnd(subscription.stripe_subscription_id)
    }

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan: params.plan,
        limits: getPlanLimits(params.plan),
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)

    if (updateError) throw updateError
  } else {
    // Upgrade or change paid plan
    if (!subscription.stripe_subscription_id) {
      throw new Error('No active Stripe subscription found')
    }

    const newPriceId = getPriceIdForPlan(params.plan)
    await updateSubscriptionPlan(subscription.stripe_subscription_id, newPriceId)

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan: params.plan,
        limits: getPlanLimits(params.plan),
        stripe_price_id: newPriceId,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)

    if (updateError) throw updateError
  }

  revalidatePath('/dashboard/settings/billing')
  return { success: true }
}

/**
 * Cancel subscription at period end
 * Only accessible by organization owners
 */
export async function cancelSubscription(): Promise<{ success: boolean }> {
  const { organizationId } = await getUserOrganization(true)
  const supabase = await createClient()

  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('organization_id', organizationId)
    .single()

  if (fetchError || !subscription?.stripe_subscription_id) {
    throw new Error('Subscription not found')
  }

  await cancelSubscriptionAtPeriodEnd(subscription.stripe_subscription_id)

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString()
    })
    .eq('organization_id', organizationId)

  if (updateError) throw updateError

  revalidatePath('/dashboard/settings/billing')
  return { success: true }
}

/**
 * Reactivate cancelled subscription
 * Only accessible by organization owners
 */
export async function reactivateSubscription(): Promise<{ success: boolean }> {
  const { organizationId } = await getUserOrganization(true)
  const supabase = await createClient()

  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('organization_id', organizationId)
    .single()

  if (fetchError || !subscription?.stripe_subscription_id) {
    throw new Error('Subscription not found')
  }

  await reactivateStripeSubscription(subscription.stripe_subscription_id)

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: false,
      cancelled_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('organization_id', organizationId)

  if (updateError) throw updateError

  revalidatePath('/dashboard/settings/billing')
  return { success: true }
}

/**
 * Get all payment methods
 * Only accessible by organization owners
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { organizationId } = await getUserOrganization(true)
  const supabase = await createClient()

  const { data: paymentMethods, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }

  return paymentMethods as PaymentMethod[]
}

/**
 * Add new payment method
 * Only accessible by organization owners
 */
export async function addPaymentMethod(
  params: AddPaymentMethodParams
): Promise<{ success: boolean }> {
  const { organizationId } = await getUserOrganization(true)
  const supabase = await createClient()

  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', organizationId)
    .single()

  if (fetchError || !subscription?.stripe_customer_id) {
    throw new Error('Stripe customer not found')
  }

  // Attach payment method to Stripe customer
  const paymentMethod = await attachPaymentMethod(
    params.payment_method_id,
    subscription.stripe_customer_id
  )

  // Save to database
  const { error: insertError } = await supabase
    .from('payment_methods')
    .insert({
      organization_id: organizationId,
      stripe_payment_method_id: params.payment_method_id,
      type: paymentMethod.type as 'card' | 'bank_account',
      card_brand: paymentMethod.card?.brand,
      card_last4: paymentMethod.card?.last4,
      card_exp_month: paymentMethod.card?.exp_month,
      card_exp_year: paymentMethod.card?.exp_year,
      is_default: false
    })

  if (insertError) throw insertError

  revalidatePath('/dashboard/settings/billing')
  return { success: true }
}

/**
 * Set default payment method
 * Only accessible by organization owners
 */
export async function setDefaultPaymentMethod(
  params: SetDefaultPaymentMethodParams
): Promise<{ success: boolean }> {
  const { organizationId } = await getUserOrganization(true)
  const supabase = await createClient()

  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', organizationId)
    .single()

  if (fetchError || !subscription?.stripe_customer_id) {
    throw new Error('Stripe customer not found')
  }

  // Set default in Stripe
  await setStripeDefaultPaymentMethod(
    subscription.stripe_customer_id,
    params.payment_method_id
  )

  // Update all payment methods to not default
  await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('organization_id', organizationId)

  // Set the selected one as default
  const { error: updateError } = await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('stripe_payment_method_id', params.payment_method_id)
    .eq('organization_id', organizationId)

  if (updateError) throw updateError

  revalidatePath('/dashboard/settings/billing')
  return { success: true }
}

/**
 * Remove payment method
 * Only accessible by organization owners
 */
export async function removePaymentMethod(
  params: RemovePaymentMethodParams
): Promise<{ success: boolean }> {
  const { organizationId } = await getUserOrganization(true)
  const supabase = await createClient()

  // Check if it's the default payment method
  const { data: paymentMethod } = await supabase
    .from('payment_methods')
    .select('is_default')
    .eq('stripe_payment_method_id', params.payment_method_id)
    .eq('organization_id', organizationId)
    .single()

  if (paymentMethod?.is_default) {
    throw new Error('Cannot remove default payment method. Set another as default first.')
  }

  // Detach from Stripe
  await detachPaymentMethod(params.payment_method_id)

  // Delete from database
  const { error: deleteError } = await supabase
    .from('payment_methods')
    .delete()
    .eq('stripe_payment_method_id', params.payment_method_id)
    .eq('organization_id', organizationId)

  if (deleteError) throw deleteError

  revalidatePath('/dashboard/settings/billing')
  return { success: true }
}

/**
 * Get invoices
 * Accessible by all organization members
 */
export async function getInvoices(): Promise<Invoice[]> {
  const { organizationId } = await getUserOrganization()
  const supabase = await createClient()

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('organization_id', organizationId)
    .order('period_start', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return invoices as Invoice[]
}

/**
 * Download invoice PDF
 * Accessible by all organization members
 */
export async function downloadInvoice(invoiceId: string): Promise<string | null> {
  const { organizationId } = await getUserOrganization()
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('stripe_invoice_id, invoice_pdf_url')
    .eq('id', invoiceId)
    .eq('organization_id', organizationId)
    .single()

  if (error || !invoice) {
    throw new Error('Invoice not found')
  }

  // Return cached PDF URL if available
  if (invoice.invoice_pdf_url) {
    return invoice.invoice_pdf_url
  }

  // Fetch from Stripe if not cached
  if (invoice.stripe_invoice_id) {
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id)
    const pdfUrl = stripeInvoice.invoice_pdf

    // Update cache
    if (pdfUrl) {
      await supabase
        .from('invoices')
        .update({ invoice_pdf_url: pdfUrl })
        .eq('id', invoiceId)
    }

    return pdfUrl || null
  }

  return null
}

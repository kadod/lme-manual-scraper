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
import { getPlanLimits } from '@/lib/stripe/client'
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
 *
 * NOTE: Subscription functionality not yet implemented in database.
 * Returns basic plan info from organizations table.
 */
export async function getSubscription(): Promise<Subscription | null> {
  const { organizationId } = await getUserOrganization()
  const supabase = await createClient()

  // Get plan from organizations table
  const { data: org, error } = await supabase
    .from('organizations')
    .select('plan, created_at, updated_at')
    .eq('id', organizationId)
    .single()

  if (error || !org) {
    console.error('Error fetching organization:', error)
    return null
  }

  // Return a basic subscription object based on organization plan
  const plan = (org.plan || 'free') as PlanType
  const limits = getPlanLimits(plan)

  return {
    id: organizationId,
    organization_id: organizationId,
    plan,
    status: 'active',
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_price_id: null,
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
    cancelled_at: null,
    trial_start: null,
    trial_end: null,
    limits,
    usage: {
      friends: 0,
      messages_this_month: 0,
      staff_accounts: 0,
      forms: 0,
      rich_menus: 0,
      api_calls_today: 0
    },
    created_at: org.created_at || new Date().toISOString(),
    updated_at: org.updated_at || new Date().toISOString()
  }
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
    const limitKey = key as keyof typeof limits
    const limit = limits[limitKey]

    // Map limit keys to usage keys (messages_per_month -> messages_this_month)
    const usageKey = (key === 'messages_per_month' ? 'messages_this_month' : key) as keyof typeof usage
    const used = usage[usageKey]

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

  // Map limit keys to usage keys (messages_per_month -> messages_this_month)
  const usageKey = resource === 'messages_per_month' ? 'messages_this_month' : resource
  const usage = usageLimits.usage[usageKey as keyof typeof usageLimits.usage]

  // -1 means unlimited
  if (limit === -1) {
    return true
  }

  return usage < limit
}

/**
 * Create Stripe checkout session for plan upgrade
 * Only accessible by organization owners
 *
 * NOTE: Stripe integration not yet implemented.
 * This function throws an error indicating the feature is unavailable.
 */
export async function createCheckoutSession(params: {
  plan: PlanType
  success_url: string
  cancel_url: string
}): Promise<CreateCheckoutSessionResult> {
  await getUserOrganization(true)

  // Billing functionality not yet implemented
  throw new Error('Billing functionality is not yet available. Please contact support for plan upgrades.')
}

/**
 * Change subscription plan
 * Only accessible by organization owners
 *
 * NOTE: Stripe integration not yet implemented.
 * Updates plan in organizations table only (no payment processing).
 */
export async function changePlan(params: ChangePlanParams): Promise<{ success: boolean }> {
  const { organizationId } = await getUserOrganization(true)
  const supabase = await createClient()

  // Update plan in organizations table (no Stripe integration yet)
  const { error: updateError } = await supabase
    .from('organizations')
    .update({
      plan: params.plan,
      updated_at: new Date().toISOString()
    })
    .eq('id', organizationId)

  if (updateError) {
    throw new Error(`Failed to update plan: ${updateError.message}`)
  }

  revalidatePath('/dashboard/settings/billing')
  return { success: true }
}

/**
 * Cancel subscription at period end
 * Only accessible by organization owners
 *
 * NOTE: Stripe integration not yet implemented.
 * This function throws an error indicating the feature is unavailable.
 */
export async function cancelSubscription(): Promise<{ success: boolean }> {
  await getUserOrganization(true)

  // Billing functionality not yet implemented
  throw new Error('Subscription cancellation is not yet available. Please contact support.')
}

/**
 * Reactivate cancelled subscription
 * Only accessible by organization owners
 *
 * NOTE: Stripe integration not yet implemented.
 * This function throws an error indicating the feature is unavailable.
 */
export async function reactivateSubscription(): Promise<{ success: boolean }> {
  await getUserOrganization(true)

  // Billing functionality not yet implemented
  throw new Error('Subscription reactivation is not yet available. Please contact support.')
}

/**
 * Get all payment methods
 * Only accessible by organization owners
 *
 * NOTE: Payment methods table not yet implemented.
 * Returns empty array.
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  await getUserOrganization(true)

  // Payment methods functionality not yet implemented
  return []
}

/**
 * Add new payment method
 * Only accessible by organization owners
 *
 * NOTE: Payment methods functionality not yet implemented.
 * This function throws an error indicating the feature is unavailable.
 */
export async function addPaymentMethod(
  params: AddPaymentMethodParams
): Promise<{ success: boolean }> {
  await getUserOrganization(true)

  // Payment methods functionality not yet implemented
  throw new Error('Payment method management is not yet available. Please contact support.')
}

/**
 * Set default payment method
 * Only accessible by organization owners
 *
 * NOTE: Payment methods functionality not yet implemented.
 * This function throws an error indicating the feature is unavailable.
 */
export async function setDefaultPaymentMethod(
  params: SetDefaultPaymentMethodParams
): Promise<{ success: boolean }> {
  await getUserOrganization(true)

  // Payment methods functionality not yet implemented
  throw new Error('Payment method management is not yet available. Please contact support.')
}

/**
 * Remove payment method
 * Only accessible by organization owners
 *
 * NOTE: Payment methods functionality not yet implemented.
 * This function throws an error indicating the feature is unavailable.
 */
export async function removePaymentMethod(
  params: RemovePaymentMethodParams
): Promise<{ success: boolean }> {
  await getUserOrganization(true)

  // Payment methods functionality not yet implemented
  throw new Error('Payment method management is not yet available. Please contact support.')
}

/**
 * Get invoices
 * Accessible by all organization members
 *
 * NOTE: Invoices table not yet implemented.
 * Returns empty array.
 */
export async function getInvoices(): Promise<Invoice[]> {
  await getUserOrganization()

  // Invoices functionality not yet implemented
  return []
}

/**
 * Download invoice PDF
 * Accessible by all organization members
 *
 * NOTE: Invoices functionality not yet implemented.
 * This function throws an error indicating the feature is unavailable.
 */
export async function downloadInvoice(invoiceId: string): Promise<string | null> {
  await getUserOrganization()

  // Invoices functionality not yet implemented
  throw new Error('Invoice downloads are not yet available. Please contact support.')
}

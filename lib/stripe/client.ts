/**
 * Stripe Client Configuration
 * Server-side Stripe SDK initialization and helper functions
 */

import Stripe from 'stripe'
import { PlanType } from '@/types/billing'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

// Initialize Stripe client with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true
})

/**
 * Get Stripe Price ID for a plan
 */
export function getPriceIdForPlan(plan: PlanType): string {
  const priceIds: Record<PlanType, string> = {
    free: '', // Free plan doesn't have a Stripe price
    pro: process.env.STRIPE_PRO_PRICE_ID || '',
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || ''
  }

  const priceId = priceIds[plan]
  if (!priceId && plan !== 'free') {
    throw new Error(`Price ID not found for plan: ${plan}`)
  }

  return priceId
}

/**
 * Create a Stripe customer
 */
export async function createStripeCustomer(params: {
  email: string
  name: string
  organizationId: string
}): Promise<Stripe.Customer> {
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      organization_id: params.organizationId
    }
  })

  return customer
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  organizationId: string
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1
      }
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      organization_id: params.organizationId
    },
    subscription_data: {
      metadata: {
        organization_id: params.organizationId
      },
      trial_period_days: 14 // 14-day trial
    }
  })

  return session
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const updatedSubscription = await stripe.subscriptions.update(
    subscriptionId,
    {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId
        }
      ],
      proration_behavior: 'create_prorations'
    }
  )

  return updatedSubscription
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscriptionAtPeriodEnd(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  })

  return subscription
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false
  })

  return subscription
}

/**
 * Attach payment method to customer
 */
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> {
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId
  })

  return paymentMethod
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> {
  const customer = await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId
    }
  })

  return customer
}

/**
 * Detach payment method
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)

  return paymentMethod
}

/**
 * List customer payment methods
 */
export async function listCustomerPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card'
  })

  return paymentMethods.data
}

/**
 * List customer invoices
 */
export async function listCustomerInvoices(
  customerId: string,
  limit: number = 12
): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit
  })

  return invoices.data
}

/**
 * Get invoice
 */
export async function getInvoice(
  invoiceId: string
): Promise<Stripe.Invoice> {
  const invoice = await stripe.invoices.retrieve(invoiceId)

  return invoice
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

/**
 * Format amount for display (Stripe uses smallest currency unit)
 */
export function formatAmount(amount: number, currency: string = 'jpy'): string {
  const formatter = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency.toUpperCase()
  })

  // JPY doesn't use decimal places
  if (currency.toLowerCase() === 'jpy') {
    return formatter.format(amount)
  }

  // Other currencies divide by 100
  return formatter.format(amount / 100)
}

/**
 * Get plan limits by plan type
 */
export function getPlanLimits(plan: PlanType) {
  const limits = {
    free: {
      friends: 1000,
      messages_per_month: 5000,
      staff_accounts: 3,
      forms: 10,
      rich_menus: 5,
      api_calls_per_day: 1000
    },
    pro: {
      friends: 10000,
      messages_per_month: 50000,
      staff_accounts: 10,
      forms: -1, // unlimited
      rich_menus: -1, // unlimited
      api_calls_per_day: 10000
    },
    enterprise: {
      friends: -1, // unlimited
      messages_per_month: -1, // unlimited
      staff_accounts: -1, // unlimited
      forms: -1, // unlimited
      rich_menus: -1, // unlimited
      api_calls_per_day: -1 // unlimited
    }
  }

  return limits[plan]
}

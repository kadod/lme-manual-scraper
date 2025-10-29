import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-10-28.acacia' as any,
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

interface SubscriptionUpdateData {
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  updated_at: string
}

interface InvoiceInsertData {
  stripe_invoice_id: string
  organization_id: string
  amount_total: number
  amount_subtotal: number
  amount_tax: number
  status: string
  paid: boolean
  paid_at: string | null
  period_start: string
  period_end: string
  invoice_pdf_url: string | null
  currency: string
}

serve(async (req) => {
  // Verify request method
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.text()

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log('Stripe webhook event received:', event.type)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabase, event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(supabase, event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, event.data.object as Stripe.Invoice)
        break

      case 'payment_method.attached':
        await handlePaymentMethodAttached(supabase, event.data.object as Stripe.PaymentMethod)
        break

      case 'payment_method.detached':
        await handlePaymentMethodDetached(supabase, event.data.object as Stripe.PaymentMethod)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(
      JSON.stringify({ received: true, event_type: event.type }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Webhook processing error:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

async function handleSubscriptionUpdate(
  supabase: any,
  subscription: Stripe.Subscription
) {
  console.log('Handling subscription update:', subscription.id)

  const updateData: SubscriptionUpdateData = {
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }

  console.log('Subscription updated successfully')
}

async function handleSubscriptionDeleted(
  supabase: any,
  subscription: Stripe.Subscription
) {
  console.log('Handling subscription deletion:', subscription.id)

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error deleting subscription:', error)
    throw error
  }

  console.log('Subscription marked as cancelled')
}

async function handleInvoicePaid(supabase: any, invoice: Stripe.Invoice) {
  console.log('Handling invoice paid:', invoice.id)

  const organizationId = await getOrgIdFromCustomer(
    supabase,
    invoice.customer as string
  )

  if (!organizationId) {
    console.error('Organization not found for customer:', invoice.customer)
    throw new Error('Organization not found')
  }

  const insertData: InvoiceInsertData = {
    stripe_invoice_id: invoice.id,
    organization_id: organizationId,
    amount_total: invoice.amount_paid,
    amount_subtotal: invoice.subtotal || 0,
    amount_tax: invoice.tax || 0,
    status: 'paid',
    paid: true,
    paid_at: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : null,
    period_start: new Date(invoice.period_start! * 1000).toISOString(),
    period_end: new Date(invoice.period_end! * 1000).toISOString(),
    invoice_pdf_url: invoice.invoice_pdf || null,
    currency: invoice.currency || 'jpy',
  }

  const { error } = await supabase
    .from('invoices')
    .upsert(insertData, {
      onConflict: 'stripe_invoice_id',
    })

  if (error) {
    console.error('Error upserting invoice:', error)
    throw error
  }

  console.log('Invoice saved successfully')
}

async function handleInvoicePaymentFailed(
  supabase: any,
  invoice: Stripe.Invoice
) {
  console.log('Handling invoice payment failed:', invoice.id)

  const organizationId = await getOrgIdFromCustomer(
    supabase,
    invoice.customer as string
  )

  if (!organizationId) {
    console.error('Organization not found for customer:', invoice.customer)
    return
  }

  // Update subscription status to past_due
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', invoice.customer)

  if (subError) {
    console.error('Error updating subscription status:', subError)
  }

  // Update invoice status
  const { error: invError } = await supabase
    .from('invoices')
    .update({
      status: 'uncollectible',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id)

  if (invError) {
    console.error('Error updating invoice status:', invError)
  }

  console.log('Invoice payment failure handled')
}

async function handlePaymentMethodAttached(
  supabase: any,
  paymentMethod: Stripe.PaymentMethod
) {
  console.log('Handling payment method attached:', paymentMethod.id)

  if (!paymentMethod.customer) {
    console.log('Payment method not attached to customer yet')
    return
  }

  const organizationId = await getOrgIdFromCustomer(
    supabase,
    paymentMethod.customer as string
  )

  if (!organizationId) {
    console.error('Organization not found for customer:', paymentMethod.customer)
    return
  }

  const insertData = {
    organization_id: organizationId,
    stripe_payment_method_id: paymentMethod.id,
    type: paymentMethod.type,
    card_brand: paymentMethod.card?.brand || null,
    card_last4: paymentMethod.card?.last4 || null,
    card_exp_month: paymentMethod.card?.exp_month || null,
    card_exp_year: paymentMethod.card?.exp_year || null,
    is_default: false,
  }

  const { error } = await supabase
    .from('payment_methods')
    .upsert(insertData, {
      onConflict: 'stripe_payment_method_id',
    })

  if (error) {
    console.error('Error saving payment method:', error)
    throw error
  }

  console.log('Payment method saved successfully')
}

async function handlePaymentMethodDetached(
  supabase: any,
  paymentMethod: Stripe.PaymentMethod
) {
  console.log('Handling payment method detached:', paymentMethod.id)

  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('stripe_payment_method_id', paymentMethod.id)

  if (error) {
    console.error('Error deleting payment method:', error)
    throw error
  }

  console.log('Payment method deleted successfully')
}

async function getOrgIdFromCustomer(
  supabase: any,
  customerId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('organization_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (error) {
    console.error('Error fetching organization ID:', error)
    return null
  }

  return data?.organization_id || null
}

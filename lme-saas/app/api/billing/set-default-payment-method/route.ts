import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentMethodId } = await request.json()

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID required' }, { status: 400 })
    }

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!userOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get payment method details
    const { data: paymentMethod } = await supabase
      .from('payment_methods')
      .select('stripe_payment_method_id')
      .eq('id', paymentMethodId)
      .eq('organization_id', userOrg.organization_id)
      .single()

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', userOrg.organization_id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 })
    }

    // Update default payment method in Stripe
    await stripe.customers.update(subscription.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethod.stripe_payment_method_id,
      },
    })

    // Update database - set all to false first
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('organization_id', userOrg.organization_id)

    // Set selected as default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)

    if (error) {
      console.error('Failed to set default payment method:', error)
      return NextResponse.json({ error: 'Failed to set default payment method' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Set default payment method API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

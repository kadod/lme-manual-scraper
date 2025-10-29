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

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', userOrg.organization_id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 })
    }

    // Attach payment method to customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: subscription.stripe_customer_id,
    })

    // Check if this is the first payment method
    const { data: existingMethods } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('organization_id', userOrg.organization_id)

    const isFirst = !existingMethods || existingMethods.length === 0

    // Save to database
    const { error } = await supabase
      .from('payment_methods')
      .insert({
        organization_id: userOrg.organization_id,
        stripe_payment_method_id: paymentMethodId,
        type: paymentMethod.type,
        card_brand: paymentMethod.card?.brand,
        card_last4: paymentMethod.card?.last4,
        card_exp_month: paymentMethod.card?.exp_month,
        card_exp_year: paymentMethod.card?.exp_year,
        is_default: isFirst, // Set as default if it's the first method
      })

    if (error) {
      console.error('Failed to save payment method:', error)
      return NextResponse.json({ error: 'Failed to save payment method' }, { status: 500 })
    }

    // Set as default in Stripe if it's the first method
    if (isFirst) {
      await stripe.customers.update(subscription.stripe_customer_id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Add payment method API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

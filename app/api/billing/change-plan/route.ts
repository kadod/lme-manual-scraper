import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single()

    if (!userOrg || userOrg.role !== 'owner') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', userOrg.organization_id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Update Stripe subscription if exists
    if (subscription.stripe_subscription_id && plan !== 'free') {
      const priceId = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS].priceId

      if (!priceId) {
        return NextResponse.json({ error: 'Invalid price configuration' }, { status: 500 })
      }

      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        items: [{
          id: subscription.stripe_price_id,
          price: priceId,
        }],
        proration_behavior: 'create_prorations',
      })
    }

    // Update database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', userOrg.organization_id)

    if (error) {
      console.error('Failed to update subscription:', error)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change plan API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

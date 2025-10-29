import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const paymentMethodId = params.id

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!userOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get payment method
    const { data: paymentMethod } = await supabase
      .from('payment_methods')
      .select('stripe_payment_method_id, is_default')
      .eq('id', paymentMethodId)
      .eq('organization_id', userOrg.organization_id)
      .single()

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    // Don't allow deleting default payment method if there are others
    if (paymentMethod.is_default) {
      const { data: otherMethods } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('organization_id', userOrg.organization_id)
        .neq('id', paymentMethodId)

      if (otherMethods && otherMethods.length > 0) {
        return NextResponse.json(
          { error: 'Cannot delete default payment method. Set another method as default first.' },
          { status: 400 }
        )
      }
    }

    // Detach from Stripe
    try {
      await stripe.paymentMethods.detach(paymentMethod.stripe_payment_method_id)
    } catch (stripeError) {
      console.error('Stripe detach error:', stripeError)
      // Continue even if Stripe fails
    }

    // Delete from database
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)

    if (error) {
      console.error('Failed to delete payment method:', error)
      return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete payment method API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

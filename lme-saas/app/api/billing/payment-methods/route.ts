import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Get payment methods
    const { data: paymentMethods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('organization_id', userOrg.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch payment methods:', error)
      return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 })
    }

    // Format payment methods
    const formattedMethods = paymentMethods.map(method => ({
      id: method.id,
      type: method.type,
      cardBrand: method.card_brand,
      cardLast4: method.card_last4,
      cardExpMonth: method.card_exp_month,
      cardExpYear: method.card_exp_year,
      bankName: method.bank_name,
      bankLast4: method.bank_last4,
      isDefault: method.is_default,
    }))

    return NextResponse.json(formattedMethods)
  } catch (error) {
    console.error('Payment methods API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

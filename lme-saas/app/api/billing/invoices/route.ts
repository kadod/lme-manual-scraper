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

    // Get invoices
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', userOrg.organization_id)
      .order('period_start', { ascending: false })
      .limit(12)

    if (error) {
      console.error('Failed to fetch invoices:', error)
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }

    // Format invoices
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
      amountTotal: invoice.amount_total,
      status: invoice.status,
      paid: invoice.paid,
      paidAt: invoice.paid_at,
      invoicePdfUrl: invoice.invoice_pdf_url,
    }))

    return NextResponse.json(formattedInvoices)
  } catch (error) {
    console.error('Invoices API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// TODO: Implement payment_methods table in database schema
// This endpoint requires: payment_methods table
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  return NextResponse.json(
    { error: 'Payment method management requires database schema migration. Please create the payment_methods table first.' },
    { status: 501 }
  )
}

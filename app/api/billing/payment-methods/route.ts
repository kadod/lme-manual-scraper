import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// TODO: Implement payment_methods table in database schema
// This endpoint requires: payment_methods table
export async function GET() {
  return NextResponse.json(
    { error: 'Payment method management requires database schema migration. Please create the payment_methods table first.' },
    { status: 501 }
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// TODO: Implement subscription and payment_methods tables in database schema
// This endpoint requires: subscriptions, payment_methods tables
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Payment method management requires database schema migration. Please create the subscriptions and payment_methods tables first.' },
    { status: 501 }
  )
}

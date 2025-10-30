import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// TODO: Implement subscriptions table in database schema
// This endpoint requires: subscriptions table
export async function POST() {
  return NextResponse.json(
    { error: 'Payment setup requires database schema migration. Please create the subscriptions table first.' },
    { status: 501 }
  )
}

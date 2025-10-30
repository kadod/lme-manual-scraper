import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'

// TODO: Implement subscriptions table in database schema
// This endpoint requires: subscriptions table
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Plan management requires database schema migration. Please create the subscriptions table first.' },
    { status: 501 }
  )
}

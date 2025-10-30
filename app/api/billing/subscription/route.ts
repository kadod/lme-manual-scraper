import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// TODO: Implement subscriptions table in database schema
// This endpoint requires: subscriptions table
export async function GET() {
  return NextResponse.json(
    { error: 'Subscription management requires database schema migration. Please create the subscriptions table first.' },
    { status: 501 }
  )
}

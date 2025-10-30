import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// TODO: Implement invoices table in database schema
// This endpoint requires: invoices table
export async function GET() {
  return NextResponse.json(
    { error: 'Invoice management requires database schema migration. Please create the invoices table first.' },
    { status: 501 }
  )
}

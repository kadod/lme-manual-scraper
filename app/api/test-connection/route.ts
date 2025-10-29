import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get connection status
    const connectionStatus = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      status: 'connected'
    }

    // Try to execute a raw SQL query to list tables
    const { data: tablesData, error: tablesError } = await supabase.rpc('get_tables')

    // If RPC doesn't exist, try listing from common table names
    // Check if there are any tables by trying common ones
    const testTables = ['users', 'profiles', 'manuals', 'categories', 'subscriptions']
    const existingTables = []

    for (const tableName of testTables) {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0)

      if (!error) {
        existingTables.push(tableName)
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection successful',
      connection: connectionStatus,
      tablesError: tablesError?.message || null,
      existingTables: existingTables.length > 0 ? existingTables : 'No tables found from test list',
      note: 'Connection verified. If no tables found, database may be empty or use different naming.'
    })
  } catch (err) {
    console.error('Supabase connection error:', err)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to Supabase',
        error: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

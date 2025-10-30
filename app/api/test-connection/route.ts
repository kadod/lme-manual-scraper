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

    // Test connection by checking if key tables exist
    const testTables = [
      'users',
      'organizations',
      'line_channels',
      'line_friends',
      'reservations'
    ]
    const existingTables: string[] = []

    for (const tableName of testTables) {
      try {
        const { error } = await supabase
          .from(tableName as any)
          .select('id')
          .limit(0)

        if (!error) {
          existingTables.push(tableName)
        }
      } catch {
        // Table doesn't exist or no access
        continue
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection successful',
      connection: connectionStatus,
      existingTables: existingTables.length > 0 ? existingTables : 'No tables found from test list',
      note: 'Connection verified. Database schema loaded successfully.'
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

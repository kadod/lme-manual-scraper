import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface ExpiredInvitation {
  id: string
  email: string
  organization_id: string
  expires_at: string
}

serve(async (req) => {
  try {
    console.log('Starting cleanup of expired invitations...')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date().toISOString()

    // Find all pending invitations that have expired
    const { data: expired, error: selectError } = await supabase
      .from('invitations')
      .select('id, email, organization_id, expires_at')
      .eq('status', 'pending')
      .lt('expires_at', now)

    if (selectError) {
      console.error('Error selecting expired invitations:', selectError)
      throw selectError
    }

    const expiredCount = expired?.length || 0
    console.log(`Found ${expiredCount} expired invitations`)

    if (expiredCount > 0) {
      // Mark invitations as expired
      const expiredIds = expired!.map((inv: ExpiredInvitation) => inv.id)

      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'expired',
          updated_at: now,
        })
        .in('id', expiredIds)

      if (updateError) {
        console.error('Error updating invitations:', updateError)
        throw updateError
      }

      // Log details of expired invitations
      expired!.forEach((inv: ExpiredInvitation) => {
        console.log(
          `Expired invitation: ${inv.id} (email: ${inv.email}, org: ${inv.organization_id}, expired at: ${inv.expires_at})`
        )
      })

      console.log(`Successfully marked ${expiredCount} invitations as expired`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired_count: expiredCount,
        timestamp: now,
        message: `Processed ${expiredCount} expired invitations`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Cleanup error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})

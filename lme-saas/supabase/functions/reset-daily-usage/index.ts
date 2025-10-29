import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface Subscription {
  id: string
  organization_id: string
  usage: {
    friends?: number
    messages_this_month?: number
    staff_accounts?: number
    forms?: number
    rich_menus?: number
    api_calls_today?: number
  }
}

serve(async (req) => {
  try {
    console.log('Starting daily usage reset...')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date().toISOString()

    // Get all active subscriptions
    const { data: subscriptions, error: selectError } = await supabase
      .from('subscriptions')
      .select('id, organization_id, usage')
      .in('status', ['active', 'trialing', 'past_due'])

    if (selectError) {
      console.error('Error selecting subscriptions:', selectError)
      throw selectError
    }

    const subscriptionCount = subscriptions?.length || 0
    console.log(`Found ${subscriptionCount} active subscriptions`)

    if (subscriptionCount > 0) {
      let resetCount = 0

      // Reset api_calls_today counter for each subscription
      for (const sub of subscriptions!) {
        const currentUsage = (sub as Subscription).usage || {}

        // Only reset api_calls_today, keep other counters
        const updatedUsage = {
          ...currentUsage,
          api_calls_today: 0,
        }

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            usage: updatedUsage,
            updated_at: now,
          })
          .eq('id', (sub as Subscription).id)

        if (updateError) {
          console.error(
            `Error updating subscription ${(sub as Subscription).id}:`,
            updateError
          )
          continue
        }

        resetCount++
        console.log(
          `Reset daily usage for subscription: ${(sub as Subscription).id} (org: ${(sub as Subscription).organization_id})`
        )
      }

      console.log(
        `Successfully reset daily usage for ${resetCount}/${subscriptionCount} subscriptions`
      )

      return new Response(
        JSON.stringify({
          success: true,
          total_subscriptions: subscriptionCount,
          reset_count: resetCount,
          timestamp: now,
          message: `Reset daily usage counters for ${resetCount} subscriptions`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_subscriptions: 0,
        reset_count: 0,
        timestamp: now,
        message: 'No active subscriptions found',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Reset error:', error)

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

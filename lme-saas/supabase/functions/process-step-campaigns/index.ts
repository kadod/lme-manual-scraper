import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message'

interface StepCampaignLog {
  id: string
  step_campaign_id: string
  line_friend_id: string
  current_step_number: number
  status: string
  next_send_at: string
  step_campaigns: {
    id: string
    line_channel_id: string
    line_channels: {
      channel_access_token: string
    }
  }
  line_friends: {
    line_user_id: string
  }
}

interface CampaignStep {
  id: string
  step_campaign_id: string
  step_number: number
  name: string
  delay_value: number
  delay_unit: 'minutes' | 'hours' | 'days'
  message_type: string
  message_content: Record<string, unknown>
  condition?: Record<string, unknown>
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    console.log('Starting step campaign processing...')

    // Get all logs that need to be processed
    const { data: logs, error: logsError } = await supabase
      .from('step_campaign_logs')
      .select(`
        *,
        step_campaigns (
          id,
          line_channel_id,
          line_channels (
            channel_access_token
          )
        ),
        line_friends (
          line_user_id
        )
      `)
      .eq('status', 'active')
      .lte('next_send_at', new Date().toISOString())
      .limit(100) // Process max 100 at a time

    if (logsError) {
      console.error('Error fetching logs:', logsError)
      throw logsError
    }

    if (!logs || logs.length === 0) {
      console.log('No logs to process')
      return new Response(
        JSON.stringify({ success: true, processedCount: 0, message: 'No logs to process' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log(`Processing ${logs.length} logs...`)

    let processedCount = 0
    let errorCount = 0

    for (const log of logs as unknown as StepCampaignLog[]) {
      try {
        // Get next step
        const nextStepNumber = log.current_step_number + 1

        const { data: nextStep, error: stepError } = await supabase
          .from('step_campaign_steps')
          .select('*')
          .eq('step_campaign_id', log.step_campaign_id)
          .eq('step_number', nextStepNumber)
          .single()

        if (stepError || !nextStep) {
          // No more steps - mark as completed
          console.log(`Campaign completed for log ${log.id}`)
          await supabase
            .from('step_campaign_logs')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', log.id)

          // Update campaign statistics
          await supabase.rpc('update_campaign_stats', {
            campaign_id: log.step_campaign_id,
          })

          processedCount++
          continue
        }

        const step = nextStep as unknown as CampaignStep

        // Check conditions if any
        if (step.condition) {
          // TODO: Implement condition checking
          console.log(`Checking conditions for step ${step.step_number}`)
        }

        // Send message via LINE API
        const accessToken = log.step_campaigns.line_channels.channel_access_token
        const lineUserId = log.line_friends.line_user_id

        const response = await fetch(`${LINE_MESSAGING_API}/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            to: lineUserId,
            messages: [step.message_content],
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error(`LINE API error for log ${log.id}:`, errorData)
          errorCount++
          continue
        }

        console.log(`Message sent successfully for log ${log.id}, step ${step.step_number}`)

        // Calculate next send time
        const nextSendAt = new Date()
        if (step.delay_unit === 'minutes') {
          nextSendAt.setMinutes(nextSendAt.getMinutes() + step.delay_value)
        } else if (step.delay_unit === 'hours') {
          nextSendAt.setHours(nextSendAt.getHours() + step.delay_value)
        } else if (step.delay_unit === 'days') {
          nextSendAt.setDate(nextSendAt.getDate() + step.delay_value)
        }

        // Update log with next step
        const { error: updateError } = await supabase
          .from('step_campaign_logs')
          .update({
            current_step_number: nextStepNumber,
            next_send_at: nextSendAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', log.id)

        if (updateError) {
          console.error(`Error updating log ${log.id}:`, updateError)
          errorCount++
          continue
        }

        processedCount++

      } catch (error) {
        console.error(`Error processing log ${log.id}:`, error)
        errorCount++
      }
    }

    console.log(`Processing complete. Processed: ${processedCount}, Errors: ${errorCount}`)

    return new Response(
      JSON.stringify({
        success: true,
        processedCount,
        errorCount,
        totalLogs: logs.length,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

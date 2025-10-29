/**
 * Edge Function: timeout-inactive-conversations
 * Automatically timeout inactive scenario conversations
 * Runs every 10 minutes via cron job
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Validate cron secret for security
    const authHeader = req.headers.get('authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Starting timeout-inactive-conversations cron job');

    // Find active conversations with their scenario timeout settings
    const { data: activeConversations, error: fetchError } = await supabase
      .from('active_conversations')
      .select(
        `
        id,
        friend_id,
        scenario_id,
        last_interaction_at,
        scenarios:scenario_id (
          id,
          timeout_minutes
        )
      `
      )
      .eq('status', 'active');

    if (fetchError) {
      throw fetchError;
    }

    if (!activeConversations || activeConversations.length === 0) {
      console.log('No active conversations to process');
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          timedout: 0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${activeConversations.length} active conversations`);

    let timedoutCount = 0;
    const now = new Date();

    // Process each conversation
    for (const conversation of activeConversations) {
      const scenario = conversation.scenarios;
      if (!scenario) continue;

      const lastInteractionAt = new Date(conversation.last_interaction_at);
      const timeoutMinutes = scenario.timeout_minutes || 30;
      const timeoutThreshold = new Date(
        lastInteractionAt.getTime() + timeoutMinutes * 60 * 1000
      );

      // Check if conversation has timed out
      if (now > timeoutThreshold) {
        console.log(
          `Timing out conversation ${conversation.id} (inactive for ${timeoutMinutes} minutes)`
        );

        // Update conversation status to timeout
        const { error: updateError } = await supabase
          .from('active_conversations')
          .update({
            status: 'timeout',
            completed_at: now.toISOString(),
          })
          .eq('id', conversation.id);

        if (updateError) {
          console.error(
            `Error timing out conversation ${conversation.id}:`,
            updateError
          );
          continue;
        }

        // Update scenario statistics
        await supabase
          .from('scenarios')
          .update({
            total_abandoned: supabase.raw('total_abandoned + 1'),
          })
          .eq('id', scenario.id);

        timedoutCount++;
      }
    }

    console.log(
      `Timeout processing complete: ${timedoutCount} conversations timed out`
    );

    return new Response(
      JSON.stringify({
        success: true,
        processed: activeConversations.length,
        timedout: timedoutCount,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in timeout-inactive-conversations:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

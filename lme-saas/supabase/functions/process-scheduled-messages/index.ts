/**
 * Edge Function: process-scheduled-messages
 * Cron Job: Runs every minute
 * Processes scheduled messages and triggers send-line-message function
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date().toISOString();

    // Get scheduled messages that are ready to send
    const { data: scheduledMessages, error: fetchError } = await supabase
      .from('messages')
      .select('id')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(100); // Process up to 100 messages per run

    if (fetchError) {
      console.error('Error fetching scheduled messages:', fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!scheduledMessages || scheduledMessages.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No scheduled messages to process',
          processedCount: 0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    let processedCount = 0;
    let errors: string[] = [];

    // Trigger send-line-message function for each scheduled message
    for (const message of scheduledMessages) {
      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/send-line-message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ messageId: message.id }),
          }
        );

        if (response.ok) {
          processedCount++;
        } else {
          const errorData = await response.json();
          errors.push(`Message ${message.id}: ${errorData.error || 'Unknown error'}`);

          // Update message status to failed
          await supabase
            .from('messages')
            .update({ status: 'failed' })
            .eq('id', message.id);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Message ${message.id}: ${errorMessage}`);

        // Update message status to failed
        await supabase
          .from('messages')
          .update({ status: 'failed' })
          .eq('id', message.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processedCount,
        totalScheduled: scheduledMessages.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing scheduled messages:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

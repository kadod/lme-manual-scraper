/**
 * Edge Function: send-line-message
 * Sends LINE messages to recipients in batches
 * Handles rate limiting (500 messages/second) and error recovery
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LINE_API_BASE = 'https://api.line.me/v2/bot';
const BATCH_SIZE = 100;
const RATE_LIMIT_DELAY = 200; // 200ms delay between batches (5 batches/second = 500 messages/second max)

interface LineMessage {
  type: string;
  [key: string]: unknown;
}

serve(async (req) => {
  try {
    // Parse request body
    const { messageId } = await req.json();

    if (!messageId) {
      return new Response(
        JSON.stringify({ error: 'messageId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get message details
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      return new Response(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update message status to sending
    await supabase
      .from('messages')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    // Get LINE access token from environment
    const accessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    if (!accessToken) {
      await supabase
        .from('messages')
        .update({ status: 'failed' })
        .eq('id', messageId);

      return new Response(
        JSON.stringify({ error: 'LINE credentials not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    let errorCount = 0;
    let offset = 0;

    // Process recipients in batches
    while (true) {
      // Get pending recipients
      const { data: recipients, error: recipientsError } = await supabase
        .from('message_recipients')
        .select(
          `
          *,
          friends:friend_id (
            id,
            line_user_id,
            is_blocked
          )
        `
        )
        .eq('message_id', messageId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .range(offset, offset + BATCH_SIZE - 1);

      if (recipientsError || !recipients || recipients.length === 0) {
        break;
      }

      // Send messages to each recipient
      for (const recipient of recipients) {
        const friend = recipient.friends;

        // Skip blocked users
        if (!friend || friend.is_blocked) {
          await supabase
            .from('message_recipients')
            .update({
              status: 'failed',
              error_message: 'User is blocked',
            })
            .eq('id', recipient.id);
          errorCount++;
          continue;
        }

        try {
          // Send message via LINE API
          const response = await fetch(`${LINE_API_BASE}/message/push`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              to: friend.line_user_id,
              messages: [message.content],
            }),
          });

          if (response.ok) {
            // Update recipient status to sent
            await supabase
              .from('message_recipients')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
              })
              .eq('id', recipient.id);
            sentCount++;
          } else {
            const errorData = await response.json();

            // Handle rate limiting
            if (response.status === 429) {
              // Wait and retry
              await new Promise((resolve) => setTimeout(resolve, 2000));
              continue;
            }

            // Handle invalid user
            if (errorData.message?.includes('Invalid')) {
              await supabase
                .from('message_recipients')
                .update({
                  status: 'failed',
                  error_message: 'INVALID_USER',
                })
                .eq('id', recipient.id);
              errorCount++;
              continue;
            }

            // Other errors
            await supabase
              .from('message_recipients')
              .update({
                status: 'failed',
                error_message: errorData.message || 'Unknown error',
              })
              .eq('id', recipient.id);
            errorCount++;
          }
        } catch (error) {
          // Network or other errors
          await supabase
            .from('message_recipients')
            .update({
              status: 'failed',
              error_message:
                error instanceof Error ? error.message : 'Network error',
            })
            .eq('id', recipient.id);
          errorCount++;
        }
      }

      // Rate limiting delay between batches
      if (recipients.length === BATCH_SIZE) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
        offset += BATCH_SIZE;
      } else {
        break; // Last batch
      }
    }

    // Update message final status
    const status = errorCount > 0 && sentCount === 0 ? 'failed' : 'completed';
    await supabase
      .from('messages')
      .update({
        status,
        sent_count: sentCount,
        error_count: errorCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    return new Response(
      JSON.stringify({
        success: true,
        messageId,
        sentCount,
        errorCount,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending messages:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

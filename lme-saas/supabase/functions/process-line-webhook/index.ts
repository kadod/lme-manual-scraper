/**
 * Edge Function: process-line-webhook
 * Handles LINE Webhook events for delivery status, read receipts, and link clicks
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

interface LineWebhookEvent {
  type: string;
  timestamp: number;
  source: {
    type: string;
    userId?: string;
  };
  message?: {
    id: string;
    type: string;
    text?: string;
  };
  delivery?: {
    userIds: string[];
  };
}

interface LineWebhookBody {
  destination: string;
  events: LineWebhookEvent[];
}

/**
 * Validate LINE webhook signature
 */
function validateSignature(body: string, signature: string, channelSecret: string): boolean {
  const encoder = new TextEncoder();
  const key = encoder.encode(channelSecret);
  const data = encoder.encode(body);

  // Create HMAC-SHA256 hash
  const hmac = crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  return hmac.then(key =>
    crypto.subtle.sign('HMAC', key, data)
  ).then(hash => {
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const hashBase64 = btoa(String.fromCharCode(...hashArray));
    return hashBase64 === signature;
  }).catch(() => false);
}

/**
 * Handle message delivery event
 */
async function handleDelivery(
  supabase: any,
  event: LineWebhookEvent
) {
  if (!event.delivery?.userIds) return;

  for (const userId of event.delivery.userIds) {
    // Find friend by LINE user ID
    const { data: friend } = await supabase
      .from('friends')
      .select('id')
      .eq('line_user_id', userId)
      .single();

    if (!friend) continue;

    // Update message recipients delivery status
    await supabase
      .from('message_recipients')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('friend_id', friend.id)
      .eq('status', 'sent');
  }
}

/**
 * Handle message event (user sent message)
 */
async function handleMessage(
  supabase: any,
  event: LineWebhookEvent
) {
  if (!event.source.userId) return;

  // Update friend last interaction
  await supabase
    .from('friends')
    .update({
      last_interaction_at: new Date().toISOString(),
    })
    .eq('line_user_id', event.source.userId);

  // Get friend details
  const { data: friend } = await supabase
    .from('friends')
    .select('id, user_id')
    .eq('line_user_id', event.source.userId)
    .single();

  if (friend) {
    // Trigger auto-response processing (fire and forget)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (supabaseUrl && supabaseAnonKey && event.message) {
      fetch(`${supabaseUrl}/functions/v1/process-auto-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          friend_id: friend.id,
          message_text: event.message.text || '',
          message_type: event.message.type || 'text',
          line_user_id: event.source.userId,
        }),
      }).catch(error => {
        console.error('Error triggering auto-response:', error);
      });
    }

    // Track analytics event if enabled
    // await supabase.from('analytics_events').insert({
    //   user_id: friend.user_id,
    //   event_type: 'message_received',
    //   event_data: { message_type: event.message?.type }
    // });
  }
}

/**
 * Handle postback event (button clicks, etc.)
 */
async function handlePostback(
  supabase: any,
  event: any
) {
  if (!event.source.userId) return;

  // Parse postback data
  const data = new URLSearchParams(event.postback.data);
  const action = data.get('action');

  // Update friend last interaction
  await supabase
    .from('friends')
    .update({
      last_interaction_at: new Date().toISOString(),
    })
    .eq('line_user_id', event.source.userId);

  // Handle specific actions
  if (action === 'click_link') {
    const messageId = data.get('message_id');
    const recipientId = data.get('recipient_id');

    if (messageId && recipientId) {
      // Update click tracking
      await supabase
        .from('message_recipients')
        .update({
          clicked_at: new Date().toISOString(),
        })
        .eq('id', recipientId);

      // Update message click count
      await supabase.rpc('increment_message_clicks', {
        message_id: messageId,
      });
    }
  }
}

/**
 * Handle follow event (user added bot as friend)
 */
async function handleFollow(
  supabase: any,
  event: LineWebhookEvent
) {
  if (!event.source.userId) return;

  // Upsert friend record
  await supabase
    .from('friends')
    .upsert({
      line_user_id: event.source.userId,
      is_blocked: false,
      last_interaction_at: new Date().toISOString(),
    }, {
      onConflict: 'line_user_id',
    });
}

/**
 * Handle unfollow event (user blocked or removed bot)
 */
async function handleUnfollow(
  supabase: any,
  event: LineWebhookEvent
) {
  if (!event.source.userId) return;

  // Update friend status
  await supabase
    .from('friends')
    .update({
      is_blocked: true,
    })
    .eq('line_user_id', event.source.userId);
}

serve(async (req) => {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get signature from headers
    const signature = req.headers.get('x-line-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    // Get channel secret from environment
    const channelSecret = Deno.env.get('LINE_CHANNEL_SECRET');
    if (!channelSecret) {
      return new Response('LINE credentials not configured', { status: 500 });
    }

    // Read request body
    const body = await req.text();

    // Validate signature
    const isValid = await validateSignature(body, signature, channelSecret);
    if (!isValid) {
      return new Response('Invalid signature', { status: 403 });
    }

    // Parse webhook body
    const webhookBody: LineWebhookBody = JSON.parse(body);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Process each event
    for (const event of webhookBody.events) {
      try {
        switch (event.type) {
          case 'message':
            await handleMessage(supabase, event);
            break;
          case 'follow':
            await handleFollow(supabase, event);
            break;
          case 'unfollow':
            await handleUnfollow(supabase, event);
            break;
          case 'delivery':
            await handleDelivery(supabase, event);
            break;
          case 'postback':
            await handlePostback(supabase, event);
            break;
          default:
            console.log('Unhandled event type:', event.type);
        }
      } catch (error) {
        console.error('Error processing event:', event.type, error);
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

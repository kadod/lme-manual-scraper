/**
 * Edge Function: process-auto-response
 * Processes incoming messages and determines appropriate auto-response
 * Handles both keyword-based responses and multi-step scenario conversations
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { matchKeyword } from './keyword-matcher.ts';
import { processScenario } from './scenario-processor.ts';
import { executeActions } from './action-executor.ts';

const LINE_API_BASE = 'https://api.line.me/v2/bot';

interface ProcessAutoResponseRequest {
  friend_id: string;
  message_text: string;
  message_type: string;
  line_user_id: string;
}

interface LineMessage {
  type: string;
  text?: string;
  [key: string]: unknown;
}

/**
 * Send LINE message to user
 */
async function sendLineMessage(
  lineUserId: string,
  message: LineMessage,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(`${LINE_API_BASE}/message/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [message],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending LINE message:', error);
    return false;
  }
}

/**
 * Log auto-response execution
 */
async function logAutoResponse(
  supabase: any,
  params: {
    user_id: string;
    friend_id: string;
    rule_id?: string;
    scenario_id?: string;
    conversation_id?: string;
    trigger_message: string;
    response_message: LineMessage;
    matched_keyword?: string;
    executed_actions?: any[];
    error_message?: string;
  }
) {
  await supabase.from('auto_response_logs').insert({
    user_id: params.user_id,
    friend_id: params.friend_id,
    rule_id: params.rule_id,
    scenario_id: params.scenario_id,
    conversation_id: params.conversation_id,
    trigger_message: params.trigger_message,
    response_message: params.response_message,
    matched_keyword: params.matched_keyword,
    executed_actions: params.executed_actions,
    error_message: params.error_message,
  });
}

/**
 * Process auto-response for incoming message
 */
async function processAutoResponse(
  supabase: any,
  request: ProcessAutoResponseRequest,
  accessToken: string
) {
  const { friend_id, message_text, message_type, line_user_id } = request;

  // Get friend details with user_id
  const { data: friend, error: friendError } = await supabase
    .from('friends')
    .select('id, user_id, line_user_id')
    .eq('id', friend_id)
    .single();

  if (friendError || !friend) {
    throw new Error('Friend not found');
  }

  // Check for active conversation first
  const { data: activeConversation } = await supabase
    .from('active_conversations')
    .select(
      `
      *,
      scenarios:scenario_id (
        id,
        name,
        steps,
        timeout_minutes,
        max_retries
      )
    `
    )
    .eq('friend_id', friend_id)
    .eq('status', 'active')
    .single();

  let responseMessage: LineMessage | null = null;
  let executedActions: any[] = [];
  let logParams: any = {
    user_id: friend.user_id,
    friend_id: friend_id,
    trigger_message: message_text,
  };

  try {
    // Priority 1: Process active scenario conversation
    if (activeConversation) {
      const scenarioResult = await processScenario(
        supabase,
        activeConversation,
        message_text,
        message_type
      );

      if (scenarioResult.responseMessage) {
        responseMessage = scenarioResult.responseMessage;
        executedActions = scenarioResult.actions || [];

        logParams.scenario_id = activeConversation.scenario_id;
        logParams.conversation_id = activeConversation.id;
      }
    }
    // Priority 2: Check keyword-based auto-response rules
    else {
      const matchResult = await matchKeyword(
        supabase,
        friend.user_id,
        friend_id,
        message_text,
        message_type
      );

      if (matchResult) {
        responseMessage = matchResult.responseMessage;
        executedActions = matchResult.actions || [];

        logParams.rule_id = matchResult.rule_id;
        logParams.matched_keyword = matchResult.matched_keyword;

        // Update rule statistics
        await supabase
          .from('auto_response_rules')
          .update({
            total_triggers: supabase.raw('total_triggers + 1'),
            last_triggered_at: new Date().toISOString(),
          })
          .eq('id', matchResult.rule_id);
      }
    }

    // Send response if we have one
    if (responseMessage) {
      const sent = await sendLineMessage(
        line_user_id,
        responseMessage,
        accessToken
      );

      if (!sent) {
        throw new Error('Failed to send LINE message');
      }

      logParams.response_message = responseMessage;
      logParams.executed_actions = executedActions;

      // Execute post-response actions
      if (executedActions.length > 0) {
        await executeActions(supabase, friend_id, friend.user_id, executedActions);
      }
    }

    // Log the interaction
    await logAutoResponse(supabase, logParams);

    return {
      success: true,
      responded: !!responseMessage,
      message: responseMessage,
      actions: executedActions,
    };
  } catch (error) {
    // Log error
    logParams.error_message =
      error instanceof Error ? error.message : 'Unknown error';
    await logAutoResponse(supabase, logParams);

    throw error;
  }
}

serve(async (req) => {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse request body
    const body: ProcessAutoResponseRequest = await req.json();

    if (!body.friend_id || !body.message_text || !body.line_user_id) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: friend_id, message_text, line_user_id',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get LINE access token
    const accessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'LINE credentials not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process auto-response
    const result = await processAutoResponse(supabase, body, accessToken);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing auto-response:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

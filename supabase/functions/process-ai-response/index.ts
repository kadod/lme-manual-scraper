/**
 * Edge Function: process-ai-response
 * Trigger: HTTP POST from LINE webhook or manual trigger
 * Processes AI response generation using OpenAI API
 *
 * Features:
 * - OpenAI Chat Completions API integration
 * - Friend context injection (name, tags, custom fields)
 * - Conversation history management
 * - Response validation and sanitization
 * - Cost tracking and token usage monitoring
 * - Rate limiting and quota management
 * - Prohibited word filtering
 * - Fallback responses for errors/timeouts
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAIClient, OpenAIConfig, estimateTokens } from "./openai-client.js";
import {
  buildSystemPrompt,
  buildMessages,
  truncateHistory,
  FriendContext,
  AISettings,
  ConversationMessage,
} from "./prompt-builder.js";
import {
  validateResponse,
  formatForLineMessage,
  isAppropriateResponse,
} from "./response-validator.js";

interface RequestBody {
  friend_id: string;
  message_text: string;
  conversation_history?: ConversationMessage[];
  user_id?: string; // Optional, will be derived from auth
}

interface AIResponseResult {
  success: boolean;
  response?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost: number;
  };
  warnings?: string[];
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const startTime = Date.now();

  try {
    console.log("Processing AI response request...");

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse request body
    const requestBody: RequestBody = await req.json();

    if (!requestBody.friend_id || !requestBody.message_text) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: friend_id, message_text",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing message for friend: ${requestBody.friend_id}`);

    // Get friend information
    const { data: friend, error: friendError } = await supabase
      .from("friends")
      .select("id, user_id, display_name, custom_fields, last_interaction_at")
      .eq("id", requestBody.friend_id)
      .single();

    if (friendError || !friend) {
      console.error("Friend not found:", friendError);
      return new Response(JSON.stringify({ error: "Friend not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = requestBody.user_id || friend.user_id;

    // Get AI settings
    const { data: aiSettings, error: settingsError } = await supabase
      .from("ai_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsError || !aiSettings) {
      console.error("AI settings not found:", settingsError);
      return new Response(
        JSON.stringify({
          error: "AI settings not configured",
          code: "AI_NOT_CONFIGURED",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if AI is enabled
    if (!aiSettings.is_enabled) {
      console.log("AI is disabled for this user");
      return new Response(
        JSON.stringify({
          success: true,
          response: aiSettings.default_response,
          code: "AI_DISABLED",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check usage limits
    const { data: canUse } = await supabase.rpc("can_use_ai", {
      p_user_id: userId,
    });

    if (!canUse) {
      console.log("AI usage limit exceeded");
      return new Response(
        JSON.stringify({
          success: true,
          response:
            "申し訳ございません。現在AIサービスの利用上限に達しています。",
          code: "LIMIT_EXCEEDED",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get friend tags
    const { data: friendTags } = await supabase
      .from("friend_tags")
      .select("tag_id, tags(name)")
      .eq("friend_id", requestBody.friend_id);

    const tags =
      friendTags?.map((ft: any) => ft.tags?.name).filter(Boolean) || [];

    // Build friend context
    const friendContext: FriendContext = {
      id: friend.id,
      display_name: friend.display_name,
      custom_fields: friend.custom_fields,
      tags,
      last_interaction_at: friend.last_interaction_at,
    };

    // Get conversation history
    let conversationHistory = requestBody.conversation_history;
    if (!conversationHistory) {
      const { data: historyData } = await supabase.rpc(
        "get_conversation_history",
        {
          p_friend_id: requestBody.friend_id,
          p_limit: 10,
        }
      );
      conversationHistory = historyData || [];
    }

    // Truncate history to fit within token limits (reserve tokens for response)
    const maxHistoryTokens = aiSettings.max_tokens * 0.4; // Use 40% of max for history
    const truncatedHistory = truncateHistory(
      conversationHistory,
      maxHistoryTokens
    );

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      {
        system_prompt: aiSettings.system_prompt,
        custom_instructions: aiSettings.custom_instructions,
      },
      friendContext
    );

    // Build messages
    const messages = buildMessages(
      systemPrompt,
      requestBody.message_text,
      truncatedHistory
    );

    console.log("Calling OpenAI API...");

    // Initialize OpenAI client
    const openaiConfig: OpenAIConfig = {
      apiKey: aiSettings.openai_api_key,
      orgId: aiSettings.openai_org_id,
      model: aiSettings.model,
      temperature: aiSettings.temperature,
      maxTokens: aiSettings.max_tokens,
      timeout: 30000, // 30 seconds
    };

    const openaiClient = new OpenAIClient(openaiConfig);

    // Call OpenAI API
    let response;
    let status = "success";
    let errorMessage: string | null = null;

    try {
      response = await openaiClient.createChatCompletion(messages);
    } catch (error) {
      console.error("OpenAI API error:", error);
      status = "error";
      errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Determine fallback response
      if (errorMessage.includes("timeout")) {
        status = "timeout";
        return createSuccessResponse(
          aiSettings.timeout_response,
          corsHeaders,
          "TIMEOUT"
        );
      } else if (errorMessage.includes("rate limit")) {
        status = "rate_limit";
        return createSuccessResponse(
          "申し訳ございません。しばらく時間をおいてからお試しください。",
          corsHeaders,
          "RATE_LIMIT"
        );
      } else {
        return createSuccessResponse(
          aiSettings.error_response,
          corsHeaders,
          "ERROR"
        );
      }
    }

    const assistantMessage = response.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response content from OpenAI");
    }

    console.log("OpenAI response received, validating...");

    // Validate response
    const validation = validateResponse(assistantMessage, {
      prohibitedWords: aiSettings.prohibited_words || [],
      maxLength: aiSettings.max_response_length || 5000,
    });

    if (!validation.isValid) {
      console.error("Response validation failed:", validation.errors);
      return createSuccessResponse(
        aiSettings.error_response,
        corsHeaders,
        "VALIDATION_FAILED"
      );
    }

    // Check for inappropriate content
    if (!isAppropriateResponse(validation.sanitizedContent!)) {
      console.error("Response contains inappropriate content");
      return createSuccessResponse(
        aiSettings.error_response,
        corsHeaders,
        "INAPPROPRIATE_CONTENT"
      );
    }

    // Format for LINE
    const formattedResponse = formatForLineMessage(
      validation.sanitizedContent!
    );

    // Calculate cost
    const estimatedCost = OpenAIClient.estimateCost(
      response.model,
      response.usage.prompt_tokens,
      response.usage.completion_tokens
    );

    const responseTime = Date.now() - startTime;

    // Log usage
    await supabase.from("ai_usage_logs").insert({
      user_id: userId,
      friend_id: requestBody.friend_id,
      model: response.model,
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
      estimated_cost_usd: estimatedCost,
      response_time_ms: responseTime,
      status,
      error_message: errorMessage,
      message_text: requestBody.message_text,
      response_text: formattedResponse,
    });

    // Save conversation
    await supabase.from("ai_conversations").insert([
      {
        user_id: userId,
        friend_id: requestBody.friend_id,
        role: "user",
        content: requestBody.message_text,
        tokens: estimateTokens(requestBody.message_text),
        model: response.model,
      },
      {
        user_id: userId,
        friend_id: requestBody.friend_id,
        role: "assistant",
        content: formattedResponse,
        tokens: response.usage.completion_tokens,
        model: response.model,
      },
    ]);

    console.log(
      `AI response processed successfully (${responseTime}ms, ${response.usage.total_tokens} tokens)`
    );

    const result: AIResponseResult = {
      success: true,
      response: formattedResponse,
      usage: {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
        estimated_cost: estimatedCost,
      },
      warnings: validation.warnings,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing AI response:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
});

/**
 * Helper to create success response with fallback message
 */
function createSuccessResponse(
  message: string,
  corsHeaders: Record<string, string>,
  code: string
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      response: message,
      code,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

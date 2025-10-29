/**
 * Prompt Builder Module
 * Constructs system prompts with friend context and conversation history
 */

import { ChatMessage } from "./openai-client.js";

export interface FriendContext {
  id: string;
  display_name: string | null;
  custom_fields: Record<string, any> | null;
  tags?: string[];
  last_interaction_at: string | null;
}

export interface AISettings {
  system_prompt?: string;
  custom_instructions?: string;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

/**
 * Build system prompt with friend context
 */
export function buildSystemPrompt(
  settings: AISettings,
  friend: FriendContext,
  userName?: string
): string {
  const parts: string[] = [];

  // Base system prompt
  if (settings.system_prompt) {
    parts.push(settings.system_prompt);
  } else {
    parts.push(
      `あなたは${userName || "当社"}のカスタマーサポートAIアシスタントです。`
    );
    parts.push(
      "丁寧で親しみやすい対応を心がけ、顧客の問題解決をサポートします。"
    );
  }

  // Custom instructions
  if (settings.custom_instructions) {
    parts.push("\n【追加指示】");
    parts.push(settings.custom_instructions);
  }

  // Friend context
  parts.push("\n【顧客情報】");

  if (friend.display_name) {
    parts.push(`名前: ${friend.display_name}`);
  }

  if (friend.tags && friend.tags.length > 0) {
    parts.push(`タグ: ${friend.tags.join(", ")}`);
  }

  if (friend.custom_fields && Object.keys(friend.custom_fields).length > 0) {
    parts.push("\nカスタムフィールド:");
    for (const [key, value] of Object.entries(friend.custom_fields)) {
      if (value !== null && value !== undefined) {
        parts.push(`- ${key}: ${value}`);
      }
    }
  }

  if (friend.last_interaction_at) {
    const lastInteraction = new Date(friend.last_interaction_at);
    const now = new Date();
    const daysSince = Math.floor(
      (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince === 0) {
      parts.push("最終やり取り: 本日");
    } else if (daysSince === 1) {
      parts.push("最終やり取り: 昨日");
    } else {
      parts.push(`最終やり取り: ${daysSince}日前`);
    }
  }

  return parts.join("\n");
}

/**
 * Build conversation messages with history
 */
export function buildMessages(
  systemPrompt: string,
  currentMessage: string,
  conversationHistory?: ConversationMessage[]
): ChatMessage[] {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
  ];

  // Add conversation history (most recent first from DB, so reverse)
  if (conversationHistory && conversationHistory.length > 0) {
    const sortedHistory = [...conversationHistory].reverse();

    for (const msg of sortedHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  // Add current user message
  messages.push({
    role: "user",
    content: currentMessage,
  });

  return messages;
}

/**
 * Format friend tags as a readable string
 */
export function formatTags(tags: string[]): string {
  if (!tags || tags.length === 0) {
    return "なし";
  }
  return tags.join(", ");
}

/**
 * Format custom fields as a readable string
 */
export function formatCustomFields(fields: Record<string, any>): string {
  if (!fields || Object.keys(fields).length === 0) {
    return "なし";
  }

  const formatted: string[] = [];
  for (const [key, value] of Object.entries(fields)) {
    if (value !== null && value !== undefined) {
      formatted.push(`${key}: ${value}`);
    }
  }

  return formatted.join(", ");
}

/**
 * Truncate conversation history to fit within token limits
 * Keep most recent messages that fit within the limit
 */
export function truncateHistory(
  history: ConversationMessage[],
  maxTokens: number
): ConversationMessage[] {
  if (!history || history.length === 0) {
    return [];
  }

  let totalTokens = 0;
  const truncated: ConversationMessage[] = [];

  // Process from most recent to oldest
  for (const msg of history) {
    // Rough token estimate (will be refined by actual tokenizer)
    const estimatedTokens = Math.ceil(msg.content.length / 3);

    if (totalTokens + estimatedTokens <= maxTokens) {
      truncated.unshift(msg); // Add to beginning to maintain order
      totalTokens += estimatedTokens;
    } else {
      break; // Stop if we exceed token limit
    }
  }

  return truncated;
}

/**
 * Sanitize message content
 * Remove potentially harmful content or PII
 */
export function sanitizeMessage(message: string): string {
  let sanitized = message;

  // Remove email addresses (basic pattern)
  sanitized = sanitized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[メールアドレス]"
  );

  // Remove phone numbers (Japanese format)
  sanitized = sanitized.replace(/0\d{1,4}-?\d{1,4}-?\d{4}/g, "[電話番号]");

  // Remove credit card numbers (basic pattern)
  sanitized = sanitized.replace(
    /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
    "[カード番号]"
  );

  return sanitized;
}

/**
 * AI Response Types
 * Type definitions for AI response processing
 */

export interface AISettings {
  id: string;
  user_id: string;
  openai_api_key: string;
  openai_org_id?: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt?: string;
  custom_instructions?: string;
  is_enabled: boolean;
  stream_responses: boolean;
  monthly_token_limit: number;
  monthly_budget_usd: number;
  prohibited_words: string[];
  max_response_length: number;
  default_response: string;
  timeout_response: string;
  error_response: string;
  created_at: string;
  updated_at: string;
}

export interface AIUsageLog {
  id: string;
  user_id: string;
  friend_id?: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  response_time_ms: number;
  status: 'success' | 'error' | 'timeout' | 'rate_limit';
  error_message?: string;
  message_text?: string;
  response_text?: string;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  friend_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  model?: string;
  created_at: string;
}

export interface AIResponseRequest {
  friend_id: string;
  message_text: string;
  conversation_history?: {
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
  }[];
  user_id?: string;
}

export interface AIResponseResult {
  success: boolean;
  response?: string;
  error?: string;
  code?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost: number;
  };
  warnings?: string[];
}

export interface AIUsageStats {
  monthly_tokens: number;
  monthly_cost: number;
  token_limit: number;
  budget_limit: number;
  usage_percentage: number;
  cost_percentage: number;
  can_use: boolean;
}

export interface AISettingsFormData {
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  custom_instructions: string;
  is_enabled: boolean;
  monthly_token_limit: number;
  monthly_budget_usd: number;
  prohibited_words: string[];
  max_response_length: number;
  default_response: string;
  timeout_response: string;
  error_response: string;
}

export type AIModel =
  | 'gpt-4-turbo-preview'
  | 'gpt-4'
  | 'gpt-4-32k'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-16k';

export interface AIModelInfo {
  id: AIModel;
  name: string;
  description: string;
  contextWindow: number;
  pricing: {
    prompt: number; // per 1K tokens
    completion: number; // per 1K tokens
  };
}

export const AI_MODELS: Record<AIModel, AIModelInfo> = {
  'gpt-4-turbo-preview': {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    description: '最新のGPT-4モデル。高性能で長いコンテキストをサポート。',
    contextWindow: 128000,
    pricing: {
      prompt: 0.01,
      completion: 0.03,
    },
  },
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    description: '標準のGPT-4モデル。高品質な応答を生成。',
    contextWindow: 8192,
    pricing: {
      prompt: 0.03,
      completion: 0.06,
    },
  },
  'gpt-4-32k': {
    id: 'gpt-4-32k',
    name: 'GPT-4 32K',
    description: '32Kトークンのコンテキストウィンドウをサポート。',
    contextWindow: 32768,
    pricing: {
      prompt: 0.06,
      completion: 0.12,
    },
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: '高速で低コスト。一般的な用途に最適。',
    contextWindow: 16385,
    pricing: {
      prompt: 0.0005,
      completion: 0.0015,
    },
  },
  'gpt-3.5-turbo-16k': {
    id: 'gpt-3.5-turbo-16k',
    name: 'GPT-3.5 Turbo 16K',
    description: '16Kトークンのコンテキストをサポート。',
    contextWindow: 16385,
    pricing: {
      prompt: 0.001,
      completion: 0.002,
    },
  },
};

export interface FriendContext {
  id: string;
  display_name: string | null;
  custom_fields: Record<string, any> | null;
  tags?: string[];
  last_interaction_at: string | null;
}

export interface PromptTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  system_prompt: string;
  custom_instructions?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * OpenAI Client Module
 * Handles API communication with OpenAI Chat Completions API
 */

export interface OpenAIConfig {
  apiKey: string;
  orgId?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * OpenAI Client with retry logic and timeout
 */
export class OpenAIClient {
  private config: OpenAIConfig;
  private retryAttempts = 3;
  private retryDelay = 1000; // ms

  constructor(config: OpenAIConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 30000, // 30 seconds default
    };
  }

  /**
   * Call OpenAI Chat Completions API with retry logic
   */
  async createChatCompletion(
    messages: ChatMessage[]
  ): Promise<ChatCompletionResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`OpenAI API attempt ${attempt}/${this.retryAttempts}`);

        const response = await this.makeRequest(messages);

        if (!response.ok) {
          const errorData: OpenAIError = await response.json();
          throw new Error(
            `OpenAI API error: ${errorData.error.message} (${errorData.error.type})`
          );
        }

        const data: ChatCompletionResponse = await response.json();
        console.log('OpenAI API success:', {
          tokens: data.usage.total_tokens,
          model: data.model,
        });

        return data;
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed:`, error);

        // Don't retry on certain errors
        if (this.isNonRetryableError(error as Error)) {
          throw error;
        }

        // Wait before retry (except on last attempt)
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw new Error(
      `OpenAI API failed after ${this.retryAttempts} attempts: ${lastError?.message}`
    );
  }

  /**
   * Make HTTP request to OpenAI API with timeout
   */
  private async makeRequest(messages: ChatMessage[]): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      };

      if (this.config.orgId) {
        headers['OpenAI-Organization'] = this.config.orgId;
      }

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: this.config.model,
            messages,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
          }),
          signal: controller.signal,
        }
      );

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (message.includes('invalid api key') || message.includes('unauthorized')) {
      return true;
    }

    // Invalid request errors
    if (message.includes('invalid request') || message.includes('bad request')) {
      return true;
    }

    // Model not found
    if (message.includes('model not found')) {
      return true;
    }

    return false;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Estimate cost based on token usage
   * Pricing as of 2024 (approximate, should be updated)
   */
  static estimateCost(
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    // Pricing per 1K tokens (USD)
    const pricing: Record<string, { prompt: number; completion: number }> = {
      'gpt-4-turbo-preview': { prompt: 0.01, completion: 0.03 },
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];

    const promptCost = (promptTokens / 1000) * modelPricing.prompt;
    const completionCost = (completionTokens / 1000) * modelPricing.completion;

    return promptCost + completionCost;
  }
}

/**
 * Count tokens (approximate)
 * Note: This is a rough estimate. For accurate counting, use tiktoken library
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English
  // 1 token ≈ 2-3 characters for Japanese
  const japaneseChars = (text.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/g) || []).length;
  const otherChars = text.length - japaneseChars;

  const japaneseTokens = japaneseChars / 2.5;
  const otherTokens = otherChars / 4;

  return Math.ceil(japaneseTokens + otherTokens);
}

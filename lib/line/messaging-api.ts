/**
 * LINE Messaging API Integration
 * Handles all LINE API communications including message sending and quota management
 */

const LINE_API_BASE = 'https://api.line.me/v2/bot';

export interface LineMessage {
  type: 'text' | 'image' | 'video' | 'audio' | 'flex' | 'template';
  [key: string]: unknown;
}

export interface LineTextMessage extends LineMessage {
  type: 'text';
  text: string;
}

export interface LineImageMessage extends LineMessage {
  type: 'image';
  originalContentUrl: string;
  previewImageUrl: string;
}

export interface LineVideoMessage extends LineMessage {
  type: 'video';
  originalContentUrl: string;
  previewImageUrl: string;
}

export interface LineFlexMessage extends LineMessage {
  type: 'flex';
  altText: string;
  contents: Record<string, unknown>;
}

export interface SendMessageResponse {
  success: boolean;
  error?: string;
  sentMessage?: {
    id: string;
    quoteToken?: string;
  };
}

export interface MessageQuota {
  type: 'none' | 'limited';
  value?: number;
}

export class LineMessagingAPI {
  private accessToken: string;
  private channelSecret: string;

  constructor(accessToken: string, channelSecret: string) {
    this.accessToken = accessToken;
    this.channelSecret = channelSecret;
  }

  /**
   * Send a text message to a specific user
   */
  async sendTextMessage(
    to: string,
    text: string
  ): Promise<SendMessageResponse> {
    const message: LineTextMessage = {
      type: 'text',
      text,
    };

    return this.sendMessage(to, [message]);
  }

  /**
   * Send an image message to a specific user
   */
  async sendImageMessage(
    to: string,
    originalContentUrl: string,
    previewImageUrl: string
  ): Promise<SendMessageResponse> {
    const message: LineImageMessage = {
      type: 'image',
      originalContentUrl,
      previewImageUrl,
    };

    return this.sendMessage(to, [message]);
  }

  /**
   * Send a video message to a specific user
   */
  async sendVideoMessage(
    to: string,
    originalContentUrl: string,
    previewImageUrl: string
  ): Promise<SendMessageResponse> {
    const message: LineVideoMessage = {
      type: 'video',
      originalContentUrl,
      previewImageUrl,
    };

    return this.sendMessage(to, [message]);
  }

  /**
   * Send a Flex message to a specific user
   */
  async sendFlexMessage(
    to: string,
    altText: string,
    contents: Record<string, unknown>
  ): Promise<SendMessageResponse> {
    const message: LineFlexMessage = {
      type: 'flex',
      altText,
      contents,
    };

    return this.sendMessage(to, [message]);
  }

  /**
   * Send message(s) to a specific user (Push API)
   */
  async sendMessage(
    to: string,
    messages: LineMessage[]
  ): Promise<SendMessageResponse> {
    try {
      const response = await fetch(`${LINE_API_BASE}/message/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          to,
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle rate limiting
        if (response.status === 429) {
          return {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
          };
        }

        // Handle invalid user
        if (errorData.message?.includes('Invalid reply token')) {
          return {
            success: false,
            error: 'INVALID_USER',
          };
        }

        return {
          success: false,
          error: errorData.message || 'Unknown error',
        };
      }

      const data = await response.json();
      return {
        success: true,
        sentMessage: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Send multicast message to multiple users (up to 500)
   */
  async sendMulticastMessage(
    to: string[],
    messages: LineMessage[]
  ): Promise<SendMessageResponse> {
    if (to.length === 0) {
      return {
        success: false,
        error: 'No recipients specified',
      };
    }

    if (to.length > 500) {
      return {
        success: false,
        error: 'Too many recipients (max 500)',
      };
    }

    try {
      const response = await fetch(`${LINE_API_BASE}/message/multicast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          to,
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 429) {
          return {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
          };
        }

        return {
          success: false,
          error: errorData.message || 'Unknown error',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get current message quota
   */
  async getMessageQuota(): Promise<MessageQuota | null> {
    try {
      const response = await fetch(`${LINE_API_BASE}/message/quota`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get message quota:', error);
      return null;
    }
  }

  /**
   * Get message consumption
   */
  async getMessageConsumption(): Promise<number | null> {
    try {
      const response = await fetch(
        `${LINE_API_BASE}/message/quota/consumption`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.totalUsage || 0;
    } catch (error) {
      console.error('Failed to get message consumption:', error);
      return null;
    }
  }

  /**
   * Validate webhook signature
   */
  validateSignature(body: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('SHA256', this.channelSecret)
      .update(body)
      .digest('base64');
    return hash === signature;
  }
}

/**
 * Create LINE Messaging API client
 */
export function createLineClient(
  accessToken?: string,
  channelSecret?: string
): LineMessagingAPI {
  const token = accessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const secret = channelSecret || process.env.LINE_CHANNEL_SECRET;

  if (!token || !secret) {
    throw new Error('LINE credentials not configured');
  }

  return new LineMessagingAPI(token, secret);
}

/**
 * Retry logic for sending messages with exponential backoff
 */
export async function sendWithRetry(
  sendFn: () => Promise<SendMessageResponse>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<SendMessageResponse> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await sendFn();

    if (result.success) {
      return result;
    }

    // Don't retry for certain errors
    if (result.error === 'INVALID_USER' || result.error === 'RATE_LIMIT_EXCEEDED') {
      return result;
    }

    lastError = result.error;

    // Wait before retrying with exponential backoff
    if (attempt < maxRetries - 1) {
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError || 'Max retries exceeded',
  };
}

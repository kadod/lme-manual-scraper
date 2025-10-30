/**
 * LINE Messaging API Utilities
 * Provides functions for sending messages through LINE Messaging API
 */

const LINE_API_BASE = 'https://api.line.me/v2/bot'

/**
 * Message types supported by LINE
 */
export interface TextMessage {
  type: 'text'
  text: string
  emojis?: Array<{
    index: number
    productId: string
    emojiId: string
  }>
}

export interface ImageMessage {
  type: 'image'
  originalContentUrl: string
  previewImageUrl: string
}

export interface VideoMessage {
  type: 'video'
  originalContentUrl: string
  previewImageUrl: string
}

export interface AudioMessage {
  type: 'audio'
  originalContentUrl: string
  duration: number
}

export interface LocationMessage {
  type: 'location'
  title: string
  address: string
  latitude: number
  longitude: number
}

export interface StickerMessage {
  type: 'sticker'
  packageId: string
  stickerId: string
}

export interface FlexMessage {
  type: 'flex'
  altText: string
  contents: Record<string, unknown>
}

export interface TemplateMessage {
  type: 'template'
  altText: string
  template: Record<string, unknown>
}

export type LineMessage =
  | TextMessage
  | ImageMessage
  | VideoMessage
  | AudioMessage
  | LocationMessage
  | StickerMessage
  | FlexMessage
  | TemplateMessage

/**
 * Send push message to a user
 * Use this to proactively send messages to users
 *
 * @param accessToken - LINE Channel Access Token
 * @param userId - LINE User ID
 * @param messages - Array of messages (max 5)
 */
export async function sendPushMessage(
  accessToken: string,
  userId: string,
  messages: LineMessage[]
): Promise<{ success: boolean; error?: string }> {
  if (messages.length === 0 || messages.length > 5) {
    return {
      success: false,
      error: 'Message count must be between 1 and 5',
    }
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/message/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to: userId,
        messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Send reply message using reply token
 * Use this to reply to user messages within webhook handler
 *
 * @param accessToken - LINE Channel Access Token
 * @param replyToken - Reply token from webhook event
 * @param messages - Array of messages (max 5)
 */
export async function sendReplyMessage(
  accessToken: string,
  replyToken: string,
  messages: LineMessage[]
): Promise<{ success: boolean; error?: string }> {
  if (messages.length === 0 || messages.length > 5) {
    return {
      success: false,
      error: 'Message count must be between 1 and 5',
    }
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/message/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Send multicast message to multiple users
 * Use this to send the same message to multiple users at once
 *
 * @param accessToken - LINE Channel Access Token
 * @param userIds - Array of LINE User IDs (max 500)
 * @param messages - Array of messages (max 5)
 */
export async function sendMulticastMessage(
  accessToken: string,
  userIds: string[],
  messages: LineMessage[]
): Promise<{ success: boolean; error?: string }> {
  if (userIds.length === 0) {
    return {
      success: false,
      error: 'At least one user ID is required',
    }
  }

  if (userIds.length > 500) {
    return {
      success: false,
      error: 'Maximum 500 users per request',
    }
  }

  if (messages.length === 0 || messages.length > 5) {
    return {
      success: false,
      error: 'Message count must be between 1 and 5',
    }
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/message/multicast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to: userIds,
        messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Send broadcast message to all friends
 * Use this to send announcements to all users
 *
 * @param accessToken - LINE Channel Access Token
 * @param messages - Array of messages (max 5)
 */
export async function sendBroadcastMessage(
  accessToken: string,
  messages: LineMessage[]
): Promise<{ success: boolean; error?: string }> {
  if (messages.length === 0 || messages.length > 5) {
    return {
      success: false,
      error: 'Message count must be between 1 and 5',
    }
  }

  try {
    const response = await fetch(`${LINE_API_BASE}/message/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Get user profile information
 *
 * @param accessToken - LINE Channel Access Token
 * @param userId - LINE User ID
 */
export async function getUserProfile(accessToken: string, userId: string) {
  try {
    const response = await fetch(`${LINE_API_BASE}/profile/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

/**
 * Get message quota information
 *
 * @param accessToken - LINE Channel Access Token
 */
export async function getMessageQuota(accessToken: string) {
  try {
    const response = await fetch(`${LINE_API_BASE}/message/quota`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get message quota: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching message quota:', error)
    throw error
  }
}

/**
 * Get message quota consumption
 *
 * @param accessToken - LINE Channel Access Token
 */
export async function getMessageQuotaConsumption(accessToken: string) {
  try {
    const response = await fetch(`${LINE_API_BASE}/message/quota/consumption`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(
        `Failed to get message quota consumption: ${response.statusText}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching message quota consumption:', error)
    throw error
  }
}

/**
 * Helper to create a text message
 */
export function createTextMessage(text: string): TextMessage {
  return {
    type: 'text',
    text,
  }
}

/**
 * Helper to create an image message
 */
export function createImageMessage(
  originalContentUrl: string,
  previewImageUrl?: string
): ImageMessage {
  return {
    type: 'image',
    originalContentUrl,
    previewImageUrl: previewImageUrl || originalContentUrl,
  }
}

/**
 * Helper to create a video message
 */
export function createVideoMessage(
  originalContentUrl: string,
  previewImageUrl: string
): VideoMessage {
  return {
    type: 'video',
    originalContentUrl,
    previewImageUrl,
  }
}

/**
 * Helper to create a sticker message
 */
export function createStickerMessage(
  packageId: string,
  stickerId: string
): StickerMessage {
  return {
    type: 'sticker',
    packageId,
    stickerId,
  }
}

/**
 * Helper to create a location message
 */
export function createLocationMessage(
  title: string,
  address: string,
  latitude: number,
  longitude: number
): LocationMessage {
  return {
    type: 'location',
    title,
    address,
    latitude,
    longitude,
  }
}

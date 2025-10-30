/**
 * LINE Webhook Utilities
 * Signature verification and webhook event handling utilities
 */

import crypto from 'crypto'

/**
 * Verify LINE webhook signature
 * Uses HMAC-SHA256 to validate that the request came from LINE
 *
 * @param body - Raw request body as string
 * @param signature - X-Line-Signature header value
 * @param secret - LINE Channel Secret
 * @returns true if signature is valid
 */
export function verifyLineSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('SHA256', secret)
    .update(body)
    .digest('base64')

  return hash === signature
}

/**
 * Webhook event types
 */
export type WebhookEventType =
  | 'message'
  | 'follow'
  | 'unfollow'
  | 'join'
  | 'leave'
  | 'memberJoined'
  | 'memberLeft'
  | 'postback'
  | 'videoPlayComplete'
  | 'beacon'
  | 'accountLink'
  | 'things'

/**
 * Message types
 */
export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'location'
  | 'sticker'

/**
 * Source types
 */
export type SourceType = 'user' | 'group' | 'room'

/**
 * Webhook event source
 */
export interface WebhookEventSource {
  type: SourceType
  userId?: string
  groupId?: string
  roomId?: string
}

/**
 * Message content
 */
export interface MessageContent {
  id: string
  type: MessageType
  text?: string
  stickerId?: string
  packageId?: string
  fileName?: string
  fileSize?: number
  title?: string
  address?: string
  latitude?: number
  longitude?: number
  contentProvider?: {
    type: 'line' | 'external'
    originalContentUrl?: string
    previewImageUrl?: string
  }
}

/**
 * Postback data
 */
export interface PostbackData {
  data: string
  params?: {
    date?: string
    time?: string
    datetime?: string
  }
}

/**
 * Base webhook event
 */
export interface WebhookEvent {
  type: WebhookEventType
  mode: 'active' | 'standby'
  timestamp: number
  source: WebhookEventSource
  webhookEventId: string
  deliveryContext: {
    isRedelivery: boolean
  }
}

/**
 * Message event
 */
export interface MessageEvent extends WebhookEvent {
  type: 'message'
  replyToken: string
  message: MessageContent
}

/**
 * Follow event
 */
export interface FollowEvent extends WebhookEvent {
  type: 'follow'
  replyToken: string
}

/**
 * Unfollow event
 */
export interface UnfollowEvent extends WebhookEvent {
  type: 'unfollow'
}

/**
 * Postback event
 */
export interface PostbackEvent extends WebhookEvent {
  type: 'postback'
  replyToken: string
  postback: PostbackData
}

/**
 * Join event
 */
export interface JoinEvent extends WebhookEvent {
  type: 'join'
  replyToken: string
}

/**
 * Leave event
 */
export interface LeaveEvent extends WebhookEvent {
  type: 'leave'
}

/**
 * Webhook request body
 */
export interface WebhookRequestBody {
  destination: string
  events: Array<
    | MessageEvent
    | FollowEvent
    | UnfollowEvent
    | PostbackEvent
    | JoinEvent
    | LeaveEvent
    | WebhookEvent
  >
}

/**
 * Parse webhook request body
 */
export function parseWebhookBody(body: string): WebhookRequestBody {
  try {
    return JSON.parse(body)
  } catch (error) {
    throw new Error('Invalid webhook body format')
  }
}

/**
 * Type guards for webhook events
 */
export function isMessageEvent(event: WebhookEvent): event is MessageEvent {
  return event.type === 'message'
}

export function isFollowEvent(event: WebhookEvent): event is FollowEvent {
  return event.type === 'follow'
}

export function isUnfollowEvent(event: WebhookEvent): event is UnfollowEvent {
  return event.type === 'unfollow'
}

export function isPostbackEvent(event: WebhookEvent): event is PostbackEvent {
  return event.type === 'postback'
}

export function isJoinEvent(event: WebhookEvent): event is JoinEvent {
  return event.type === 'join'
}

export function isLeaveEvent(event: WebhookEvent): event is LeaveEvent {
  return event.type === 'leave'
}

/**
 * Extract user ID from event source
 */
export function getUserIdFromEvent(event: WebhookEvent): string | null {
  return event.source.userId || null
}

/**
 * Check if event is from user (not group or room)
 */
export function isUserEvent(event: WebhookEvent): boolean {
  return event.source.type === 'user' && !!event.source.userId
}

/**
 * Check if event is from group
 */
export function isGroupEvent(event: WebhookEvent): boolean {
  return event.source.type === 'group' && !!event.source.groupId
}

/**
 * Check if event is from room
 */
export function isRoomEvent(event: WebhookEvent): boolean {
  return event.source.type === 'room' && !!event.source.roomId
}

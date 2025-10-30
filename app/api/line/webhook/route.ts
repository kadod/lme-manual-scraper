/**
 * LINE Webhook Endpoint
 * Handles incoming webhook events from LINE Platform
 *
 * Events supported:
 * - follow: User adds bot as friend
 * - unfollow: User blocks or removes bot
 * - message: User sends message to bot
 * - postback: User interacts with template message
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

interface LineWebhookEvent {
  type: 'follow' | 'unfollow' | 'message' | 'postback' | 'join' | 'leave' | 'memberJoined' | 'memberLeft'
  timestamp: number
  source: {
    type: 'user' | 'group' | 'room'
    userId?: string
    groupId?: string
    roomId?: string
  }
  replyToken?: string
  message?: {
    id: string
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker'
    text?: string
    contentProvider?: {
      type: string
    }
    stickerId?: string
    packageId?: string
    [key: string]: unknown
  }
  postback?: {
    data: string
    params?: Record<string, unknown>
  }
}

interface LineWebhookBody {
  destination: string
  events: LineWebhookEvent[]
}

/**
 * Verify LINE webhook signature
 */
function verifySignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64')
  return hash === signature
}

/**
 * Get first active LINE channel (assuming one channel per organization)
 */
async function getFirstActiveChannel() {
  const supabase = await createClient()

  const { data: channel, error } = await supabase
    .from('line_channels')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !channel) {
    throw new Error('LINE channel not found or inactive')
  }

  return channel
}

/**
 * Get user profile from LINE API
 */
async function getLineProfile(userId: string, accessToken: string) {
  try {
    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      console.error('Failed to get LINE profile:', response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching LINE profile:', error)
    return null
  }
}

/**
 * Handle follow event - user adds bot as friend
 */
async function handleFollowEvent(
  event: LineWebhookEvent,
  lineChannel: any
) {
  if (!event.source.userId) return

  const supabase = await createClient()
  const userId = event.source.userId

  // Get user profile from LINE
  const profile = await getLineProfile(userId, lineChannel.channel_access_token)

  // Check if friend already exists
  const { data: existingFriend } = await supabase
    .from('line_friends')
    .select('id')
    .eq('line_channel_id', lineChannel.id)
    .eq('line_user_id', userId)
    .single()

  if (existingFriend) {
    // Update existing friend
    await supabase
      .from('line_friends')
      .update({
        follow_status: 'active',
        display_name: profile?.displayName || 'Unknown',
        picture_url: profile?.pictureUrl || null,
        status_message: profile?.statusMessage || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingFriend.id)
  } else {
    // Create new friend
    await supabase
      .from('line_friends')
      .insert({
        organization_id: lineChannel.organization_id,
        line_channel_id: lineChannel.id,
        line_user_id: userId,
        display_name: profile?.displayName || 'Unknown',
        picture_url: profile?.pictureUrl || null,
        status_message: profile?.statusMessage || null,
        follow_status: 'active',
        followed_at: new Date(event.timestamp).toISOString()
      })
  }

  console.log(`Friend added: ${userId}`)
}

/**
 * Handle unfollow event - user blocks or removes bot
 */
async function handleUnfollowEvent(
  event: LineWebhookEvent,
  lineChannel: any
) {
  if (!event.source.userId) return

  const supabase = await createClient()
  const userId = event.source.userId

  await supabase
    .from('line_friends')
    .update({
      follow_status: 'unfollowed',
      unfollowed_at: new Date(event.timestamp).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('line_channel_id', lineChannel.id)
    .eq('line_user_id', userId)

  console.log(`Friend unfollowed: ${userId}`)
}

/**
 * Handle message event - user sends message
 */
async function handleMessageEvent(
  event: LineWebhookEvent,
  lineChannel: any
) {
  if (!event.source.userId || !event.message) return

  const supabase = await createClient()
  const userId = event.source.userId
  const message = event.message

  // Get or create conversation
  const { data: friend } = await supabase
    .from('line_friends')
    .select('id')
    .eq('line_channel_id', lineChannel.id)
    .eq('line_user_id', userId)
    .single()

  if (!friend) {
    console.error('Friend not found for message event')
    return
  }

  // Find or create conversation
  let conversationId: string

  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('line_friend_id', friend.id)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existingConversation) {
    conversationId = existingConversation.id
  } else {
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        organization_id: lineChannel.organization_id,
        line_friend_id: friend.id,
        status: 'open',
        last_message_at: new Date(event.timestamp).toISOString()
      })
      .select('id')
      .single()

    if (error || !newConversation) {
      console.error('Failed to create conversation:', error)
      return
    }

    conversationId = newConversation.id
  }

  // Save message
  await supabase
    .from('chat_messages')
    .insert({
      organization_id: lineChannel.organization_id,
      conversation_id: conversationId,
      sender_type: 'user',
      message_type: message.type,
      content: message.text || `[${message.type}]`,
      metadata: {
        lineMessageId: message.id,
        stickerId: message.stickerId,
        packageId: message.packageId,
        contentProvider: message.contentProvider
      },
      created_at: new Date(event.timestamp).toISOString()
    })

  // Update conversation last message time
  await supabase
    .from('conversations')
    .update({
      last_message_at: new Date(event.timestamp).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)

  console.log(`Message saved: ${message.id} from ${userId}`)
}

/**
 * Log webhook event
 */
async function logWebhookEvent(
  lineChannelId: string,
  event: LineWebhookEvent,
  status: 'success' | 'error',
  errorMessage?: string
) {
  const supabase = await createClient()

  await supabase
    .from('webhook_logs')
    .insert({
      line_channel_id: lineChannelId,
      event_type: event.type,
      payload: event as unknown as any, // Cast to any to match Json type
      status,
      error_message: errorMessage || null,
      processed_at: new Date().toISOString()
    })
}

/**
 * POST /api/line/webhook
 * Main webhook endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get('x-line-signature')

    if (!signature) {
      console.error('Missing x-line-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Get raw body
    const rawBody = await request.text()
    console.log('Webhook received, body length:', rawBody.length)

    const body: LineWebhookBody = JSON.parse(rawBody)
    console.log('Parsed webhook body:', {
      destination: body.destination,
      eventCount: body.events?.length || 0,
      eventTypes: body.events?.map(e => e.type) || []
    })

    // LINE verification requests have empty events array - this is valid
    if (!body.destination || !body.events) {
      console.error('Invalid webhook payload:', {
        hasDestination: !!body.destination,
        hasEvents: !!body.events
      })
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    // If events array is empty, it's a verification request - just return success
    if (body.events.length === 0) {
      console.log('Webhook verification request received')
      return NextResponse.json({ success: true })
    }

    // Get LINE channel configuration (first active channel)
    let lineChannel
    try {
      lineChannel = await getFirstActiveChannel()
      console.log('LINE channel found:', {
        id: lineChannel.id,
        name: lineChannel.name,
        organizationId: lineChannel.organization_id,
        destination: body.destination
      })
    } catch (error) {
      console.error('Failed to get LINE channel:', error)
      return NextResponse.json(
        { error: 'LINE channel not found', destination: body.destination },
        { status: 404 }
      )
    }

    // Verify signature
    const isValid = verifySignature(
      rawBody,
      signature,
      lineChannel.channel_secret
    )

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    console.log('Signature verified successfully')

    // Process each event
    for (const event of body.events) {
      try {
        console.log(`Processing event: ${event.type}`, {
          userId: event.source.userId,
          timestamp: event.timestamp
        })

        switch (event.type) {
          case 'follow':
            await handleFollowEvent(event, lineChannel)
            console.log('Follow event processed successfully')
            break

          case 'unfollow':
            await handleUnfollowEvent(event, lineChannel)
            console.log('Unfollow event processed successfully')
            break

          case 'message':
            await handleMessageEvent(event, lineChannel)
            console.log('Message event processed successfully')
            break

          case 'postback':
            // Handle postback events (template message interactions)
            console.log('Postback event:', event.postback)
            break

          default:
            console.log('Unhandled event type:', event.type)
        }

        // Log successful processing
        await logWebhookEvent(lineChannel.id, event, 'success')

      } catch (error) {
        console.error(`Error processing event ${event.type}:`, error)
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

        // Log error
        await logWebhookEvent(
          lineChannel.id,
          event,
          'error',
          error instanceof Error ? error.message : 'Unknown error'
        )
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/line/webhook
 * Webhook verification endpoint (for LINE Platform setup)
 */
export async function GET() {
  return NextResponse.json({
    message: 'LINE Webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}

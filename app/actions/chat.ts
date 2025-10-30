'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'
import { revalidatePath } from 'next/cache'
import { createLineClient } from '@/lib/line/messaging-api'

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_type: 'user' | 'friend'
  message_type: 'text' | 'image' | 'sticker' | 'link'
  content: string
  metadata: Record<string, any>
  is_read: boolean
  sent_at: string
  created_at: string
  organization_id: string
}

export interface ConversationPreview {
  id: string
  display_name: string | null
  picture_url: string | null
  follow_status: string
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

/**
 * Get all conversations with latest message preview
 */
export async function getConversations(): Promise<ConversationPreview[]> {
  const supabase = await createClient()
  const organizationId = await getCurrentUserOrganizationId()

  if (!organizationId) {
    throw new Error('Organization not found')
  }

  // Get all friends
  const { data: friends, error: friendsError } = await supabase
    .from('line_friends')
    .select('id, display_name, picture_url, follow_status')
    .eq('organization_id', organizationId)
    .eq('follow_status', 'following')
    .order('last_interaction_at', { ascending: false })

  if (friendsError) {
    console.error('Error fetching friends:', friendsError)
    throw new Error('Failed to fetch conversations')
  }

  if (!friends || friends.length === 0) {
    return []
  }

  // Get latest messages for each friend
  const conversationsWithMessages = await Promise.all(
    friends.map(async (friend) => {
      const { data: latestMessage } = await supabase
        .from('chat_messages')
        .select('content, sent_at')
        .eq('conversation_id', friend.id)
        .eq('organization_id', organizationId)
        .order('sent_at', { ascending: false })
        .limit(1)
        .single()

      const { count: unreadCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', friend.id)
        .eq('organization_id', organizationId)
        .eq('sender_type', 'friend')
        .eq('is_read', false)

      return {
        id: friend.id,
        display_name: friend.display_name,
        picture_url: friend.picture_url,
        follow_status: friend.follow_status,
        last_message: latestMessage?.content || null,
        last_message_at: latestMessage?.sent_at || null,
        unread_count: unreadCount || 0,
      }
    })
  )

  // Sort by latest message
  return conversationsWithMessages.sort((a, b) => {
    if (!a.last_message_at) return 1
    if (!b.last_message_at) return -1
    return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  })
}

/**
 * Get messages for a specific conversation
 */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const organizationId = await getCurrentUserOrganizationId()

  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('organization_id', organizationId)
    .order('sent_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    throw new Error('Failed to fetch messages')
  }

  return (messages as ChatMessage[]) || []
}

/**
 * Send a new message
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  messageType: 'text' | 'image' | 'sticker' | 'link' = 'text',
  metadata: Record<string, any> = {}
): Promise<ChatMessage> {
  const supabase = await createClient()
  const organizationId = await getCurrentUserOrganizationId()

  if (!organizationId) {
    throw new Error('Organization not found')
  }

  if (!content.trim()) {
    throw new Error('Message content cannot be empty')
  }

  // Get friend's LINE user ID
  const { data: friend, error: friendError } = await supabase
    .from('line_friends')
    .select('line_user_id')
    .eq('id', conversationId)
    .eq('organization_id', organizationId)
    .single()

  if (friendError || !friend) {
    console.error('Error fetching friend:', friendError)
    throw new Error('Friend not found')
  }

  // Get LINE credentials from organization settings
  const { data: org } = await supabase
    .from('organizations')
    .select('line_channel_access_token, line_channel_secret')
    .eq('id', organizationId)
    .single()

  // Send message via LINE Messaging API if credentials available
  if (org?.line_channel_access_token && org?.line_channel_secret && friend.line_user_id) {
    try {
      const lineClient = createLineClient(
        org.line_channel_access_token,
        org.line_channel_secret
      )

      // Send message based on type
      if (messageType === 'text') {
        await lineClient.sendTextMessage(friend.line_user_id, content.trim())
      }
      // Add support for other message types as needed
    } catch (lineError) {
      console.error('Error sending LINE message:', lineError)
      // Continue to save message even if LINE API fails
    }
  }

  // Save message to database
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      sender_type: 'user',
      message_type: messageType,
      content: content.trim(),
      metadata,
      is_read: true,
      organization_id: organizationId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    throw new Error('Failed to send message')
  }

  // Update friend's last interaction time
  await supabase
    .from('line_friends')
    .update({ last_interaction_at: new Date().toISOString() })
    .eq('id', conversationId)
    .eq('organization_id', organizationId)

  revalidatePath('/dashboard/chat')
  return message as ChatMessage
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string): Promise<void> {
  const supabase = await createClient()
  const organizationId = await getCurrentUserOrganizationId()

  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('organization_id', organizationId)
    .eq('sender_type', 'friend')
    .eq('is_read', false)

  if (error) {
    console.error('Error marking messages as read:', error)
    throw new Error('Failed to mark messages as read')
  }

  revalidatePath('/dashboard/chat')
}

/**
 * Get total unread message count
 */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient()
  const organizationId = await getCurrentUserOrganizationId()

  if (!organizationId) {
    return 0
  }

  const { count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('sender_type', 'friend')
    .eq('is_read', false)

  return count || 0
}

/**
 * Get friend details
 */
export async function getFriendDetails(friendId: string) {
  const supabase = await createClient()
  const organizationId = await getCurrentUserOrganizationId()

  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const { data: friend, error } = await supabase
    .from('line_friends')
    .select('*')
    .eq('id', friendId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching friend details:', error)
    throw new Error('Friend not found')
  }

  return friend
}

/**
 * Message Query Utilities
 * Database operations for messages and message recipients
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables, TablesInsert, TablesUpdate } from '@/types/supabase';

type Message = Tables<'messages'>;
type MessageInsert = TablesInsert<'messages'>;
type MessageUpdate = TablesUpdate<'messages'>;
type MessageRecipient = Tables<'message_recipients'>;
type MessageRecipientInsert = TablesInsert<'message_recipients'>;
type MessageRecipientUpdate = TablesUpdate<'message_recipients'>;

/**
 * Get all messages for a user with pagination
 */
export async function getMessages(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: {
    page?: number;
    limit?: number;
    status?: Message['status'];
  } = {}
) {
  const { page = 1, limit = 20, status } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    data,
    count,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

/**
 * Get a single message by ID
 */
export async function getMessageById(
  supabase: SupabaseClient<Database>,
  messageId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get message recipients with friend details
 */
export async function getMessageRecipients(
  supabase: SupabaseClient<Database>,
  messageId: string,
  options: {
    page?: number;
    limit?: number;
    status?: MessageRecipient['status'];
  } = {}
) {
  const { page = 1, limit = 50, status } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('message_recipients')
    .select(
      `
      *,
      friends:friend_id (
        id,
        line_user_id,
        display_name,
        picture_url
      )
    `,
      { count: 'exact' }
    )
    .eq('message_id', messageId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    data,
    count,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

/**
 * Create a new message
 */
export async function createMessage(
  supabase: SupabaseClient<Database>,
  message: MessageInsert
) {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update a message
 */
export async function updateMessage(
  supabase: SupabaseClient<Database>,
  messageId: string,
  userId: string,
  updates: MessageUpdate
) {
  const { data, error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', messageId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete a message
 */
export async function deleteMessage(
  supabase: SupabaseClient<Database>,
  messageId: string,
  userId: string
) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Create message recipients in bulk
 */
export async function createMessageRecipients(
  supabase: SupabaseClient<Database>,
  recipients: MessageRecipientInsert[]
) {
  const { data, error } = await supabase
    .from('message_recipients')
    .insert(recipients)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update a message recipient
 */
export async function updateMessageRecipient(
  supabase: SupabaseClient<Database>,
  recipientId: string,
  updates: MessageRecipientUpdate
) {
  const { data, error } = await supabase
    .from('message_recipients')
    .update(updates)
    .eq('id', recipientId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update message statistics
 */
export async function updateMessageStats(
  supabase: SupabaseClient<Database>,
  messageId: string,
  stats: {
    sent_count?: number;
    delivered_count?: number;
    read_count?: number;
    click_count?: number;
    error_count?: number;
  }
) {
  const { data, error } = await supabase
    .from('messages')
    .update(stats)
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get scheduled messages that are ready to send
 */
export async function getScheduledMessagesReadyToSend(
  supabase: SupabaseClient<Database>
) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get pending recipients for a message (for batch processing)
 */
export async function getPendingRecipients(
  supabase: SupabaseClient<Database>,
  messageId: string,
  limit = 100
) {
  const { data, error } = await supabase
    .from('message_recipients')
    .select(
      `
      *,
      friends:friend_id (
        id,
        line_user_id,
        display_name,
        is_blocked
      )
    `
    )
    .eq('message_id', messageId)
    .eq('status', 'pending')
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get message statistics summary
 */
export async function getMessageStatsSummary(
  supabase: SupabaseClient<Database>,
  messageId: string
) {
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (messageError) {
    throw messageError;
  }

  const { data: recipients, error: recipientsError } = await supabase
    .from('message_recipients')
    .select('status')
    .eq('message_id', messageId);

  if (recipientsError) {
    throw recipientsError;
  }

  const stats = {
    total: recipients.length,
    pending: recipients.filter(r => r.status === 'pending').length,
    sent: recipients.filter(r => r.status === 'sent').length,
    delivered: recipients.filter(r => r.status === 'delivered').length,
    failed: recipients.filter(r => r.status === 'failed').length,
  };

  return {
    message,
    stats,
  };
}

/**
 * Cancel a scheduled message
 */
export async function cancelScheduledMessage(
  supabase: SupabaseClient<Database>,
  messageId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('messages')
    .update({ status: 'cancelled' })
    .eq('id', messageId)
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get messages by status
 */
export async function getMessagesByStatus(
  supabase: SupabaseClient<Database>,
  userId: string,
  status: Message['status'],
  limit = 20
) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Resolve target recipients from segments/tags/manual selection
 */
export async function resolveTargetRecipients(
  supabase: SupabaseClient<Database>,
  userId: string,
  targetType: Message['target_type'],
  targetIds?: string[] | null
): Promise<string[]> {
  let friendIds: string[] = [];

  switch (targetType) {
    case 'all':
      // Get all friends
      const { data: allFriends, error: allError } = await supabase
        .from('line_friends')
        .select('id')
        .eq('organization_id', userId) // TODO: Should use organization_id properly
        .eq('is_blocked', false);

      if (allError) throw allError;
      friendIds = allFriends.map(f => f.id);
      break;

    case 'segment':
      if (!targetIds || targetIds.length === 0) break;

      // Get friends from segment
      for (const segmentId of targetIds) {
        const { data: segment, error: segmentError } = await supabase
          .from('segments')
          .select('conditions')
          .eq('id', segmentId)
          .eq('organization_id', userId) // TODO: Should use organization_id properly
          .single();

        if (segmentError) continue;

        // Note: This is simplified. In production, you'd need to evaluate segment conditions
        // For now, we'll just get all friends and filter later
        const { data: segmentFriends, error: friendsError } = await supabase
          .from('line_friends')
          .select('id')
          .eq('organization_id', userId) // TODO: Should use organization_id properly
          .eq('is_blocked', false);

        if (!friendsError && segmentFriends) {
          friendIds.push(...segmentFriends.map(f => f.id));
        }
      }
      break;

    case 'tags':
      if (!targetIds || targetIds.length === 0) break;

      // Get friends with specified tags
      const { data: taggedFriends, error: tagError } = await supabase
        .from('friend_tags')
        .select('line_friend_id')
        .in('tag_id', targetIds);

      if (tagError) throw tagError;
      friendIds = [...new Set(taggedFriends.map(ft => ft.line_friend_id))];
      break;

    case 'manual':
      // Use provided friend IDs directly
      friendIds = targetIds || [];
      break;
  }

  // Remove duplicates
  return [...new Set(friendIds)];
}

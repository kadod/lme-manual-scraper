'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  ActiveConversation,
  ConversationStatus,
  ConversationDetail,
  ConversationHistory,
} from '@/types/auto-response'

/**
 * Get current user ID from authenticated session
 */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

// ============================================================================
// Conversation Management
// ============================================================================

/**
 * Get all active conversations
 */
export async function getActiveConversations(filters?: {
  friendId?: string
  scenarioId?: string
  status?: ConversationStatus
  page?: number
  limit?: number
}) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('auto_response_conversations')
    .select(`
      *,
      friend:friends (
        id,
        display_name,
        picture_url
      ),
      scenario:auto_response_rules!auto_response_conversations_scenario_id_fkey (
        id,
        name
      )
    `, { count: 'exact' })
    .eq('user_id', userId)

  if (filters?.friendId) {
    query = query.eq('friend_id', filters.friendId)
  }

  if (filters?.scenarioId) {
    query = query.eq('scenario_id', filters.scenarioId)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  } else {
    // Default to active conversations only
    query = query.eq('status', 'active')
  }

  query = query.order('last_interaction_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching active conversations:', error)
    throw error
  }

  return {
    data: (data || []) as ActiveConversation[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Get conversation details with full history
 */
export async function getConversation(conversationId: string): Promise<ConversationDetail | null> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Get conversation
  const { data: conversation, error: convError } = await supabase
    .from('auto_response_conversations')
    .select(`
      *,
      friend:friends (
        id,
        display_name,
        picture_url
      ),
      scenario:auto_response_rules!auto_response_conversations_scenario_id_fkey (
        id,
        name,
        description,
        actions
      )
    `)
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()

  if (convError || !conversation) {
    console.error('Error fetching conversation:', convError)
    return null
  }

  // Get conversation history
  const { data: history, error: histError } = await supabase
    .from('auto_response_conversation_history')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (histError) {
    console.error('Error fetching conversation history:', histError)
  }

  return {
    conversation: conversation as ActiveConversation,
    history: (history || []) as ConversationHistory[],
    scenario: {
      id: conversation.scenario?.id || '',
      name: conversation.scenario?.name || '',
      description: conversation.scenario?.description || null,
      steps: conversation.scenario?.actions || [],
    },
  }
}

/**
 * End a conversation (mark as completed)
 */
export async function endConversation(conversationId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from('auto_response_conversations')
    .select('id, user_id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    throw new Error('Conversation not found')
  }

  const { data, error } = await supabase
    .from('auto_response_conversations')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .select()
    .single()

  if (error) {
    console.error('Error ending conversation:', error)
    throw error
  }

  revalidatePath('/dashboard/auto-response/conversations')
  revalidatePath(`/dashboard/auto-response/conversations/${conversationId}`)
  return data
}

/**
 * Reset a conversation (start over from first step)
 */
export async function resetConversation(conversationId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from('auto_response_conversations')
    .select('id, user_id, scenario_id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    throw new Error('Conversation not found')
  }

  const { data, error } = await supabase
    .from('auto_response_conversations')
    .update({
      current_step: 1,
      status: 'active',
      started_at: new Date().toISOString(),
      last_interaction_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .select()
    .single()

  if (error) {
    console.error('Error resetting conversation:', error)
    throw error
  }

  // Clear conversation history
  await supabase
    .from('auto_response_conversation_history')
    .delete()
    .eq('conversation_id', conversationId)

  revalidatePath('/dashboard/auto-response/conversations')
  revalidatePath(`/dashboard/auto-response/conversations/${conversationId}`)
  return data
}

/**
 * Abandon a conversation (mark as abandoned)
 */
export async function abandonConversation(conversationId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from('auto_response_conversations')
    .select('id, user_id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    throw new Error('Conversation not found')
  }

  const { data, error } = await supabase
    .from('auto_response_conversations')
    .update({
      status: 'abandoned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .select()
    .single()

  if (error) {
    console.error('Error abandoning conversation:', error)
    throw error
  }

  revalidatePath('/dashboard/auto-response/conversations')
  revalidatePath(`/dashboard/auto-response/conversations/${conversationId}`)
  return data
}

/**
 * Delete a conversation and its history
 */
export async function deleteConversation(conversationId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from('auto_response_conversations')
    .select('id, user_id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    throw new Error('Conversation not found')
  }

  // Delete history first (foreign key)
  await supabase
    .from('auto_response_conversation_history')
    .delete()
    .eq('conversation_id', conversationId)

  // Delete conversation
  const { error } = await supabase
    .from('auto_response_conversations')
    .delete()
    .eq('id', conversationId)

  if (error) {
    console.error('Error deleting conversation:', error)
    throw error
  }

  revalidatePath('/dashboard/auto-response/conversations')
  return { success: true }
}

/**
 * Get conversation statistics
 */
export async function getConversationStats(dateRange?: {
  startDate: string
  endDate: string
}) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  let query = supabase
    .from('auto_response_conversations')
    .select('status, started_at, last_interaction_at', { count: 'exact' })
    .eq('user_id', userId)

  if (dateRange) {
    query = query
      .gte('started_at', dateRange.startDate)
      .lte('started_at', dateRange.endDate)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching conversation stats:', error)
    throw error
  }

  const total = count || 0
  const active = data?.filter((c) => c.status === 'active').length || 0
  const completed = data?.filter((c) => c.status === 'completed').length || 0
  const abandoned = data?.filter((c) => c.status === 'abandoned').length || 0
  const expired = data?.filter((c) => c.status === 'expired').length || 0

  // Calculate average duration for completed conversations
  let totalDuration = 0
  let completedCount = 0

  data?.forEach((conv) => {
    if (conv.status === 'completed') {
      const start = new Date(conv.started_at).getTime()
      const end = new Date(conv.last_interaction_at).getTime()
      totalDuration += end - start
      completedCount++
    }
  })

  const averageDuration = completedCount > 0 ? totalDuration / completedCount : 0

  return {
    total,
    active,
    completed,
    abandoned,
    expired,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    abandonmentRate: total > 0 ? (abandoned / total) * 100 : 0,
    averageDurationMs: averageDuration,
    averageDurationMinutes: Math.round(averageDuration / 60000),
  }
}

/**
 * Get conversations by scenario
 */
export async function getConversationsByScenario(
  scenarioId: string,
  filters?: {
    status?: ConversationStatus
    page?: number
    limit?: number
  }
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('auto_response_conversations')
    .select(`
      *,
      friend:friends (
        id,
        display_name,
        picture_url
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  query = query.order('last_interaction_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching conversations by scenario:', error)
    throw error
  }

  return {
    data: (data || []) as ActiveConversation[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

/**
 * Clean up expired conversations
 */
export async function cleanupExpiredConversations() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  const now = new Date().toISOString()

  // Mark expired conversations
  const { data, error } = await supabase
    .from('auto_response_conversations')
    .update({ status: 'expired' })
    .eq('user_id', userId)
    .eq('status', 'active')
    .not('expires_at', 'is', null)
    .lt('expires_at', now)
    .select()

  if (error) {
    console.error('Error cleaning up expired conversations:', error)
    throw error
  }

  revalidatePath('/dashboard/auto-response/conversations')
  return { expiredCount: data?.length || 0 }
}

/**
 * Export conversations to CSV
 */
export async function exportConversationsToCSV(filters?: {
  scenarioId?: string
  status?: ConversationStatus
  startDate?: string
  endDate?: string
}) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    let query = supabase
      .from('auto_response_conversations')
      .select(`
        *,
        friend:friends (
          display_name
        ),
        scenario:auto_response_rules!auto_response_conversations_scenario_id_fkey (
          name
        )
      `)
      .eq('user_id', userId)

    if (filters?.scenarioId) {
      query = query.eq('scenario_id', filters.scenarioId)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.startDate) {
      query = query.gte('started_at', filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte('started_at', filters.endDate)
    }

    const { data: conversations, error } = await query

    if (error) {
      throw error
    }

    const headers = [
      'ID',
      'Friend Name',
      'Scenario Name',
      'Current Step',
      'Total Steps',
      'Status',
      'Started At',
      'Last Interaction',
      'Expires At',
    ]

    const rows = (conversations || []).map((conv: any) => {
      return [
        conv.id,
        conv.friend?.display_name || 'Unknown',
        conv.scenario?.name || 'Unknown',
        conv.current_step,
        conv.total_steps,
        conv.status,
        new Date(conv.started_at).toLocaleString(),
        new Date(conv.last_interaction_at).toLocaleString(),
        conv.expires_at ? new Date(conv.expires_at).toLocaleString() : '',
      ]
    })

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    return {
      success: true,
      data: csv,
      filename: `conversations_${new Date().toISOString().split('T')[0]}.csv`,
    }
  } catch (error) {
    console.error('Error exporting conversations:', error)
    return {
      success: false,
      error: 'Failed to export conversations',
    }
  }
}

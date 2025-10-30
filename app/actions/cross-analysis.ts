'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  CrossAnalysisConfig,
  CrossAnalysisResult,
  CrossAnalysisPreset,
} from '@/types/analytics'

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

/**
 * Perform cross-analysis with custom configuration
 */
export async function performCrossAnalysis(
  config: CrossAnalysisConfig
): Promise<CrossAnalysisResult> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  const { xAxis, yAxis, filters } = config

  let data: { x_value: string; y_value: number; metadata?: Record<string, unknown> }[] = []

  // Handle different X and Y axis combinations
  if (xAxis === 'date' && yAxis === 'friends') {
    data = await analyzeDateVsFriends(supabase, userId, filters)
  } else if (xAxis === 'date' && yAxis === 'messages') {
    data = await analyzeDateVsMessages(supabase, userId, filters)
  } else if (xAxis === 'date' && yAxis === 'delivery_rate') {
    data = await analyzeDateVsDeliveryRate(supabase, userId, filters)
  } else if (xAxis === 'date' && yAxis === 'engagement') {
    data = await analyzeDateVsEngagement(supabase, userId, filters)
  } else if (xAxis === 'tag' && yAxis === 'friends') {
    data = await analyzeTagVsFriends(supabase, userId, filters)
  } else if (xAxis === 'tag' && yAxis === 'messages') {
    data = await analyzeTagVsMessages(supabase, userId, filters)
  } else if (xAxis === 'message_type' && yAxis === 'delivery_rate') {
    data = await analyzeMessageTypeVsDeliveryRate(supabase, userId, filters)
  } else if (xAxis === 'message_type' && yAxis === 'engagement') {
    data = await analyzeMessageTypeVsEngagement(supabase, userId, filters)
  } else if (xAxis === 'segment' && yAxis === 'friends') {
    data = await analyzeSegmentVsFriends(supabase, userId, filters)
  } else if (xAxis === 'segment' && yAxis === 'messages') {
    data = await analyzeSegmentVsMessages(supabase, userId, filters)
  } else {
    throw new Error(`Unsupported analysis combination: ${xAxis} vs ${yAxis}`)
  }

  // Calculate summary statistics
  const values = data.map((d) => d.y_value)
  const summary = {
    total: values.reduce((sum, val) => sum + val, 0),
    average: values.length > 0 ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length) : 0,
    max: values.length > 0 ? Math.max(...values) : 0,
    min: values.length > 0 ? Math.min(...values) : 0,
  }

  return {
    config,
    data,
    summary,
  }
}

/**
 * Analysis functions for different combinations
 */
async function analyzeDateVsFriends(
  supabase: any,
  userId: string,
  filters?: CrossAnalysisConfig['filters']
): Promise<{ x_value: string; y_value: number; metadata?: Record<string, unknown> }[]> {
  const startDate = filters?.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = filters?.dateTo || new Date().toISOString()

  const { data: friends } = await supabase
    .from('line_friends')
    .select('created_at')
    .eq('organization_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  // Group by date
  const byDate = (friends || []).reduce((acc: Record<string, number>, friend: any) => {
    const date = new Date(friend.created_at).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  return Object.entries(byDate)
    .map(([date, count]): { x_value: string; y_value: number } => ({
      x_value: date,
      y_value: count as number,
    }))
    .sort((a, b) => a.x_value.localeCompare(b.x_value))
}

async function analyzeDateVsMessages(
  supabase: any,
  userId: string,
  filters?: CrossAnalysisConfig['filters']
): Promise<{ x_value: string; y_value: number; metadata?: Record<string, unknown> }[]> {
  const startDate = filters?.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = filters?.dateTo || new Date().toISOString()

  let query = supabase
    .from('messages')
    .select('created_at, type')
    .eq('organization_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (filters?.messageTypes && filters.messageTypes.length > 0) {
    query = query.in('type', filters.messageTypes)
  }

  const { data: messages } = await query

  // Group by date
  const byDate = (messages || []).reduce((acc: Record<string, number>, message: any) => {
    const date = new Date(message.created_at).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  return Object.entries(byDate)
    .map(([date, count]): { x_value: string; y_value: number } => ({
      x_value: date,
      y_value: count as number,
    }))
    .sort((a, b) => a.x_value.localeCompare(b.x_value))
}

async function analyzeDateVsDeliveryRate(
  supabase: any,
  userId: string,
  filters?: CrossAnalysisConfig['filters']
): Promise<{ x_value: string; y_value: number; metadata?: Record<string, unknown> }[]> {
  const startDate = filters?.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = filters?.dateTo || new Date().toISOString()

  const { data: messages } = await supabase
    .from('messages')
    .select('id, created_at')
    .eq('organization_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (!messages || messages.length === 0) {
    return []
  }

  const messageIds = messages.map((m: any) => m.id)

  const { data: recipients } = await supabase
    .from('message_recipients')
    .select('message_id, status, created_at')
    .in('message_id', messageIds)

  // Group by date
  const byDate = (recipients || []).reduce((acc: Record<string, { sent: number; delivered: number }>, recipient: any) => {
    const date = new Date(recipient.created_at).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { sent: 0, delivered: 0 }
    }
    acc[date].sent += 1
    if (recipient.status === 'delivered' || recipient.status === 'sent') {
      acc[date].delivered += 1
    }
    return acc
  }, {})

  return Object.entries(byDate)
    .map(([date, stats]): { x_value: string; y_value: number; metadata: Record<string, unknown> } => ({
      x_value: date,
      y_value: (stats as { sent: number; delivered: number }).sent > 0
        ? Math.round(((stats as { sent: number; delivered: number }).delivered / (stats as { sent: number; delivered: number }).sent) * 100)
        : 0,
      metadata: {
        sent: (stats as { sent: number; delivered: number }).sent,
        delivered: (stats as { sent: number; delivered: number }).delivered,
      },
    }))
    .sort((a, b) => a.x_value.localeCompare(b.x_value))
}

async function analyzeDateVsEngagement(
  supabase: any,
  userId: string,
  filters?: CrossAnalysisConfig['filters']
): Promise<{ x_value: string; y_value: number; metadata?: Record<string, unknown> }[]> {
  const startDate = filters?.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = filters?.dateTo || new Date().toISOString()

  const { data: messages } = await supabase
    .from('messages')
    .select('id, created_at')
    .eq('organization_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (!messages || messages.length === 0) {
    return []
  }

  const messageIds = messages.map((m: any) => m.id)

  const { data: recipients } = await supabase
    .from('message_recipients')
    .select('message_id, status, read_at, clicked_at, created_at')
    .in('message_id', messageIds)

  // Group by date
  const byDate = (recipients || []).reduce((acc: Record<string, { delivered: number; engaged: number }>, recipient: any) => {
    const date = new Date(recipient.created_at).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { delivered: 0, engaged: 0 }
    }
    if (recipient.status === 'delivered' || recipient.status === 'sent') {
      acc[date].delivered += 1
    }
    if (recipient.read_at || recipient.clicked_at) {
      acc[date].engaged += 1
    }
    return acc
  }, {})

  return Object.entries(byDate)
    .map(([date, stats]): { x_value: string; y_value: number; metadata: Record<string, unknown> } => ({
      x_value: date,
      y_value: (stats as { delivered: number; engaged: number }).delivered > 0
        ? Math.round(((stats as { delivered: number; engaged: number }).engaged / (stats as { delivered: number; engaged: number }).delivered) * 100)
        : 0,
      metadata: {
        delivered: (stats as { delivered: number; engaged: number }).delivered,
        engaged: (stats as { delivered: number; engaged: number }).engaged,
      },
    }))
    .sort((a, b) => a.x_value.localeCompare(b.x_value))
}

async function analyzeTagVsFriends(
  supabase: any,
  userId: string,
  filters?: CrossAnalysisConfig['filters']
): Promise<{ x_value: string; y_value: number; metadata?: Record<string, unknown> }[]> {
  let query = supabase
    .from('tags')
    .select(`
      id,
      name,
      friend_tags (
        line_friend_id
      )
    `)
    .eq('organization_id', userId)

  if (filters?.tags && filters.tags.length > 0) {
    query = query.in('id', filters.tags)
  }

  const { data: tags } = await query

  return (tags || []).map((tag: any) => ({
    x_value: tag.name,
    y_value: tag.friend_tags?.length || 0,
    metadata: {
      tag_id: tag.id,
    },
  }))
}

async function analyzeTagVsMessages(
  supabase: any,
  userId: string,
  filters?: CrossAnalysisConfig['filters']
): Promise<{ x_value: string; y_value: number; metadata?: Record<string, unknown> }[]> {
  const { data: tags } = await supabase
    .from('tags')
    .select('id, name')
    .eq('organization_id', userId)

  if (!tags || tags.length === 0) {
    return []
  }

  // Get messages targeting specific tags
  const { data: messages } = await supabase
    .from('messages')
    .select('id, target_type, target_ids')
    .eq('organization_id', userId)
    .eq('target_type', 'tags')

  const tagMessageCount = (messages || []).reduce((acc: Record<string, number>, message: any) => {
    const targetIds = message.target_ids || []
    targetIds.forEach((tagId: string) => {
      acc[tagId] = (acc[tagId] || 0) + 1
    })
    return acc
  }, {})

  return tags.map((tag: any) => ({
    x_value: tag.name,
    y_value: tagMessageCount[tag.id] || 0,
    metadata: {
      tag_id: tag.id,
    },
  }))
}

async function analyzeMessageTypeVsDeliveryRate(
  supabase: any,
  userId: string,
  filters?: CrossAnalysisConfig['filters']
): Promise<{ x_value: string; y_value: number; metadata?: Record<string, unknown> }[]> {
  const startDate = filters?.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = filters?.dateTo || new Date().toISOString()

  const { data: messages } = await supabase
    .from('messages')
    .select('id, type')
    .eq('organization_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (!messages || messages.length === 0) {
    return []
  }

  const messageIds = messages.map((m: any) => m.id)

  const { data: recipients } = await supabase
    .from('message_recipients')
    .select('message_id, status')
    .in('message_id', messageIds)

  // Group by message type
  const byType = (messages || []).reduce((acc: Record<string, { sent: number; delivered: number }>, message: any) => {
    if (!acc[message.type]) {
      acc[message.type] = { sent: 0, delivered: 0 }
    }

    const messageRecipients = (recipients || []).filter((r: any) => r.message_id === message.id)
    acc[message.type].sent += messageRecipients.length
    acc[message.type].delivered += messageRecipients.filter((r: any) => r.status === 'delivered' || r.status === 'sent').length

    return acc
  }, {})

  return Object.entries(byType).map(([type, stats]): { x_value: string; y_value: number; metadata: Record<string, unknown> } => ({
    x_value: type,
    y_value: (stats as { sent: number; delivered: number }).sent > 0
      ? Math.round(((stats as { sent: number; delivered: number }).delivered / (stats as { sent: number; delivered: number }).sent) * 100)
      : 0,
    metadata: {
      sent: (stats as { sent: number; delivered: number }).sent,
      delivered: (stats as { sent: number; delivered: number }).delivered,
    },
  }))
}

async function analyzeMessageTypeVsEngagement(
  supabase: any,
  userId: string,
  filters?: CrossAnalysisConfig['filters']
): Promise<{ x_value: string; y_value: number; metadata?: Record<string, unknown> }[]> {
  const startDate = filters?.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = filters?.dateTo || new Date().toISOString()

  const { data: messages } = await supabase
    .from('messages')
    .select('id, type')
    .eq('organization_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (!messages || messages.length === 0) {
    return []
  }

  const messageIds = messages.map((m: any) => m.id)

  const { data: recipients } = await supabase
    .from('message_recipients')
    .select('message_id, status, read_at, clicked_at')
    .in('message_id', messageIds)

  // Group by message type
  const byType = (messages || []).reduce((acc: Record<string, { delivered: number; engaged: number }>, message: any) => {
    if (!acc[message.type]) {
      acc[message.type] = { delivered: 0, engaged: 0 }
    }

    const messageRecipients = (recipients || []).filter((r: any) => r.message_id === message.id)
    acc[message.type].delivered += messageRecipients.filter((r: any) => r.status === 'delivered' || r.status === 'sent').length
    acc[message.type].engaged += messageRecipients.filter((r: any) => r.read_at || r.clicked_at).length

    return acc
  }, {})

  return Object.entries(byType).map(([type, stats]): { x_value: string; y_value: number; metadata: Record<string, unknown> } => ({
    x_value: type,
    y_value: (stats as { delivered: number; engaged: number }).delivered > 0
      ? Math.round(((stats as { delivered: number; engaged: number }).engaged / (stats as { delivered: number; engaged: number }).delivered) * 100)
      : 0,
    metadata: {
      delivered: (stats as { delivered: number; engaged: number }).delivered,
      engaged: (stats as { delivered: number; engaged: number }).engaged,
    },
  }))
}

async function analyzeSegmentVsFriends(
  supabase: any,
  userId: string,
  filters?: CrossAnalysisConfig['filters']
): Promise<{ x_value: string; y_value: number; metadata?: Record<string, unknown> }[]> {
  let query = supabase
    .from('segments')
    .select('id, name')
    .eq('organization_id', userId)

  if (filters?.segments && filters.segments.length > 0) {
    query = query.in('id', filters.segments)
  }

  const { data: segments } = await query

  if (!segments || segments.length === 0) {
    return []
  }

  // Note: Actual segment member count would require evaluating segment conditions
  // This is a simplified implementation
  return segments.map((segment: any) => ({
    x_value: segment.name,
    y_value: segment.estimated_count || 0,
    metadata: {
      segment_id: segment.id,
    },
  }))
}

async function analyzeSegmentVsMessages(
  supabase: any,
  userId: string,
  filters?: CrossAnalysisConfig['filters']
): Promise<{ x_value: string; y_value: number; metadata?: Record<string, unknown> }[]> {
  const { data: segments } = await supabase
    .from('segments')
    .select('id, name')
    .eq('organization_id', userId)

  if (!segments || segments.length === 0) {
    return []
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('id, target_type, target_ids')
    .eq('organization_id', userId)
    .eq('target_type', 'segment')

  const segmentMessageCount = (messages || []).reduce((acc: Record<string, number>, message: any) => {
    const targetIds = message.target_ids || []
    targetIds.forEach((segmentId: string) => {
      acc[segmentId] = (acc[segmentId] || 0) + 1
    })
    return acc
  }, {})

  return segments.map((segment: any) => ({
    x_value: segment.name,
    y_value: segmentMessageCount[segment.id] || 0,
    metadata: {
      segment_id: segment.id,
    },
  }))
}

/**
 * Save cross-analysis preset
 */
export async function saveCrossAnalysisPreset(
  name: string,
  description: string | null,
  config: CrossAnalysisConfig
): Promise<CrossAnalysisPreset> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Note: This requires a cross_analysis_presets table in the database
  // For now, we'll simulate the response
  const preset: CrossAnalysisPreset = {
    id: crypto.randomUUID(),
    user_id: userId,
    name,
    description,
    config,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // In production: insert into database
  // await supabase.from('cross_analysis_presets').insert(preset)

  revalidatePath('/dashboard/analytics/cross-analysis')
  return preset
}

/**
 * Get all cross-analysis presets for the user
 */
export async function getCrossAnalysisPresets(): Promise<CrossAnalysisPreset[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Note: This requires a cross_analysis_presets table in the database
  // For now, return empty array
  return []
}

/**
 * Delete a cross-analysis preset
 */
export async function deleteCrossAnalysisPreset(id: string): Promise<{ success: boolean }> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Note: This requires a cross_analysis_presets table in the database
  // In production: delete from database
  // await supabase.from('cross_analysis_presets').delete().eq('id', id).eq('user_id', userId)

  revalidatePath('/dashboard/analytics/cross-analysis')
  return { success: true }
}

/**
 * Export cross-analysis data
 */
export async function exportCrossAnalysis(
  result: CrossAnalysisResult,
  format: 'csv' | 'png'
): Promise<{ url: string; filename: string }> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { config, data, summary } = result

  if (format === 'csv') {
    const csvContent = [
      `Cross Analysis: ${config.xAxis} vs ${config.yAxis}`,
      '',
      'Summary',
      `Total,${summary.total}`,
      `Average,${summary.average}`,
      `Maximum,${summary.max}`,
      `Minimum,${summary.min}`,
      '',
      `${config.xAxis},${config.yAxis}`,
      ...data.map((d) => `${d.x_value},${d.y_value}`),
    ].join('\n')

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `cross-analysis-${config.xAxis}-vs-${config.yAxis}-${timestamp}.csv`
    const mockUrl = `/exports/${filename}`

    return { url: mockUrl, filename }
  }

  // PNG export would require a chart rendering library
  throw new Error('PNG export not yet implemented')
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  DashboardStats,
  FriendsTrendData,
  MessageStatsData,
  EngagementRateData,
  TimeRange,
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
 * Get organization ID for the current user
 */
async function getOrganizationId(): Promise<string | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('user_id', userId)
    .single()

  return profile?.organization_id || null
}

/**
 * Calculate growth rate between current and previous values
 */
function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Format metric based on type
 */
function formatMetric(value: number, type: 'number' | 'percentage' | 'rate'): string {
  switch (type) {
    case 'percentage':
      return `${Math.round(value * 100) / 100}%`
    case 'rate':
      return `${Math.round(value * 100) / 100}%`
    default:
      return value.toLocaleString()
  }
}

/**
 * Get date range from TimeRange preset
 */
function getDateRange(range: TimeRange): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (range) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '90d':
      start.setDate(end.getDate() - 90)
      break
    case '1y':
      start.setFullYear(end.getFullYear() - 1)
      break
    case 'all':
      start.setFullYear(2020, 0, 1)
      break
  }

  return { start, end }
}

/**
 * Get analytics overview for dashboard KPIs
 */
export async function getAnalyticsOverview(
  dateRange: TimeRange = '30d'
): Promise<DashboardStats> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()
  const { start, end } = getDateRange(dateRange)

  // Get current period stats from analytics_daily_stats
  const { data: currentStats } = await supabase
    .from('analytics_daily_stats')
    .select('*')
    .eq('organization_id', orgId)
    .gte('date', start.toISOString().split('T')[0])
    .lte('date', end.toISOString().split('T')[0])

  // Calculate previous period for comparison
  const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const prevStart = new Date(start)
  prevStart.setDate(prevStart.getDate() - daysInPeriod)
  const prevEnd = new Date(start)
  prevEnd.setDate(prevEnd.getDate() - 1)

  const { data: prevStats } = await supabase
    .from('analytics_daily_stats')
    .select('*')
    .eq('organization_id', orgId)
    .gte('date', prevStart.toISOString().split('T')[0])
    .lte('date', prevEnd.toISOString().split('T')[0])

  // Aggregate current period metrics
  const current = (currentStats || []).reduce(
    (acc, stat) => ({
      friends: acc.friends + (stat.new_friends || 0) - (stat.blocked_friends || 0),
      messages: acc.messages + (stat.messages_sent || 0),
      delivered: acc.delivered + (stat.messages_delivered || 0),
      read: acc.read + (stat.messages_read || 0),
      clicked: acc.clicked + (stat.messages_clicked || 0),
    }),
    { friends: 0, messages: 0, delivered: 0, read: 0, clicked: 0 }
  )

  // Aggregate previous period metrics
  const previous = (prevStats || []).reduce(
    (acc, stat) => ({
      friends: acc.friends + (stat.new_friends || 0) - (stat.blocked_friends || 0),
      messages: acc.messages + (stat.messages_sent || 0),
      delivered: acc.delivered + (stat.messages_delivered || 0),
      read: acc.read + (stat.messages_read || 0),
      clicked: acc.clicked + (stat.messages_clicked || 0),
    }),
    { friends: 0, messages: 0, delivered: 0, read: 0, clicked: 0 }
  )

  // Calculate rates
  const deliveryRate = current.messages > 0 ? (current.delivered / current.messages) * 100 : 0
  const prevDeliveryRate = previous.messages > 0 ? (previous.delivered / previous.messages) * 100 : 0
  const engagementRate = current.delivered > 0 ? ((current.read + current.clicked) / current.delivered) * 100 : 0
  const prevEngagementRate = previous.delivered > 0 ? ((previous.read + previous.clicked) / previous.delivered) * 100 : 0

  return {
    friendsTotal: current.friends,
    friendsChange: current.friends - previous.friends,
    friendsChangePercent: calculateGrowthRate(current.friends, previous.friends),
    messagesTotal: current.messages,
    messagesChange: current.messages - previous.messages,
    messagesChangePercent: calculateGrowthRate(current.messages, previous.messages),
    deliveryRate: Math.round(deliveryRate * 100) / 100,
    deliveryRateChange: Math.round((deliveryRate - prevDeliveryRate) * 100) / 100,
    engagementRate: Math.round(engagementRate * 100) / 100,
    engagementRateChange: Math.round((engagementRate - prevEngagementRate) * 100) / 100,
  }
}

/**
 * Get friends trend over time (overloaded for both TimeRange and date strings)
 */
export async function getFriendsTrend(
  dateRangeOrStart: TimeRange | string = '30d',
  endDate?: string
): Promise<FriendsTrendData[]> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Determine if we're using TimeRange or date strings
  let start: Date
  let end: Date

  if (endDate !== undefined) {
    // Using date strings
    start = new Date(dateRangeOrStart as string)
    end = new Date(endDate)
  } else {
    // Using TimeRange
    const range = getDateRange(dateRangeOrStart as TimeRange)
    start = range.start
    end = range.end
  }

  const { data: stats, error } = await supabase
    .from('analytics_daily_stats')
    .select('date, new_friends, blocked_friends, total_friends')
    .eq('organization_id', orgId)
    .gte('date', start.toISOString().split('T')[0])
    .lte('date', end.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching friends trend:', error)
    throw error
  }

  return (stats || []).map((stat) => ({
    date: stat.date,
    total: stat.total_friends || 0,
    new_friends: stat.new_friends || 0,
    blocked: stat.blocked_friends || 0,
  }))
}

/**
 * Get message performance metrics
 */
export async function getMessagePerformance(
  dateRange: TimeRange = '30d'
): Promise<MessageStatsData> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()
  const { start, end } = getDateRange(dateRange)

  const { data: stats, error } = await supabase
    .from('analytics_daily_stats')
    .select('*')
    .eq('organization_id', orgId)
    .gte('date', start.toISOString().split('T')[0])
    .lte('date', end.toISOString().split('T')[0])

  if (error) {
    console.error('Error fetching message performance:', error)
    throw error
  }

  // Aggregate totals
  const totals = (stats || []).reduce(
    (acc, stat) => ({
      sent: acc.sent + (stat.messages_sent || 0),
      delivered: acc.delivered + (stat.messages_delivered || 0),
      read: acc.read + (stat.messages_read || 0),
      clicked: acc.clicked + (stat.messages_clicked || 0),
      text: acc.text + (stat.text_messages || 0),
      image: acc.image + (stat.image_messages || 0),
      video: acc.video + (stat.video_messages || 0),
      audio: acc.audio + (stat.audio_messages || 0),
      flex: acc.flex + (stat.flex_messages || 0),
      template: acc.template + (stat.template_messages || 0),
    }),
    { sent: 0, delivered: 0, read: 0, clicked: 0, text: 0, image: 0, video: 0, audio: 0, flex: 0, template: 0 }
  )

  // Calculate rates
  const deliveryRate = totals.sent > 0 ? (totals.delivered / totals.sent) * 100 : 0
  const readRate = totals.delivered > 0 ? (totals.read / totals.delivered) * 100 : 0
  const clickRate = totals.delivered > 0 ? (totals.clicked / totals.delivered) * 100 : 0

  return {
    total_sent: totals.sent,
    total_delivered: totals.delivered,
    total_read: totals.read,
    total_clicked: totals.clicked,
    delivery_rate: Math.round(deliveryRate * 100) / 100,
    read_rate: Math.round(readRate * 100) / 100,
    click_rate: Math.round(clickRate * 100) / 100,
    by_type: [
      { type: 'text', count: totals.text, delivered: 0, read: 0, clicked: 0 },
      { type: 'image', count: totals.image, delivered: 0, read: 0, clicked: 0 },
      { type: 'video', count: totals.video, delivered: 0, read: 0, clicked: 0 },
      { type: 'audio', count: totals.audio, delivered: 0, read: 0, clicked: 0 },
      { type: 'flex', count: totals.flex, delivered: 0, read: 0, clicked: 0 },
      { type: 'template', count: totals.template, delivered: 0, read: 0, clicked: 0 },
    ].filter(t => t.count > 0),
  }
}

/**
 * Get engagement trend over time
 */
export async function getEngagementTrend(
  dateRange: TimeRange = '30d'
): Promise<EngagementRateData> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()
  const { start, end } = getDateRange(dateRange)

  const { data: stats, error } = await supabase
    .from('analytics_daily_stats')
    .select('date, messages_sent, messages_delivered, messages_read, messages_clicked')
    .eq('organization_id', orgId)
    .gte('date', start.toISOString().split('T')[0])
    .lte('date', end.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching engagement trend:', error)
    throw error
  }

  const byDay = (stats || []).map((stat) => {
    const delivered = stat.messages_delivered || 0
    const interactions = (stat.messages_read || 0) + (stat.messages_clicked || 0)
    const rate = delivered > 0 ? (interactions / delivered) * 100 : 0

    return {
      date: stat.date,
      rate: Math.round(rate * 100) / 100,
      messages_sent: stat.messages_sent || 0,
      interactions,
    }
  })

  const overallInteractions = byDay.reduce((sum, day) => sum + day.interactions, 0)
  const overallDelivered = byDay.reduce((sum, day) => sum + day.messages_sent, 0)
  const overallRate = overallDelivered > 0 ? (overallInteractions / overallDelivered) * 100 : 0

  return {
    overall_rate: Math.round(overallRate * 100) / 100,
    by_day: byDay,
  }
}

/**
 * Get top performing messages
 */
export async function getTopMessages(limit: number = 10) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      id,
      title,
      content,
      type,
      sent_at,
      created_at,
      message_recipients (
        status,
        read_at,
        clicked_at
      )
    `)
    .eq('organization_id', orgId)
    .not('sent_at', 'is', null)
    .order('sent_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching top messages:', error)
    throw error
  }

  // Calculate engagement metrics for each message
  const messagesWithMetrics = (messages || []).map((msg: any) => {
    const recipients = msg.message_recipients || []
    const delivered = recipients.filter((r: any) => r.status === 'delivered' || r.status === 'sent').length
    const read = recipients.filter((r: any) => r.read_at).length
    const clicked = recipients.filter((r: any) => r.clicked_at).length
    const engagementScore = delivered > 0 ? ((read + clicked * 2) / delivered) * 100 : 0

    return {
      id: msg.id,
      title: msg.title,
      content: msg.content,
      type: msg.type,
      sent_at: msg.sent_at,
      total_sent: recipients.length,
      delivered,
      read,
      clicked,
      engagement_score: Math.round(engagementScore * 100) / 100,
    }
  })

  // Sort by engagement score and return top N
  return messagesWithMetrics
    .sort((a, b) => b.engagement_score - a.engagement_score)
    .slice(0, limit)
}

/**
 * Get top clicked URLs
 */
export async function getTopUrls(limit: number = 10) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: urls, error } = await supabase
    .from('url_tracking')
    .select(`
      id,
      original_url,
      short_code,
      custom_slug,
      campaign_name,
      total_clicks,
      unique_clicks,
      created_at
    `)
    .eq('organization_id', orgId)
    .order('total_clicks', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top URLs:', error)
    throw error
  }

  return urls || []
}

/**
 * Get dashboard stats wrapper with date range parameters
 */
export async function getDashboardStats(startDate: string, endDate: string): Promise<DashboardStats> {
  // Calculate time range based on date difference
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  let range: TimeRange = '30d'
  if (days <= 7) range = '7d'
  else if (days <= 30) range = '30d'
  else if (days <= 90) range = '90d'
  else if (days <= 365) range = '1y'
  else range = 'all'

  return getAnalyticsOverview(range)
}

/**
 * Get message stats wrapper (alias for getMessagePerformance)
 */
export async function getMessageStats(startDate: string, endDate: string): Promise<MessageStatsData> {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  let range: TimeRange = '30d'
  if (days <= 7) range = '7d'
  else if (days <= 30) range = '30d'
  else if (days <= 90) range = '90d'
  else if (days <= 365) range = '1y'
  else range = 'all'

  return getMessagePerformance(range)
}

/**
 * Get engagement rate wrapper (alias for getEngagementTrend)
 */
export async function getEngagementRate(startDate: string, endDate: string): Promise<EngagementRateData> {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  let range: TimeRange = '30d'
  if (days <= 7) range = '7d'
  else if (days <= 30) range = '30d'
  else if (days <= 90) range = '90d'
  else if (days <= 365) range = '1y'
  else range = 'all'

  return getEngagementTrend(range)
}

/**
 * Get tag distribution across friends
 */
export async function getTagDistribution() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Get tag counts with friend associations
  const { data: tagCounts, error } = await supabase
    .from('friend_tags')
    .select(`
      tag_id,
      tags (
        id,
        name,
        color
      )
    `)
    .eq('tags.organization_id', orgId)

  if (error) {
    console.error('Error fetching tag distribution:', error)
    return []
  }

  // Aggregate by tag
  const tagMap = new Map<string, { name: string; color: string | null; count: number }>()

  for (const item of tagCounts || []) {
    if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
      const tag = item.tags[0]
      const existing = tagMap.get(item.tag_id) || { name: tag.name, color: tag.color, count: 0 }
      existing.count += 1
      tagMap.set(item.tag_id, existing)
    }
  }

  const totalFriends = Array.from(tagMap.values()).reduce((sum, tag) => sum + tag.count, 0)

  return Array.from(tagMap.entries()).map(([tag_id, data]) => ({
    tag_id,
    tag_name: data.name,
    tag_color: data.color,
    friend_count: data.count,
    percentage: totalFriends > 0 ? Math.round((data.count / totalFriends) * 100 * 100) / 100 : 0,
  }))
}

/**
 * Get device breakdown from friend profiles
 */
export async function getDeviceBreakdown(startDate: string, endDate: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Get device information from friends
  const { data: friends, error } = await supabase
    .from('friends')
    .select('metadata')
    .eq('organization_id', orgId)

  if (error) {
    console.error('Error fetching device breakdown:', error)
    return []
  }

  // Extract device types from metadata
  const deviceMap = new Map<string, number>()

  for (const friend of friends || []) {
    const deviceType = (friend.metadata as any)?.device_type || 'unknown'
    deviceMap.set(deviceType, (deviceMap.get(deviceType) || 0) + 1)
  }

  const total = Array.from(deviceMap.values()).reduce((sum, count) => sum + count, 0)

  return Array.from(deviceMap.entries()).map(([device_type, count]) => ({
    device_type,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0,
  }))
}

/**
 * Refresh analytics cache
 */
export async function refreshAnalytics() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  revalidatePath('/dashboard/analytics')
  return { success: true }
}

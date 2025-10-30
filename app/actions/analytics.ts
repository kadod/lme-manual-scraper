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
  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', userId)
    .single()

  return userData?.organization_id || null
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

  // TODO: Implement analytics_daily_stats table or calculate from analytics_events
  // For now, calculate from existing tables
  const { data: friends } = await supabase
    .from('line_friends')
    .select('id, created_at, follow_status')
    .eq('organization_id', orgId)

  const { data: messages } = await supabase
    .from('messages')
    .select('id, sent_count, delivered_count, read_count, click_count, created_at')
    .eq('organization_id', orgId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  // Calculate current period metrics from actual data
  const current = {
    friends: (friends || []).filter(f => f.follow_status === 'following').length,
    messages: (messages || []).reduce((sum, m) => sum + (m.sent_count || 0), 0),
    delivered: (messages || []).reduce((sum, m) => sum + (m.delivered_count || 0), 0),
    read: (messages || []).reduce((sum, m) => sum + (m.read_count || 0), 0),
    clicked: (messages || []).reduce((sum, m) => sum + (m.click_count || 0), 0),
  }

  // Calculate previous period for comparison
  const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const prevStart = new Date(start)
  prevStart.setDate(prevStart.getDate() - daysInPeriod)
  const prevEnd = new Date(start)
  prevEnd.setDate(prevEnd.getDate() - 1)

  const { data: prevMessages } = await supabase
    .from('messages')
    .select('id, sent_count, delivered_count, read_count, click_count, created_at')
    .eq('organization_id', orgId)
    .gte('created_at', prevStart.toISOString())
    .lte('created_at', prevEnd.toISOString())

  // Aggregate previous period metrics
  const previous = {
    friends: 0, // TODO: Calculate historical friend count
    messages: (prevMessages || []).reduce((sum, m) => sum + (m.sent_count || 0), 0),
    delivered: (prevMessages || []).reduce((sum, m) => sum + (m.delivered_count || 0), 0),
    read: (prevMessages || []).reduce((sum, m) => sum + (m.read_count || 0), 0),
    clicked: (prevMessages || []).reduce((sum, m) => sum + (m.click_count || 0), 0),
  }

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

  // TODO: Implement analytics_daily_stats table for efficient querying
  // For now, calculate from line_friends table
  const { data: friends, error } = await supabase
    .from('line_friends')
    .select('created_at, follow_status')
    .eq('organization_id', orgId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching friends trend:', error)
    throw error
  }

  // Group by date
  const dateMap = new Map<string, { new: number; blocked: number }>()
  let runningTotal = 0

  for (const friend of friends || []) {
    if (!friend.created_at) continue
    const date = new Date(friend.created_at).toISOString().split('T')[0]
    const current = dateMap.get(date) || { new: 0, blocked: 0 }

    if (friend.follow_status === 'following') {
      current.new += 1
      runningTotal += 1
    } else if (friend.follow_status === 'blocked' || friend.follow_status === 'unfollowed') {
      current.blocked += 1
      runningTotal -= 1
    }

    dateMap.set(date, current)
  }

  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    total: runningTotal,
    new_friends: data.new,
    blocked: data.blocked,
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

  // TODO: Implement analytics_daily_stats table for efficient querying
  // For now, calculate from messages table
  const { data: messages, error } = await supabase
    .from('messages')
    .select('type, sent_count, delivered_count, read_count, click_count')
    .eq('organization_id', orgId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  if (error) {
    console.error('Error fetching message performance:', error)
    throw error
  }

  // Aggregate totals from messages
  const totals = (messages || []).reduce(
    (acc, msg) => {
      const sent = msg.sent_count || 0
      const delivered = msg.delivered_count || 0
      const read = msg.read_count || 0
      const clicked = msg.click_count || 0

      // Count by type
      const typeKey = msg.type as 'text' | 'image' | 'video' | 'audio' | 'flex' | 'template'
      if (typeKey && acc[typeKey] !== undefined) {
        acc[typeKey] += sent
      }

      return {
        ...acc,
        sent: acc.sent + sent,
        delivered: acc.delivered + delivered,
        read: acc.read + read,
        clicked: acc.clicked + clicked,
      }
    },
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
    by_type: ([
      { type: 'text' as const, count: totals.text, delivered: 0, read: 0, clicked: 0 },
      { type: 'image' as const, count: totals.image, delivered: 0, read: 0, clicked: 0 },
      { type: 'video' as const, count: totals.video, delivered: 0, read: 0, clicked: 0 },
      { type: 'audio' as const, count: totals.audio, delivered: 0, read: 0, clicked: 0 },
      { type: 'flex' as const, count: totals.flex, delivered: 0, read: 0, clicked: 0 },
      { type: 'template' as const, count: totals.template, delivered: 0, read: 0, clicked: 0 },
    ] as const).filter(t => t.count > 0) as Array<{type: 'text' | 'image' | 'video' | 'audio' | 'flex' | 'template', count: number, delivered: number, read: number, clicked: number}>,
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

  // TODO: Implement analytics_daily_stats table for efficient daily querying
  // For now, calculate from messages table
  const { data: messages, error } = await supabase
    .from('messages')
    .select('created_at, sent_count, delivered_count, read_count, click_count')
    .eq('organization_id', orgId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching engagement trend:', error)
    throw error
  }

  // Group by date
  const dateMap = new Map<string, { sent: number; delivered: number; read: number; clicked: number }>()

  for (const msg of messages || []) {
    if (!msg.created_at) continue
    const date = new Date(msg.created_at).toISOString().split('T')[0]
    const current = dateMap.get(date) || { sent: 0, delivered: 0, read: 0, clicked: 0 }

    current.sent += msg.sent_count || 0
    current.delivered += msg.delivered_count || 0
    current.read += msg.read_count || 0
    current.clicked += msg.click_count || 0

    dateMap.set(date, current)
  }

  const byDay = Array.from(dateMap.entries()).map(([date, data]) => {
    const interactions = data.read + data.clicked
    const rate = data.delivered > 0 ? (interactions / data.delivered) * 100 : 0

    return {
      date,
      rate: Math.round(rate * 100) / 100,
      messages_sent: data.sent,
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

  const { data: urls, error} = await supabase
    .from('url_mappings')
    .select(`
      id,
      original_url,
      short_code,
      click_count,
      unique_click_count,
      created_at
    `)
    .eq('organization_id', orgId)
    .order('click_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top URLs:', error)
    throw error
  }

  return (urls || []).map(url => ({
    id: url.id,
    original_url: url.original_url,
    short_code: url.short_code,
    custom_slug: null, // url_mappings doesn't have custom_slug
    campaign_name: null, // url_mappings doesn't have campaign_name
    total_clicks: url.click_count || 0,
    unique_clicks: url.unique_click_count || 0,
    created_at: url.created_at,
  }))
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

  // Get device information from LINE friends
  const { data: friends, error } = await supabase
    .from('line_friends')
    .select('custom_fields')
    .eq('organization_id', orgId)

  if (error) {
    console.error('Error fetching device breakdown:', error)
    return []
  }

  // Extract device types from custom_fields
  const deviceMap = new Map<string, number>()

  for (const friend of friends || []) {
    const deviceType = (friend.custom_fields as any)?.device_type || 'unknown'
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

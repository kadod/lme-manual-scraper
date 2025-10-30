'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { URLTrackingStats, URLClickTrendData, TimeRange } from '@/types/analytics'

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
 * Generate random short code for URLs
 */
function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Get URL tracking list with filters
 */
export async function getUrlTrackingList(filters?: {
  search?: string
  campaignName?: string
  dateFrom?: string
  dateTo?: string
}) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  let query = supabase
    .from('url_mappings')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(`original_url.ilike.%${filters.search}%,short_code.ilike.%${filters.search}%`)
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching URL tracking list:', error)
    throw error
  }

  return data || []
}

/**
 * Create short URL
 */
export async function createShortUrl(data: {
  originalUrl: string
  customSlug?: string
  campaignName?: string
  expiresAt?: string
}) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Generate short code or use custom slug
  const shortCode = data.customSlug || generateShortCode()

  // Check if slug already exists
  const { data: existing } = await supabase
    .from('url_mappings')
    .select('id')
    .eq('organization_id', orgId)
    .eq('short_code', shortCode)
    .single()

  if (existing) {
    throw new Error('This slug is already in use')
  }

  // Validate URL format
  try {
    new URL(data.originalUrl)
  } catch {
    throw new Error('Invalid URL format')
  }

  const { data: result, error } = await supabase
    .from('url_mappings')
    .insert({
      organization_id: orgId,
      original_url: data.originalUrl,
      short_code: shortCode,
      expires_at: data.expiresAt || null,
      click_count: 0,
      unique_click_count: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating short URL:', error)
    throw error
  }

  revalidatePath('/dashboard/analytics/url-tracking')
  return result
}

/**
 * Update short URL
 */
export async function updateShortUrl(
  id: string,
  data: {
    campaignName?: string
    expiresAt?: string | null
  }
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from('url_mappings')
    .select('id')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single()

  if (!existing) {
    throw new Error('URL not found')
  }

  const { data: result, error } = await supabase
    .from('url_mappings')
    .update({
      expires_at: data.expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating short URL:', error)
    throw error
  }

  revalidatePath('/dashboard/analytics/url-tracking')
  return result
}

/**
 * Delete short URL
 */
export async function deleteShortUrl(id: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from('url_mappings')
    .select('id')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single()

  if (!existing) {
    throw new Error('URL not found')
  }

  const { error } = await supabase
    .from('url_mappings')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting short URL:', error)
    throw error
  }

  revalidatePath('/dashboard/analytics/url-tracking')
  return { success: true }
}

/**
 * Get URL statistics
 */
export async function getUrlStats(shortCode: string, dateRange?: TimeRange) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Get URL tracking record
  const { data: urlMapping, error: urlError } = await supabase
    .from('url_mappings')
    .select('*')
    .eq('organization_id', orgId)
    .eq('short_code', shortCode)
    .single()

  if (urlError || !urlMapping) {
    throw new Error('URL not found')
  }

  // Calculate date range for click data
  let dateFrom: string | undefined
  if (dateRange) {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : dateRange === '1y' ? 365 : undefined
    if (days) {
      const date = new Date()
      date.setDate(date.getDate() - days)
      dateFrom = date.toISOString()
    }
  }

  // Get click data
  let clickQuery = supabase
    .from('url_clicks')
    .select('*')
    .eq('url_mapping_id', urlMapping.id)
    .order('clicked_at', { ascending: false })

  if (dateFrom) {
    clickQuery = clickQuery.gte('clicked_at', dateFrom)
  }

  const { data: clicks, error: clicksError } = await clickQuery

  if (clicksError) {
    console.error('Error fetching URL clicks:', clicksError)
    throw clicksError
  }

  // Process click data
  const clicksByDate: Record<string, { clicks: number; unique_clicks: number }> = {}
  const uniqueUsers = new Set<string>()

  clicks?.forEach((click) => {
    const date = new Date(click.clicked_at!).toISOString().split('T')[0]
    if (!clicksByDate[date]) {
      clicksByDate[date] = { clicks: 0, unique_clicks: 0 }
    }
    clicksByDate[date].clicks += 1

    const friendId = click.line_friend_id
    if (friendId && !uniqueUsers.has(friendId)) {
      clicksByDate[date].unique_clicks += 1
      uniqueUsers.add(friendId)
    }
  })

  const clickTrend: URLClickTrendData[] = Object.entries(clicksByDate)
    .map(([date, data]) => ({
      date,
      clicks: data.clicks,
      unique_clicks: data.unique_clicks,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Process referrer data
  const referrerCounts: Record<string, number> = {}
  clicks?.forEach((click) => {
    const referrer = click.referrer || 'Direct'
    referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1
  })

  const referrerData = Object.entries(referrerCounts)
    .map(([referrer, count]) => ({
      referrer,
      clicks: count,
    }))
    .sort((a, b) => b.clicks - a.clicks)

  // Process device data
  const deviceCounts: Record<string, number> = {}
  clicks?.forEach((click) => {
    const userAgent = click.user_agent?.toLowerCase() || ''
    let device = 'Desktop'

    if (/(iphone|ipod|android.*mobile)/i.test(userAgent)) {
      device = 'Mobile'
    } else if (/(ipad|android(?!.*mobile))/i.test(userAgent)) {
      device = 'Tablet'
    }

    deviceCounts[device] = (deviceCounts[device] || 0) + 1
  })

  const deviceData = Object.entries(deviceCounts).map(([device_type, count]) => ({
    device_type,
    clicks: count,
  }))

  const stats: URLTrackingStats = {
    id: urlMapping.id,
    user_id: userId,
    original_url: urlMapping.original_url,
    short_code: urlMapping.short_code,
    short_url: `${process.env.NEXT_PUBLIC_APP_URL}/s/${urlMapping.short_code}`,
    custom_slug: null,
    campaign_name: null,
    total_clicks: urlMapping.click_count || 0,
    unique_clicks: urlMapping.unique_click_count || 0,
    created_at: urlMapping.created_at!,
    last_clicked_at: clicks && clicks.length > 0 ? clicks[0].clicked_at! : null,
    click_data: clickTrend,
    referrer_data: referrerData,
    device_data: deviceData,
  }

  return stats
}

/**
 * Get URL click details
 */
export async function getUrlClickDetails(shortCode: string, dateRange?: TimeRange) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Get URL tracking record
  const { data: urlMapping, error: urlError } = await supabase
    .from('url_mappings')
    .select('id')
    .eq('organization_id', orgId)
    .eq('short_code', shortCode)
    .single()

  if (urlError || !urlMapping) {
    throw new Error('URL not found')
  }

  // Calculate date range
  let dateFrom: string | undefined
  if (dateRange) {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : dateRange === '1y' ? 365 : undefined
    if (days) {
      const date = new Date()
      date.setDate(date.getDate() - days)
      dateFrom = date.toISOString()
    }
  }

  // Get detailed click data with friend information
  let clickQuery = supabase
    .from('url_clicks')
    .select(`
      *,
      friend:line_friends!line_friend_id (
        id,
        display_name,
        picture_url
      )
    `)
    .eq('url_mapping_id', urlMapping.id)
    .order('clicked_at', { ascending: false })

  if (dateFrom) {
    clickQuery = clickQuery.gte('clicked_at', dateFrom)
  }

  const { data: clicks, error: clicksError } = await clickQuery

  if (clicksError) {
    console.error('Error fetching URL click details:', clicksError)
    throw clicksError
  }

  return clicks || []
}

/**
 * Generate QR code for short URL
 */
export async function generateQRCode(shortCode: string): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Verify URL exists
  const { data: urlMapping } = await supabase
    .from('url_mappings')
    .select('short_code')
    .eq('organization_id', orgId)
    .eq('short_code', shortCode)
    .single()

  if (!urlMapping) {
    throw new Error('URL not found')
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${shortCode}`

  // Generate QR code using API (e.g., QR Server API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`

  // Fetch and convert to base64
  try {
    const response = await fetch(qrCodeUrl)
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

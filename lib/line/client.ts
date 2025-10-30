/**
 * LINE Client Factory
 * Provides LINE API client instances with organization-specific credentials
 */

import { createClient } from '@/lib/supabase/server'

export interface LineClientConfig {
  accessToken: string
  secret: string
  channelId: string
}

/**
 * Get LINE client configuration for a company (organization)
 * Fetches active LINE channel credentials from database
 */
export async function getLineClient(
  organizationId: string
): Promise<LineClientConfig> {
  const supabase = await createClient()

  const { data: channel, error } = await supabase
    .from('line_channels')
    .select('channel_access_token, channel_secret, channel_id')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .single()

  if (error || !channel) {
    throw new Error('LINE Channel not found or inactive')
  }

  return {
    accessToken: channel.channel_access_token,
    secret: channel.channel_secret,
    channelId: channel.channel_id,
  }
}

/**
 * Get LINE client by channel ID
 * Useful when you have the channel ID from webhook events
 */
export async function getLineClientByChannelId(
  channelId: string
): Promise<LineClientConfig> {
  const supabase = await createClient()

  const { data: channel, error } = await supabase
    .from('line_channels')
    .select('channel_access_token, channel_secret, channel_id, organization_id')
    .eq('channel_id', channelId)
    .eq('status', 'active')
    .single()

  if (error || !channel) {
    throw new Error('LINE Channel not found or inactive')
  }

  return {
    accessToken: channel.channel_access_token,
    secret: channel.channel_secret,
    channelId: channel.channel_id,
  }
}

/**
 * Validate LINE credentials by making a test API call
 */
export async function validateLineCredentials(
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch('https://api.line.me/v2/bot/info', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Failed to validate LINE credentials:', error)
    return false
  }
}

/**
 * Get bot profile information
 */
export async function getBotProfile(accessToken: string) {
  try {
    const response = await fetch('https://api.line.me/v2/bot/info', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get bot profile: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching bot profile:', error)
    throw error
  }
}

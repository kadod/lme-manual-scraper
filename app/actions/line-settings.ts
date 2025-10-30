'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'
import { revalidatePath } from 'next/cache'

export interface LineChannel {
  id: string
  organization_id: string
  name: string
  channel_id: string
  channel_secret: string
  channel_access_token: string
  webhook_url: string | null
  picture_url: string | null
  settings: {
    liff_id?: string
    [key: string]: unknown
  }
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface LineSettingsFormData {
  channelId: string
  channelSecret: string
  channelAccessToken: string
  liffId?: string
  channelName?: string
}

/**
 * Get LINE channel settings for current company (organization)
 */
export async function getLineSettings() {
  const companyId = await getCurrentUserOrganizationId()

  if (!companyId) {
    throw new Error('Company not found')
  }

  const supabase = await createClient()

  const { data, error} = await supabase
    .from('line_channels')
    .select('*')
    .eq('organization_id', companyId)
    .eq('status', 'active')
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching LINE settings:', error)
    throw error
  }

  return data as LineChannel | null
}

/**
 * Save or update LINE channel settings
 */
export async function saveLineSettings(data: LineSettingsFormData) {
  const companyId = await getCurrentUserOrganizationId()

  if (!companyId) {
    throw new Error('Company not found')
  }

  const supabase = await createClient()

  // Verify user has permission to update settings
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userProfile || !['owner', 'admin'].includes(userProfile.role)) {
    throw new Error(
      'Insufficient permissions: Only owners and admins can update LINE settings'
    )
  }

  // Check if channel already exists
  const { data: existingChannel } = await supabase
    .from('line_channels')
    .select('id')
    .eq('organization_id', companyId)
    .single()

  const channelData = {
    organization_id: companyId,
    name: data.channelName || 'LINE Channel',
    channel_id: data.channelId,
    channel_secret: data.channelSecret,
    channel_access_token: data.channelAccessToken,
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/line/webhook`,
    settings: {
      liff_id: data.liffId || null,
    },
    status: 'active' as const,
    updated_at: new Date().toISOString(),
  }

  let result

  if (existingChannel) {
    // Update existing channel
    const { data: updatedChannel, error } = await supabase
      .from('line_channels')
      .update(channelData)
      .eq('id', existingChannel.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating LINE channel:', error)
      throw new Error('Failed to update LINE settings')
    }

    result = updatedChannel
  } else {
    // Insert new channel
    const { data: newChannel, error } = await supabase
      .from('line_channels')
      .insert(channelData)
      .select()
      .single()

    if (error) {
      console.error('Error creating LINE channel:', error)
      throw new Error('Failed to save LINE settings')
    }

    result = newChannel
  }

  revalidatePath('/dashboard/settings/line')
  return result as LineChannel
}

/**
 * Test LINE channel connection
 * Calls LINE Bot Info API to verify credentials
 */
export async function testLineConnection(channelAccessToken: string) {
  try {
    const response = await fetch('https://api.line.me/v2/bot/info', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid access token. Please check your credentials.',
        }
      }

      return {
        success: false,
        error: errorData.message || `Connection failed: ${response.statusText}`,
      }
    }

    const botInfo = await response.json()

    return {
      success: true,
      data: {
        userId: botInfo.userId,
        basicId: botInfo.basicId,
        premiumId: botInfo.premiumId,
        displayName: botInfo.displayName,
        pictureUrl: botInfo.pictureUrl,
      },
    }
  } catch (error) {
    console.error('LINE connection test error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    }
  }
}

/**
 * Update channel profile (name and icon) from LINE API
 */
export async function updateChannelProfile() {
  const companyId = await getCurrentUserOrganizationId()

  if (!companyId) {
    throw new Error('Company not found')
  }

  const supabase = await createClient()

  // Get existing channel
  const { data: channel, error: channelError } = await supabase
    .from('line_channels')
    .select('*')
    .eq('organization_id', companyId)
    .eq('status', 'active')
    .single()

  if (channelError || !channel) {
    throw new Error('LINE channel not found')
  }

  // Get bot info from LINE API
  const connectionTest = await testLineConnection(channel.channel_access_token)

  if (!connectionTest.success || !connectionTest.data) {
    throw new Error('Failed to fetch channel profile from LINE')
  }

  // Update channel with profile info
  const { data: updatedChannel, error: updateError } = await supabase
    .from('line_channels')
    .update({
      name: connectionTest.data.displayName,
      picture_url: connectionTest.data.pictureUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', channel.id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating channel profile:', updateError)
    throw new Error('Failed to update channel profile')
  }

  revalidatePath('/dashboard/settings/line')
  return updatedChannel as LineChannel
}

/**
 * Fetch existing friends from LINE API
 * This is useful for initial setup to import existing followers
 */
export async function fetchExistingFriends() {
  const companyId = await getCurrentUserOrganizationId()

  if (!companyId) {
    throw new Error('Company not found')
  }

  const supabase = await createClient()

  // Get channel
  const { data: channel, error: channelError } = await supabase
    .from('line_channels')
    .select('*')
    .eq('organization_id', companyId)
    .eq('status', 'active')
    .single()

  if (channelError || !channel) {
    throw new Error('LINE channel not found')
  }

  try {
    // Note: LINE API doesn't provide a direct endpoint to list all followers
    // This would typically be done through webhook events over time
    // For now, we'll return a message indicating this limitation

    return {
      success: true,
      message:
        'Friend information is automatically collected through webhook events when users interact with your bot.',
      note: 'LINE API does not provide a direct endpoint to list all existing followers.',
    }
  } catch (error) {
    console.error('Error fetching friends:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch friends',
    }
  }
}

/**
 * Test LIFF app connection
 */
export async function testLiffConnection(liffId: string) {
  try {
    // LIFF app verification would typically be done client-side
    // Here we just validate the format
    if (!liffId || !liffId.match(/^\d+-\w+$/)) {
      return {
        success: false,
        error: 'Invalid LIFF ID format. Expected format: 1234567890-abcdefgh',
      }
    }

    // In a real implementation, you might want to verify the LIFF app
    // by checking if it's properly configured in LINE Developers Console
    // For now, we'll just validate the format

    return {
      success: true,
      message: 'LIFF ID format is valid',
    }
  } catch (error) {
    console.error('LIFF connection test error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

/**
 * Get webhook URL for LINE Channel settings
 */
export async function getWebhookUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/api/line/webhook`
}

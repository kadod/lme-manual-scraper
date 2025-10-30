'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'
import { revalidatePath } from 'next/cache'

export interface LineSettingsUpdate {
  channelAccessToken: string
  channelSecret: string
}

/**
 * Update LINE settings for organization
 */
export async function updateLineSettings(
  organizationId: string,
  settings: LineSettingsUpdate
) {
  const supabase = await createClient()
  const currentOrgId = await getCurrentUserOrganizationId()

  // Verify user has access to this organization
  if (currentOrgId !== organizationId) {
    throw new Error('Unauthorized: You do not have access to this organization')
  }

  // Verify user has permission to update settings
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Authentication required')
  }

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .single()

  if (!userOrg || (userOrg.role !== 'owner' && userOrg.role !== 'admin')) {
    throw new Error('Insufficient permissions: Only owners and admins can update LINE settings')
  }

  // Update organization LINE settings
  const { error } = await supabase
    .from('organizations')
    .update({
      line_channel_access_token: settings.channelAccessToken,
      line_channel_secret: settings.channelSecret,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId)

  if (error) {
    console.error('Error updating LINE settings:', error)
    throw new Error('Failed to update LINE settings')
  }

  revalidatePath('/dashboard/settings/line')
  return { success: true }
}

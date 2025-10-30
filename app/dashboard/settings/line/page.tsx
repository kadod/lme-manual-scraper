import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LineSettingsClient } from './client'

export const metadata: Metadata = {
  title: 'LINE設定 | L Message',
  description: 'LINE連携、チャネル設定、Webhook設定',
}

async function getLineSettings(userId: string) {
  const supabase = await createClient()

  // Get user's organization
  const { data: userOrg, error: userOrgError } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', userId)
    .maybeSingle()

  if (userOrgError || !userOrg) {
    throw new Error('Organization not found')
  }

  // Get organization with LINE settings
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, line_channel_access_token, line_channel_secret')
    .eq('id', userOrg.organization_id)
    .single()

  if (orgError || !organization) {
    throw new Error('Failed to fetch organization')
  }

  const webhookUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-line-webhook`

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      channelAccessToken: organization.line_channel_access_token,
      channelSecret: organization.line_channel_secret,
    },
    currentUserRole: userOrg.role,
    webhookUrl,
  }
}

export default async function LineSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = await getLineSettings(user.id)

  return <LineSettingsClient {...data} />
}

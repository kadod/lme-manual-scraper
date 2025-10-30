import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SystemUtilitiesClient } from './SystemUtilitiesClient'
import { getAuditLogs, getSystemInfo } from '@/app/actions/system'
import type { APIKey } from '@/types/system'

export default async function SystemUtilitiesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user organization and check permissions
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single()

  if (!userOrg || !['owner', 'admin'].includes(userOrg.role)) {
    redirect('/dashboard')
  }

  // Fetch API keys
  const { data: apiKeysData } = await supabase
    .from('api_keys')
    .select('*')
    .eq('organization_id', userOrg.organization_id)
    .order('created_at', { ascending: false })

  // Map database result to APIKey type
  const apiKeys: APIKey[] = (apiKeysData || []).map((key): APIKey => ({
    id: key.id,
    organization_id: key.organization_id,
    name: key.name,
    key_prefix: key.key_prefix,
    key_hash: key.key_hash,
    permissions: Array.isArray(key.permissions) ? (key.permissions as string[]) : [],
    rate_limit: key.rate_limit || 1000,
    allowed_ips: Array.isArray(key.allowed_ips) ? (key.allowed_ips as string[]) : [],
    is_active: key.is_active || false,
    last_used_at: key.last_used_at,
    expires_at: key.expires_at,
    created_by: key.created_by || '',
    created_at: key.created_at || new Date().toISOString(),
    updated_at: key.updated_at || new Date().toISOString(),
  }))

  // Fetch initial audit logs
  const initialLogs = await getAuditLogs({ page: 1, limit: 20 })

  // Fetch system info
  const systemInfo = await getSystemInfo()

  return (
    <SystemUtilitiesClient
      apiKeys={apiKeys || []}
      initialLogs={initialLogs}
      systemInfo={systemInfo}
    />
  )
}

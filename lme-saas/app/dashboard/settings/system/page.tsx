import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SystemUtilitiesClient } from './SystemUtilitiesClient'
import { getAuditLogs, getSystemInfo } from '@/app/actions/system'

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
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('organization_id', userOrg.organization_id)
    .order('created_at', { ascending: false })

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

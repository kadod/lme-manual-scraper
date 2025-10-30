import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrganizationSettingsClient } from './client'

export const metadata: Metadata = {
  title: '組織設定 | L Message',
  description: '組織の基本情報、ブランディング、スタッフ管理',
}

async function getOrganizationData(userId: string) {
  const supabase = await createClient()

  // Get user's organization and role
  const { data: userOrg, error: userOrgError } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', userId)
    .maybeSingle()

  if (userOrgError) {
    console.error('Error fetching user organization:', userOrgError)
    throw new Error(`Failed to fetch organization data: ${userOrgError.message}`)
  }

  if (!userOrg) {
    throw new Error('You are not a member of any organization. Please contact support or create a new organization.')
  }

  console.log('User org data:', userOrg)

  // Get organization details
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', userOrg.organization_id)
    .maybeSingle()

  console.log('Organization query result:', { organization, orgError })

  if (orgError) {
    console.error('Error fetching organization:', orgError)
    throw new Error(`Failed to fetch organization: ${orgError.message}`)
  }

  if (!organization) {
    throw new Error(`Organization data not found for ID: ${userOrg.organization_id}. The organization may have been deleted.`)
  }

  // Get all staff members
  const { data: staffMembers, error: staffError } = await supabase
    .from('user_organizations')
    .select(`
      id,
      role,
      created_at,
      users:user_id (
        id,
        email,
        display_name,
        avatar_url
      )
    `)
    .eq('organization_id', userOrg.organization_id)

  if (staffError) {
    console.error('Error fetching staff members:', staffError)
    throw new Error(`Failed to fetch staff members: ${staffError.message}`)
  }

  // Get pending invitations
  const { data: invitations, error: invitationsError } = await supabase
    .from('invitations')
    .select('*')
    .eq('organization_id', userOrg.organization_id)
    .eq('status', 'pending')

  const activeMembers = (staffMembers || []).map((member: any) => ({
    id: member.users.id,
    email: member.users.email,
    fullName: member.users.display_name,
    avatarUrl: member.users.avatar_url,
    role: member.role,
    status: 'active' as const,
  }))

  const pendingMembers = (invitations || []).map((invitation: any) => ({
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: 'pending' as const,
    invitedAt: invitation.created_at,
  }))

  return {
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logoUrl: organization.logo_url,
      primaryColor: organization.primary_color || '#00B900',
      secondaryColor: organization.secondary_color || '#06C755',
      websiteUrl: organization.website_url,
      contactEmail: organization.contact_email,
    },
    currentUserRole: userOrg.role,
    members: [...activeMembers, ...pendingMembers],
  }
}

export default async function OrganizationSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = await getOrganizationData(user.id)

  return <OrganizationSettingsClient {...data} />
}

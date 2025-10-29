'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Get the current user's organization ID
 * Uses the user_organizations table to find the organization
 * Returns the first organization if user belongs to multiple
 */
export async function getCurrentUserOrganizationId(): Promise<string | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // First try to get from users table (legacy support)
  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (userData?.organization_id) {
    return userData.organization_id
  }

  // Then try from user_organizations table (new multi-tenant support)
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return userOrg?.organization_id || null
}

/**
 * Get the current user's ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

/**
 * Get user's organization with role
 */
export async function getUserOrganization() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Try from user_organizations table first
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select(`
      organization_id,
      role,
      organization:organizations (
        id,
        name,
        slug,
        plan,
        status
      )
    `)
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (userOrg) {
    return {
      organizationId: userOrg.organization_id,
      role: userOrg.role,
      organization: userOrg.organization,
    }
  }

  // Fallback to users table (legacy)
  const { data: userData } = await supabase
    .from('users')
    .select(`
      organization_id,
      role,
      organization:organizations (
        id,
        name,
        slug,
        plan,
        status
      )
    `)
    .eq('id', user.id)
    .single()

  if (userData) {
    return {
      organizationId: userData.organization_id,
      role: userData.role,
      organization: userData.organization,
    }
  }

  return null
}

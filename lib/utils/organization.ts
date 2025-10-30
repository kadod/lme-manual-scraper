'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Get the current user's company ID (organization)
 * Uses the user_profiles table to find the company
 */
export async function getCurrentUserOrganizationId(): Promise<string | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('[getCurrentUserOrganizationId] No user found')
    return null
  }

  console.log('[getCurrentUserOrganizationId] User ID:', user.id)
  console.log('[getCurrentUserOrganizationId] User email:', user.email)

  // Get organization_id from users table
  const { data: userData, error } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  console.log('[getCurrentUserOrganizationId] Query result - User Data:', userData)
  console.log('[getCurrentUserOrganizationId] Query result - Error:', error)

  if (error) {
    console.error('[getCurrentUserOrganizationId] Error details:', JSON.stringify(error, null, 2))
  }

  return userData?.organization_id || null
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
 * Get user's company (organization) with role
 */
export async function getUserOrganization() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get from users table with organization details
  const { data: userData } = await supabase
    .from('users')
    .select(`
      organization_id,
      role,
      organization:organizations (
        id,
        name,
        slug
      )
    `)
    .eq('id', user.id)
    .single()

  if (userData && userData.organization_id) {
    return {
      organizationId: userData.organization_id,
      role: userData.role,
      organization: userData.organization,
    }
  }

  return null
}

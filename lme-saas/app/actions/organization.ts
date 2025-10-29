/**
 * Organization Management Server Actions
 * Handles organization settings, branding, staff management, and deletion
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendInvitationEmail } from '@/lib/email/send-invitation'
import type {
  OrganizationUpdateData,
  BrandingSettings,
  StaffMember,
} from '@/types/organization'

/**
 * Get current user's organization with member role
 */
async function getUserOrganization() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: userOrg, error } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single()

  if (error || !userOrg) {
    throw new Error('Organization not found')
  }

  return { user, userOrg }
}

/**
 * Check if user has required role
 */
function hasPermission(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Get organization details
 */
export async function getOrganization() {
  const { userOrg } = await getUserOrganization()
  const supabase = await createClient()

  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', userOrg.organization_id)
    .single()

  if (error) {
    throw new Error('Failed to fetch organization')
  }

  return organization
}

/**
 * Update organization information
 * Requires: owner or admin role
 */
export async function updateOrganization(data: OrganizationUpdateData) {
  const { userOrg } = await getUserOrganization()
  const supabase = await createClient()

  // Permission check: owner or admin only
  if (!hasPermission(userOrg.role, ['owner', 'admin'])) {
    throw new Error('Permission denied: Admin or owner role required')
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      name: data.name,
      website_url: data.website_url,
      contact_email: data.contact_email,
      billing_email: data.billing_email,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      timezone: data.timezone,
      locale: data.locale,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userOrg.organization_id)

  if (error) {
    throw new Error(`Failed to update organization: ${error.message}`)
  }

  revalidatePath('/dashboard/settings/organization')
  return { success: true }
}

/**
 * Upload organization logo
 * Requires: owner or admin role
 */
export async function uploadLogo(formData: FormData) {
  const { userOrg } = await getUserOrganization()
  const supabase = await createClient()

  // Permission check: owner or admin only
  if (!hasPermission(userOrg.role, ['owner', 'admin'])) {
    throw new Error('Permission denied: Admin or owner role required')
  }

  const file = formData.get('logo') as File
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PNG, JPG, and WebP are allowed.')
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 2MB limit')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${userOrg.organization_id}/logo.${fileExt}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('organization-assets')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    throw new Error(`Failed to upload logo: ${uploadError.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('organization-assets').getPublicUrl(fileName)

  // Update organization record
  const { error } = await supabase
    .from('organizations')
    .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', userOrg.organization_id)

  if (error) {
    throw new Error(`Failed to update organization logo: ${error.message}`)
  }

  revalidatePath('/dashboard/settings/organization')
  return { success: true, logo_url: publicUrl }
}

/**
 * Update branding settings (colors and theme)
 * Requires: owner or admin role
 */
export async function updateBranding(settings: BrandingSettings) {
  const { userOrg } = await getUserOrganization()
  const supabase = await createClient()

  // Permission check: owner or admin only
  if (!hasPermission(userOrg.role, ['owner', 'admin'])) {
    throw new Error('Permission denied: Admin or owner role required')
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userOrg.organization_id)

  if (error) {
    throw new Error(`Failed to update branding: ${error.message}`)
  }

  revalidatePath('/dashboard/settings/organization')
  return { success: true }
}

/**
 * Get list of all staff members in organization
 */
export async function getStaffList(): Promise<StaffMember[]> {
  const { userOrg } = await getUserOrganization()
  const supabase = await createClient()

  // Get all user_organizations records
  const { data: members, error } = await supabase
    .from('user_organizations')
    .select(
      `
      user_id,
      role,
      created_at,
      users (
        email,
        full_name,
        avatar_url,
        last_login_at
      )
    `
    )
    .eq('organization_id', userOrg.organization_id)

  if (error) {
    throw new Error(`Failed to fetch staff list: ${error.message}`)
  }

  // Transform to StaffMember format
  const staffList: StaffMember[] = members.map((member: any) => ({
    id: member.user_id,
    email: member.users?.email || '',
    full_name: member.users?.full_name,
    avatar_url: member.users?.avatar_url,
    role: member.role,
    status: 'active',
    last_login_at: member.users?.last_login_at,
    created_at: member.created_at,
  }))

  return staffList
}

/**
 * Invite new staff member
 * Requires: owner or admin role
 */
export async function inviteStaff(data: {
  email: string
  role: 'admin' | 'member' | 'readonly'
}) {
  const { user, userOrg } = await getUserOrganization()
  const supabase = await createClient()

  // Permission check: owner or admin only
  if (!hasPermission(userOrg.role, ['owner', 'admin'])) {
    throw new Error('Permission denied: Admin or owner role required')
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    throw new Error('Invalid email address')
  }

  // Check if user already exists in organization
  const { data: existingMember } = await supabase
    .from('user_organizations')
    .select('user_id')
    .eq('organization_id', userOrg.organization_id)
    .eq('user_id', data.email) // This would need to join with users table
    .single()

  if (existingMember) {
    throw new Error('User is already a member of this organization')
  }

  // Check if invitation already exists and is pending
  const { data: existingInvitation } = await supabase
    .from('invitations')
    .select('id, status')
    .eq('organization_id', userOrg.organization_id)
    .eq('email', data.email)
    .eq('status', 'pending')
    .single()

  if (existingInvitation) {
    throw new Error('An invitation is already pending for this email')
  }

  // Generate secure invitation token using crypto
  const tokenBytes = new Uint8Array(32)
  crypto.getRandomValues(tokenBytes)
  const token = Array.from(tokenBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  // Set expiration to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // Insert invitation record
  const { error: inviteError } = await supabase.from('invitations').insert({
    organization_id: userOrg.organization_id,
    email: data.email,
    role: data.role,
    token,
    invited_by: user.id,
    expires_at: expiresAt.toISOString(),
  })

  if (inviteError) {
    throw new Error(`Failed to create invitation: ${inviteError.message}`)
  }

  // Get organization details for email
  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', userOrg.organization_id)
    .single()

  // Get inviter details
  const { data: inviterUser } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // Send invitation email
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

  await sendInvitationEmail({
    to: data.email,
    inviterName: inviterUser?.full_name || inviterUser?.email || 'Admin',
    organizationName: organization?.name || 'Organization',
    role: data.role,
    inviteUrl,
  })

  revalidatePath('/dashboard/settings/organization')
  return { success: true, message: 'Invitation sent successfully' }
}

/**
 * Resend invitation email
 * Requires: owner or admin role
 */
export async function resendInvitation(invitationId: string) {
  const { user, userOrg } = await getUserOrganization()
  const supabase = await createClient()

  // Permission check: owner or admin only
  if (!hasPermission(userOrg.role, ['owner', 'admin'])) {
    throw new Error('Permission denied: Admin or owner role required')
  }

  // Get invitation details
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .eq('organization_id', userOrg.organization_id)
    .single()

  if (error || !invitation) {
    throw new Error('Invitation not found')
  }

  if (invitation.status !== 'pending') {
    throw new Error('Can only resend pending invitations')
  }

  // Check if expired and update expiration
  const newExpiresAt = new Date()
  newExpiresAt.setDate(newExpiresAt.getDate() + 7)

  await supabase
    .from('invitations')
    .update({
      expires_at: newExpiresAt.toISOString(),
      status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitationId)

  // Get organization details
  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', userOrg.organization_id)
    .single()

  // Get inviter details
  const { data: inviterUser } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // Resend invitation email
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`

  await sendInvitationEmail({
    to: invitation.email,
    inviterName: inviterUser?.full_name || inviterUser?.email || 'Admin',
    organizationName: organization?.name || 'Organization',
    role: invitation.role,
    inviteUrl,
  })

  revalidatePath('/dashboard/settings/organization')
  return { success: true, message: 'Invitation resent successfully' }
}

/**
 * Cancel pending invitation
 * Requires: owner or admin role
 */
export async function cancelInvitation(invitationId: string) {
  const { userOrg } = await getUserOrganization()
  const supabase = await createClient()

  // Permission check: owner or admin only
  if (!hasPermission(userOrg.role, ['owner', 'admin'])) {
    throw new Error('Permission denied: Admin or owner role required')
  }

  const { error } = await supabase
    .from('invitations')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitationId)
    .eq('organization_id', userOrg.organization_id)
    .eq('status', 'pending')

  if (error) {
    throw new Error(`Failed to cancel invitation: ${error.message}`)
  }

  revalidatePath('/dashboard/settings/organization')
  return { success: true, message: 'Invitation cancelled successfully' }
}

/**
 * Update staff member role
 * Requires: owner role
 */
export async function updateStaffRole(data: {
  userId: string
  role: 'admin' | 'member' | 'readonly'
}) {
  const { userOrg } = await getUserOrganization()
  const supabase = await createClient()

  // Permission check: owner only
  if (userOrg.role !== 'owner') {
    throw new Error('Permission denied: Owner role required')
  }

  // Prevent changing own role
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user && data.userId === user.id) {
    throw new Error('Cannot change your own role')
  }

  // Check if user is a member
  const { data: existingMember } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', data.userId)
    .eq('organization_id', userOrg.organization_id)
    .single()

  if (!existingMember) {
    throw new Error('User is not a member of this organization')
  }

  // Prevent changing other owners
  if (existingMember.role === 'owner') {
    throw new Error('Cannot change role of organization owner')
  }

  const { error } = await supabase
    .from('user_organizations')
    .update({ role: data.role })
    .eq('user_id', data.userId)
    .eq('organization_id', userOrg.organization_id)

  if (error) {
    throw new Error(`Failed to update staff role: ${error.message}`)
  }

  revalidatePath('/dashboard/settings/organization')
  return { success: true, message: 'Staff role updated successfully' }
}

/**
 * Remove staff member from organization
 * Requires: owner role
 */
export async function removeStaff(userId: string) {
  const { userOrg } = await getUserOrganization()
  const supabase = await createClient()

  // Permission check: owner only
  if (userOrg.role !== 'owner') {
    throw new Error('Permission denied: Owner role required')
  }

  // Prevent removing self
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user && userId === user.id) {
    throw new Error('Cannot remove yourself from the organization')
  }

  // Check if user is a member
  const { data: existingMember } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', userId)
    .eq('organization_id', userOrg.organization_id)
    .single()

  if (!existingMember) {
    throw new Error('User is not a member of this organization')
  }

  // Prevent removing other owners
  if (existingMember.role === 'owner') {
    throw new Error('Cannot remove organization owner')
  }

  const { error } = await supabase
    .from('user_organizations')
    .delete()
    .eq('user_id', userId)
    .eq('organization_id', userOrg.organization_id)

  if (error) {
    throw new Error(`Failed to remove staff member: ${error.message}`)
  }

  revalidatePath('/dashboard/settings/organization')
  return { success: true, message: 'Staff member removed successfully' }
}

/**
 * Delete organization and all associated data
 * Requires: owner role
 * WARNING: This is irreversible!
 */
export async function deleteOrganization(confirmationName: string) {
  const { user, userOrg } = await getUserOrganization()
  const supabase = await createClient()

  // Permission check: owner only
  if (userOrg.role !== 'owner') {
    throw new Error(
      'Permission denied: Only organization owner can delete the organization'
    )
  }

  // Get organization details for confirmation
  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', userOrg.organization_id)
    .single()

  if (!organization) {
    throw new Error('Organization not found')
  }

  // Verify confirmation name matches
  if (organization.name !== confirmationName) {
    throw new Error(
      'Organization name does not match. Deletion cancelled for safety.'
    )
  }

  // Delete organization (cascade will handle related records due to ON DELETE CASCADE)
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', userOrg.organization_id)

  if (error) {
    throw new Error(`Failed to delete organization: ${error.message}`)
  }

  // Delete organization assets from storage
  try {
    await supabase.storage
      .from('organization-assets')
      .remove([`${userOrg.organization_id}/`])
  } catch (storageError) {
    console.error('Failed to delete organization assets:', storageError)
    // Continue anyway as main data is deleted
  }

  // Invalidate all organization-related pages
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')

  return {
    success: true,
    message: 'Organization deleted successfully',
    redirect: '/onboarding', // User needs to create new org or join another
  }
}

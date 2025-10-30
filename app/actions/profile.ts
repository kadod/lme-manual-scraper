'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { authenticator } from 'otplib'
import * as QRCode from 'qrcode'
import {
  ProfileUpdateData,
  NotificationSettings,
  Session,
  AvatarUploadResult,
  ProfileUpdateResult,
  TwoFactorEnableResult,
  TwoFactorVerifyData,
} from '@/types/profile'

/**
 * Helper function to get current authenticated user
 */
async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized: User not authenticated')
  }

  return { supabase, user }
}

/**
 * Update user profile information
 * @param data Profile update data (name, phone, timezone, locale)
 * @returns Promise<ProfileUpdateResult>
 */
export async function updateProfile(
  data: ProfileUpdateData
): Promise<ProfileUpdateResult> {
  try {
    const { supabase, user } = await getCurrentUser()

    const { error } = await supabase
      .from('users')
      .update({
        display_name: data.full_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings/profile')
    return { success: true }
  } catch (error) {
    console.error('Profile update exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update user avatar image
 * Uploads to Supabase Storage 'user-avatars' bucket
 * @param formData FormData containing avatar file
 * @returns Promise<AvatarUploadResult>
 */
export async function updateAvatar(
  formData: FormData
): Promise<AvatarUploadResult> {
  try {
    const { supabase, user } = await getCurrentUser()

    const file = formData.get('avatar') as File
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 5MB limit' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath)

    // Update user record with avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Avatar URL update error:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/dashboard/settings/profile')
    return { success: true, avatar_url: publicUrl }
  } catch (error) {
    console.error('Avatar update exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Change user password
 * Verifies current password before updating
 * @param currentPassword Current password for verification
 * @param newPassword New password to set
 * @returns Promise<ProfileUpdateResult>
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ProfileUpdateResult> {
  try {
    const { supabase, user } = await getCurrentUser()

    // Verify current password by attempting sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Validate new password
    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Password change exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update notification settings
 * @param settings Notification preferences (email and push)
 * @returns Promise<ProfileUpdateResult>
 */
export async function updateNotificationSettings(
  settings: NotificationSettings
): Promise<ProfileUpdateResult> {
  try {
    const { supabase, user } = await getCurrentUser()

    const { error } = await supabase
      .from('users')
      .update({
        notification_settings: settings as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('Notification settings update error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings/profile')
    return { success: true }
  } catch (error) {
    console.error('Notification settings update exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Enable two-factor authentication
 * Generates TOTP secret and QR code
 * @returns Promise<TwoFactorEnableResult>
 */
export async function enable2FA(): Promise<TwoFactorEnableResult> {
  try {
    const { supabase, user } = await getCurrentUser()

    // Generate TOTP secret
    const secret = authenticator.generateSecret()

    // Generate OTP auth URL for QR code
    const otpauthUrl = authenticator.keyuri(
      user.email!,
      'L Message SaaS',
      secret
    )

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl)

    // Generate backup codes (10 codes, 8 characters each)
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )

    // Store secret in database (not enabled yet, pending verification)
    const { error } = await supabase
      .from('users')
      .update({
        two_factor_secret: secret,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('2FA secret storage error:', error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      qr_code_url: qrCodeUrl,
      secret,
      backup_codes: backupCodes,
    }
  } catch (error) {
    console.error('2FA enable exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Verify 2FA code and enable two-factor authentication
 * @param data Verification data (code and secret)
 * @returns Promise<ProfileUpdateResult>
 */
export async function verify2FA(
  data: TwoFactorVerifyData
): Promise<ProfileUpdateResult> {
  try {
    const { supabase, user } = await getCurrentUser()

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: data.code,
      secret: data.secret,
    })

    if (!isValid) {
      return { success: false, error: 'Invalid verification code' }
    }

    // Enable 2FA in database
    const { error } = await supabase
      .from('users')
      .update({
        two_factor_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('2FA enable error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings/profile')
    return { success: true }
  } catch (error) {
    console.error('2FA verify exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Disable two-factor authentication
 * @returns Promise<ProfileUpdateResult>
 */
export async function disable2FA(): Promise<ProfileUpdateResult> {
  try {
    const { supabase, user } = await getCurrentUser()

    const { error } = await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('2FA disable error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings/profile')
    return { success: true }
  } catch (error) {
    console.error('2FA disable exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get active sessions for current user
 * Note: Supabase auth sessions are managed by auth.admin
 * This is a placeholder for future session management
 * @returns Promise<Session[]>
 */
export async function getActiveSessions(): Promise<Session[]> {
  try {
    const { supabase, user } = await getCurrentUser()

    // TODO: Implement session tracking table
    // For now, return current session info
    const { data: userData } = await supabase
      .from('users')
      .select('last_login_at')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return []
    }

    // Return mock session data (replace with actual session tracking)
    return [
      {
        id: 'current',
        user_id: user.id,
        ip_address: null,
        user_agent: null,
        created_at: userData.last_login_at || new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      },
    ]
  } catch (error) {
    console.error('Get sessions exception:', error)
    return []
  }
}

/**
 * Revoke a specific session
 * @param sessionId Session ID to revoke
 * @returns Promise<ProfileUpdateResult>
 */
export async function revokeSession(
  sessionId: string
): Promise<ProfileUpdateResult> {
  try {
    const { supabase } = await getCurrentUser()

    // TODO: Implement session revocation
    // For now, if trying to revoke current session, sign out
    if (sessionId === 'current') {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Revoke session exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Revoke all sessions except current
 * Signs out from all other devices
 * @returns Promise<ProfileUpdateResult>
 */
export async function revokeAllSessions(): Promise<ProfileUpdateResult> {
  try {
    const { supabase } = await getCurrentUser()

    // Sign out from all sessions (Supabase handles this globally)
    // Current session will remain active
    const { error } = await supabase.auth.signOut({ scope: 'others' })

    if (error) {
      console.error('Revoke all sessions error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings/profile')
    return { success: true }
  } catch (error) {
    console.error('Revoke all sessions exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get current user profile data
 * @returns User profile information
 */
export async function getCurrentProfile() {
  try {
    const { supabase, user } = await getCurrentUser()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Get profile exception:', error)
    throw error
  }
}

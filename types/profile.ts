// Profile Management Type Definitions

export interface ProfileUpdateData {
  full_name: string
  phone_number?: string
  timezone: string
  locale: string
}

export interface NotificationSettings {
  email: {
    message_sent: boolean
    form_submitted: boolean
    reservation_created: boolean
    weekly_report: boolean
  }
  push: {
    message_failed: boolean
    reservation_reminder: boolean
  }
}

export interface Session {
  id: string
  user_id: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  last_active_at: string
  expires_at: string
}

export interface TwoFactorSettings {
  enabled: boolean
  secret?: string
  backup_codes?: string[]
}

export interface PasswordChangeData {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface AvatarUploadResult {
  success: boolean
  avatar_url?: string
  error?: string
}

export interface ProfileUpdateResult {
  success: boolean
  error?: string
}

export interface TwoFactorEnableResult {
  success: boolean
  qr_code_url?: string
  secret?: string
  backup_codes?: string[]
  error?: string
}

export interface TwoFactorVerifyData {
  code: string
  secret: string
}

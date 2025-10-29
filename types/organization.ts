export interface OrganizationUpdateData {
  name: string
  website_url?: string
  contact_email?: string
  billing_email?: string
  primary_color?: string
  secondary_color?: string
  timezone?: string
  locale?: string
}

export interface BrandingSettings {
  logo_url?: string
  primary_color: string
  secondary_color: string
}

export interface StaffInvitation {
  id: string
  organization_id: string
  email: string
  role: 'admin' | 'member' | 'readonly'
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  token: string
  expires_at: string
  invited_by?: string
  created_at: string
}

export interface StaffMember {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'owner' | 'admin' | 'member' | 'readonly'
  status: 'active' | 'pending' | 'inactive'
  last_login_at?: string
  created_at: string
}

export interface OrganizationMember {
  user_id: string
  organization_id: string
  role: 'owner' | 'admin' | 'member' | 'readonly'
  joined_at: string
  user?: {
    email: string
    full_name?: string
    avatar_url?: string
  }
}

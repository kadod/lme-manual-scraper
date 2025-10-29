-- Phase 8: Profile Management - User Table Extensions
-- Created: 2025-10-30
-- Purpose: Add profile management fields to users table

-- =============================================
-- 1. Extend users table with profile fields
-- =============================================

-- Add profile-related columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  timezone TEXT DEFAULT 'Asia/Tokyo',
  locale TEXT DEFAULT 'ja',
  notification_settings JSONB DEFAULT '{
    "email": {
      "message_sent": true,
      "form_submitted": true,
      "reservation_created": true,
      "weekly_report": true
    },
    "push": {
      "message_failed": true,
      "reservation_reminder": true
    }
  }',
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  last_login_at TIMESTAMPTZ,
  last_login_ip INET;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_two_factor ON users(two_factor_enabled) WHERE two_factor_enabled = true;
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);

-- =============================================
-- 2. Storage Bucket Setup (user-avatars)
-- =============================================

-- Create user-avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true, -- Public bucket for avatar access
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for user-avatars bucket
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name))
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name))
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name))
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- =============================================
-- 3. Helper Functions
-- =============================================

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    last_login_at = NOW(),
    last_login_ip = inet_client_addr()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update last login
-- Note: This should be connected to auth events in application logic
-- since Supabase auth doesn't directly expose triggers

-- Function to validate notification settings structure
CREATE OR REPLACE FUNCTION validate_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure notification_settings has required structure
  IF NEW.notification_settings IS NOT NULL THEN
    IF NOT (
      NEW.notification_settings ? 'email' AND
      NEW.notification_settings ? 'push'
    ) THEN
      RAISE EXCEPTION 'notification_settings must contain email and push objects';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate notification settings
DROP TRIGGER IF EXISTS validate_notification_settings_trigger ON users;
CREATE TRIGGER validate_notification_settings_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_notification_settings();

-- =============================================
-- 4. RLS Policies for users table
-- =============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =============================================
-- 5. Comments for Documentation
-- =============================================

COMMENT ON COLUMN users.full_name IS 'User full name for display';
COMMENT ON COLUMN users.avatar_url IS 'URL to user avatar image in storage';
COMMENT ON COLUMN users.phone_number IS 'User contact phone number';
COMMENT ON COLUMN users.timezone IS 'User timezone (default: Asia/Tokyo)';
COMMENT ON COLUMN users.locale IS 'User locale for i18n (default: ja)';
COMMENT ON COLUMN users.notification_settings IS 'JSON structure for email and push notification preferences';
COMMENT ON COLUMN users.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN users.two_factor_secret IS 'TOTP secret for 2FA (encrypted)';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.last_login_ip IS 'IP address of last login';

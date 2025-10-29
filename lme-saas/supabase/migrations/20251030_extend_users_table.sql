-- Extend users table for Phase 8 system settings
-- Adds notification preferences, 2FA, session tracking

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Tokyo';
ALTER TABLE users ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'ja';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
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
}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip INET;

-- Add comments for documentation
COMMENT ON COLUMN users.phone_number IS 'User phone number for contact';
COMMENT ON COLUMN users.timezone IS 'User preferred timezone (IANA format)';
COMMENT ON COLUMN users.locale IS 'User preferred locale (ISO 639-1)';
COMMENT ON COLUMN users.notification_settings IS 'User notification preferences (JSON)';
COMMENT ON COLUMN users.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN users.two_factor_secret IS 'TOTP secret for 2FA (encrypted)';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.last_login_ip IS 'IP address of last login';

-- Add check constraint for phone number format (basic validation)
ALTER TABLE users ADD CONSTRAINT users_phone_number_check
  CHECK (phone_number IS NULL OR length(phone_number) >= 10);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);
CREATE INDEX IF NOT EXISTS idx_users_locale ON users(locale);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_two_factor ON users(two_factor_enabled) WHERE two_factor_enabled = true;

-- Function to update last_login_at automatically
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Trigger will be created by application logic when user logs in
COMMENT ON FUNCTION update_user_last_login() IS 'Updates last_login_at timestamp when user logs in';

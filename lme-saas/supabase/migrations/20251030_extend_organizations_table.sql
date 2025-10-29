-- Extend organizations table for Phase 8 system settings
-- Adds branding, localization, and contact information

-- Add new columns to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#00B900';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#06C755';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Tokyo';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'ja';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS billing_email TEXT;

-- Add comments for documentation
COMMENT ON COLUMN organizations.logo_url IS 'Organization logo URL from Supabase Storage';
COMMENT ON COLUMN organizations.primary_color IS 'Primary brand color (hex format)';
COMMENT ON COLUMN organizations.secondary_color IS 'Secondary brand color (hex format)';
COMMENT ON COLUMN organizations.timezone IS 'Organization default timezone (IANA format)';
COMMENT ON COLUMN organizations.locale IS 'Organization default locale (ISO 639-1)';
COMMENT ON COLUMN organizations.website_url IS 'Organization website URL';
COMMENT ON COLUMN organizations.contact_email IS 'General contact email address';
COMMENT ON COLUMN organizations.billing_email IS 'Billing-specific email address';

-- Add check constraints for color format validation
ALTER TABLE organizations ADD CONSTRAINT organizations_primary_color_check
  CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$');

ALTER TABLE organizations ADD CONSTRAINT organizations_secondary_color_check
  CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$');

-- Add check constraints for URL validation
ALTER TABLE organizations ADD CONSTRAINT organizations_website_url_check
  CHECK (website_url IS NULL OR website_url ~ '^https?://');

-- Create index for locale-based queries
CREATE INDEX IF NOT EXISTS idx_organizations_locale ON organizations(locale);
CREATE INDEX IF NOT EXISTS idx_organizations_timezone ON organizations(timezone);

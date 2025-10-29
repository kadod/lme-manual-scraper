-- Create system_settings table for organization-wide configuration
-- Stores general, notification, security, API, and data retention settings

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,

  -- Comprehensive settings in JSONB format
  settings JSONB DEFAULT '{
    "general": {
      "date_format": "yyyy/MM/dd",
      "time_format": "HH:mm",
      "week_starts_on": "sunday"
    },
    "notifications": {
      "enable_email": true,
      "enable_slack": false,
      "slack_webhook_url": null
    },
    "security": {
      "require_2fa": false,
      "password_expiry_days": 90,
      "session_timeout_minutes": 60,
      "ip_whitelist": []
    },
    "api": {
      "enable_webhooks": true,
      "webhook_retry_attempts": 3,
      "webhook_timeout_seconds": 30
    },
    "data_retention": {
      "analytics_events_days": 365,
      "audit_logs_days": 90,
      "message_logs_days": 180
    }
  }'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE system_settings IS 'Organization-wide system configuration and preferences';
COMMENT ON COLUMN system_settings.id IS 'Unique settings ID';
COMMENT ON COLUMN system_settings.organization_id IS 'One settings record per organization';
COMMENT ON COLUMN system_settings.settings IS 'Comprehensive settings in JSON format';

-- Detailed comments for settings structure
COMMENT ON COLUMN system_settings.settings IS 'Settings structure:
{
  "general": {
    "date_format": "yyyy/MM/dd",
    "time_format": "HH:mm",
    "week_starts_on": "sunday|monday"
  },
  "notifications": {
    "enable_email": boolean,
    "enable_slack": boolean,
    "slack_webhook_url": string|null
  },
  "security": {
    "require_2fa": boolean,
    "password_expiry_days": number,
    "session_timeout_minutes": number,
    "ip_whitelist": string[]
  },
  "api": {
    "enable_webhooks": boolean,
    "webhook_retry_attempts": number,
    "webhook_timeout_seconds": number
  },
  "data_retention": {
    "analytics_events_days": number,
    "audit_logs_days": number,
    "message_logs_days": number
  }
}';

-- Create indexes for performance
CREATE INDEX idx_system_settings_org ON system_settings(organization_id);

-- GIN index for JSONB queries
CREATE INDEX idx_system_settings_settings ON system_settings USING GIN (settings);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on changes
CREATE TRIGGER system_settings_updated_at_trigger
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION update_system_settings_updated_at();

-- Function to get a specific setting value
CREATE OR REPLACE FUNCTION get_setting(
  p_organization_id UUID,
  p_setting_path TEXT[]
) RETURNS JSONB AS $$
DECLARE
  v_value JSONB;
BEGIN
  SELECT settings #> p_setting_path
  INTO v_value
  FROM system_settings
  WHERE organization_id = p_organization_id;

  RETURN v_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_setting IS 'Gets a specific setting value by path array (e.g., {general, date_format})';

-- Function to update a specific setting value
CREATE OR REPLACE FUNCTION update_setting(
  p_organization_id UUID,
  p_setting_path TEXT[],
  p_value JSONB
) RETURNS VOID AS $$
BEGIN
  UPDATE system_settings
  SET settings = jsonb_set(settings, p_setting_path, p_value)
  WHERE organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_setting IS 'Updates a specific setting value by path array';

-- Function to initialize default settings for new organization
CREATE OR REPLACE FUNCTION initialize_system_settings(
  p_organization_id UUID
) RETURNS UUID AS $$
DECLARE
  v_settings_id UUID;
BEGIN
  INSERT INTO system_settings (organization_id)
  VALUES (p_organization_id)
  ON CONFLICT (organization_id) DO NOTHING
  RETURNING id INTO v_settings_id;

  RETURN v_settings_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION initialize_system_settings IS 'Initializes default system settings for a new organization';

-- Function to validate settings structure (optional, for data integrity)
CREATE OR REPLACE FUNCTION validate_system_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that required top-level keys exist
  IF NOT (NEW.settings ? 'general' AND
          NEW.settings ? 'notifications' AND
          NEW.settings ? 'security' AND
          NEW.settings ? 'api' AND
          NEW.settings ? 'data_retention') THEN
    RAISE EXCEPTION 'Settings must contain all required sections: general, notifications, security, api, data_retention';
  END IF;

  -- Additional validation can be added here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate settings on insert/update
CREATE TRIGGER system_settings_validate_trigger
BEFORE INSERT OR UPDATE OF settings ON system_settings
FOR EACH ROW
EXECUTE FUNCTION validate_system_settings();

COMMENT ON FUNCTION validate_system_settings IS 'Validates system settings structure before insert/update';

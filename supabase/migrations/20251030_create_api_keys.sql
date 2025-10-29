-- Create api_keys table for API key management
-- Supports key-based authentication with permissions and rate limiting

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Key information
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,

  -- Permissions (array of permission strings)
  permissions JSONB DEFAULT '[]'::jsonb,

  -- Rate limiting
  rate_limit INTEGER DEFAULT 1000,
  allowed_ips TEXT[] DEFAULT '{}',

  -- Status and tracking
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE api_keys IS 'API key management with permissions and rate limiting';
COMMENT ON COLUMN api_keys.id IS 'Unique API key ID';
COMMENT ON COLUMN api_keys.organization_id IS 'Organization this API key belongs to';
COMMENT ON COLUMN api_keys.name IS 'Descriptive name for the API key';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 8 characters of key (e.g., lm_prod****)';
COMMENT ON COLUMN api_keys.key_hash IS 'SHA-256 hash of the full API key (never store plain text)';
COMMENT ON COLUMN api_keys.permissions IS 'Array of permission strings: ["read:friends", "write:messages", "read:analytics"]';
COMMENT ON COLUMN api_keys.rate_limit IS 'Maximum API requests per day';
COMMENT ON COLUMN api_keys.allowed_ips IS 'Array of allowed IP addresses (empty = all allowed)';
COMMENT ON COLUMN api_keys.is_active IS 'Whether the API key is currently active';
COMMENT ON COLUMN api_keys.last_used_at IS 'Timestamp of last API request using this key';
COMMENT ON COLUMN api_keys.expires_at IS 'Optional expiration date for the key';
COMMENT ON COLUMN api_keys.created_by IS 'User who created this API key';

-- Create indexes for performance
CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_expires ON api_keys(expires_at) WHERE expires_at IS NOT NULL;

-- Add check constraints
ALTER TABLE api_keys ADD CONSTRAINT api_keys_rate_limit_check
  CHECK (rate_limit > 0 AND rate_limit <= 1000000);

ALTER TABLE api_keys ADD CONSTRAINT api_keys_key_prefix_check
  CHECK (length(key_prefix) >= 8);

ALTER TABLE api_keys ADD CONSTRAINT api_keys_name_check
  CHECK (length(name) >= 1 AND length(name) <= 255);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on changes
CREATE TRIGGER api_keys_updated_at_trigger
BEFORE UPDATE ON api_keys
FOR EACH ROW
EXECUTE FUNCTION update_api_keys_updated_at();

-- Function to check if API key is valid and active
CREATE OR REPLACE FUNCTION is_api_key_valid(
  p_key_hash TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_key RECORD;
BEGIN
  SELECT
    is_active,
    expires_at
  INTO v_key
  FROM api_keys
  WHERE key_hash = p_key_hash;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if key is active
  IF NOT v_key.is_active THEN
    RETURN false;
  END IF;

  -- Check if key has expired
  IF v_key.expires_at IS NOT NULL AND v_key.expires_at < NOW() THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_api_key_valid IS 'Validates API key by checking active status and expiration';

-- Function to update last_used_at when API key is used
CREATE OR REPLACE FUNCTION update_api_key_last_used(
  p_key_hash TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE api_keys
  SET last_used_at = NOW()
  WHERE key_hash = p_key_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_api_key_last_used IS 'Updates last_used_at timestamp when API key is used';

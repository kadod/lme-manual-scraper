-- Create audit_logs table for comprehensive audit logging
-- Tracks all important actions in the system for security and compliance

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Action information
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,

  -- Detailed information
  details JSONB DEFAULT '{}'::jsonb,

  -- Request metadata
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for all system actions';
COMMENT ON COLUMN audit_logs.id IS 'Unique log entry ID';
COMMENT ON COLUMN audit_logs.organization_id IS 'Organization this action belongs to';
COMMENT ON COLUMN audit_logs.user_id IS 'User who performed the action (NULL for system actions)';
COMMENT ON COLUMN audit_logs.action IS 'Action identifier (e.g., user.login, message.sent, friend.deleted)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., user, message, friend, organization)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.details IS 'Additional details in JSON format';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string of the request';

-- Add example comment for details structure
COMMENT ON COLUMN audit_logs.details IS 'Details structure: {"changes": {"before": {...}, "after": {...}}, "metadata": {...}}';

-- Create indexes for performance
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address);

-- Composite indexes for common queries
CREATE INDEX idx_audit_logs_org_created ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_org_action ON audit_logs(organization_id, action);

-- Add check constraints
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check
  CHECK (length(action) >= 3 AND length(action) <= 255);

ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_resource_type_check
  CHECK (length(resource_type) >= 1 AND length(resource_type) <= 100);

-- Partition table by month for large datasets (commented out, enable if needed)
-- CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

COMMENT ON TABLE audit_logs IS 'Consider partitioning by month for production use with high log volume';

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_organization_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_organization_id,
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    COALESCE(p_ip_address, inet_client_addr()),
    COALESCE(p_user_agent, current_setting('application.user_agent', true))
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_audit_log IS 'Creates an audit log entry with optional IP and user agent';

-- Function to query recent audit logs for an organization
CREATE OR REPLACE FUNCTION get_recent_audit_logs(
  p_organization_id UUID,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  action TEXT,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.details,
    al.ip_address,
    al.created_at
  FROM audit_logs al
  WHERE al.organization_id = p_organization_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_recent_audit_logs IS 'Retrieves recent audit logs for an organization';

-- Function to clean up old audit logs (for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
  p_days_to_keep INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL
  RETURNING COUNT(*) INTO v_deleted_count;

  RETURN COALESCE(v_deleted_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Deletes audit logs older than specified days (default: 90 days)';

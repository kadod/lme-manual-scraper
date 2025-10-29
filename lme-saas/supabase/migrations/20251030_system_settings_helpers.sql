-- Helper functions for Phase 8 system settings
-- Provides utility functions for common operations

-- ============================================================================
-- Usage Limit Functions
-- ============================================================================

-- Check if organization is within usage limit for a specific resource
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_organization_id UUID,
  p_resource TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_usage INTEGER;
BEGIN
  SELECT
    (limits->>p_resource)::INTEGER,
    (usage->>p_resource)::INTEGER
  INTO v_limit, v_usage
  FROM subscriptions
  WHERE organization_id = p_organization_id;

  IF v_limit IS NULL OR v_usage IS NULL THEN
    RETURN false;
  END IF;

  RETURN v_usage < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_usage_limit IS 'Checks if organization is within usage limits for a specific resource';

-- Increment usage counter for a specific resource
CREATE OR REPLACE FUNCTION increment_usage(
  p_organization_id UUID,
  p_resource TEXT,
  p_amount INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET
    usage = jsonb_set(
      usage,
      ARRAY[p_resource],
      to_jsonb(COALESCE((usage->>p_resource)::INTEGER, 0) + p_amount)
    ),
    updated_at = NOW()
  WHERE organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_usage IS 'Increments usage counter for a specific resource';

-- Decrement usage counter for a specific resource
CREATE OR REPLACE FUNCTION decrement_usage(
  p_organization_id UUID,
  p_resource TEXT,
  p_amount INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET
    usage = jsonb_set(
      usage,
      ARRAY[p_resource],
      to_jsonb(GREATEST(0, COALESCE((usage->>p_resource)::INTEGER, 0) - p_amount))
    ),
    updated_at = NOW()
  WHERE organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION decrement_usage IS 'Decrements usage counter for a specific resource (minimum 0)';

-- Reset monthly usage counters
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  UPDATE subscriptions
  SET
    usage = jsonb_set(
      usage,
      '{messages_this_month}',
      '0'::jsonb
    ),
    updated_at = NOW()
  WHERE status = 'active';

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION reset_monthly_usage IS 'Resets monthly usage counters for all active subscriptions';

-- Reset daily usage counters
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  UPDATE subscriptions
  SET
    usage = jsonb_set(
      usage,
      '{api_calls_today}',
      '0'::jsonb
    ),
    updated_at = NOW()
  WHERE status = 'active';

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION reset_daily_usage IS 'Resets daily usage counters for all active subscriptions';

-- ============================================================================
-- Audit Log Functions
-- ============================================================================

-- Simplified audit log creation function
CREATE OR REPLACE FUNCTION log_audit(
  p_organization_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
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
    inet_client_addr(),
    current_setting('application.user_agent', true)
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_audit IS 'Creates an audit log entry (simplified version)';

-- ============================================================================
-- Organization Management Functions
-- ============================================================================

-- Get organization usage summary
CREATE OR REPLACE FUNCTION get_organization_usage_summary(
  p_organization_id UUID
) RETURNS TABLE (
  plan TEXT,
  status TEXT,
  friends_used INTEGER,
  friends_limit INTEGER,
  messages_used INTEGER,
  messages_limit INTEGER,
  staff_used INTEGER,
  staff_limit INTEGER,
  forms_used INTEGER,
  forms_limit INTEGER,
  api_calls_used INTEGER,
  api_calls_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.plan,
    s.status,
    (s.usage->>'friends')::INTEGER,
    (s.limits->>'friends')::INTEGER,
    (s.usage->>'messages_this_month')::INTEGER,
    (s.limits->>'messages_per_month')::INTEGER,
    (s.usage->>'staff_accounts')::INTEGER,
    (s.limits->>'staff_accounts')::INTEGER,
    (s.usage->>'forms')::INTEGER,
    (s.limits->>'forms')::INTEGER,
    (s.usage->>'api_calls_today')::INTEGER,
    (s.limits->>'api_calls_per_day')::INTEGER
  FROM subscriptions s
  WHERE s.organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_organization_usage_summary IS 'Returns comprehensive usage summary for an organization';

-- ============================================================================
-- Invitation Management Functions
-- ============================================================================

-- Expire old pending invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE invitations
  SET
    status = 'expired',
    updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION expire_old_invitations IS 'Marks expired pending invitations as expired';

-- ============================================================================
-- Payment Method Functions
-- ============================================================================

-- Get default payment method for organization
CREATE OR REPLACE FUNCTION get_default_payment_method(
  p_organization_id UUID
) RETURNS TABLE (
  id UUID,
  stripe_payment_method_id TEXT,
  type TEXT,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.id,
    pm.stripe_payment_method_id,
    pm.type,
    pm.card_brand,
    pm.card_last4,
    pm.card_exp_month,
    pm.card_exp_year
  FROM payment_methods pm
  WHERE pm.organization_id = p_organization_id
    AND pm.is_default = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_default_payment_method IS 'Returns the default payment method for an organization';

-- ============================================================================
-- API Key Functions
-- ============================================================================

-- Check if API key has specific permission
CREATE OR REPLACE FUNCTION api_key_has_permission(
  p_key_hash TEXT,
  p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  SELECT permissions
  INTO v_permissions
  FROM api_keys
  WHERE key_hash = p_key_hash
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if permission exists in the array
  RETURN v_permissions ? p_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION api_key_has_permission IS 'Checks if an API key has a specific permission';

-- ============================================================================
-- System Statistics Functions
-- ============================================================================

-- Get system statistics for dashboard
CREATE OR REPLACE FUNCTION get_system_statistics(
  p_organization_id UUID
) RETURNS TABLE (
  total_friends BIGINT,
  total_messages BIGINT,
  total_forms BIGINT,
  total_staff BIGINT,
  total_api_keys BIGINT,
  active_subscriptions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((s.usage->>'friends')::BIGINT, 0),
    COALESCE((s.usage->>'messages_this_month')::BIGINT, 0),
    COALESCE((s.usage->>'forms')::BIGINT, 0),
    COALESCE((s.usage->>'staff_accounts')::BIGINT, 0),
    (SELECT COUNT(*) FROM api_keys WHERE organization_id = p_organization_id AND is_active = true),
    CASE WHEN s.status = 'active' THEN 1 ELSE 0 END
  FROM subscriptions s
  WHERE s.organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_system_statistics IS 'Returns system statistics for organization dashboard';

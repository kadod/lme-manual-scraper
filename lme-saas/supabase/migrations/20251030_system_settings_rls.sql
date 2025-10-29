-- Row Level Security (RLS) policies for Phase 8 system settings
-- Ensures data access is properly restricted by organization and role

-- ============================================================================
-- Invitations RLS Policies
-- ============================================================================

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations in their organization
CREATE POLICY "Users can view invitations in their organization"
ON invitations FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- Admins and owners can manage invitations
CREATE POLICY "Admins can manage invitations"
ON invitations FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

COMMENT ON POLICY "Users can view invitations in their organization" ON invitations IS
  'All organization members can view invitations';
COMMENT ON POLICY "Admins can manage invitations" ON invitations IS
  'Only owners and admins can create, update, and delete invitations';

-- ============================================================================
-- Subscriptions RLS Policies
-- ============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view subscription in their organization
CREATE POLICY "Users can view subscription in their organization"
ON subscriptions FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- Only owners can manage subscription
CREATE POLICY "Owners can manage subscription"
ON subscriptions FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

COMMENT ON POLICY "Users can view subscription in their organization" ON subscriptions IS
  'All organization members can view subscription details';
COMMENT ON POLICY "Owners can manage subscription" ON subscriptions IS
  'Only organization owners can modify subscription and billing details';

-- ============================================================================
-- Payment Methods RLS Policies
-- ============================================================================

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Only owners can view payment methods
CREATE POLICY "Owners can view payment methods"
ON payment_methods FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Only owners can manage payment methods
CREATE POLICY "Owners can manage payment methods"
ON payment_methods FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "Owners can update payment methods"
ON payment_methods FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "Owners can delete payment methods"
ON payment_methods FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

COMMENT ON POLICY "Owners can view payment methods" ON payment_methods IS
  'Only organization owners can view payment methods';

-- ============================================================================
-- Invoices RLS Policies
-- ============================================================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users can view invoices in their organization
CREATE POLICY "Users can view invoices in their organization"
ON invoices FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- Invoices are managed by system/Stripe webhooks, not directly by users
CREATE POLICY "Service role can manage invoices"
ON invoices FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON POLICY "Users can view invoices in their organization" ON invoices IS
  'All organization members can view invoice history';
COMMENT ON POLICY "Service role can manage invoices" ON invoices IS
  'Invoices are managed by Stripe webhooks using service role';

-- ============================================================================
-- API Keys RLS Policies
-- ============================================================================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can view API keys in their organization
CREATE POLICY "Users can view api keys in their organization"
ON api_keys FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- Admins and owners can manage API keys
CREATE POLICY "Admins can manage api keys"
ON api_keys FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can update api keys"
ON api_keys FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can delete api keys"
ON api_keys FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

COMMENT ON POLICY "Users can view api keys in their organization" ON api_keys IS
  'All organization members can view API keys';
COMMENT ON POLICY "Admins can manage api keys" ON api_keys IS
  'Only owners and admins can create, update, and delete API keys';

-- ============================================================================
-- Audit Logs RLS Policies
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view audit logs in their organization
CREATE POLICY "Users can view audit logs in their organization"
ON audit_logs FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- Audit logs are created by system, not directly by users
CREATE POLICY "Service role can create audit logs"
ON audit_logs FOR INSERT
WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Application can create audit logs"
ON audit_logs FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

COMMENT ON POLICY "Users can view audit logs in their organization" ON audit_logs IS
  'All organization members can view audit logs';
COMMENT ON POLICY "Service role can create audit logs" ON audit_logs IS
  'System can create audit logs using service role';
COMMENT ON POLICY "Application can create audit logs" ON audit_logs IS
  'Application can create audit logs for authenticated users';

-- ============================================================================
-- System Settings RLS Policies
-- ============================================================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Users can view system settings in their organization
CREATE POLICY "Users can view system settings in their organization"
ON system_settings FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- Admins and owners can manage system settings
CREATE POLICY "Admins can manage system settings"
ON system_settings FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can update system settings"
ON system_settings FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

COMMENT ON POLICY "Users can view system settings in their organization" ON system_settings IS
  'All organization members can view system settings';
COMMENT ON POLICY "Admins can manage system settings" ON system_settings IS
  'Only owners and admins can modify system settings';

-- ============================================================================
-- Grant necessary permissions
-- ============================================================================

-- Grant usage on sequences (if any are created)
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure authenticated users can access these tables
GRANT SELECT ON invitations TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON payment_methods TO authenticated;
GRANT SELECT ON invoices TO authenticated;
GRANT SELECT ON api_keys TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON system_settings TO authenticated;

-- Service role needs full access for webhook processing
GRANT ALL ON invitations TO service_role;
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON payment_methods TO service_role;
GRANT ALL ON invoices TO service_role;
GRANT ALL ON api_keys TO service_role;
GRANT ALL ON audit_logs TO service_role;
GRANT ALL ON system_settings TO service_role;

-- ============================================================================
-- Security Notes
-- ============================================================================

COMMENT ON TABLE invitations IS 'RLS enabled: Users view, admins manage invitations in their organization';
COMMENT ON TABLE subscriptions IS 'RLS enabled: Users view, only owners manage subscriptions';
COMMENT ON TABLE payment_methods IS 'RLS enabled: Only owners can view and manage payment methods';
COMMENT ON TABLE invoices IS 'RLS enabled: Users view, system manages via webhooks';
COMMENT ON TABLE api_keys IS 'RLS enabled: Users view, admins manage API keys';
COMMENT ON TABLE audit_logs IS 'RLS enabled: Users view, system creates audit logs';
COMMENT ON TABLE system_settings IS 'RLS enabled: Users view, admins manage settings';

-- Row Level Security Policies for Analytics Tables
-- Ensures proper multi-tenant isolation for analytics data

-- Enable RLS on all analytics tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ANALYTICS EVENTS POLICIES
-- ============================================

-- SELECT: Users can view events from their organization
CREATE POLICY analytics_events_select_policy ON analytics_events
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Users can create events for their organization
CREATE POLICY analytics_events_insert_policy ON analytics_events
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: Admins can delete events
CREATE POLICY analytics_events_delete_policy ON analytics_events
  FOR DELETE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- ANALYTICS DAILY STATS POLICIES
-- ============================================

-- SELECT: Users can view daily stats from their organization
CREATE POLICY analytics_daily_stats_select_policy ON analytics_daily_stats
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: System can create daily stats
CREATE POLICY analytics_daily_stats_insert_policy ON analytics_daily_stats
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: System can update daily stats
CREATE POLICY analytics_daily_stats_update_policy ON analytics_daily_stats
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: Admins can delete daily stats
CREATE POLICY analytics_daily_stats_delete_policy ON analytics_daily_stats
  FOR DELETE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- URL TRACKING POLICIES
-- ============================================

-- SELECT: Users can view tracked URLs from their organization
CREATE POLICY url_tracking_select_policy ON url_tracking
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Users can create tracked URLs for their organization
CREATE POLICY url_tracking_insert_policy ON url_tracking
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Users can update tracked URLs in their organization
CREATE POLICY url_tracking_update_policy ON url_tracking
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: Admins and creators can delete tracked URLs
CREATE POLICY url_tracking_delete_policy ON url_tracking
  FOR DELETE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND (
          om.role IN ('owner', 'admin')
          OR created_by = auth.uid()
        )
    )
  );

-- ============================================
-- URL CLICKS POLICIES
-- ============================================

-- SELECT: Users can view clicks for their organization's URLs
CREATE POLICY url_clicks_select_policy ON url_clicks
  FOR SELECT
  USING (
    url_tracking_id IN (
      SELECT id
      FROM url_tracking
      WHERE organization_id IN (
        SELECT organization_id
        FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- INSERT: Anyone can record clicks (public endpoint)
CREATE POLICY url_clicks_insert_policy ON url_clicks
  FOR INSERT
  WITH CHECK (true);

-- DELETE: Admins can delete click records
CREATE POLICY url_clicks_delete_policy ON url_clicks
  FOR DELETE
  USING (
    url_tracking_id IN (
      SELECT ut.id
      FROM url_tracking ut
      JOIN organization_members om ON ut.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- CUSTOM REPORTS POLICIES
-- ============================================

-- SELECT: Users can view reports from their organization
CREATE POLICY custom_reports_select_policy ON custom_reports
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Users can create reports for their organization
CREATE POLICY custom_reports_insert_policy ON custom_reports
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Users can update their own reports, admins can update any
CREATE POLICY custom_reports_update_policy ON custom_reports
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND (
          om.role IN ('owner', 'admin')
          OR created_by = auth.uid()
        )
    )
  );

-- DELETE: Users can delete their own reports, admins can delete any
CREATE POLICY custom_reports_delete_policy ON custom_reports
  FOR DELETE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND (
          om.role IN ('owner', 'admin')
          OR created_by = auth.uid()
        )
    )
  );

-- ============================================
-- REPORT EXECUTIONS POLICIES
-- ============================================

-- SELECT: Users can view execution history for their organization's reports
CREATE POLICY report_executions_select_policy ON report_executions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: System can create execution records
CREATE POLICY report_executions_insert_policy ON report_executions
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: System can update execution records
CREATE POLICY report_executions_update_policy ON report_executions
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: Admins can delete execution records
CREATE POLICY report_executions_delete_policy ON report_executions
  FOR DELETE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM organization_members om
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- SERVICE ROLE BYPASS
-- ============================================

-- Grant service role full access to all analytics tables
GRANT ALL ON analytics_events TO service_role;
GRANT ALL ON analytics_daily_stats TO service_role;
GRANT ALL ON url_tracking TO service_role;
GRANT ALL ON url_clicks TO service_role;
GRANT ALL ON custom_reports TO service_role;
GRANT ALL ON report_executions TO service_role;

-- ============================================
-- AUTHENTICATED USER PERMISSIONS
-- ============================================

-- Grant authenticated users access to their organization's data
GRANT SELECT, INSERT, UPDATE ON analytics_events TO authenticated;
GRANT SELECT ON analytics_daily_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON url_tracking TO authenticated;
GRANT SELECT ON url_clicks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON custom_reports TO authenticated;
GRANT SELECT ON report_executions TO authenticated;

-- ============================================
-- ANONYMOUS USER PERMISSIONS (for URL clicks)
-- ============================================

-- Allow anonymous users to record URL clicks
GRANT INSERT ON url_clicks TO anon;

-- Comments
COMMENT ON POLICY analytics_events_select_policy ON analytics_events IS 'Users can view analytics events from their organization';
COMMENT ON POLICY url_tracking_select_policy ON url_tracking IS 'Users can view tracked URLs from their organization';
COMMENT ON POLICY url_clicks_insert_policy ON url_clicks IS 'Anyone can record URL clicks (public endpoint)';
COMMENT ON POLICY custom_reports_select_policy ON custom_reports IS 'Users can view reports from their organization';

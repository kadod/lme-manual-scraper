-- Additional Indexes for Analytics Performance Optimization
-- Composite indexes for common query patterns

-- ============================================
-- ANALYTICS EVENTS INDEXES
-- ============================================

-- Index for time-series analysis by organization and event type
CREATE INDEX IF NOT EXISTS idx_analytics_events_timeseries
  ON analytics_events(organization_id, event_type, created_at DESC)
  WHERE created_at > now() - interval '1 year';

-- Index for friend activity analysis
CREATE INDEX IF NOT EXISTS idx_analytics_events_friend_activity
  ON analytics_events(friend_id, event_type, created_at DESC)
  WHERE friend_id IS NOT NULL;

-- Index for session analysis
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_analysis
  ON analytics_events(organization_id, session_id, created_at)
  WHERE session_id IS NOT NULL;

-- Partial index for recent events (hot data)
CREATE INDEX IF NOT EXISTS idx_analytics_events_recent
  ON analytics_events(organization_id, created_at DESC)
  WHERE created_at > now() - interval '30 days';

-- Index for message event analysis
CREATE INDEX IF NOT EXISTS idx_analytics_events_messages
  ON analytics_events(organization_id, created_at DESC)
  WHERE event_type IN ('message_sent', 'message_delivered', 'message_read', 'message_failed');

-- Index for campaign event analysis
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaigns
  ON analytics_events(organization_id, created_at DESC)
  WHERE event_type LIKE 'campaign_%';

-- Index for form event analysis
CREATE INDEX IF NOT EXISTS idx_analytics_events_forms
  ON analytics_events(organization_id, created_at DESC)
  WHERE event_type LIKE 'form_%';

-- ============================================
-- ANALYTICS DAILY STATS INDEXES
-- ============================================

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_daily_stats_date_range
  ON analytics_daily_stats(organization_id, date DESC)
  INCLUDE (messages_sent, messages_delivered, campaigns_completed, forms_submitted);

-- Index for trend analysis
CREATE INDEX IF NOT EXISTS idx_daily_stats_trends
  ON analytics_daily_stats(date DESC, organization_id)
  WHERE date > CURRENT_DATE - 90;

-- Index for performance metrics
CREATE INDEX IF NOT EXISTS idx_daily_stats_performance
  ON analytics_daily_stats(organization_id, date DESC)
  INCLUDE (message_delivery_rate, message_read_rate, form_conversion_rate);

-- ============================================
-- URL TRACKING INDEXES
-- ============================================

-- Index for active URL lookup
CREATE INDEX IF NOT EXISTS idx_url_tracking_active_lookup
  ON url_tracking(short_code, is_active)
  WHERE is_active = true;

-- Index for organization URL management
CREATE INDEX IF NOT EXISTS idx_url_tracking_org_management
  ON url_tracking(organization_id, created_at DESC)
  INCLUDE (short_code, original_url, click_count);

-- Index for campaign URL tracking
CREATE INDEX IF NOT EXISTS idx_url_tracking_campaign
  ON url_tracking(campaign_id, click_count DESC)
  WHERE campaign_id IS NOT NULL;

-- Index for form URL tracking
CREATE INDEX IF NOT EXISTS idx_url_tracking_form
  ON url_tracking(form_id, click_count DESC)
  WHERE form_id IS NOT NULL;

-- Index for expiring URLs (for cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_url_tracking_expiring
  ON url_tracking(expires_at)
  WHERE is_active = true AND expires_at IS NOT NULL;

-- Index for popular URLs
CREATE INDEX IF NOT EXISTS idx_url_tracking_popular
  ON url_tracking(organization_id, click_count DESC)
  WHERE click_count > 0;

-- ============================================
-- URL CLICKS INDEXES
-- ============================================

-- Index for click analysis by time
CREATE INDEX IF NOT EXISTS idx_url_clicks_time_analysis
  ON url_clicks(url_tracking_id, clicked_at DESC)
  INCLUDE (device_type, country_code, is_unique_click);

-- Index for friend click history
CREATE INDEX IF NOT EXISTS idx_url_clicks_friend_history
  ON url_clicks(friend_id, clicked_at DESC)
  WHERE friend_id IS NOT NULL;

-- Index for geographic analysis
CREATE INDEX IF NOT EXISTS idx_url_clicks_geography
  ON url_clicks(url_tracking_id, country_code, clicked_at DESC)
  WHERE country_code IS NOT NULL;

-- Index for device analysis
CREATE INDEX IF NOT EXISTS idx_url_clicks_device_analysis
  ON url_clicks(url_tracking_id, device_type, clicked_at DESC)
  WHERE device_type IS NOT NULL;

-- Index for unique clicks tracking
CREATE INDEX IF NOT EXISTS idx_url_clicks_unique
  ON url_clicks(url_tracking_id, clicked_at DESC)
  WHERE is_unique_click = true;

-- Partial index for recent clicks (hot data)
CREATE INDEX IF NOT EXISTS idx_url_clicks_recent
  ON url_clicks(url_tracking_id, clicked_at DESC)
  WHERE clicked_at > now() - interval '30 days';

-- Index for IP-based deduplication
CREATE INDEX IF NOT EXISTS idx_url_clicks_ip_dedup
  ON url_clicks(url_tracking_id, ip_address, clicked_at DESC)
  WHERE ip_address IS NOT NULL;

-- ============================================
-- CUSTOM REPORTS INDEXES
-- ============================================

-- Index for active reports listing
CREATE INDEX IF NOT EXISTS idx_custom_reports_active_listing
  ON custom_reports(organization_id, is_active, updated_at DESC)
  WHERE is_active = true;

-- Index for favorite reports
CREATE INDEX IF NOT EXISTS idx_custom_reports_favorites
  ON custom_reports(organization_id, is_favorite, updated_at DESC)
  WHERE is_favorite = true;

-- Index for scheduled reports processing
CREATE INDEX IF NOT EXISTS idx_custom_reports_scheduled_processing
  ON custom_reports(next_scheduled_at, is_active, schedule_enabled)
  WHERE schedule_enabled = true AND is_active = true;

-- Index for report type filtering
CREATE INDEX IF NOT EXISTS idx_custom_reports_by_type
  ON custom_reports(organization_id, report_type, updated_at DESC);

-- ============================================
-- REPORT EXECUTIONS INDEXES
-- ============================================

-- Index for execution history
CREATE INDEX IF NOT EXISTS idx_report_executions_history
  ON report_executions(report_id, started_at DESC)
  INCLUDE (status, duration_ms, row_count);

-- Index for active/pending executions
CREATE INDEX IF NOT EXISTS idx_report_executions_pending
  ON report_executions(status, started_at)
  WHERE status IN ('pending', 'running');

-- Index for failed executions
CREATE INDEX IF NOT EXISTS idx_report_executions_failed
  ON report_executions(report_id, started_at DESC)
  WHERE status = 'failed';

-- Index for organization execution history
CREATE INDEX IF NOT EXISTS idx_report_executions_org_history
  ON report_executions(organization_id, started_at DESC)
  INCLUDE (report_id, status, duration_ms);

-- Index for execution performance analysis
CREATE INDEX IF NOT EXISTS idx_report_executions_performance
  ON report_executions(report_id, completed_at DESC)
  INCLUDE (duration_ms, row_count)
  WHERE status = 'completed';

-- ============================================
-- MAINTENANCE INDEXES
-- ============================================

-- Index for data retention cleanup (analytics_events)
CREATE INDEX IF NOT EXISTS idx_analytics_events_cleanup
  ON analytics_events(created_at)
  WHERE created_at < now() - interval '1 year';

-- Index for data retention cleanup (url_clicks)
CREATE INDEX IF NOT EXISTS idx_url_clicks_cleanup
  ON url_clicks(clicked_at)
  WHERE clicked_at < now() - interval '1 year';

-- Index for old report executions cleanup
CREATE INDEX IF NOT EXISTS idx_report_executions_cleanup
  ON report_executions(completed_at)
  WHERE completed_at < now() - interval '6 months';

-- ============================================
-- STATISTICS COLLECTION
-- ============================================

-- Analyze tables to update query planner statistics
ANALYZE analytics_events;
ANALYZE analytics_daily_stats;
ANALYZE url_tracking;
ANALYZE url_clicks;
ANALYZE custom_reports;
ANALYZE report_executions;

-- Comments
COMMENT ON INDEX idx_analytics_events_timeseries IS 'Optimizes time-series analysis queries for recent year';
COMMENT ON INDEX idx_url_tracking_active_lookup IS 'Fast lookup for active short URLs';
COMMENT ON INDEX idx_url_clicks_time_analysis IS 'Optimizes click analysis queries with device and location data';
COMMENT ON INDEX idx_custom_reports_scheduled_processing IS 'Optimizes scheduled report processing queries';
COMMENT ON INDEX idx_analytics_events_cleanup IS 'Supports data retention cleanup jobs';

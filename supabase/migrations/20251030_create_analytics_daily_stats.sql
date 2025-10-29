-- Analytics Daily Stats Table
-- Aggregated daily statistics for organizations

CREATE TABLE IF NOT EXISTS analytics_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Message metrics
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_read INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  message_delivery_rate NUMERIC(5,2),
  message_read_rate NUMERIC(5,2),

  -- Campaign metrics
  campaigns_created INTEGER DEFAULT 0,
  campaigns_started INTEGER DEFAULT 0,
  campaigns_completed INTEGER DEFAULT 0,
  campaign_completion_rate NUMERIC(5,2),

  -- Friend metrics
  friends_added INTEGER DEFAULT 0,
  friends_active INTEGER DEFAULT 0,
  friends_total INTEGER DEFAULT 0,

  -- Form metrics
  forms_viewed INTEGER DEFAULT 0,
  forms_submitted INTEGER DEFAULT 0,
  form_conversion_rate NUMERIC(5,2),
  forms_abandoned INTEGER DEFAULT 0,

  -- Reservation metrics
  reservations_created INTEGER DEFAULT 0,
  reservations_confirmed INTEGER DEFAULT 0,
  reservations_cancelled INTEGER DEFAULT 0,
  reservations_completed INTEGER DEFAULT 0,
  reservations_no_show INTEGER DEFAULT 0,
  reservation_show_rate NUMERIC(5,2),

  -- URL tracking metrics
  url_clicks INTEGER DEFAULT 0,
  unique_url_clicks INTEGER DEFAULT 0,

  -- Engagement metrics
  active_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration INTEGER, -- in seconds
  page_views INTEGER DEFAULT 0,

  -- Revenue metrics (if applicable)
  revenue NUMERIC(12,2) DEFAULT 0,
  transactions INTEGER DEFAULT 0,

  -- Additional metrics as JSON for flexibility
  custom_metrics JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(organization_id, date)
);

-- Indexes
CREATE INDEX idx_daily_stats_org_id ON analytics_daily_stats(organization_id);
CREATE INDEX idx_daily_stats_date ON analytics_daily_stats(date DESC);
CREATE INDEX idx_daily_stats_org_date ON analytics_daily_stats(organization_id, date DESC);

-- GIN index for custom metrics
CREATE INDEX idx_daily_stats_custom_metrics ON analytics_daily_stats USING gin(custom_metrics);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_daily_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_daily_stats_updated_at
  BEFORE UPDATE ON analytics_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats_updated_at();

-- Materialized View for faster analytics queries
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_analytics AS
SELECT
  organization_id,
  date,
  messages_sent,
  messages_delivered,
  messages_read,
  message_delivery_rate,
  message_read_rate,
  campaigns_completed,
  friends_active,
  forms_submitted,
  form_conversion_rate,
  reservations_completed,
  reservation_show_rate,
  url_clicks,
  active_users,
  revenue
FROM analytics_daily_stats
ORDER BY organization_id, date DESC;

-- Index on materialized view
CREATE INDEX idx_mv_daily_analytics_org_date ON mv_daily_analytics(organization_id, date DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_daily_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_analytics;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE analytics_daily_stats IS 'Daily aggregated statistics for organizations';
COMMENT ON COLUMN analytics_daily_stats.message_delivery_rate IS 'Percentage of messages successfully delivered';
COMMENT ON COLUMN analytics_daily_stats.message_read_rate IS 'Percentage of delivered messages that were read';
COMMENT ON COLUMN analytics_daily_stats.form_conversion_rate IS 'Percentage of form views that resulted in submissions';
COMMENT ON COLUMN analytics_daily_stats.reservation_show_rate IS 'Percentage of confirmed reservations where customer showed up';
COMMENT ON COLUMN analytics_daily_stats.custom_metrics IS 'Additional organization-specific metrics in JSON format';
COMMENT ON MATERIALIZED VIEW mv_daily_analytics IS 'Materialized view for fast analytics dashboard queries';

-- Analytics Daily Stats Table
-- Stores daily aggregated analytics data
CREATE TABLE IF NOT EXISTS analytics_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Friend metrics
  friends_added INTEGER DEFAULT 0,
  friends_blocked INTEGER DEFAULT 0,
  friends_total INTEGER DEFAULT 0,

  -- Message metrics
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_read INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,

  -- Engagement metrics
  open_rate DECIMAL(5,2) DEFAULT 0.00,
  click_rate DECIMAL(5,2) DEFAULT 0.00,
  response_rate DECIMAL(5,2) DEFAULT 0.00,

  -- Reservation metrics
  reservations_created INTEGER DEFAULT 0,
  reservations_confirmed INTEGER DEFAULT 0,
  reservations_cancelled INTEGER DEFAULT 0,
  reservations_completed INTEGER DEFAULT 0,
  reservations_no_show INTEGER DEFAULT 0,

  -- Form metrics
  forms_viewed INTEGER DEFAULT 0,
  forms_submitted INTEGER DEFAULT 0,
  forms_abandoned INTEGER DEFAULT 0,
  form_completion_rate DECIMAL(5,2) DEFAULT 0.00,

  -- URL tracking metrics
  url_clicks_total INTEGER DEFAULT 0,
  unique_url_clicks INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(organization_id, date)
);

-- Indexes for performance
CREATE INDEX idx_analytics_daily_stats_org_id ON analytics_daily_stats(organization_id);
CREATE INDEX idx_analytics_daily_stats_date ON analytics_daily_stats(date DESC);
CREATE INDEX idx_analytics_daily_stats_org_date ON analytics_daily_stats(organization_id, date DESC);

-- URL Tracking Table
-- Stores trackable URLs with shortened links
CREATE TABLE IF NOT EXISTS url_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  short_code TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,

  -- Metadata
  title TEXT,
  description TEXT,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  message_id UUID,

  -- Statistics
  click_count INTEGER DEFAULT 0,
  unique_click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT valid_url CHECK (original_url ~* '^https?://.*')
);

-- Indexes for url_tracking
CREATE INDEX idx_url_tracking_org_id ON url_tracking(organization_id);
CREATE INDEX idx_url_tracking_short_code ON url_tracking(short_code);
CREATE INDEX idx_url_tracking_campaign ON url_tracking(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_url_tracking_active ON url_tracking(is_active, expires_at) WHERE is_active = true;
CREATE INDEX idx_url_tracking_created ON url_tracking(created_at DESC);

-- URL Clicks Table
-- Stores individual URL click events
CREATE TABLE IF NOT EXISTS url_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_tracking_id UUID NOT NULL REFERENCES url_tracking(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES friends(id) ON DELETE SET NULL,

  -- Click metadata
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop', 'bot', 'unknown'
  browser TEXT,
  os TEXT,

  -- Network info
  ip_address INET,
  country_code TEXT,
  city TEXT,

  -- Source tracking
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Session tracking
  session_id TEXT,
  is_unique_click BOOLEAN DEFAULT true
);

-- Indexes for url_clicks
CREATE INDEX idx_url_clicks_url_tracking ON url_clicks(url_tracking_id);
CREATE INDEX idx_url_clicks_org_id ON url_clicks(organization_id);
CREATE INDEX idx_url_clicks_friend_id ON url_clicks(friend_id) WHERE friend_id IS NOT NULL;
CREATE INDEX idx_url_clicks_date ON url_clicks(clicked_at DESC);
CREATE INDEX idx_url_clicks_device ON url_clicks(device_type) WHERE device_type IS NOT NULL;
CREATE INDEX idx_url_clicks_session ON url_clicks(session_id) WHERE session_id IS NOT NULL;

-- Materialized View for Analytics Overview
-- Pre-computed view for fast dashboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_overview AS
SELECT
  ae.organization_id,
  DATE(ae.created_at) as date,

  -- Message metrics
  COUNT(CASE WHEN ae.event_type = 'message_sent' THEN 1 END) as messages_sent,
  COUNT(CASE WHEN ae.event_type = 'message_delivered' THEN 1 END) as messages_delivered,
  COUNT(CASE WHEN ae.event_type = 'message_read' THEN 1 END) as messages_read,
  COUNT(CASE WHEN ae.event_type = 'message_failed' THEN 1 END) as messages_failed,

  -- Friend metrics
  COUNT(CASE WHEN ae.event_type = 'friend_added' THEN 1 END) as friends_added,
  COUNT(CASE WHEN ae.event_type = 'friend_deleted' THEN 1 END) as friends_deleted,

  -- Form metrics
  COUNT(CASE WHEN ae.event_type = 'form_viewed' THEN 1 END) as forms_viewed,
  COUNT(CASE WHEN ae.event_type = 'form_submitted' THEN 1 END) as forms_submitted,
  COUNT(CASE WHEN ae.event_type = 'form_abandoned' THEN 1 END) as forms_abandoned,

  -- Reservation metrics
  COUNT(CASE WHEN ae.event_type = 'reservation_created' THEN 1 END) as reservations_created,
  COUNT(CASE WHEN ae.event_type = 'reservation_confirmed' THEN 1 END) as reservations_confirmed,
  COUNT(CASE WHEN ae.event_type = 'reservation_cancelled' THEN 1 END) as reservations_cancelled,
  COUNT(CASE WHEN ae.event_type = 'reservation_completed' THEN 1 END) as reservations_completed,
  COUNT(CASE WHEN ae.event_type = 'reservation_no_show' THEN 1 END) as reservations_no_show,

  -- URL tracking
  COUNT(CASE WHEN ae.event_type = 'url_clicked' THEN 1 END) as url_clicks_total,
  COUNT(DISTINCT CASE WHEN ae.event_type = 'url_clicked' THEN ae.friend_id END) as unique_url_clicks

FROM analytics_events ae
GROUP BY ae.organization_id, DATE(ae.created_at);

-- Index on materialized view
CREATE UNIQUE INDEX idx_analytics_overview_org_date ON analytics_overview(organization_id, date DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_analytics_overview()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_overview;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_analytics_daily_stats_updated_at
  BEFORE UPDATE ON analytics_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_url_tracking_updated_at
  BEFORE UPDATE ON url_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE analytics_daily_stats IS 'Daily aggregated analytics data for organizations';
COMMENT ON TABLE url_tracking IS 'Trackable URLs with shortened links for click tracking';
COMMENT ON TABLE url_clicks IS 'Individual URL click events with metadata';
COMMENT ON MATERIALIZED VIEW analytics_overview IS 'Pre-computed analytics overview for dashboard queries';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON analytics_daily_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON url_tracking TO authenticated;
GRANT SELECT, INSERT ON url_clicks TO authenticated;
GRANT SELECT ON analytics_overview TO authenticated;

-- Analytics Helper Functions
-- Utility functions for event tracking, statistics, and reporting

-- ============================================
-- EVENT TRACKING FUNCTIONS
-- ============================================

-- Track a custom event
CREATE OR REPLACE FUNCTION track_event(
  p_organization_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_friend_id UUID DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_page_url TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO analytics_events (
    organization_id,
    event_type,
    event_data,
    friend_id,
    user_agent,
    ip_address,
    session_id,
    page_url,
    referrer
  ) VALUES (
    p_organization_id,
    p_event_type,
    p_event_data,
    p_friend_id,
    p_user_agent,
    p_ip_address,
    p_session_id,
    p_page_url,
    p_referrer
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Batch track multiple events
CREATE OR REPLACE FUNCTION track_events_batch(
  p_events JSONB
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_event JSONB;
BEGIN
  FOR v_event IN SELECT * FROM jsonb_array_elements(p_events)
  LOOP
    INSERT INTO analytics_events (
      organization_id,
      event_type,
      event_data,
      friend_id,
      session_id
    ) VALUES (
      (v_event->>'organization_id')::UUID,
      v_event->>'event_type',
      COALESCE(v_event->'event_data', '{}'::jsonb),
      (v_event->>'friend_id')::UUID,
      v_event->>'session_id'
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STATISTICS FUNCTIONS
-- ============================================

-- Get daily statistics for a date range
CREATE OR REPLACE FUNCTION get_daily_stats(
  p_organization_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  date DATE,
  messages_sent INTEGER,
  messages_delivered INTEGER,
  messages_read INTEGER,
  message_delivery_rate NUMERIC,
  message_read_rate NUMERIC,
  campaigns_completed INTEGER,
  friends_active INTEGER,
  forms_submitted INTEGER,
  form_conversion_rate NUMERIC,
  reservations_completed INTEGER,
  url_clicks INTEGER,
  active_users INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.date,
    ds.messages_sent,
    ds.messages_delivered,
    ds.messages_read,
    ds.message_delivery_rate,
    ds.message_read_rate,
    ds.campaigns_completed,
    ds.friends_active,
    ds.forms_submitted,
    ds.form_conversion_rate,
    ds.reservations_completed,
    ds.url_clicks,
    ds.active_users
  FROM analytics_daily_stats ds
  WHERE
    ds.organization_id = p_organization_id
    AND ds.date BETWEEN p_start_date AND p_end_date
  ORDER BY ds.date DESC;
END;
$$ LANGUAGE plpgsql;

-- Calculate statistics for a specific date
CREATE OR REPLACE FUNCTION calculate_daily_stats(
  p_organization_id UUID,
  p_date DATE
)
RETURNS void AS $$
DECLARE
  v_messages_sent INTEGER;
  v_messages_delivered INTEGER;
  v_messages_read INTEGER;
  v_messages_failed INTEGER;
  v_campaigns_created INTEGER;
  v_campaigns_started INTEGER;
  v_campaigns_completed INTEGER;
  v_friends_added INTEGER;
  v_forms_viewed INTEGER;
  v_forms_submitted INTEGER;
  v_reservations_created INTEGER;
  v_reservations_completed INTEGER;
  v_url_clicks INTEGER;
BEGIN
  -- Count message events
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'message_sent'),
    COUNT(*) FILTER (WHERE event_type = 'message_delivered'),
    COUNT(*) FILTER (WHERE event_type = 'message_read'),
    COUNT(*) FILTER (WHERE event_type = 'message_failed')
  INTO
    v_messages_sent,
    v_messages_delivered,
    v_messages_read,
    v_messages_failed
  FROM analytics_events
  WHERE
    organization_id = p_organization_id
    AND DATE(created_at) = p_date
    AND event_type IN ('message_sent', 'message_delivered', 'message_read', 'message_failed');

  -- Count campaign events
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'campaign_created'),
    COUNT(*) FILTER (WHERE event_type = 'campaign_started'),
    COUNT(*) FILTER (WHERE event_type = 'campaign_completed')
  INTO
    v_campaigns_created,
    v_campaigns_started,
    v_campaigns_completed
  FROM analytics_events
  WHERE
    organization_id = p_organization_id
    AND DATE(created_at) = p_date
    AND event_type LIKE 'campaign_%';

  -- Count friend events
  SELECT COUNT(*)
  INTO v_friends_added
  FROM analytics_events
  WHERE
    organization_id = p_organization_id
    AND DATE(created_at) = p_date
    AND event_type = 'friend_added';

  -- Count form events
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'form_viewed'),
    COUNT(*) FILTER (WHERE event_type = 'form_submitted')
  INTO
    v_forms_viewed,
    v_forms_submitted
  FROM analytics_events
  WHERE
    organization_id = p_organization_id
    AND DATE(created_at) = p_date
    AND event_type IN ('form_viewed', 'form_submitted');

  -- Count reservation events
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'reservation_created'),
    COUNT(*) FILTER (WHERE event_type = 'reservation_completed')
  INTO
    v_reservations_created,
    v_reservations_completed
  FROM analytics_events
  WHERE
    organization_id = p_organization_id
    AND DATE(created_at) = p_date
    AND event_type IN ('reservation_created', 'reservation_completed');

  -- Count URL clicks
  SELECT COUNT(*)
  INTO v_url_clicks
  FROM url_clicks uc
  JOIN url_tracking ut ON uc.url_tracking_id = ut.id
  WHERE
    ut.organization_id = p_organization_id
    AND DATE(uc.clicked_at) = p_date;

  -- Insert or update daily stats
  INSERT INTO analytics_daily_stats (
    organization_id,
    date,
    messages_sent,
    messages_delivered,
    messages_read,
    messages_failed,
    message_delivery_rate,
    message_read_rate,
    campaigns_created,
    campaigns_started,
    campaigns_completed,
    friends_added,
    forms_viewed,
    forms_submitted,
    form_conversion_rate,
    reservations_created,
    reservations_completed,
    url_clicks
  ) VALUES (
    p_organization_id,
    p_date,
    v_messages_sent,
    v_messages_delivered,
    v_messages_read,
    v_messages_failed,
    CASE WHEN v_messages_sent > 0
      THEN ROUND((v_messages_delivered::NUMERIC / v_messages_sent * 100), 2)
      ELSE 0
    END,
    CASE WHEN v_messages_delivered > 0
      THEN ROUND((v_messages_read::NUMERIC / v_messages_delivered * 100), 2)
      ELSE 0
    END,
    v_campaigns_created,
    v_campaigns_started,
    v_campaigns_completed,
    v_friends_added,
    v_forms_viewed,
    v_forms_submitted,
    CASE WHEN v_forms_viewed > 0
      THEN ROUND((v_forms_submitted::NUMERIC / v_forms_viewed * 100), 2)
      ELSE 0
    END,
    v_reservations_created,
    v_reservations_completed,
    v_url_clicks
  )
  ON CONFLICT (organization_id, date)
  DO UPDATE SET
    messages_sent = EXCLUDED.messages_sent,
    messages_delivered = EXCLUDED.messages_delivered,
    messages_read = EXCLUDED.messages_read,
    messages_failed = EXCLUDED.messages_failed,
    message_delivery_rate = EXCLUDED.message_delivery_rate,
    message_read_rate = EXCLUDED.message_read_rate,
    campaigns_created = EXCLUDED.campaigns_created,
    campaigns_started = EXCLUDED.campaigns_started,
    campaigns_completed = EXCLUDED.campaigns_completed,
    friends_added = EXCLUDED.friends_added,
    forms_viewed = EXCLUDED.forms_viewed,
    forms_submitted = EXCLUDED.forms_submitted,
    form_conversion_rate = EXCLUDED.form_conversion_rate,
    reservations_created = EXCLUDED.reservations_created,
    reservations_completed = EXCLUDED.reservations_completed,
    url_clicks = EXCLUDED.url_clicks,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Calculate stats for all organizations for a specific date
CREATE OR REPLACE FUNCTION calculate_all_daily_stats(p_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS INTEGER AS $$
DECLARE
  v_org RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_org IN
    SELECT DISTINCT organization_id
    FROM analytics_events
    WHERE DATE(created_at) = p_date
  LOOP
    PERFORM calculate_daily_stats(v_org.organization_id, p_date);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AGGREGATION FUNCTIONS
-- ============================================

-- Get event counts by type for a date range
CREATE OR REPLACE FUNCTION get_event_counts_by_type(
  p_organization_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  event_type TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.event_type,
    COUNT(*)::BIGINT
  FROM analytics_events ae
  WHERE
    ae.organization_id = p_organization_id
    AND ae.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY ae.event_type
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Get top performing URLs
CREATE OR REPLACE FUNCTION get_top_urls(
  p_organization_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  short_code TEXT,
  original_url TEXT,
  click_count INTEGER,
  unique_click_count INTEGER,
  last_clicked_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ut.short_code,
    ut.original_url,
    ut.click_count,
    ut.unique_click_count,
    ut.last_clicked_at
  FROM url_tracking ut
  WHERE
    ut.organization_id = p_organization_id
    AND ut.is_active = true
  ORDER BY ut.click_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get friend engagement metrics
CREATE OR REPLACE FUNCTION get_friend_engagement(
  p_organization_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  friend_id UUID,
  event_count BIGINT,
  message_count BIGINT,
  form_submission_count BIGINT,
  url_click_count BIGINT,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.friend_id,
    COUNT(*)::BIGINT as event_count,
    COUNT(*) FILTER (WHERE ae.event_type LIKE 'message_%')::BIGINT as message_count,
    COUNT(*) FILTER (WHERE ae.event_type = 'form_submitted')::BIGINT as form_submission_count,
    COUNT(*) FILTER (WHERE ae.event_type = 'url_clicked')::BIGINT as url_click_count,
    MAX(ae.created_at) as last_activity
  FROM analytics_events ae
  WHERE
    ae.organization_id = p_organization_id
    AND ae.friend_id IS NOT NULL
    AND ae.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY ae.friend_id
  ORDER BY event_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TREND ANALYSIS FUNCTIONS
-- ============================================

-- Get trend data for a metric
CREATE OR REPLACE FUNCTION get_metric_trend(
  p_organization_id UUID,
  p_metric TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  value NUMERIC
) AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT date, %I::NUMERIC as value
     FROM analytics_daily_stats
     WHERE organization_id = $1
       AND date >= CURRENT_DATE - $2
     ORDER BY date DESC',
    p_metric
  )
  USING p_organization_id, p_days;
END;
$$ LANGUAGE plpgsql;

-- Calculate growth rate for a metric
CREATE OR REPLACE FUNCTION calculate_growth_rate(
  p_organization_id UUID,
  p_metric TEXT,
  p_current_period_days INTEGER DEFAULT 7,
  p_previous_period_days INTEGER DEFAULT 7
)
RETURNS NUMERIC AS $$
DECLARE
  v_current_avg NUMERIC;
  v_previous_avg NUMERIC;
  v_growth_rate NUMERIC;
BEGIN
  -- Get current period average
  EXECUTE format(
    'SELECT AVG(%I)
     FROM analytics_daily_stats
     WHERE organization_id = $1
       AND date >= CURRENT_DATE - $2
       AND date < CURRENT_DATE',
    p_metric
  )
  INTO v_current_avg
  USING p_organization_id, p_current_period_days;

  -- Get previous period average
  EXECUTE format(
    'SELECT AVG(%I)
     FROM analytics_daily_stats
     WHERE organization_id = $1
       AND date >= CURRENT_DATE - $2 - $3
       AND date < CURRENT_DATE - $3',
    p_metric
  )
  INTO v_previous_avg
  USING p_organization_id, p_current_period_days, p_previous_period_days;

  -- Calculate growth rate
  IF v_previous_avg IS NULL OR v_previous_avg = 0 THEN
    RETURN NULL;
  END IF;

  v_growth_rate := ((v_current_avg - v_previous_avg) / v_previous_avg) * 100;

  RETURN ROUND(v_growth_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CLEANUP FUNCTIONS
-- ============================================

-- Clean up old analytics events
CREATE OR REPLACE FUNCTION cleanup_old_events(
  p_retention_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < now() - (p_retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Clean up old URL clicks
CREATE OR REPLACE FUNCTION cleanup_old_clicks(
  p_retention_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM url_clicks
  WHERE clicked_at < now() - (p_retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Clean up old report executions
CREATE OR REPLACE FUNCTION cleanup_old_report_executions(
  p_retention_days INTEGER DEFAULT 180
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM report_executions
  WHERE
    completed_at < now() - (p_retention_days || ' days')::INTERVAL
    AND status IN ('completed', 'failed');

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION track_event IS 'Tracks a single analytics event';
COMMENT ON FUNCTION track_events_batch IS 'Tracks multiple analytics events in a single transaction';
COMMENT ON FUNCTION get_daily_stats IS 'Retrieves daily statistics for an organization within a date range';
COMMENT ON FUNCTION calculate_daily_stats IS 'Calculates and stores daily statistics for a specific date';
COMMENT ON FUNCTION calculate_all_daily_stats IS 'Calculates daily statistics for all organizations';
COMMENT ON FUNCTION get_event_counts_by_type IS 'Returns event counts grouped by event type';
COMMENT ON FUNCTION get_top_urls IS 'Returns top performing tracked URLs';
COMMENT ON FUNCTION get_friend_engagement IS 'Returns engagement metrics for friends';
COMMENT ON FUNCTION get_metric_trend IS 'Returns trend data for a specific metric';
COMMENT ON FUNCTION calculate_growth_rate IS 'Calculates growth rate for a metric between two periods';
COMMENT ON FUNCTION cleanup_old_events IS 'Deletes analytics events older than specified retention period';
COMMENT ON FUNCTION cleanup_old_clicks IS 'Deletes URL clicks older than specified retention period';
COMMENT ON FUNCTION cleanup_old_report_executions IS 'Deletes old report execution records';

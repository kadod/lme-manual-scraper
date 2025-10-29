-- ========================================
-- Helper Functions for Message Statistics
-- ========================================

/**
 * Increment message click count
 */
CREATE OR REPLACE FUNCTION increment_message_clicks(message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET click_count = click_count + 1
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Increment message read count
 */
CREATE OR REPLACE FUNCTION increment_message_reads(message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET read_count = read_count + 1
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Increment message delivered count
 */
CREATE OR REPLACE FUNCTION increment_message_deliveries(message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET delivered_count = delivered_count + 1
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Update message statistics from recipients
 * Called after batch processing to sync stats
 */
CREATE OR REPLACE FUNCTION update_message_stats_from_recipients(message_id UUID)
RETURNS void AS $$
DECLARE
  stats RECORD;
BEGIN
  -- Calculate statistics from message_recipients
  SELECT
    COUNT(*) FILTER (WHERE status = 'sent' OR status = 'delivered') as sent,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
    COUNT(*) FILTER (WHERE read_at IS NOT NULL) as read_count,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as click_count,
    COUNT(*) FILTER (WHERE status = 'failed') as errors
  INTO stats
  FROM message_recipients
  WHERE message_recipients.message_id = update_message_stats_from_recipients.message_id;

  -- Update message statistics
  UPDATE messages
  SET
    sent_count = stats.sent,
    delivered_count = stats.delivered,
    read_count = stats.read_count,
    click_count = stats.click_count,
    error_count = stats.errors,
    updated_at = NOW()
  WHERE id = update_message_stats_from_recipients.message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Get message delivery statistics
 */
CREATE OR REPLACE FUNCTION get_message_delivery_stats(message_id UUID)
RETURNS TABLE (
  total_recipients BIGINT,
  pending BIGINT,
  sent BIGINT,
  delivered BIGINT,
  failed BIGINT,
  delivery_rate NUMERIC,
  read_rate NUMERIC,
  click_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_recipients,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'sent' OR status = 'delivered') as sent,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'delivered') * 100.0 /
      NULLIF(COUNT(*) FILTER (WHERE status = 'sent' OR status = 'delivered'), 0),
      2
    ) as delivery_rate,
    ROUND(
      COUNT(*) FILTER (WHERE read_at IS NOT NULL) * 100.0 /
      NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0),
      2
    ) as read_rate,
    ROUND(
      COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) * 100.0 /
      NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0),
      2
    ) as click_rate
  FROM message_recipients
  WHERE message_recipients.message_id = get_message_delivery_stats.message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
 * Auto-update message statistics trigger
 * Automatically updates message stats when recipient status changes
 */
CREATE OR REPLACE FUNCTION auto_update_message_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update message statistics
  PERFORM update_message_stats_from_recipients(NEW.message_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on message_recipients
DROP TRIGGER IF EXISTS trigger_auto_update_message_stats ON message_recipients;
CREATE TRIGGER trigger_auto_update_message_stats
  AFTER INSERT OR UPDATE ON message_recipients
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_message_stats();

/**
 * Get user's message summary statistics
 */
CREATE OR REPLACE FUNCTION get_user_message_summary(user_id_param UUID)
RETURNS TABLE (
  total_messages BIGINT,
  scheduled_messages BIGINT,
  sending_messages BIGINT,
  completed_messages BIGINT,
  failed_messages BIGINT,
  total_sent BIGINT,
  total_delivered BIGINT,
  total_read BIGINT,
  total_clicks BIGINT,
  overall_delivery_rate NUMERIC,
  overall_read_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_messages,
    COUNT(*) FILTER (WHERE status = 'sending') as sending_messages,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_messages,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_messages,
    COALESCE(SUM(sent_count), 0) as total_sent,
    COALESCE(SUM(delivered_count), 0) as total_delivered,
    COALESCE(SUM(read_count), 0) as total_read,
    COALESCE(SUM(click_count), 0) as total_clicks,
    ROUND(
      COALESCE(SUM(delivered_count), 0) * 100.0 /
      NULLIF(COALESCE(SUM(sent_count), 0), 0),
      2
    ) as overall_delivery_rate,
    ROUND(
      COALESCE(SUM(read_count), 0) * 100.0 /
      NULLIF(COALESCE(SUM(delivered_count), 0), 0),
      2
    ) as overall_read_rate
  FROM messages
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Views for Analytics
-- ========================================

/**
 * Message delivery performance view
 */
CREATE OR REPLACE VIEW message_delivery_performance AS
SELECT
  m.id,
  m.user_id,
  m.type,
  m.status,
  m.total_recipients,
  m.sent_count,
  m.delivered_count,
  m.read_count,
  m.click_count,
  m.error_count,
  ROUND(m.delivered_count * 100.0 / NULLIF(m.sent_count, 0), 2) as delivery_rate,
  ROUND(m.read_count * 100.0 / NULLIF(m.delivered_count, 0), 2) as read_rate,
  ROUND(m.click_count * 100.0 / NULLIF(m.delivered_count, 0), 2) as click_through_rate,
  m.created_at,
  m.sent_at,
  m.completed_at,
  EXTRACT(EPOCH FROM (m.completed_at - m.sent_at)) / 60 as send_duration_minutes
FROM messages m
WHERE m.status IN ('completed', 'failed');

-- Grant access to the view
GRANT SELECT ON message_delivery_performance TO authenticated;

/**
 * Daily message statistics view
 */
CREATE OR REPLACE VIEW daily_message_stats AS
SELECT
  user_id,
  DATE(created_at) as date,
  COUNT(*) as messages_created,
  COUNT(*) FILTER (WHERE status = 'completed') as messages_completed,
  COALESCE(SUM(sent_count), 0) as total_sent,
  COALESCE(SUM(delivered_count), 0) as total_delivered,
  COALESCE(SUM(read_count), 0) as total_read,
  ROUND(
    COALESCE(SUM(delivered_count), 0) * 100.0 /
    NULLIF(COALESCE(SUM(sent_count), 0), 0),
    2
  ) as delivery_rate,
  ROUND(
    COALESCE(SUM(read_count), 0) * 100.0 /
    NULLIF(COALESCE(SUM(delivered_count), 0), 0),
    2
  ) as read_rate
FROM messages
GROUP BY user_id, DATE(created_at)
ORDER BY date DESC;

-- Grant access to the view
GRANT SELECT ON daily_message_stats TO authenticated;

-- ========================================
-- RLS for Helper Functions
-- ========================================

-- Allow authenticated users to call these functions
GRANT EXECUTE ON FUNCTION increment_message_clicks TO authenticated;
GRANT EXECUTE ON FUNCTION increment_message_reads TO authenticated;
GRANT EXECUTE ON FUNCTION increment_message_deliveries TO authenticated;
GRANT EXECUTE ON FUNCTION get_message_delivery_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_message_summary TO authenticated;

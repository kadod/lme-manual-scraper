-- Create function to timeout inactive conversations
CREATE OR REPLACE FUNCTION timeout_inactive_conversations()
RETURNS void AS $$
BEGIN
  -- Find and timeout conversations that have been inactive beyond their scenario's timeout period
  UPDATE active_conversations ac
  SET
    status = 'timeout',
    completed_at = NOW()
  FROM scenarios s
  WHERE
    ac.scenario_id = s.id
    AND ac.status = 'active'
    AND ac.last_interaction_at < NOW() - (s.timeout_minutes || ' minutes')::INTERVAL;

  -- Update scenario statistics for timed-out conversations
  UPDATE scenarios s
  SET total_abandoned = total_abandoned + (
    SELECT COUNT(*)
    FROM active_conversations ac
    WHERE ac.scenario_id = s.id
      AND ac.status = 'timeout'
      AND ac.completed_at >= NOW() - INTERVAL '10 minutes'
  );
END;
$$ LANGUAGE plpgsql;

-- Schedule the cron job to run every 10 minutes
-- Note: This requires pg_cron extension to be enabled
SELECT cron.schedule(
  'timeout-inactive-conversations',
  '*/10 * * * *',  -- Every 10 minutes
  $$
  SELECT timeout_inactive_conversations();
  $$
);

-- Add comment
COMMENT ON FUNCTION timeout_inactive_conversations IS 'Automatically timeout inactive scenario conversations based on scenario timeout settings';

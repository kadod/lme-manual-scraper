-- Setup pg_cron for analytics aggregation
-- This ensures the cron job is created in the database
-- Note: Edge Functions cron is configured in _cron.yml

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job for analytics aggregation (runs at 2:00 AM daily)
-- This complements the Edge Function cron configuration
SELECT cron.schedule(
  'aggregate-analytics-daily',
  '0 2 * * *',
  $$
  -- This job is handled by the Edge Function aggregate-analytics
  -- This SQL job serves as a backup trigger
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/aggregate-analytics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Grant necessary permissions for the cron job
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create a function to manually trigger analytics aggregation
CREATE OR REPLACE FUNCTION trigger_analytics_aggregation(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- This function can be called manually to trigger aggregation for a specific date
  -- Example: SELECT trigger_analytics_aggregation('2025-10-29');

  -- Call the Edge Function
  SELECT content::jsonb INTO result
  FROM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/aggregate-analytics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object('date', target_date)
  );

  RETURN result;
END;
$$;

-- Comments
COMMENT ON FUNCTION trigger_analytics_aggregation IS 'Manually trigger analytics aggregation for a specific date';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION trigger_analytics_aggregation TO authenticated;

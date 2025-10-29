-- Auto Response Logs Table
-- Tracks all automated response activities for audit and analytics

CREATE TABLE IF NOT EXISTS auto_response_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES auto_response_rules(id) ON DELETE SET NULL,
  friend_id UUID REFERENCES friends(id) ON DELETE CASCADE,

  -- Match Information
  matched_keyword TEXT,
  match_type VARCHAR(50),
  incoming_message TEXT,

  -- Response Information
  response_type VARCHAR(50),
  response_sent JSONB,
  sent_at TIMESTAMPTZ DEFAULT now(),

  -- Execution Status
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,

  -- Context
  conversation_id UUID REFERENCES auto_response_conversations(id) ON DELETE SET NULL,
  scenario_step_id UUID REFERENCES auto_response_scenario_steps(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partition by month for better performance
-- Note: This is a template. Actual partitioning should be set up separately if needed
-- CREATE TABLE auto_response_logs_y2024m01 PARTITION OF auto_response_logs
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Indexes
CREATE INDEX idx_auto_response_logs_rule_id ON auto_response_logs(rule_id);
CREATE INDEX idx_auto_response_logs_friend_id ON auto_response_logs(friend_id);
CREATE INDEX idx_auto_response_logs_conversation_id ON auto_response_logs(conversation_id);
CREATE INDEX idx_auto_response_logs_sent_at ON auto_response_logs(sent_at DESC);
CREATE INDEX idx_auto_response_logs_success ON auto_response_logs(success);
CREATE INDEX idx_auto_response_logs_created_at ON auto_response_logs(created_at DESC);
CREATE INDEX idx_auto_response_logs_match_type ON auto_response_logs(match_type);

-- Composite indexes for common queries
CREATE INDEX idx_auto_response_logs_friend_date ON auto_response_logs(friend_id, created_at DESC);
CREATE INDEX idx_auto_response_logs_rule_date ON auto_response_logs(rule_id, created_at DESC);
CREATE INDEX idx_auto_response_logs_errors ON auto_response_logs(success, created_at DESC)
  WHERE success = false;

-- GIN indexes for JSONB fields
CREATE INDEX idx_auto_response_logs_response_sent ON auto_response_logs USING GIN (response_sent);
CREATE INDEX idx_auto_response_logs_metadata ON auto_response_logs USING GIN (metadata);

-- Text search index for incoming messages
CREATE INDEX idx_auto_response_logs_incoming_message ON auto_response_logs USING GIN (to_tsvector('english', incoming_message));

-- Statistics table for aggregated metrics
CREATE TABLE IF NOT EXISTS auto_response_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES auto_response_rules(id) ON DELETE CASCADE,

  -- Date bucket
  date DATE NOT NULL,

  -- Metrics
  total_triggers INTEGER NOT NULL DEFAULT 0,
  successful_responses INTEGER NOT NULL DEFAULT 0,
  failed_responses INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  avg_execution_time_ms NUMERIC(10, 2),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_rule_date UNIQUE (rule_id, date)
);

-- Indexes for stats
CREATE INDEX idx_auto_response_stats_rule_id ON auto_response_stats(rule_id);
CREATE INDEX idx_auto_response_stats_date ON auto_response_stats(date DESC);
CREATE INDEX idx_auto_response_stats_rule_date ON auto_response_stats(rule_id, date DESC);

-- Function to aggregate daily statistics
CREATE OR REPLACE FUNCTION aggregate_auto_response_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO auto_response_stats (
    rule_id,
    date,
    total_triggers,
    successful_responses,
    failed_responses,
    unique_users,
    avg_execution_time_ms
  )
  SELECT
    rule_id,
    target_date,
    COUNT(*) as total_triggers,
    COUNT(*) FILTER (WHERE success = true) as successful_responses,
    COUNT(*) FILTER (WHERE success = false) as failed_responses,
    COUNT(DISTINCT friend_id) as unique_users,
    AVG(execution_time_ms) as avg_execution_time_ms
  FROM auto_response_logs
  WHERE DATE(created_at) = target_date
    AND rule_id IS NOT NULL
  GROUP BY rule_id
  ON CONFLICT (rule_id, date)
  DO UPDATE SET
    total_triggers = EXCLUDED.total_triggers,
    successful_responses = EXCLUDED.successful_responses,
    failed_responses = EXCLUDED.failed_responses,
    unique_users = EXCLUDED.unique_users,
    avg_execution_time_ms = EXCLUDED.avg_execution_time_ms,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE auto_response_logs IS 'Audit log of all automated response activities';
COMMENT ON COLUMN auto_response_logs.execution_time_ms IS 'Response generation and sending time in milliseconds';
COMMENT ON COLUMN auto_response_logs.metadata IS 'Additional context and debugging information';

COMMENT ON TABLE auto_response_stats IS 'Aggregated daily statistics for auto response rules';
COMMENT ON FUNCTION aggregate_auto_response_stats IS 'Aggregates daily statistics from auto_response_logs';

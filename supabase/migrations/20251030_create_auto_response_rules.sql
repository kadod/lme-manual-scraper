-- Auto Response Rules Table
-- Stores master rule configurations for automated responses

CREATE TABLE IF NOT EXISTS auto_response_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Rule Type and Configuration
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('keyword', 'scenario', 'ai')),
  priority INTEGER NOT NULL DEFAULT 0,

  -- Status and Validity
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,

  -- Advanced Configuration
  conditions JSONB DEFAULT '{}'::jsonb,
  -- Example: { "time_range": {"start": "09:00", "end": "18:00"}, "day_of_week": [1,2,3,4,5], "tags": ["vip"] }

  actions JSONB DEFAULT '{}'::jsonb,
  -- Example: { "send_message": true, "add_tag": "responded", "trigger_webhook": "url" }

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_priority CHECK (priority >= 0 AND priority <= 100),
  CONSTRAINT valid_date_range CHECK (valid_until IS NULL OR valid_until > valid_from)
);

-- Indexes
CREATE INDEX idx_auto_response_rules_user_id ON auto_response_rules(user_id);
CREATE INDEX idx_auto_response_rules_rule_type ON auto_response_rules(rule_type);
CREATE INDEX idx_auto_response_rules_is_active ON auto_response_rules(is_active);
CREATE INDEX idx_auto_response_rules_priority ON auto_response_rules(priority DESC);
CREATE INDEX idx_auto_response_rules_active_rules ON auto_response_rules(user_id, is_active, rule_type)
  WHERE is_active = true;

-- GIN index for JSONB fields
CREATE INDEX idx_auto_response_rules_conditions ON auto_response_rules USING GIN (conditions);
CREATE INDEX idx_auto_response_rules_actions ON auto_response_rules USING GIN (actions);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_auto_response_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_response_rules_updated_at
  BEFORE UPDATE ON auto_response_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_auto_response_rules_updated_at();

-- Comments
COMMENT ON TABLE auto_response_rules IS 'Master table for automated response rules configuration';
COMMENT ON COLUMN auto_response_rules.rule_type IS 'Type of rule: keyword, scenario, or ai-based';
COMMENT ON COLUMN auto_response_rules.priority IS 'Rule priority (0-100), higher values processed first';
COMMENT ON COLUMN auto_response_rules.conditions IS 'Advanced matching conditions (time, tags, etc.)';
COMMENT ON COLUMN auto_response_rules.actions IS 'Actions to execute when rule matches';

-- Enable RLS
ALTER TABLE auto_response_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own auto response rules"
  ON auto_response_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own auto response rules"
  ON auto_response_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auto response rules"
  ON auto_response_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own auto response rules"
  ON auto_response_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Auto Response Logs Table
CREATE TABLE IF NOT EXISTS auto_response_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES auto_response_rules(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES friends(id) ON DELETE SET NULL,
  line_user_id VARCHAR(255),

  -- Trigger information
  trigger_message TEXT,
  trigger_type VARCHAR(50),

  -- Response information
  response_sent BOOLEAN NOT NULL DEFAULT false,
  response_content JSONB,

  -- Error information
  error_message TEXT,

  -- Timestamps
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for logs
CREATE INDEX idx_auto_response_logs_rule_id ON auto_response_logs(rule_id);
CREATE INDEX idx_auto_response_logs_friend_id ON auto_response_logs(friend_id);
CREATE INDEX idx_auto_response_logs_triggered_at ON auto_response_logs(triggered_at DESC);

-- RLS Policies for auto_response_logs
ALTER TABLE auto_response_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for their rules"
  ON auto_response_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_logs.rule_id
      AND auto_response_rules.user_id = auth.uid()
    )
  );

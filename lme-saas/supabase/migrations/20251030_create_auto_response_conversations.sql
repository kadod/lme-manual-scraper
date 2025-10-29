-- Auto Response Conversations Table
-- Tracks active conversation states for scenario-based responses

CREATE TABLE IF NOT EXISTS auto_response_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES auto_response_scenarios(id) ON DELETE CASCADE,

  -- Current State
  current_step_id UUID REFERENCES auto_response_scenario_steps(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'timeout', 'cancelled')),

  -- Conversation Context
  context JSONB DEFAULT '{}'::jsonb,
  -- Stores collected variables and answers: { "user_name": "John", "age": 25, "preferences": [...] }

  -- History
  step_history JSONB DEFAULT '[]'::jsonb,
  -- Array of step transitions: [{"step_id": "uuid", "timestamp": "2024-01-01T00:00:00Z", "answer": "yes"}]

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  timeout_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_active_conversation UNIQUE (friend_id, scenario_id, status)
    WHERE status = 'active'
);

-- Indexes
CREATE INDEX idx_auto_response_conversations_friend_id ON auto_response_conversations(friend_id);
CREATE INDEX idx_auto_response_conversations_scenario_id ON auto_response_conversations(scenario_id);
CREATE INDEX idx_auto_response_conversations_status ON auto_response_conversations(status);
CREATE INDEX idx_auto_response_conversations_current_step ON auto_response_conversations(current_step_id);
CREATE INDEX idx_auto_response_conversations_active ON auto_response_conversations(friend_id, status)
  WHERE status = 'active';
CREATE INDEX idx_auto_response_conversations_timeout ON auto_response_conversations(timeout_at)
  WHERE status = 'active' AND timeout_at IS NOT NULL;
CREATE INDEX idx_auto_response_conversations_last_interaction ON auto_response_conversations(last_interaction_at);

-- GIN indexes for JSONB fields
CREATE INDEX idx_auto_response_conversations_context ON auto_response_conversations USING GIN (context);
CREATE INDEX idx_auto_response_conversations_history ON auto_response_conversations USING GIN (step_history);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_auto_response_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_response_conversations_updated_at
  BEFORE UPDATE ON auto_response_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_auto_response_conversations_updated_at();

-- Automatic timeout calculation trigger
CREATE OR REPLACE FUNCTION calculate_conversation_timeout()
RETURNS TRIGGER AS $$
DECLARE
  scenario_timeout INTEGER;
BEGIN
  -- Get timeout from scenario
  SELECT timeout_minutes INTO scenario_timeout
  FROM auto_response_scenarios
  WHERE id = NEW.scenario_id;

  -- Calculate timeout timestamp
  NEW.timeout_at = NEW.last_interaction_at + (scenario_timeout || ' minutes')::INTERVAL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_response_conversations_timeout
  BEFORE INSERT OR UPDATE OF last_interaction_at ON auto_response_conversations
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION calculate_conversation_timeout();

-- Comments
COMMENT ON TABLE auto_response_conversations IS 'Tracks active conversation states for scenario-based auto responses';
COMMENT ON COLUMN auto_response_conversations.context IS 'Stores collected variables and user answers throughout the conversation';
COMMENT ON COLUMN auto_response_conversations.step_history IS 'Array of step transitions with timestamps and answers';
COMMENT ON COLUMN auto_response_conversations.timeout_at IS 'Calculated timeout timestamp based on scenario configuration';

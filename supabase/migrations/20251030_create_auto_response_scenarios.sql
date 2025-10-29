-- Auto Response Scenarios Table
-- Stores multi-step conversation scenario definitions

CREATE TABLE IF NOT EXISTS auto_response_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES auto_response_rules(id) ON DELETE CASCADE,

  -- Scenario Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  entry_keyword TEXT,

  -- Configuration
  timeout_minutes INTEGER NOT NULL DEFAULT 30,
  allow_restart BOOLEAN NOT NULL DEFAULT true,
  completion_message JSONB,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_timeout CHECK (timeout_minutes > 0 AND timeout_minutes <= 1440)
);

-- Auto Response Scenario Steps Table
-- Stores individual steps within a scenario

CREATE TABLE IF NOT EXISTS auto_response_scenario_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES auto_response_scenarios(id) ON DELETE CASCADE,

  -- Step Configuration
  step_order INTEGER NOT NULL,
  step_type VARCHAR(50) NOT NULL CHECK (step_type IN ('message', 'question', 'branch', 'action', 'end')),

  -- Content
  content JSONB NOT NULL,
  -- Example for message: { "type": "text", "text": "Welcome!" }
  -- Example for question: { "question": "What's your name?", "variable": "user_name", "validation": "required" }
  -- Example for branch: { "condition": "{{answer}} == 'yes'", "true_step": 2, "false_step": 3 }

  -- Next Step Logic
  next_step_conditions JSONB DEFAULT '{}'::jsonb,
  -- Example: { "default": "next_step_id", "conditions": [{"if": "{{answer}} > 10", "then": "step_id"}] }

  default_next_step_id UUID REFERENCES auto_response_scenario_steps(id) ON DELETE SET NULL,

  -- Validation
  validation_rules JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_step_order CHECK (step_order >= 0),
  CONSTRAINT unique_scenario_step_order UNIQUE (scenario_id, step_order)
);

-- Indexes for scenarios
CREATE INDEX idx_auto_response_scenarios_rule_id ON auto_response_scenarios(rule_id);
CREATE INDEX idx_auto_response_scenarios_entry_keyword ON auto_response_scenarios(entry_keyword);

-- Indexes for scenario steps
CREATE INDEX idx_auto_response_scenario_steps_scenario_id ON auto_response_scenario_steps(scenario_id);
CREATE INDEX idx_auto_response_scenario_steps_order ON auto_response_scenario_steps(scenario_id, step_order);
CREATE INDEX idx_auto_response_scenario_steps_type ON auto_response_scenario_steps(step_type);
CREATE INDEX idx_auto_response_scenario_steps_next_step ON auto_response_scenario_steps(default_next_step_id);

-- GIN indexes for JSONB fields
CREATE INDEX idx_auto_response_scenario_steps_content ON auto_response_scenario_steps USING GIN (content);
CREATE INDEX idx_auto_response_scenario_steps_conditions ON auto_response_scenario_steps USING GIN (next_step_conditions);
CREATE INDEX idx_auto_response_scenarios_completion ON auto_response_scenarios USING GIN (completion_message);

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION update_auto_response_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_response_scenarios_updated_at
  BEFORE UPDATE ON auto_response_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_auto_response_scenarios_updated_at();

CREATE OR REPLACE FUNCTION update_auto_response_scenario_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_response_scenario_steps_updated_at
  BEFORE UPDATE ON auto_response_scenario_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_auto_response_scenario_steps_updated_at();

-- Comments
COMMENT ON TABLE auto_response_scenarios IS 'Multi-step conversation scenario definitions';
COMMENT ON COLUMN auto_response_scenarios.timeout_minutes IS 'Scenario timeout in minutes (max 24 hours)';
COMMENT ON COLUMN auto_response_scenarios.entry_keyword IS 'Keyword to trigger scenario start';

COMMENT ON TABLE auto_response_scenario_steps IS 'Individual steps within a conversation scenario';
COMMENT ON COLUMN auto_response_scenario_steps.step_type IS 'Type: message, question, branch, action, or end';
COMMENT ON COLUMN auto_response_scenario_steps.content IS 'Step content configuration in JSON format';
COMMENT ON COLUMN auto_response_scenario_steps.next_step_conditions IS 'Conditional logic for determining next step';

-- Helper Functions for Auto Response System
-- Provides utility functions for keyword matching, conversation management, and timeout handling

-- ============================================
-- KEYWORD MATCHING FUNCTIONS
-- ============================================

-- Match keyword against message based on match type
CREATE OR REPLACE FUNCTION match_keyword(
  p_message TEXT,
  p_keyword TEXT,
  p_match_type TEXT,
  p_case_sensitive BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
DECLARE
  v_message TEXT;
  v_keyword TEXT;
BEGIN
  -- Normalize case if not case-sensitive
  IF NOT p_case_sensitive THEN
    v_message := LOWER(p_message);
    v_keyword := LOWER(p_keyword);
  ELSE
    v_message := p_message;
    v_keyword := p_keyword;
  END IF;

  -- Match based on type
  RETURN CASE p_match_type
    WHEN 'exact' THEN v_message = v_keyword
    WHEN 'partial' THEN v_message LIKE '%' || v_keyword || '%'
    WHEN 'prefix' THEN v_message LIKE v_keyword || '%'
    WHEN 'suffix' THEN v_message LIKE '%' || v_keyword
    WHEN 'regex' THEN v_message ~ v_keyword
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Find matching keywords for a message
CREATE OR REPLACE FUNCTION find_matching_keywords(
  p_user_id UUID,
  p_message TEXT
)
RETURNS TABLE (
  rule_id UUID,
  rule_name TEXT,
  rule_priority INTEGER,
  keyword_id UUID,
  keyword TEXT,
  response_type TEXT,
  response_content JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id as rule_id,
    r.name as rule_name,
    r.priority as rule_priority,
    k.id as keyword_id,
    k.keyword,
    k.response_type,
    k.response_content
  FROM auto_response_rules r
  JOIN auto_response_keywords k ON k.rule_id = r.id
  WHERE r.user_id = p_user_id
    AND r.is_active = true
    AND r.rule_type = 'keyword'
    AND (r.valid_from IS NULL OR r.valid_from <= now())
    AND (r.valid_until IS NULL OR r.valid_until >= now())
    AND match_keyword(p_message, k.keyword, k.match_type, k.case_sensitive)
  ORDER BY r.priority DESC, k.priority DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- CONVERSATION MANAGEMENT FUNCTIONS
-- ============================================

-- Get active conversation for a friend
CREATE OR REPLACE FUNCTION get_active_conversation(p_friend_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  scenario_id UUID,
  current_step_id UUID,
  context JSONB,
  started_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ,
  timeout_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.scenario_id,
    c.current_step_id,
    c.context,
    c.started_at,
    c.last_interaction_at,
    c.timeout_at
  FROM auto_response_conversations c
  WHERE c.friend_id = p_friend_id
    AND c.status = 'active'
    AND (c.timeout_at IS NULL OR c.timeout_at > now())
  ORDER BY c.started_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create new conversation
CREATE OR REPLACE FUNCTION create_conversation(
  p_friend_id UUID,
  p_scenario_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_first_step_id UUID;
BEGIN
  -- Get first step of scenario
  SELECT id INTO v_first_step_id
  FROM auto_response_scenario_steps
  WHERE scenario_id = p_scenario_id
  ORDER BY step_order
  LIMIT 1;

  -- Create conversation
  INSERT INTO auto_response_conversations (
    friend_id,
    scenario_id,
    current_step_id,
    status
  )
  VALUES (
    p_friend_id,
    p_scenario_id,
    v_first_step_id,
    'active'
  )
  RETURNING id INTO v_conversation_id;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Update conversation to next step
CREATE OR REPLACE FUNCTION update_conversation_step(
  p_conversation_id UUID,
  p_answer TEXT DEFAULT NULL,
  p_next_step_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_step_id UUID;
  v_next_step_id UUID;
  v_step_history JSONB;
  v_context JSONB;
  v_variable_name TEXT;
BEGIN
  -- Get current conversation state
  SELECT current_step_id, step_history, context
  INTO v_current_step_id, v_step_history, v_context
  FROM auto_response_conversations
  WHERE id = p_conversation_id;

  IF v_current_step_id IS NULL THEN
    RETURN false;
  END IF;

  -- Determine next step
  IF p_next_step_id IS NOT NULL THEN
    v_next_step_id := p_next_step_id;
  ELSE
    -- Get default next step
    SELECT default_next_step_id INTO v_next_step_id
    FROM auto_response_scenario_steps
    WHERE id = v_current_step_id;
  END IF;

  -- Update step history
  v_step_history := v_step_history || jsonb_build_object(
    'step_id', v_current_step_id,
    'timestamp', now(),
    'answer', p_answer
  );

  -- Update context with answer if there's a variable
  IF p_answer IS NOT NULL THEN
    SELECT content->>'variable' INTO v_variable_name
    FROM auto_response_scenario_steps
    WHERE id = v_current_step_id;

    IF v_variable_name IS NOT NULL THEN
      v_context := jsonb_set(v_context, ARRAY[v_variable_name], to_jsonb(p_answer), true);
    END IF;
  END IF;

  -- Check if this is the end
  IF v_next_step_id IS NULL OR EXISTS (
    SELECT 1 FROM auto_response_scenario_steps
    WHERE id = v_next_step_id AND step_type = 'end'
  ) THEN
    -- Complete conversation
    UPDATE auto_response_conversations
    SET
      current_step_id = v_next_step_id,
      status = 'completed',
      completed_at = now(),
      last_interaction_at = now(),
      step_history = v_step_history,
      context = v_context
    WHERE id = p_conversation_id;
  ELSE
    -- Continue conversation
    UPDATE auto_response_conversations
    SET
      current_step_id = v_next_step_id,
      last_interaction_at = now(),
      step_history = v_step_history,
      context = v_context
    WHERE id = p_conversation_id;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Cancel conversation
CREATE OR REPLACE FUNCTION cancel_conversation(p_conversation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE auto_response_conversations
  SET
    status = 'cancelled',
    completed_at = now()
  WHERE id = p_conversation_id
    AND status = 'active';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TIMEOUT MANAGEMENT FUNCTIONS
-- ============================================

-- Process timed out conversations
CREATE OR REPLACE FUNCTION timeout_inactive_conversations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE auto_response_conversations
  SET
    status = 'timeout',
    completed_at = now()
  WHERE status = 'active'
    AND timeout_at IS NOT NULL
    AND timeout_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Check if conversation is still valid
CREATE OR REPLACE FUNCTION is_conversation_valid(p_conversation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_status TEXT;
  v_timeout_at TIMESTAMPTZ;
BEGIN
  SELECT status, timeout_at
  INTO v_status, v_timeout_at
  FROM auto_response_conversations
  WHERE id = p_conversation_id;

  RETURN v_status = 'active'
    AND (v_timeout_at IS NULL OR v_timeout_at > now());
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- RULE EVALUATION FUNCTIONS
-- ============================================

-- Check if rule conditions are met
CREATE OR REPLACE FUNCTION evaluate_rule_conditions(
  p_rule_id UUID,
  p_friend_id UUID,
  p_current_time TIMESTAMPTZ DEFAULT now()
)
RETURNS BOOLEAN AS $$
DECLARE
  v_conditions JSONB;
  v_time_start TIME;
  v_time_end TIME;
  v_current_time TIME;
  v_day_of_week INTEGER;
  v_allowed_days INTEGER[];
  v_required_tags TEXT[];
  v_friend_tags TEXT[];
BEGIN
  -- Get rule conditions
  SELECT conditions INTO v_conditions
  FROM auto_response_rules
  WHERE id = p_rule_id;

  IF v_conditions IS NULL OR v_conditions = '{}'::jsonb THEN
    RETURN true;
  END IF;

  -- Check time range
  IF v_conditions ? 'time_range' THEN
    v_time_start := (v_conditions->'time_range'->>'start')::TIME;
    v_time_end := (v_conditions->'time_range'->>'end')::TIME;
    v_current_time := p_current_time::TIME;

    IF v_current_time < v_time_start OR v_current_time > v_time_end THEN
      RETURN false;
    END IF;
  END IF;

  -- Check day of week
  IF v_conditions ? 'day_of_week' THEN
    v_day_of_week := EXTRACT(DOW FROM p_current_time)::INTEGER;
    v_allowed_days := ARRAY(SELECT jsonb_array_elements_text(v_conditions->'day_of_week')::INTEGER);

    IF NOT (v_day_of_week = ANY(v_allowed_days)) THEN
      RETURN false;
    END IF;
  END IF;

  -- Check friend tags
  IF v_conditions ? 'tags' THEN
    v_required_tags := ARRAY(SELECT jsonb_array_elements_text(v_conditions->'tags'));

    SELECT ARRAY_AGG(t.name)
    INTO v_friend_tags
    FROM friend_tags ft
    JOIN tags t ON t.id = ft.tag_id
    WHERE ft.friend_id = p_friend_id;

    IF v_friend_tags IS NULL OR NOT (v_required_tags <@ v_friend_tags) THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- STATISTICS FUNCTIONS
-- ============================================

-- Get rule performance metrics
CREATE OR REPLACE FUNCTION get_rule_performance(
  p_rule_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_triggers BIGINT,
  successful_responses BIGINT,
  failed_responses BIGINT,
  success_rate NUMERIC,
  avg_execution_time_ms NUMERIC,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(s.total_triggers)::BIGINT,
    SUM(s.successful_responses)::BIGINT,
    SUM(s.failed_responses)::BIGINT,
    CASE
      WHEN SUM(s.total_triggers) > 0
      THEN ROUND(SUM(s.successful_responses)::NUMERIC / SUM(s.total_triggers) * 100, 2)
      ELSE 0
    END,
    AVG(s.avg_execution_time_ms),
    SUM(s.unique_users)::BIGINT
  FROM auto_response_stats s
  WHERE s.rule_id = p_rule_id
    AND s.date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comments
COMMENT ON FUNCTION match_keyword IS 'Matches a keyword against a message based on match type (exact, partial, regex, etc.)';
COMMENT ON FUNCTION find_matching_keywords IS 'Finds all matching keywords for a given message and user';
COMMENT ON FUNCTION get_active_conversation IS 'Retrieves active conversation for a friend if exists and not timed out';
COMMENT ON FUNCTION create_conversation IS 'Creates a new conversation and sets it to the first step';
COMMENT ON FUNCTION update_conversation_step IS 'Updates conversation to next step and stores answer in context';
COMMENT ON FUNCTION timeout_inactive_conversations IS 'Marks all timed-out conversations as completed';
COMMENT ON FUNCTION evaluate_rule_conditions IS 'Evaluates if rule conditions (time, tags, etc.) are met';
COMMENT ON FUNCTION get_rule_performance IS 'Retrieves performance metrics for a rule over a date range';

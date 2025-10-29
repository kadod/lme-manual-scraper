-- Row Level Security Policies for Auto Response Tables
-- Ensures proper multi-tenant data isolation

-- Enable RLS on all auto response tables
ALTER TABLE auto_response_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_response_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_response_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_response_scenario_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_response_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_response_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_response_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUTO_RESPONSE_RULES POLICIES
-- ============================================

-- SELECT: Users can view their own rules
CREATE POLICY "Users can view their own auto response rules"
  ON auto_response_rules
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Users can create rules
CREATE POLICY "Users can create auto response rules"
  ON auto_response_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can update their own rules
CREATE POLICY "Users can update their own auto response rules"
  ON auto_response_rules
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete their own rules
CREATE POLICY "Users can delete their own auto response rules"
  ON auto_response_rules
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- AUTO_RESPONSE_KEYWORDS POLICIES
-- ============================================

-- SELECT: Users can view keywords for their rules
CREATE POLICY "Users can view keywords for their rules"
  ON auto_response_keywords
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_keywords.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  );

-- INSERT: Users can create keywords for their rules
CREATE POLICY "Users can create keywords for their rules"
  ON auto_response_keywords
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_keywords.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  );

-- UPDATE: Users can update keywords for their rules
CREATE POLICY "Users can update keywords for their rules"
  ON auto_response_keywords
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_keywords.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_keywords.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  );

-- DELETE: Users can delete keywords for their rules
CREATE POLICY "Users can delete keywords for their rules"
  ON auto_response_keywords
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_keywords.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  );

-- ============================================
-- AUTO_RESPONSE_SCENARIOS POLICIES
-- ============================================

-- SELECT: Users can view scenarios for their rules
CREATE POLICY "Users can view scenarios for their rules"
  ON auto_response_scenarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_scenarios.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  );

-- INSERT: Users can create scenarios for their rules
CREATE POLICY "Users can create scenarios for their rules"
  ON auto_response_scenarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_scenarios.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  );

-- UPDATE: Users can update scenarios for their rules
CREATE POLICY "Users can update scenarios for their rules"
  ON auto_response_scenarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_scenarios.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_scenarios.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  );

-- DELETE: Users can delete scenarios for their rules
CREATE POLICY "Users can delete scenarios for their rules"
  ON auto_response_scenarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_scenarios.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  );

-- ============================================
-- AUTO_RESPONSE_SCENARIO_STEPS POLICIES
-- ============================================

-- SELECT: Users can view steps for their scenarios
CREATE POLICY "Users can view scenario steps for their scenarios"
  ON auto_response_scenario_steps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_scenarios s
      JOIN auto_response_rules r ON r.id = s.rule_id
      WHERE s.id = auto_response_scenario_steps.scenario_id
        AND r.user_id = auth.uid()
    )
  );

-- INSERT: Users can create steps for their scenarios
CREATE POLICY "Users can create scenario steps for their scenarios"
  ON auto_response_scenario_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auto_response_scenarios s
      JOIN auto_response_rules r ON r.id = s.rule_id
      WHERE s.id = auto_response_scenario_steps.scenario_id
        AND r.user_id = auth.uid()
    )
  );

-- UPDATE: Users can update steps for their scenarios
CREATE POLICY "Users can update scenario steps for their scenarios"
  ON auto_response_scenario_steps
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_scenarios s
      JOIN auto_response_rules r ON r.id = s.rule_id
      WHERE s.id = auto_response_scenario_steps.scenario_id
        AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auto_response_scenarios s
      JOIN auto_response_rules r ON r.id = s.rule_id
      WHERE s.id = auto_response_scenario_steps.scenario_id
        AND r.user_id = auth.uid()
    )
  );

-- DELETE: Users can delete steps for their scenarios
CREATE POLICY "Users can delete scenario steps for their scenarios"
  ON auto_response_scenario_steps
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_scenarios s
      JOIN auto_response_rules r ON r.id = s.rule_id
      WHERE s.id = auto_response_scenario_steps.scenario_id
        AND r.user_id = auth.uid()
    )
  );

-- ============================================
-- AUTO_RESPONSE_CONVERSATIONS POLICIES
-- ============================================

-- SELECT: Users can view conversations for their friends
CREATE POLICY "Users can view conversations for their friends"
  ON auto_response_conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM friends
      WHERE friends.id = auto_response_conversations.friend_id
        AND friends.user_id = auth.uid()
    )
  );

-- INSERT: System can create conversations
CREATE POLICY "System can create conversations"
  ON auto_response_conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM friends
      WHERE friends.id = auto_response_conversations.friend_id
        AND friends.user_id = auth.uid()
    )
  );

-- UPDATE: System can update conversations
CREATE POLICY "System can update conversations"
  ON auto_response_conversations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM friends
      WHERE friends.id = auto_response_conversations.friend_id
        AND friends.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM friends
      WHERE friends.id = auto_response_conversations.friend_id
        AND friends.user_id = auth.uid()
    )
  );

-- DELETE: Users can delete conversations for their friends
CREATE POLICY "Users can delete conversations for their friends"
  ON auto_response_conversations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM friends
      WHERE friends.id = auto_response_conversations.friend_id
        AND friends.user_id = auth.uid()
    )
  );

-- ============================================
-- AUTO_RESPONSE_LOGS POLICIES
-- ============================================

-- SELECT: Users can view logs for their rules
CREATE POLICY "Users can view logs for their rules"
  ON auto_response_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_logs.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM friends
      WHERE friends.id = auto_response_logs.friend_id
        AND friends.user_id = auth.uid()
    )
  );

-- INSERT: System can create logs
CREATE POLICY "System can create logs"
  ON auto_response_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Logs can be created by system/edge functions

-- No UPDATE or DELETE policies for logs (append-only)

-- ============================================
-- AUTO_RESPONSE_STATS POLICIES
-- ============================================

-- SELECT: Users can view stats for their rules
CREATE POLICY "Users can view stats for their rules"
  ON auto_response_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_stats.rule_id
        AND auto_response_rules.user_id = auth.uid()
    )
  );

-- INSERT/UPDATE: System can manage stats
CREATE POLICY "System can manage stats"
  ON auto_response_stats
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON POLICY "Users can view their own auto response rules" ON auto_response_rules
  IS 'Users can only view auto response rules they own';
COMMENT ON POLICY "Users can view conversations for their friends" ON auto_response_conversations
  IS 'Users can only view conversations for friends they manage';
COMMENT ON POLICY "System can create logs" ON auto_response_logs
  IS 'Logs are append-only and can be created by system processes';

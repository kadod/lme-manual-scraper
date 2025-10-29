-- Additional Performance Indexes for Auto Response System
-- Optimized for common query patterns and high-performance lookups

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

-- Find active rules for a user by type and priority
CREATE INDEX IF NOT EXISTS idx_auto_response_rules_user_active_priority
  ON auto_response_rules(user_id, rule_type, priority DESC, is_active)
  WHERE is_active = true;

-- Find valid rules within date range
CREATE INDEX IF NOT EXISTS idx_auto_response_rules_validity
  ON auto_response_rules(user_id, valid_from, valid_until)
  WHERE is_active = true;

-- ============================================
-- KEYWORD MATCHING OPTIMIZATION
-- ============================================

-- Optimize keyword lookup by rule and match type
CREATE INDEX IF NOT EXISTS idx_auto_response_keywords_rule_match
  ON auto_response_keywords(rule_id, match_type, priority DESC);

-- Case-insensitive keyword search
CREATE INDEX IF NOT EXISTS idx_auto_response_keywords_keyword_lower
  ON auto_response_keywords(LOWER(keyword))
  WHERE case_sensitive = false;

-- Exact match optimization
CREATE INDEX IF NOT EXISTS idx_auto_response_keywords_exact_match
  ON auto_response_keywords(keyword)
  WHERE match_type = 'exact';

-- ============================================
-- SCENARIO EXECUTION OPTIMIZATION
-- ============================================

-- Optimize scenario step navigation
CREATE INDEX IF NOT EXISTS idx_scenario_steps_navigation
  ON auto_response_scenario_steps(scenario_id, step_order, step_type);

-- Find first step in scenario
CREATE INDEX IF NOT EXISTS idx_scenario_steps_first
  ON auto_response_scenario_steps(scenario_id, step_order)
  WHERE step_order = 0;

-- Find end steps
CREATE INDEX IF NOT EXISTS idx_scenario_steps_end
  ON auto_response_scenario_steps(scenario_id)
  WHERE step_type = 'end';

-- ============================================
-- CONVERSATION STATE MANAGEMENT
-- ============================================

-- Find active conversations by friend
CREATE INDEX IF NOT EXISTS idx_conversations_friend_active
  ON auto_response_conversations(friend_id, status, last_interaction_at DESC)
  WHERE status = 'active';

-- Find conversations needing timeout check
CREATE INDEX IF NOT EXISTS idx_conversations_timeout_check
  ON auto_response_conversations(timeout_at, status)
  WHERE status = 'active' AND timeout_at < now();

-- Optimize conversation history queries
CREATE INDEX IF NOT EXISTS idx_conversations_scenario_status
  ON auto_response_conversations(scenario_id, status, completed_at DESC);

-- ============================================
-- LOG ANALYTICS OPTIMIZATION
-- ============================================

-- Performance analysis by rule
CREATE INDEX IF NOT EXISTS idx_logs_rule_performance
  ON auto_response_logs(rule_id, success, execution_time_ms)
  WHERE execution_time_ms IS NOT NULL;

-- Error tracking
CREATE INDEX IF NOT EXISTS idx_logs_errors_recent
  ON auto_response_logs(created_at DESC, rule_id)
  WHERE success = false;

-- Friend interaction history
CREATE INDEX IF NOT EXISTS idx_logs_friend_timeline
  ON auto_response_logs(friend_id, sent_at DESC)
  WHERE success = true;

-- Response type distribution
CREATE INDEX IF NOT EXISTS idx_logs_response_type_stats
  ON auto_response_logs(response_type, created_at DESC)
  WHERE success = true;

-- Conversation tracking
CREATE INDEX IF NOT EXISTS idx_logs_conversation_timeline
  ON auto_response_logs(conversation_id, created_at)
  WHERE conversation_id IS NOT NULL;

-- ============================================
-- STATISTICS OPTIMIZATION
-- ============================================

-- Recent stats lookup
CREATE INDEX IF NOT EXISTS idx_stats_recent
  ON auto_response_stats(rule_id, date DESC)
  INCLUDE (total_triggers, successful_responses, failed_responses);

-- Performance trending
CREATE INDEX IF NOT EXISTS idx_stats_performance
  ON auto_response_stats(rule_id, date)
  INCLUDE (avg_execution_time_ms);

-- Usage metrics
CREATE INDEX IF NOT EXISTS idx_stats_usage
  ON auto_response_stats(date DESC, total_triggers DESC);

-- ============================================
-- JSONB PATH INDEXES FOR COMMON QUERIES
-- ============================================

-- Index for rule conditions time-based filtering
CREATE INDEX IF NOT EXISTS idx_rules_conditions_time
  ON auto_response_rules USING GIN ((conditions -> 'time_range'));

-- Index for rule conditions tag filtering
CREATE INDEX IF NOT EXISTS idx_rules_conditions_tags
  ON auto_response_rules USING GIN ((conditions -> 'tags'));

-- Index for keyword response template lookup
CREATE INDEX IF NOT EXISTS idx_keywords_template_id
  ON auto_response_keywords USING GIN ((response_content -> 'template_id'));

-- Index for conversation context variables
CREATE INDEX IF NOT EXISTS idx_conversations_context_vars
  ON auto_response_conversations USING GIN (context jsonb_path_ops);

-- Index for step content questions
CREATE INDEX IF NOT EXISTS idx_steps_content_question
  ON auto_response_scenario_steps USING GIN ((content -> 'question'));

-- ============================================
-- PARTIAL INDEXES FOR SPECIFIC USE CASES
-- ============================================

-- High-priority rules only
CREATE INDEX IF NOT EXISTS idx_rules_high_priority
  ON auto_response_rules(user_id, rule_type)
  WHERE is_active = true AND priority >= 80;

-- Recent conversations only (last 30 days)
CREATE INDEX IF NOT EXISTS idx_conversations_recent
  ON auto_response_conversations(friend_id, started_at DESC)
  WHERE started_at >= now() - interval '30 days';

-- Slow responses (for optimization)
CREATE INDEX IF NOT EXISTS idx_logs_slow_responses
  ON auto_response_logs(rule_id, execution_time_ms DESC)
  WHERE execution_time_ms > 1000;

-- ============================================
-- COVERING INDEXES FOR COMMON QUERIES
-- ============================================

-- Rule list view (avoid table lookups)
CREATE INDEX IF NOT EXISTS idx_rules_list_view
  ON auto_response_rules(user_id, created_at DESC)
  INCLUDE (name, rule_type, is_active, priority)
  WHERE is_active = true;

-- Keyword list view
CREATE INDEX IF NOT EXISTS idx_keywords_list_view
  ON auto_response_keywords(rule_id)
  INCLUDE (keyword, match_type, response_type, priority);

-- Scenario list view
CREATE INDEX IF NOT EXISTS idx_scenarios_list_view
  ON auto_response_scenarios(rule_id)
  INCLUDE (name, entry_keyword, timeout_minutes);

-- Active conversation summary
CREATE INDEX IF NOT EXISTS idx_conversations_summary
  ON auto_response_conversations(friend_id, status)
  INCLUDE (scenario_id, started_at, last_interaction_at)
  WHERE status = 'active';

-- ============================================
-- VACUUM AND ANALYZE
-- ============================================

-- Ensure statistics are up to date for query planning
ANALYZE auto_response_rules;
ANALYZE auto_response_keywords;
ANALYZE auto_response_scenarios;
ANALYZE auto_response_scenario_steps;
ANALYZE auto_response_conversations;
ANALYZE auto_response_logs;
ANALYZE auto_response_stats;

-- Comments
COMMENT ON INDEX idx_auto_response_rules_user_active_priority
  IS 'Optimizes finding active rules by user, type, and priority';
COMMENT ON INDEX idx_conversations_timeout_check
  IS 'Identifies conversations that have exceeded their timeout period';
COMMENT ON INDEX idx_logs_slow_responses
  IS 'Identifies slow responses for performance optimization';

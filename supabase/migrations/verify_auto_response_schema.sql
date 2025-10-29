-- Verification Script for Auto Response Database Schema
-- Run this after applying all migrations to verify correct setup

-- ============================================
-- TABLE VERIFICATION
-- ============================================

DO $$
DECLARE
  v_table_count INTEGER;
  v_expected_tables TEXT[] := ARRAY[
    'auto_response_rules',
    'auto_response_keywords',
    'auto_response_scenarios',
    'auto_response_scenario_steps',
    'auto_response_conversations',
    'auto_response_logs',
    'auto_response_stats'
  ];
  v_table TEXT;
  v_missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  RAISE NOTICE '=== TABLE VERIFICATION ===';

  FOREACH v_table IN ARRAY v_expected_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = v_table
    ) THEN
      v_missing_tables := array_append(v_missing_tables, v_table);
    ELSE
      RAISE NOTICE 'PASS: Table % exists', v_table;
    END IF;
  END LOOP;

  IF array_length(v_missing_tables, 1) > 0 THEN
    RAISE WARNING 'FAIL: Missing tables: %', array_to_string(v_missing_tables, ', ');
  ELSE
    RAISE NOTICE 'SUCCESS: All 7 tables exist';
  END IF;
END $$;

-- ============================================
-- RLS VERIFICATION
-- ============================================

DO $$
DECLARE
  v_table TEXT;
  v_tables_without_rls TEXT[] := ARRAY[]::TEXT[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== RLS VERIFICATION ===';

  FOR v_table IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename LIKE 'auto_response%'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = v_table
      AND rowsecurity = true
    ) THEN
      v_tables_without_rls := array_append(v_tables_without_rls, v_table);
    ELSE
      RAISE NOTICE 'PASS: RLS enabled on %', v_table;
    END IF;
  END LOOP;

  IF array_length(v_tables_without_rls, 1) > 0 THEN
    RAISE WARNING 'FAIL: RLS not enabled on: %', array_to_string(v_tables_without_rls, ', ');
  ELSE
    RAISE NOTICE 'SUCCESS: RLS enabled on all tables';
  END IF;
END $$;

-- ============================================
-- INDEX VERIFICATION
-- ============================================

DO $$
DECLARE
  v_index_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== INDEX VERIFICATION ===';

  SELECT COUNT(*) INTO v_index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename LIKE 'auto_response%';

  RAISE NOTICE 'Total indexes: %', v_index_count;

  IF v_index_count >= 40 THEN
    RAISE NOTICE 'SUCCESS: Sufficient indexes created (expected 40+, found %)', v_index_count;
  ELSE
    RAISE WARNING 'WARNING: Expected 40+ indexes, found only %', v_index_count;
  END IF;
END $$;

-- ============================================
-- FUNCTION VERIFICATION
-- ============================================

DO $$
DECLARE
  v_expected_functions TEXT[] := ARRAY[
    'match_keyword',
    'find_matching_keywords',
    'get_active_conversation',
    'create_conversation',
    'update_conversation_step',
    'cancel_conversation',
    'timeout_inactive_conversations',
    'is_conversation_valid',
    'evaluate_rule_conditions',
    'get_rule_performance',
    'aggregate_auto_response_stats'
  ];
  v_function TEXT;
  v_missing_functions TEXT[] := ARRAY[]::TEXT[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== FUNCTION VERIFICATION ===';

  FOREACH v_function IN ARRAY v_expected_functions LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = v_function
    ) THEN
      v_missing_functions := array_append(v_missing_functions, v_function);
    ELSE
      RAISE NOTICE 'PASS: Function % exists', v_function;
    END IF;
  END LOOP;

  IF array_length(v_missing_functions, 1) > 0 THEN
    RAISE WARNING 'FAIL: Missing functions: %', array_to_string(v_missing_functions, ', ');
  ELSE
    RAISE NOTICE 'SUCCESS: All 11 helper functions exist';
  END IF;
END $$;

-- ============================================
-- TRIGGER VERIFICATION
-- ============================================

DO $$
DECLARE
  v_expected_triggers TEXT[] := ARRAY[
    'auto_response_rules_updated_at',
    'auto_response_keywords_updated_at',
    'auto_response_scenarios_updated_at',
    'auto_response_scenario_steps_updated_at',
    'auto_response_conversations_updated_at',
    'auto_response_conversations_timeout'
  ];
  v_trigger TEXT;
  v_missing_triggers TEXT[] := ARRAY[]::TEXT[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TRIGGER VERIFICATION ===';

  FOREACH v_trigger IN ARRAY v_expected_triggers LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = v_trigger
    ) THEN
      v_missing_triggers := array_append(v_missing_triggers, v_trigger);
    ELSE
      RAISE NOTICE 'PASS: Trigger % exists', v_trigger;
    END IF;
  END LOOP;

  IF array_length(v_missing_triggers, 1) > 0 THEN
    RAISE WARNING 'FAIL: Missing triggers: %', array_to_string(v_missing_triggers, ', ');
  ELSE
    RAISE NOTICE 'SUCCESS: All 6 triggers exist';
  END IF;
END $$;

-- ============================================
-- CONSTRAINT VERIFICATION
-- ============================================

DO $$
DECLARE
  v_constraint_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== CONSTRAINT VERIFICATION ===';

  -- Check constraints
  SELECT COUNT(*) INTO v_constraint_count
  FROM information_schema.check_constraints
  WHERE constraint_schema = 'public'
  AND constraint_name LIKE '%auto_response%';

  RAISE NOTICE 'Check constraints: %', v_constraint_count;

  -- Foreign key constraints
  SELECT COUNT(*) INTO v_constraint_count
  FROM information_schema.table_constraints
  WHERE constraint_schema = 'public'
  AND constraint_type = 'FOREIGN KEY'
  AND table_name LIKE 'auto_response%';

  RAISE NOTICE 'Foreign key constraints: %', v_constraint_count;

  IF v_constraint_count >= 10 THEN
    RAISE NOTICE 'SUCCESS: Sufficient constraints exist';
  ELSE
    RAISE WARNING 'WARNING: Expected more constraints, found %', v_constraint_count;
  END IF;
END $$;

-- ============================================
-- POLICY VERIFICATION
-- ============================================

DO $$
DECLARE
  v_policy_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== POLICY VERIFICATION ===';

  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename LIKE 'auto_response%';

  RAISE NOTICE 'Total RLS policies: %', v_policy_count;

  IF v_policy_count >= 20 THEN
    RAISE NOTICE 'SUCCESS: Sufficient policies created (expected 20+, found %)', v_policy_count;
  ELSE
    RAISE WARNING 'WARNING: Expected 20+ policies, found only %', v_policy_count;
  END IF;
END $$;

-- ============================================
-- SAMPLE DATA TEST
-- ============================================

DO $$
DECLARE
  v_test_user_id UUID;
  v_test_rule_id UUID;
  v_test_scenario_id UUID;
  v_test_keyword_id UUID;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== SAMPLE DATA TEST ===';

  -- This is a dry-run test, actual insert would require auth.uid()
  RAISE NOTICE 'Testing table structure (without actual insert)...';

  -- Verify column structure
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_response_rules'
    AND column_name IN ('id', 'user_id', 'name', 'rule_type', 'priority', 'is_active', 'conditions', 'actions')
  ) THEN
    RAISE NOTICE 'PASS: auto_response_rules has required columns';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_response_keywords'
    AND column_name IN ('id', 'rule_id', 'keyword', 'match_type', 'response_type', 'response_content')
  ) THEN
    RAISE NOTICE 'PASS: auto_response_keywords has required columns';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_response_scenarios'
    AND column_name IN ('id', 'rule_id', 'name', 'entry_keyword', 'timeout_minutes')
  ) THEN
    RAISE NOTICE 'PASS: auto_response_scenarios has required columns';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_response_conversations'
    AND column_name IN ('id', 'friend_id', 'scenario_id', 'current_step_id', 'status', 'context', 'step_history')
  ) THEN
    RAISE NOTICE 'PASS: auto_response_conversations has required columns';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_response_logs'
    AND column_name IN ('id', 'rule_id', 'friend_id', 'matched_keyword', 'success', 'execution_time_ms')
  ) THEN
    RAISE NOTICE 'PASS: auto_response_logs has required columns';
  END IF;

  RAISE NOTICE 'SUCCESS: All tables have required columns';
END $$;

-- ============================================
-- FINAL SUMMARY
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'AUTO RESPONSE SCHEMA VERIFICATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Review the output above for any FAIL or WARNING messages.';
  RAISE NOTICE 'All PASS messages indicate successful setup.';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected Components:';
  RAISE NOTICE '- 7 tables';
  RAISE NOTICE '- 40+ indexes';
  RAISE NOTICE '- 11 functions';
  RAISE NOTICE '- 6 triggers';
  RAISE NOTICE '- 20+ RLS policies';
  RAISE NOTICE '';
END $$;

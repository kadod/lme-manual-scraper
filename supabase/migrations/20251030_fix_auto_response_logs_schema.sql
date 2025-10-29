-- Fix auto_response_logs table schema
-- Add missing user_id column and update RLS policies

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_response_logs'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE auto_response_logs
    ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

    -- Backfill user_id from rule_id
    UPDATE auto_response_logs SET user_id = (
      SELECT user_id FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_logs.rule_id
    ) WHERE rule_id IS NOT NULL;

    -- Create index for user_id
    CREATE INDEX idx_auto_response_logs_user_id ON auto_response_logs(user_id, created_at DESC);
  END IF;
END $$;

-- Add triggered_at column if it doesn't exist (for compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_response_logs'
    AND column_name = 'triggered_at'
  ) THEN
    ALTER TABLE auto_response_logs
    ADD COLUMN triggered_at TIMESTAMPTZ DEFAULT now();

    -- Copy from created_at if exists
    UPDATE auto_response_logs SET triggered_at = created_at;

    -- Create index
    CREATE INDEX idx_auto_response_logs_triggered_at_new ON auto_response_logs(triggered_at DESC);
  END IF;
END $$;

-- Add rule_type column if it doesn't exist (for query compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_response_logs'
    AND column_name = 'rule_type'
  ) THEN
    ALTER TABLE auto_response_logs
    ADD COLUMN rule_type VARCHAR(50);

    -- Backfill from rules table
    UPDATE auto_response_logs SET rule_type = (
      SELECT rule_type FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_logs.rule_id
    ) WHERE rule_id IS NOT NULL;
  END IF;
END $$;

-- Add user_message column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_response_logs'
    AND column_name = 'user_message'
  ) THEN
    ALTER TABLE auto_response_logs
    ADD COLUMN user_message TEXT;

    -- Copy from incoming_message if exists
    UPDATE auto_response_logs SET user_message = incoming_message;
  END IF;
END $$;

-- Add response_message column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auto_response_logs'
    AND column_name = 'response_message'
  ) THEN
    ALTER TABLE auto_response_logs
    ADD COLUMN response_message TEXT;
  END IF;
END $$;

-- Update RLS policies to include user_id check
DROP POLICY IF EXISTS "Users can view logs for their rules" ON auto_response_logs;
DROP POLICY IF EXISTS "Users can view their own logs" ON auto_response_logs;

CREATE POLICY "Users can view their own logs"
  ON auto_response_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_logs.rule_id
      AND auto_response_rules.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own logs"
  ON auto_response_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM auto_response_rules
      WHERE auto_response_rules.id = auto_response_logs.rule_id
      AND auto_response_rules.user_id = auth.uid()
    )
  );

-- Add helpful comment
COMMENT ON COLUMN auto_response_logs.user_id IS 'Denormalized user_id for efficient querying';
COMMENT ON COLUMN auto_response_logs.triggered_at IS 'When the auto response was triggered (alias for created_at)';
COMMENT ON COLUMN auto_response_logs.rule_type IS 'Denormalized rule type for efficient filtering';

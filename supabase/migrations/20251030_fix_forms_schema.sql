-- ========================================
-- Fix Forms Table Schema
-- Migration to align database schema with application code
-- ========================================

-- Add missing columns that the application expects
ALTER TABLE forms ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS total_responses INTEGER DEFAULT 0;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS response_rate DECIMAL DEFAULT 0;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Rename 'fields' column to 'questions' to match application code
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forms'
    AND column_name = 'fields'
  ) THEN
    ALTER TABLE forms RENAME COLUMN fields TO questions;
  END IF;
END $$;

-- Update status enum values to match application expectations
-- Change 'active' to 'published' in existing records
UPDATE forms SET status = 'published' WHERE status = 'active';

-- Drop the old check constraint
ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_status_check;

-- Add new check constraint with correct status values
ALTER TABLE forms ADD CONSTRAINT forms_status_check
  CHECK (status IN ('draft', 'published', 'closed'));

-- Migrate data from organization_id to user_id
-- For now, we'll populate user_id from organization_id where needed
-- This assumes a 1:1 mapping or that we want to use the first user in the organization
UPDATE forms f
SET user_id = COALESCE(
  f.user_id,
  (
    SELECT u.id
    FROM users u
    WHERE u.organization_id = f.organization_id
    ORDER BY u.created_at
    LIMIT 1
  )
)
WHERE f.user_id IS NULL AND f.organization_id IS NOT NULL;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);

-- Update form_responses table - rename line_friend_id to friend_id
-- Only rename if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_responses'
    AND column_name = 'line_friend_id'
  ) THEN
    ALTER TABLE form_responses RENAME COLUMN line_friend_id TO friend_id;
  END IF;
END $$;

-- Rename response_data to answers to match application code
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_responses'
    AND column_name = 'response_data'
  ) THEN
    ALTER TABLE form_responses RENAME COLUMN response_data TO answers;
  END IF;
END $$;

-- Add missing submitted_at handling (it already exists, just ensure it's properly used)
-- The column already exists, no changes needed

-- Update indexes
DROP INDEX IF EXISTS idx_form_responses_line_friend_id;
CREATE INDEX IF NOT EXISTS idx_form_responses_friend_id ON form_responses(friend_id);

-- Update RLS policies to use user_id instead of organization_id

-- Drop old policies
DROP POLICY IF EXISTS "Users can view forms in their organization" ON forms;
DROP POLICY IF EXISTS "Members can create forms in their organization" ON forms;
DROP POLICY IF EXISTS "Members can update forms in their organization" ON forms;
DROP POLICY IF EXISTS "Admins can delete forms in their organization" ON forms;

-- Create new policies using user_id
CREATE POLICY "Users can view their own forms"
ON forms FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own forms"
ON forms FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own forms"
ON forms FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own forms"
ON forms FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Update form_responses policies
DROP POLICY IF EXISTS "Users can view responses for their organization's forms" ON form_responses;

CREATE POLICY "Users can view responses for their forms"
ON form_responses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_responses.form_id
    AND forms.user_id = auth.uid()
  )
);

-- Update the trigger function to work with new column names
DROP TRIGGER IF EXISTS trigger_update_analytics ON form_responses;

-- Create updated trigger function
CREATE OR REPLACE FUNCTION update_analytics_on_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics for the date of the response
  PERFORM calculate_form_statistics(
    NEW.form_id,
    DATE(NEW.submitted_at)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_analytics
  AFTER INSERT OR UPDATE ON form_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_on_response();

-- Update helper functions to use new column names
CREATE OR REPLACE FUNCTION aggregate_field_responses(
  p_form_id UUID,
  p_field_id TEXT,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_field_type TEXT;
  v_result JSONB;
BEGIN
  -- Get field type from form definition (now using 'questions' column)
  SELECT field->>'type' INTO v_field_type
  FROM forms,
       jsonb_array_elements(questions) as field
  WHERE forms.id = p_form_id
  AND field->>'id' = p_field_id;

  -- Aggregate based on field type
  CASE v_field_type
    WHEN 'select', 'radio', 'checkbox' THEN
      -- For choice fields, count each option (now using 'answers' column)
      SELECT jsonb_object_agg(
        value,
        count
      ) INTO v_result
      FROM (
        SELECT
          answers->p_field_id as value,
          COUNT(*)::INTEGER as count
        FROM form_responses
        WHERE form_id = p_form_id
        AND (p_start_date IS NULL OR DATE(submitted_at) >= p_start_date)
        AND (p_end_date IS NULL OR DATE(submitted_at) <= p_end_date)
        AND answers ? p_field_id
        GROUP BY answers->p_field_id
        ORDER BY count DESC
      ) sub;

    WHEN 'number' THEN
      -- For number fields, calculate statistics
      SELECT jsonb_build_object(
        'count', COUNT(*)::INTEGER,
        'sum', SUM((answers->>p_field_id)::DECIMAL),
        'avg', AVG((answers->>p_field_id)::DECIMAL),
        'min', MIN((answers->>p_field_id)::DECIMAL),
        'max', MAX((answers->>p_field_id)::DECIMAL),
        'median', PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (answers->>p_field_id)::DECIMAL)
      ) INTO v_result
      FROM form_responses
      WHERE form_id = p_form_id
      AND (p_start_date IS NULL OR DATE(submitted_at) >= p_start_date)
      AND (p_end_date IS NULL OR DATE(submitted_at) <= p_end_date)
      AND answers ? p_field_id
      AND answers->>p_field_id ~ '^[0-9.]+$';

    ELSE
      -- For text fields, just count responses
      SELECT jsonb_build_object(
        'count', COUNT(*)::INTEGER,
        'sample_responses', jsonb_agg(answers->>p_field_id)
      ) INTO v_result
      FROM (
        SELECT answers->>p_field_id
        FROM form_responses
        WHERE form_id = p_form_id
        AND (p_start_date IS NULL OR DATE(submitted_at) >= p_start_date)
        AND (p_end_date IS NULL OR DATE(submitted_at) <= p_end_date)
        AND answers ? p_field_id
        LIMIT 100
      ) sub;
  END CASE;

  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE forms IS 'User-created forms for surveys and data collection';
COMMENT ON COLUMN forms.user_id IS 'User who created the form (references auth.users)';
COMMENT ON COLUMN forms.questions IS 'Form questions/fields definition (JSONB array)';
COMMENT ON COLUMN forms.total_responses IS 'Total number of responses received';
COMMENT ON COLUMN forms.response_rate IS 'Response rate percentage';

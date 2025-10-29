-- ========================================
-- Simple Fix for Forms Table Schema
-- Apply this through Supabase Dashboard SQL Editor
-- ========================================

-- STEP 1: Add missing columns to forms table
ALTER TABLE forms ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS total_responses INTEGER DEFAULT 0;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS response_rate DECIMAL DEFAULT 0;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- STEP 2: Rename columns if they exist
DO $$
BEGIN
  -- Rename 'fields' to 'questions'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'forms'
    AND column_name = 'fields'
  ) THEN
    ALTER TABLE forms RENAME COLUMN fields TO questions;
  END IF;
END $$;

-- STEP 3: Update form_responses columns
DO $$
BEGIN
  -- Rename 'line_friend_id' to 'friend_id'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_responses'
    AND column_name = 'line_friend_id'
  ) THEN
    ALTER TABLE form_responses RENAME COLUMN line_friend_id TO friend_id;
  END IF;

  -- Rename 'response_data' to 'answers'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_responses'
    AND column_name = 'response_data'
  ) THEN
    ALTER TABLE form_responses RENAME COLUMN response_data TO answers;
  END IF;
END $$;

-- STEP 4: Update status values
UPDATE forms SET status = 'published' WHERE status = 'active';

-- STEP 5: Update check constraint for status
ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_status_check;
ALTER TABLE forms ADD CONSTRAINT forms_status_check
  CHECK (status IN ('draft', 'published', 'closed'));

-- STEP 6: Populate user_id from organization_id if needed
-- This assumes there's a users table with organization_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'forms'
    AND column_name = 'organization_id'
  ) THEN
    UPDATE forms f
    SET user_id = COALESCE(
      f.user_id,
      (
        SELECT u.id
        FROM users u
        WHERE u.organization_id = f.organization_id
        ORDER BY u.created_at
        LIMIT 1
      ),
      f.created_by
    )
    WHERE f.user_id IS NULL;
  END IF;
END $$;

-- STEP 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
DROP INDEX IF EXISTS idx_form_responses_line_friend_id;
CREATE INDEX IF NOT EXISTS idx_form_responses_friend_id ON form_responses(friend_id);

-- STEP 8: Update RLS policies
DROP POLICY IF EXISTS "Users can view forms in their organization" ON forms;
DROP POLICY IF EXISTS "Members can create forms in their organization" ON forms;
DROP POLICY IF EXISTS "Members can update forms in their organization" ON forms;
DROP POLICY IF EXISTS "Admins can delete forms in their organization" ON forms;
DROP POLICY IF EXISTS "Users can view responses for their organization's forms" ON form_responses;

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

-- STEP 9: Verify the changes
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Please verify the forms table has these columns:';
  RAISE NOTICE '- user_id, title, description, questions, settings, status';
  RAISE NOTICE '- total_responses, response_rate, created_at, updated_at';
  RAISE NOTICE '- published_at, closed_at';
END $$;

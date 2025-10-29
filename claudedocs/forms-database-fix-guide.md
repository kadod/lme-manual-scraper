# Forms Database Schema Fix Guide

## Problem

The forms page is showing error code 42703 which means "column does not exist" in PostgreSQL. This is due to mismatched column names between the database schema and the application code.

## Root Cause Analysis

### Database Schema (from migration file)
The original migration `20251029_create_forms_tables.sql` created tables with these columns:

**forms table:**
- `organization_id` (not `user_id`)
- `fields` (not `questions`)
- Status values: 'draft', 'active', 'closed' (not 'published')
- Missing columns: `total_responses`, `response_rate`, `published_at`, `closed_at`

**form_responses table:**
- `line_friend_id` (not `friend_id`)
- `response_data` (not `answers`)

### Application Code (from actions/forms.ts)
The application expects:

**forms table:**
- `user_id` column
- `questions` column
- Status values: 'draft', 'published', 'closed'
- Columns: `total_responses`, `response_rate`, `published_at`, `closed_at`

**form_responses table:**
- `friend_id` column
- `answers` column

## Column Mapping

| Database Schema | Application Expects | Fix Required |
|----------------|---------------------|--------------|
| `organization_id` | `user_id` | Add user_id column, migrate data |
| `fields` | `questions` | Rename column |
| status: 'active' | status: 'published' | Update data + constraint |
| (missing) | `total_responses` | Add column |
| (missing) | `response_rate` | Add column |
| (missing) | `closed_at` | Add column |
| `line_friend_id` | `friend_id` | Rename column |
| `response_data` | `answers` | Rename column |

## Solution

### Option 1: Apply Migration via Supabase Dashboard (RECOMMENDED)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Open a new query
5. Copy the entire contents of `/supabase/migrations/20251030_fix_forms_simple.sql`
6. Paste into the SQL Editor
7. Click **Run**
8. Verify the output shows no errors

### Option 2: Apply Migration via Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref powrxrjblbxrfrqskvye

# Apply the migration
supabase db push
```

### Option 3: Manual Column Updates

If you prefer to update columns one by one:

```sql
-- Add missing columns
ALTER TABLE forms ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE forms ADD COLUMN total_responses INTEGER DEFAULT 0;
ALTER TABLE forms ADD COLUMN response_rate DECIMAL DEFAULT 0;
ALTER TABLE forms ADD COLUMN closed_at TIMESTAMPTZ;

-- Rename columns
ALTER TABLE forms RENAME COLUMN fields TO questions;
ALTER TABLE form_responses RENAME COLUMN line_friend_id TO friend_id;
ALTER TABLE form_responses RENAME COLUMN response_data TO answers;

-- Update status values
UPDATE forms SET status = 'published' WHERE status = 'active';
ALTER TABLE forms DROP CONSTRAINT forms_status_check;
ALTER TABLE forms ADD CONSTRAINT forms_status_check
  CHECK (status IN ('draft', 'published', 'closed'));
```

## Verification

After applying the fix, verify the changes:

```sql
-- Check forms table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'forms'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check form_responses table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'form_responses'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check status values
SELECT DISTINCT status FROM forms;
```

Expected results:

**forms table should have:**
- id, user_id, organization_id (optional), title, description
- questions, settings, status, total_responses, response_rate
- created_at, updated_at, published_at, closed_at

**form_responses table should have:**
- id, form_id, friend_id, answers, submitted_at, created_at

## Testing

1. Navigate to `/dashboard/forms` in your application
2. The page should load without errors
3. Try creating a new form
4. Verify existing forms are displayed correctly

## Rollback (if needed)

If you need to rollback the changes:

```sql
-- Rename columns back
ALTER TABLE forms RENAME COLUMN questions TO fields;
ALTER TABLE form_responses RENAME COLUMN friend_id TO line_friend_id;
ALTER TABLE form_responses RENAME COLUMN answers TO response_data;

-- Restore status values
UPDATE forms SET status = 'active' WHERE status = 'published';
```

## Files Modified

1. `/supabase/migrations/20251030_fix_forms_schema.sql` - Complete migration with all fixes
2. `/supabase/migrations/20251030_fix_forms_simple.sql` - Simplified version for manual application
3. `/scripts/apply-forms-fix.ts` - TypeScript script to apply migration programmatically

## Notes

- The migration is designed to be idempotent (can be run multiple times safely)
- Existing data is preserved during column renames
- RLS policies are updated to work with user_id instead of organization_id
- Indexes are created for optimal query performance

# Fix Forms Page Database Error (Code 42703)

## Quick Fix

The forms page is showing an error because the database schema doesn't match the application code.

### Step-by-Step Solution

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `powrxrjblbxrfrqskvye`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Fix**
   - Open this file: `/supabase/migrations/20251030_fix_forms_simple.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd+Enter)

4. **Verify**
   - You should see a success message
   - Navigate to `/dashboard/forms` in your app
   - The page should now load without errors

### What This Fixes

The migration updates the database schema to match the application code:

- ✅ Renames `fields` → `questions`
- ✅ Renames `response_data` → `answers`
- ✅ Renames `line_friend_id` → `friend_id`
- ✅ Adds `user_id`, `total_responses`, `response_rate`, `closed_at` columns
- ✅ Updates status values from 'active' → 'published'
- ✅ Updates RLS policies to work with user_id

### Detailed Documentation

For more information, see: `/claudedocs/forms-database-fix-guide.md`

### Need Help?

If you encounter any issues:
1. Check the error message in the SQL Editor
2. Review the detailed guide in `claudedocs/forms-database-fix-guide.md`
3. Ensure you're running the migration on the correct database

# Rich Menus Page Fix Summary

## Issues Identified and Resolved

### 1. Database Error: "Error fetching rich menus"

**Root Cause:** The `rich_menus` and `line_channels` tables did not exist in the database schema.

**Issue Details:**
- The `getRichMenus()` server action was trying to query a `rich_menus` table that didn't exist
- The table was also missing from the TypeScript type definitions in `/types/supabase.ts`
- Additionally, the `line_channels` table (referenced in rich-menus actions) was also missing

**Resolution:**

Created database migration files:

1. **`/supabase/migrations/20251030_create_rich_menus.sql`**
   - Created `rich_menus` table with proper schema:
     - `id` (UUID primary key)
     - `user_id` (UUID, references auth.users)
     - `rich_menu_id` (TEXT, unique - LINE's rich menu ID)
     - `line_rich_menu_id` (TEXT, nullable - deployed LINE rich menu ID)
     - `name` (TEXT)
     - `chat_bar_text` (TEXT)
     - `size` (JSONB - width/height)
     - `selected` (BOOLEAN)
     - `areas` (JSONB - tap areas configuration)
     - `status` (TEXT - draft/published/archived)
     - `is_default` (BOOLEAN)
     - `created_at`, `updated_at` (TIMESTAMPTZ)

   - Created `rich_menu_areas` table for normalized storage:
     - `id` (UUID primary key)
     - `rich_menu_id` (UUID, references rich_menus)
     - `bounds` (JSONB - area boundaries)
     - `action` (JSONB - action configuration)
     - `created_at` (TIMESTAMPTZ)

   - Added indexes for performance:
     - `idx_rich_menus_user_id`
     - `idx_rich_menus_rich_menu_id`
     - `idx_rich_menus_line_rich_menu_id`
     - `idx_rich_menus_status`
     - `idx_rich_menu_areas_rich_menu_id`

   - Enabled Row Level Security (RLS) with policies:
     - Users can only view/insert/update/delete their own rich menus
     - Area access controlled through parent rich menu ownership

   - Added `updated_at` trigger for automatic timestamp updates

2. **`/supabase/migrations/20251030_create_line_channels.sql`**
   - Created `line_channels` table:
     - `id` (UUID primary key)
     - `user_id` (UUID, references auth.users)
     - `channel_id` (TEXT, unique)
     - `channel_secret` (TEXT)
     - `access_token` (TEXT)
     - `channel_name` (TEXT, nullable)
     - `is_active` (BOOLEAN)
     - `created_at`, `updated_at` (TIMESTAMPTZ)

   - Added indexes and RLS policies
   - Added `updated_at` trigger

**TypeScript Type Updates:**

Updated `/types/supabase.ts` to include the new table definitions:

```typescript
rich_menus: {
  Row: {
    id: string
    user_id: string
    rich_menu_id: string
    line_rich_menu_id: string | null
    name: string
    chat_bar_text: string
    size: Json
    selected: boolean
    areas: Json
    status: string
    is_default: boolean
    created_at: string
    updated_at: string
  }
  Insert: { ... }
  Update: { ... }
  Relationships: [ ... ]
}

rich_menu_areas: {
  Row: { ... }
  Insert: { ... }
  Update: { ... }
  Relationships: [ ... ]
}

line_channels: {
  Row: {
    id: string
    user_id: string
    channel_id: string
    channel_secret: string
    access_token: string
    channel_name: string | null
    is_active: boolean
    created_at: string
    updated_at: string
  }
  Insert: { ... }
  Update: { ... }
  Relationships: [ ... ]
}
```

---

### 2. React Error: "Event handlers cannot be passed to Client Component props"

**Root Cause:** The error component in `/app/dashboard/rich-menus/page.tsx` was trying to render a `<Button>` with an `onClick` handler inside a Server Component.

**Issue Details:**
- The `RichMenusContent` async server component was rendering an error state
- The error state included `<Button onClick={() => window.location.reload()}>` directly
- This violates React Server Components rules - event handlers cannot be used in server components

**Resolution:**

Created a new Client Component for error handling:

**`/components/rich-menus/RichMenuError.tsx`**
```typescript
'use client';

import { Button } from '@/components/ui/button';

export function RichMenuError() {
  return (
    <div className="text-center py-12 bg-white rounded-lg border">
      <p className="text-red-500 mb-4">Failed to load rich menus</p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  );
}
```

Updated `/app/dashboard/rich-menus/page.tsx`:
- Imported the new `RichMenuError` component
- Replaced inline error JSX with `<RichMenuError />`
- Server component now properly delegates event handling to client component

**Before:**
```typescript
async function RichMenusContent() {
  try {
    const richMenus = await getRichMenus()
    return <RichMenuList initialMenus={richMenus} />
  } catch (error) {
    console.error('Failed to load rich menus:', error)
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-red-500 mb-4">Failed to load rich menus</p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    )
  }
}
```

**After:**
```typescript
async function RichMenusContent() {
  try {
    const richMenus = await getRichMenus()
    return <RichMenuList initialMenus={richMenus} />
  } catch (error) {
    console.error('Failed to load rich menus:', error)
    return <RichMenuError />
  }
}
```

---

## Architectural Changes

### Server/Client Component Separation

The fix properly implements the Next.js 13+ App Router pattern:

1. **Server Components** (default):
   - `/app/dashboard/rich-menus/page.tsx` - Main page with async data fetching
   - `RichMenusContent` - Async component that fetches data

2. **Client Components** (marked with 'use client'):
   - `/components/rich-menus/RichMenuList.tsx` - Interactive list with state management
   - `/components/rich-menus/RichMenuError.tsx` - Error UI with reload button

### Data Flow

```
RichMenusPage (Server)
  └─> Suspense
      └─> RichMenusContent (Server)
          ├─> getRichMenus() → Database Query
          ├─> Success: RichMenuList (Client) with initial data
          └─> Error: RichMenuError (Client) with reload handler
```

### Benefits

1. **Performance**: Server components reduce client JavaScript bundle size
2. **Security**: Database queries happen server-side, keeping credentials secure
3. **SEO**: Server-rendered content is immediately available for crawlers
4. **User Experience**: Suspense boundaries provide loading states, error boundaries handle failures gracefully

---

## Migration Instructions

To apply these fixes to your database:

1. Run the migrations in your Supabase project:
   ```bash
   # Apply rich_menus table
   supabase migration up 20251030_create_rich_menus

   # Apply line_channels table
   supabase migration up 20251030_create_line_channels
   ```

2. Verify the tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('rich_menus', 'rich_menu_areas', 'line_channels');
   ```

3. Test the rich menus page:
   - Navigate to `/dashboard/rich-menus`
   - Verify no database errors
   - Verify no React errors in console
   - Test creating/editing/deleting rich menus

---

## Files Modified

1. `/app/dashboard/rich-menus/page.tsx` - Updated error handling
2. `/components/rich-menus/RichMenuError.tsx` - NEW: Client component for errors
3. `/types/supabase.ts` - Added rich_menus, rich_menu_areas, line_channels types
4. `/supabase/migrations/20251030_create_rich_menus.sql` - NEW: Database schema
5. `/supabase/migrations/20251030_create_line_channels.sql` - NEW: Database schema

---

## Testing Checklist

- [x] Build completes without errors for rich-menus components
- [ ] Database migrations applied successfully
- [ ] Rich menus page loads without errors
- [ ] Error state renders correctly with reload button
- [ ] Create rich menu functionality works
- [ ] Edit rich menu functionality works
- [ ] Delete rich menu functionality works
- [ ] Deploy/undeploy actions work
- [ ] Set default menu functionality works

---

## Notes

- The existing `/app/actions/rich-menus.ts` file already had the correct logic for querying `rich_menus` table
- The existing `/lib/supabase/queries/rich-menus.ts` file had proper query methods but wasn't being used by the actions file
- Consider refactoring actions to use the query library for consistency
- The `line_channels` table is critical for LINE API interactions - ensure it's populated before testing rich menu deployments

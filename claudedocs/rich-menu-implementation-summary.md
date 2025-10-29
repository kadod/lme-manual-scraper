# Rich Menu Implementation Summary

## Completed Tasks

### 1. LINE Rich Menu API Integration
**File**: `/lib/line/rich-menu-api.ts`

Created comprehensive LINE Rich Menu API client with following methods:

**Core Operations**:
- `createRichMenu(richMenu)` - Create Rich Menu on LINE
- `uploadRichMenuImage(richMenuId, imageBuffer, contentType)` - Upload image
- `deleteRichMenu(richMenuId)` - Delete Rich Menu from LINE
- `getRichMenu(richMenuId)` - Get Rich Menu details
- `listRichMenus()` - List all Rich Menus

**Default Management**:
- `setDefaultRichMenu(richMenuId)` - Set as default for all users
- `getDefaultRichMenuId()` - Get current default Rich Menu ID
- `cancelDefaultRichMenu()` - Remove default setting

**User-Specific Operations**:
- `linkRichMenuToUser(richMenuId, userId)` - Link to specific user
- `unlinkRichMenuFromUser(userId)` - Unlink from user
- `getRichMenuIdOfUser(userId)` - Get user's current Rich Menu

**Helper Functions**:
- `createRichMenuClient(accessToken?)` - Create API client instance
- `downloadImage(url)` - Download image as Buffer

### 2. Database Query Layer
**File**: `/lib/supabase/queries/rich-menus.ts`

Created `RichMenusQueries` class with comprehensive database operations:

**Query Methods**:
- `getRichMenus(userId, filters?)` - List with filtering (status, search, pagination)
- `getRichMenuById(richMenuId, userId)` - Get by ID with areas
- `getRichMenuAreas(richMenuId, userId)` - Get areas only
- `createRichMenu(richMenu)` - Create new Rich Menu
- `updateRichMenu(richMenuId, userId, updates)` - Update Rich Menu
- `deleteRichMenu(richMenuId, userId)` - Delete Rich Menu

**Status Management**:
- `updateLineRichMenuId(richMenuId, userId, lineRichMenuId)` - Update LINE ID
- `updateRichMenuStatus(richMenuId, userId, status)` - Update status
- `getPublishedRichMenus(userId)` - Get published menus only
- `getRichMenuCount(userId)` - Count user's Rich Menus

**Types**:
```typescript
interface RichMenuWithAreas extends RichMenu {
  areas: RichMenuArea[]
}

interface RichMenuFilters {
  status?: 'draft' | 'published' | 'archived'
  searchQuery?: string
  limit?: number
  offset?: number
}
```

### 3. Supabase Edge Function
**File**: `/supabase/functions/deploy-rich-menu/index.ts`

Created Edge Function for deploying Rich Menus to LINE:

**Features**:
- Authenticates user via Supabase Auth
- Fetches Rich Menu data from database with areas
- Creates Rich Menu on LINE API
- Downloads image from URL
- Uploads image to LINE Rich Menu
- Optionally sets as default for all users
- Updates database with LINE Rich Menu ID and status

**Request Format**:
```typescript
interface DeployRequest {
  richMenuId: string
  setAsDefault?: boolean
}
```

**Response Format**:
```typescript
interface DeployResponse {
  success: boolean
  lineRichMenuId?: string
  error?: string
}
```

**Error Handling**:
- CORS support for browser requests
- Authentication validation
- Rich Menu existence check
- LINE API error handling
- Image download/upload error handling

### 4. Server Actions
**File**: `/app/actions/rich-menus.ts` (Extended)

Added deployment-related server actions to existing file:

**New Exports**:
```typescript
interface DeployRichMenuOptions {
  richMenuId: string
  setAsDefault?: boolean
}

interface DeployResult {
  success: boolean
  lineRichMenuId?: string
  error?: string
}
```

**New Functions**:

1. `deployRichMenu(options)` - Deploy to LINE via Edge Function
   - Calls Edge Function with auth token
   - Revalidates cache on success
   - Returns deployment result

2. `setAsDefault(richMenuId)` - Set as default (for deployed menus)
   - Verifies menu is deployed
   - Calls LINE API to set default
   - Updates database flags

3. `undeployRichMenu(richMenuId)` - Remove from LINE
   - Deletes from LINE API
   - Updates database (clears line_rich_menu_id)
   - Sets status to 'draft'

4. `linkRichMenuToUser(richMenuId, lineUserId)` - Link to user
   - Verifies menu is deployed
   - Links via LINE API
   - Returns result

5. `unlinkRichMenuFromUser(lineUserId)` - Unlink from user
   - Calls LINE API to unlink
   - Returns result

**Existing Functions** (preserved):
- `getRichMenus()` - List menus
- `createRichMenu()` - Create on LINE
- `updateRichMenu()` - Update on LINE
- `deleteRichMenu()` - Delete from LINE
- `uploadRichMenuImage()` - Upload image
- `duplicateRichMenu()` - Duplicate menu
- `setDefaultRichMenu()` - Set default
- `publishRichMenu()` - Publish menu
- `unpublishRichMenu()` - Unpublish menu

### 5. Query Index Update
**File**: `/lib/supabase/queries/index.ts`

Added export for rich-menus queries:
```typescript
export * from './rich-menus'
```

## File Structure

```
lme-saas/
├── lib/
│   ├── line/
│   │   ├── messaging-api.ts (existing)
│   │   └── rich-menu-api.ts (NEW)
│   └── supabase/
│       └── queries/
│           ├── index.ts (updated)
│           └── rich-menus.ts (NEW)
├── app/
│   └── actions/
│       └── rich-menus.ts (extended)
├── supabase/
│   └── functions/
│       └── deploy-rich-menu/
│           └── index.ts (NEW)
└── claudedocs/
    ├── rich-menu-deployment-guide.md (NEW)
    └── rich-menu-implementation-summary.md (NEW)
```

## Usage Examples

### Deploy Rich Menu Workflow

```typescript
// 1. Create Rich Menu in database
const richMenu = await createRichMenu({
  name: 'Main Menu',
  chat_bar_text: 'Menu',
  size: { width: 2500, height: 1686 },
  selected: true,
  image_url: 'https://storage.example.com/menu.png',
  status: 'draft'
})

// 2. Deploy to LINE
const deployResult = await deployRichMenu({
  richMenuId: richMenu.id,
  setAsDefault: true
})

if (deployResult.success) {
  console.log('Deployed with LINE ID:', deployResult.lineRichMenuId)
}

// 3. Link to specific user (optional)
await linkRichMenuToUser(richMenu.id, 'U123456789')
```

### Query Rich Menus

```typescript
import { RichMenusQueries } from '@/lib/supabase/queries'

const queries = new RichMenusQueries(supabase)

// Get published menus
const published = await queries.getPublishedRichMenus(userId)

// Get with filters
const filtered = await queries.getRichMenus(userId, {
  status: 'draft',
  searchQuery: 'menu',
  limit: 10,
  offset: 0
})

// Get with areas
const richMenu = await queries.getRichMenuById(richMenuId, userId)
console.log(richMenu.data.areas)
```

### Direct LINE API Usage

```typescript
import { createRichMenuClient } from '@/lib/line/rich-menu-api'

const client = createRichMenuClient()

// List all Rich Menus
const list = await client.listRichMenus()

// Get default Rich Menu
const defaultId = await client.getDefaultRichMenuId()

// Link to user
await client.linkRichMenuToUser(richMenuId, userId)
```

## Environment Variables Required

### Edge Function (Supabase Secrets)
```bash
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Next.js (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
```

## Database Schema Requirements

**rich_menus table**:
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `line_rich_menu_id` (text, nullable) - LINE APIから返されるID
- `name` (text)
- `chat_bar_text` (text)
- `size` (jsonb) - { width, height }
- `selected` (boolean)
- `image_url` (text)
- `status` (text) - 'draft' | 'published' | 'archived'
- `is_default` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**rich_menu_areas table**:
- `id` (uuid, PK)
- `rich_menu_id` (uuid, FK)
- `bounds` (jsonb) - { x, y, width, height }
- `action` (jsonb) - LINE action object
- `created_at` (timestamp)

## Deployment Steps

### 1. Deploy Edge Function
```bash
cd /path/to/lme-saas
supabase functions deploy deploy-rich-menu
```

### 2. Set Secrets
```bash
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=your_token
```

### 3. Verify Environment Variables
Ensure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=...
LINE_CHANNEL_ACCESS_TOKEN=...
```

### 4. Test Deployment
```typescript
const result = await deployRichMenu({
  richMenuId: 'test-uuid',
  setAsDefault: false
})

console.assert(result.success === true)
```

## API Endpoints

### Edge Function
```
POST https://your-project.supabase.co/functions/v1/deploy-rich-menu
Authorization: Bearer <user_access_token>
Content-Type: application/json

{
  "richMenuId": "uuid",
  "setAsDefault": true
}
```

### LINE API (via client)
All LINE API calls are abstracted through `LineRichMenuAPI` class:
- `POST /richmenu` - Create
- `POST /richmenu/{richMenuId}/content` - Upload image
- `POST /user/all/richmenu/{richMenuId}` - Set default
- `DELETE /richmenu/{richMenuId}` - Delete
- `POST /user/{userId}/richmenu/{richMenuId}` - Link to user
- `DELETE /user/{userId}/richmenu` - Unlink from user
- `GET /richmenu/{richMenuId}` - Get details
- `GET /richmenu/list` - List all

## Testing Checklist

- [ ] Create Rich Menu in database
- [ ] Deploy to LINE via Edge Function
- [ ] Verify line_rich_menu_id is saved
- [ ] Upload Rich Menu image
- [ ] Set as default
- [ ] Link to specific user
- [ ] Unlink from user
- [ ] Undeploy from LINE
- [ ] Delete Rich Menu

## Integration Points

1. **Frontend** (to be implemented):
   - Rich Menu list page
   - Rich Menu creation form
   - Deploy button with status indicator
   - Default toggle switch
   - User assignment interface

2. **Storage** (to be implemented):
   - Supabase Storage for images
   - Image size validation (2500x1686 or 2500x843)
   - Preview generation

3. **Analytics** (to be implemented):
   - Track Rich Menu taps
   - User engagement metrics
   - Popular actions analysis

## Next Implementation Phase

1. **Rich Menu Builder UI**:
   - Canvas-based area editor
   - Action type selection
   - Image upload with preview
   - Size validation

2. **Template System**:
   - Predefined templates
   - Template duplication
   - Custom template saving

3. **User Segmentation**:
   - Assign Rich Menus by segment
   - Schedule Rich Menu changes
   - A/B testing support

4. **Analytics Dashboard**:
   - Rich Menu tap statistics
   - Conversion tracking
   - User behavior analysis

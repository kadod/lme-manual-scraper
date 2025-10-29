# Rich Menu Editor Implementation

## Overview
Complete rich menu editor for LINE Messaging API with visual canvas editor, tap area management, and action configuration.

## Implementation Date
2025-10-29

## Files Created

### 1. Type Definitions
**File**: `/lib/line/rich-menu-types.ts`
- LINE Rich Menu type definitions
- Rich menu size specifications (2500x1686, 2500x843)
- Action types (uri, message, postback)
- Area bounds and actions
- Grid template definitions (2x2, 3x3, 2x1, 3x1)

### 2. Server Actions
**File**: `/app/actions/rich-menus.ts`
Comprehensive server actions for rich menu management:
- `uploadRichMenuImage()` - Upload image to LINE
- `createRichMenu()` - Create new rich menu
- `updateRichMenu()` - Update existing menu
- `deleteRichMenu()` - Delete menu
- `getRichMenus()` - Fetch all menus
- `duplicateRichMenu()` - Clone menu
- `setDefaultRichMenu()` - Set as default
- `deployRichMenu()` - Deploy to LINE
- `undeployRichMenu()` - Remove from LINE
- `setAsDefault()` - Set deployed menu as default
- `linkRichMenuToUser()` - Link to specific user
- `unlinkRichMenuFromUser()` - Unlink from user

### 3. React Components

#### Core Editor Component
**File**: `/components/rich-menus/RichMenuEditor.tsx`
Main editor with tabbed interface:
- Tab 1: Basic Settings (name, chat bar text, size)
- Tab 2: Design (image upload, grid templates)
- Tab 3: Tap Areas (canvas editor, area list)
- Form validation
- Save/Update functionality
- Dialog for action editing

#### Canvas Editor
**File**: `/components/rich-menus/CanvasEditor.tsx`
Visual canvas for tap area creation:
- Canvas API integration
- Drag to create areas
- Click to select areas
- Visual feedback (colors, numbers)
- Image overlay support
- Scale calculation (800px canvas width)
- Mouse event handling

#### Area Selector
**File**: `/components/rich-menus/AreaSelector.tsx`
List view of tap areas:
- Display area bounds and size
- Show action type and value
- Edit and delete buttons
- Visual selection state
- Area numbering (1-20)

#### Action Editor
**File**: `/components/rich-menus/ActionEditor.tsx`
Configure tap area actions:
- Radio button type selection
- URI input (with https validation)
- Message text input
- Postback data input
- Label field (optional)
- Field validation

#### Grid Templates
**File**: `/components/rich-menus/GridTemplates.tsx`
Preset layout selection:
- 2x2 Grid (large)
- 3x3 Grid (large)
- 2x1 Grid (small)
- 3x1 Grid (small)
- Visual preview
- One-click application

#### Rich Menu List
**File**: `/components/rich-menus/RichMenuList.tsx`
Display and manage menus:
- Card-based grid layout
- Deploy/Undeploy actions
- Set as default
- Duplicate functionality
- Delete confirmation dialog
- Status badges

### 4. Pages

#### List Page
**File**: `/app/dashboard/rich-menus/page.tsx`
- Display all rich menus
- Suspense with loading skeleton
- Empty state with CTA
- Error boundary

#### New Page
**File**: `/app/dashboard/rich-menus/new/page.tsx`
- Create new rich menu
- Authentication check
- Breadcrumb navigation

#### Edit Page
**File**: `/app/dashboard/rich-menus/[id]/edit/page.tsx`
- Edit existing menu
- Load from database
- Authentication check
- 404 redirect if not found

## Features Implemented

### Visual Editor
- Canvas-based tap area creation
- Drag to define rectangular areas
- Click to select/deselect areas
- Visual numbering (1-20)
- Color-coded selection state
- Image overlay preview
- Scale-aware coordinate mapping

### Grid Templates
- 4 preset layouts
- Instant application
- Visual preview
- Size-appropriate templates

### Action Configuration
- 3 action types supported:
  1. URI (URL links)
  2. Message (text sending)
  3. Postback (data passing)
- Type-specific validation
- Optional label field

### Image Management
- PNG/JPEG support
- 1MB size limit
- Client-side preview
- Upload to LINE API
- Size validation (2500x1686 or 2500x843)

### Form Validation
- Required fields check
- Chat bar text length (14 chars)
- Action completeness
- Image requirement
- Area count validation

### Deployment Features
- Draft mode
- Deploy to LINE
- Set as default
- Undeploy functionality
- Link to specific users
- Status tracking

## UI/UX Features

### Heroicons Usage
All icons from @heroicons/react/24/outline:
- PlusIcon - Create actions
- PencilIcon - Edit actions
- TrashIcon - Delete actions
- PhotoIcon - Image upload
- ArrowLeftIcon - Navigation
- DocumentDuplicateIcon - Duplicate
- CheckCircleIcon - Default status
- RocketLaunchIcon - Deploy
- EyeSlashIcon - Undeploy
- RectangleStackIcon - Rich menu icon

### shadcn/ui Components
- Dialog - Action editor modal
- Tabs - Editor sections
- Card - Menu display
- Button - All actions
- Input - Text fields
- Label - Form labels
- RadioGroup - Type selection
- Badge - Status indicators
- AlertDialog - Delete confirmation

### Responsive Design
- Mobile-first approach
- Grid layouts (1/2/3 columns)
- Touch-friendly canvas
- Flexible spacing

### Accessibility
- Semantic HTML
- Keyboard navigation
- Screen reader labels
- Focus states
- ARIA attributes

## Technical Specifications

### Canvas Dimensions
- Display: 800px width (scaled)
- Large: 2500x1686px (actual)
- Small: 2500x843px (actual)
- Scale factor: 800/2500 = 0.32

### Tap Area Limits
- Maximum: 20 areas per menu
- Minimum size: 20x20px (display)
- Coordinate precision: Integer pixels

### Image Requirements
- Format: PNG or JPEG
- Size: Exact dimensions required
- File size: Max 1MB
- Color: RGB (no transparency)

### LINE API Integration
- Base URL: https://api.line.me/v2/bot
- Authentication: Bearer token
- Endpoints used:
  - POST /richmenu - Create
  - DELETE /richmenu/{id} - Delete
  - POST /richmenu/{id}/content - Upload image
  - POST /user/all/richmenu/{id} - Set default
  - POST /user/{userId}/richmenu/{id} - Link to user
  - DELETE /user/{userId}/richmenu - Unlink

## Database Schema Requirements

### rich_menus table
Required columns:
- rich_menu_id (string, PK)
- user_id (string, FK)
- name (string)
- chat_bar_text (string, max 14)
- size (jsonb: {width, height})
- selected (boolean)
- areas (jsonb: array)
- is_default (boolean)
- status (string: draft/published)
- line_rich_menu_id (string, nullable)
- created_at (timestamp)
- updated_at (timestamp)

## Usage Flow

### Creating Rich Menu
1. Navigate to /dashboard/rich-menus/new
2. Set basic info (name, chat bar text)
3. Choose size (large or small)
4. Upload image
5. Select grid template OR manually draw areas
6. Configure action for each area
7. Save (creates in database + LINE)
8. Upload image to LINE
9. Deploy when ready

### Editing Rich Menu
1. Click edit on menu card
2. Modify settings/areas/actions
3. Update saves changes
4. Re-uploads image if changed
5. Redeploys to LINE

### Managing Menus
1. View all in list page
2. Deploy/undeploy individual menus
3. Set default menu
4. Duplicate existing menus
5. Delete with confirmation

## Error Handling

### Validation Errors
- Missing required fields
- Invalid image format/size
- Incomplete actions
- Area count exceeded

### API Errors
- LINE API failures
- Network errors
- Authentication issues
- Rate limiting

### User Feedback
- Error messages in red alert
- Success via navigation
- Loading states on buttons
- Disabled states during operations

## Future Enhancements

### Potential Features
- Undo/redo for canvas edits
- Area resize handles
- Area snapping to grid
- Copy/paste areas
- Action templates
- Image editor integration
- Preview on mobile device
- A/B testing support
- Analytics integration
- Scheduled deployment
- Conditional display rules

### Performance Optimizations
- Image compression
- Canvas debouncing
- Lazy loading
- Virtual scrolling for large lists
- Optimistic UI updates

## Testing Recommendations

### Unit Tests
- Type validation
- Coordinate calculations
- Action validation
- Form validation

### Integration Tests
- Server action flows
- Canvas interactions
- Dialog workflows
- Navigation paths

### E2E Tests
- Full creation flow
- Edit and update
- Deploy and undeploy
- Delete with confirmation

## Deployment Checklist

- [ ] Database migration for rich_menus table
- [ ] LINE channel access token configured
- [ ] Environment variables set
- [ ] Image upload endpoint accessible
- [ ] Rate limiting configured
- [ ] Error monitoring enabled
- [ ] User permissions validated

## Related Documentation
- LINE Messaging API: https://developers.line.biz/en/reference/messaging-api/#rich-menu
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- shadcn/ui: https://ui.shadcn.com/
- Heroicons: https://heroicons.com/

## Support
For issues or questions about this implementation, refer to:
- Type definitions: `/lib/line/rich-menu-types.ts`
- Server actions: `/app/actions/rich-menus.ts`
- Main editor: `/components/rich-menus/RichMenuEditor.tsx`

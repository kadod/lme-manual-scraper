# Message Templates Implementation

## Overview
Complete implementation of the message template system for LME SaaS, allowing users to create, manage, and reuse message templates with variable support.

## Implementation Date
October 29, 2024

## Components Implemented

### 1. Database Layer

#### Schema (`types/supabase.ts`)
- Added `message_templates` table type definition
- Fields:
  - `id`: UUID primary key
  - `user_id`: UUID foreign key to users
  - `name`: Template name
  - `category`: Category for organization (nullable)
  - `description`: Template description (nullable)
  - `type`: Message type (text, image, video, flex, carousel)
  - `content`: JSONB content
  - `variables`: Array of variable names
  - `created_at`, `updated_at`: Timestamps

#### Migration (`supabase/migrations/create_message_templates.sql`)
- Table creation with proper constraints
- Indexes for performance (user_id, category, type)
- Row Level Security (RLS) policies
- Automatic updated_at trigger

### 2. Data Access Layer

#### Queries (`lib/supabase/queries/templates.ts`)
- `TemplatesQueries` class with methods:
  - `getTemplates(userId, filters)`: List templates with filtering
  - `getTemplateById(templateId, userId)`: Get single template
  - `createTemplate(template)`: Create new template
  - `updateTemplate(templateId, userId, updates)`: Update template
  - `deleteTemplate(templateId, userId)`: Delete template
  - `getCategories(userId)`: Get unique categories
  - `getTemplateCount(userId)`: Count user templates

#### Server Actions (`app/actions/templates.ts`)
- Authentication wrapper functions
- `getTemplates(filters)`: Public API for template listing
- `getTemplateById(templateId)`: Get template by ID
- `createTemplate(template)`: Create template
- `updateTemplate(templateId, updates)`: Update template
- `deleteTemplate(templateId)`: Delete template
- `getCategories()`: Get categories
- `getTemplateCount()`: Get count
- `applyTemplate(options)`: Apply template with variable replacement

### 3. UI Components

#### TemplateCard (`components/messages/TemplateCard.tsx`)
- Card-based template display
- Shows name, category, description, type
- Variable count badge
- Preview, edit, delete actions
- Type-specific icons (Heroicons)
- Category color coding

#### TemplateList (`components/messages/TemplateList.tsx`)
- Grid layout for template cards
- Search functionality
- Category filter dropdown
- Type filter dropdown
- Empty state with CTA
- Result count display

#### TemplateDialog (`components/messages/TemplateDialog.tsx`)
- Create/Edit modal dialog
- Form fields:
  - Name (required)
  - Category (select from predefined)
  - Description (optional)
  - Message type (select)
  - Content (type-specific input)
- Variable insertion system:
  - Predefined variables (name, line_user_id)
  - Custom variable creation
  - Variable badge display with removal
  - Insert at cursor position
- Type-specific content editors:
  - Text: Textarea with variable insertion
  - Image/Video: URL inputs
  - Flex/Carousel: JSON editor

#### TemplatePreviewDialog (`components/messages/TemplatePreviewDialog.tsx`)
- Two-tab interface:
  - Preview tab: Visual message preview
  - JSON tab: Raw content display
- Variable value input for testing
- LINE-style message preview
- Image fallback handling
- Type-specific rendering

#### TemplateSelector (`components/messages/TemplateSelector.tsx`)
- Modal for selecting templates during message creation
- Two-step process:
  1. Template selection with search
  2. Variable value input
- Template card display in list
- Search functionality
- Variable auto-fill support
- Integration-ready for message creation flow

### 4. Pages

#### Templates Page (`app/dashboard/messages/templates/page.tsx`)
- Main template management interface
- State management for CRUD operations
- Dialog orchestration
- Delete confirmation with AlertDialog
- Data loading and refresh
- Error handling

## Features Implemented

### 1. Template Management
- Create templates with rich metadata
- Edit existing templates
- Delete with confirmation
- List with filtering and search
- Category organization

### 2. Variable System
- Predefined variables:
  - `{name}`: Friend display name
  - `{line_user_id}`: LINE user ID
- Custom variables support
- Visual variable insertion in editor
- Variable tracking and display
- Automatic replacement in applyTemplate

### 3. Message Types Support
- Text messages
- Image messages (URL-based)
- Video messages (URL-based)
- Flex messages (JSON)
- Carousel messages (JSON)

### 4. User Experience
- Intuitive card-based interface
- Real-time search and filtering
- Visual preview with variable substitution
- Type-specific icons and labels
- Category color coding
- Responsive design
- Loading states
- Error handling

## Categories
Predefined categories for organization:
- プロモーション (Promotion)
- お知らせ (Announcement)
- あいさつ (Greeting)
- フォローアップ (Follow-up)
- イベント (Event)
- その他 (Other)

Each category has distinct color coding for visual organization.

## Variable Replacement Logic
1. Template content stored as JSON
2. Variables marked with curly braces: `{variable_name}`
3. On application:
   - Convert content to string
   - Replace each `{variable}` with provided value
   - Parse back to JSON
4. Special handling for system variables (name, line_user_id)

## Usage Flow

### Creating a Template
1. Click "新規作成" button
2. Fill in template details
3. Select message type
4. Enter content with variables
5. Insert variables using buttons or custom input
6. Save template

### Using a Template
1. Open TemplateSelector in message creation
2. Search and select template
3. Fill in variable values (if any)
4. Template applied to message content

### Managing Templates
1. View all templates in grid layout
2. Filter by category or type
3. Search by name or description
4. Preview, edit, or delete templates

## Integration Points

### Database
- Requires Supabase migration execution
- RLS policies ensure data isolation
- Automatic timestamp management

### Message Creation Flow
- TemplateSelector can be integrated into message composition
- Variable values auto-populate for system variables
- Custom variables require user input

## File Structure
```
lme-saas/
├── app/
│   ├── actions/
│   │   └── templates.ts
│   └── dashboard/
│       └── messages/
│           └── templates/
│               └── page.tsx
├── components/
│   ├── messages/
│   │   ├── TemplateCard.tsx
│   │   ├── TemplateDialog.tsx
│   │   ├── TemplateList.tsx
│   │   ├── TemplatePreviewDialog.tsx
│   │   └── TemplateSelector.tsx
│   └── ui/
│       └── alert-dialog.tsx
├── lib/
│   └── supabase/
│       └── queries/
│           └── templates.ts
├── supabase/
│   └── migrations/
│       └── create_message_templates.sql
└── types/
    └── supabase.ts
```

## Dependencies Added
- `@radix-ui/react-alert-dialog`: Alert dialog for delete confirmation

## Next Steps
1. Run database migration in Supabase
2. Test template CRUD operations
3. Integrate TemplateSelector into message creation page
4. Add template usage analytics (optional)
5. Implement template sharing (optional)
6. Add template export/import (optional)

## Testing Checklist
- [ ] Create text template with variables
- [ ] Create image template
- [ ] Create flex/carousel template
- [ ] Edit template
- [ ] Delete template with confirmation
- [ ] Search templates
- [ ] Filter by category
- [ ] Filter by type
- [ ] Preview template with variable substitution
- [ ] Apply template in message creation
- [ ] Variable replacement accuracy
- [ ] RLS policy enforcement

## Notes
- All UI components use Heroicons (not emojis)
- Consistent with existing design system
- Mobile-responsive layouts
- Accessibility considerations (ARIA labels, keyboard navigation)
- Error boundaries and loading states
- Type-safe with TypeScript
- Server actions for all mutations

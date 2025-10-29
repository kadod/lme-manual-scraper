# Form Response Management - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interface Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Response List Page                                      │  │
│  │   /dashboard/forms/[id]/responses/page.tsx               │  │
│  │                                                            │  │
│  │   ┌────────────────┐  ┌──────────────┐  ┌─────────────┐│  │
│  │   │ ResponseStats  │  │ ResponseList │  │ ExportButton││  │
│  │   └────────────────┘  └──────────────┘  └─────────────┘│  │
│  │           │                   │                 │        │  │
│  │           │        ┌──────────┴──────────┐      │        │  │
│  │           │        │                     │      │        │  │
│  │           │   ┌────▼────────┐  ┌────────▼──────▼─┐     │  │
│  │           │   │ResponseTable│  │ResponseFilters  │     │  │
│  │           │   └─────────────┘  └─────────────────┘     │  │
│  └───────────┼──────────────────────────────────────────────┘  │
│              │                                                   │
│  ┌───────────▼──────────────────────────────────────────────┐  │
│  │   Response Detail Page                                    │  │
│  │   /dashboard/forms/[id]/responses/[responseId]/page.tsx  │  │
│  │                                                            │  │
│  │   ┌──────────────────────────────────────────────────┐  │  │
│  │   │         ResponseDetail Component                  │  │  │
│  │   │                                                    │  │  │
│  │   │  ┌─────────────┐  ┌──────────┐  ┌─────────────┐│  │  │
│  │   │  │ Respondent  │  │ Answers  │  │  Metadata   ││  │  │
│  │   │  │    Card     │  │   Card   │  │    Card     ││  │  │
│  │   │  └─────────────┘  └──────────┘  └─────────────┘│  │  │
│  │   └──────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Server Actions Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                 /app/actions/forms.ts                            │
│                                                                   │
│  ┌──────────────────┐  ┌───────────────────┐  ┌──────────────┐│
│  │ getFormResponses │  │getFormResponseById│  │ getFormStats ││
│  └──────────────────┘  └───────────────────┘  └──────────────┘│
│           │                      │                     │        │
│  ┌────────▼─────┐   ┌───────────▼──────┐   ┌─────────▼──────┐│
│  │exportToCSV   │   │deleteFormResponse│   │ Authentication ││
│  └──────────────┘   └──────────────────┘   └────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Access Layer                             │
├─────────────────────────────────────────────────────────────────┤
│               Supabase Client (SSR)                              │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │ Authentication │  │ Row Level      │  │  Query Builder   │ │
│  │    Service     │  │   Security     │  │                  │ │
│  └────────────────┘  └────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database Layer                                │
├─────────────────────────────────────────────────────────────────┤
│                    PostgreSQL (Supabase)                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  forms table                                             │   │
│  │  ├─ id (UUID, PK)                                        │   │
│  │  ├─ user_id (UUID, FK → users)                          │   │
│  │  ├─ title, description, status                          │   │
│  │  ├─ questions (JSONB)                                    │   │
│  │  └─ total_responses, response_rate                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              │ 1:N                                │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  form_responses table                                    │   │
│  │  ├─ id (UUID, PK)                                        │   │
│  │  ├─ form_id (UUID, FK → forms)                          │   │
│  │  ├─ friend_id (UUID, FK → friends)                      │   │
│  │  ├─ answers (JSONB)                                      │   │
│  │  └─ submitted_at (TIMESTAMPTZ)                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              │ N:1                                │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  friends table                                           │   │
│  │  ├─ id (UUID, PK)                                        │   │
│  │  ├─ line_user_id (TEXT)                                 │   │
│  │  ├─ display_name, picture_url                           │   │
│  │  └─ status_message                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Loading Response List

```
User Request
    │
    ▼
Response List Page
    │
    ├──────────────────────┐
    │                      │
    ▼                      ▼
getFormResponses()   getFormStats()
    │                      │
    ├──────────────────────┤
    │                      │
    ▼                      ▼
Supabase Query       Supabase Query
    │                      │
    ├──────────────────────┤
    │                      │
    ▼                      ▼
Database Read         Database Read
    │                      │
    ├──────────────────────┤
    │                      │
    ▼                      ▼
Return Data          Return Stats
    │                      │
    └──────────┬───────────┘
               │
               ▼
        Update UI State
               │
               ▼
     ┌─────────────────┐
     │ ResponseStats   │
     │ ResponseTable   │
     │ ResponseFilters │
     └─────────────────┘
```

### 2. CSV Export Flow

```
User Click Export
        │
        ▼
  ExportButton
        │
        ▼
exportResponsesToCSV(formId)
        │
        ├─── Verify Ownership
        │
        ├─── Fetch Form Schema
        │
        ├─── Fetch All Responses
        │
        ├─── Build CSV Headers
        │
        ├─── Build CSV Rows
        │         │
        │         ├─── Map Question IDs
        │         ├─── Format Answers
        │         └─── Handle Arrays
        │
        └─── Generate CSV String
               │
               ▼
        Return CSV Data
               │
               ▼
      Create Blob File
               │
               ▼
    Trigger Browser Download
```

### 3. Response Detail View

```
User Navigate to Detail
        │
        ▼
Response Detail Page
        │
        ▼
getFormResponseById(responseId)
        │
        ├─── Verify Authentication
        │
        ├─── Fetch Response with Relations:
        │         │
        │         ├─── form_responses.*
        │         ├─── friend (display_name, picture, etc)
        │         └─── form (title, questions)
        │
        └─── Verify Ownership
               │
               ▼
        Return Full Data
               │
               ▼
    ┌─────────────────────┐
    │  ResponseDetail     │
    │                     │
    │  ├─ Respondent Card │
    │  ├─ Answers Card    │
    │  └─ Metadata Card   │
    └─────────────────────┘
```

### 4. Filter and Search Flow

```
User Input Filter
        │
        ├─── Start Date
        ├─── End Date
        └─── Search Term
               │
               ▼
    ResponseFilters Component
               │
               ▼
    onFilterChange Callback
               │
               ▼
    Update State in Page
               │
               ▼
getFormResponses(formId, filters)
               │
               ├─── Apply Date Range (DB)
               └─── Apply Search (Client)
                        │
                        ▼
               Filter Response Array
                        │
                        ▼
                Update Table Display
```

## Component Hierarchy

```
Response List Page
├── ResponseStats
│   ├── Card (Total Responses)
│   ├── Card (Response Rate)
│   └── Card (Average Time)
│
└── ResponseList
    ├── ResponseFilters
    │   ├── Search Input
    │   ├── Start Date Picker
    │   │   └── Calendar Popover
    │   ├── End Date Picker
    │   │   └── Calendar Popover
    │   ├── Apply Button
    │   └── Reset Button
    │
    ├── ExportButton
    │
    ├── ResponseTable
    │   ├── Table Header
    │   │   ├── Respondent Column
    │   │   ├── Content Column
    │   │   ├── Date Column
    │   │   └── Actions Column
    │   │
    │   └── Table Body
    │       └── For Each Response:
    │           ├── Avatar + Name + LINE ID
    │           ├── Answer Preview
    │           ├── Formatted Date
    │           └── Actions Dropdown
    │               ├── View Detail (Link)
    │               └── Delete (Button)
    │
    └── Delete Confirmation Dialog

Response Detail Page
├── Back Button
├── Delete Button
├── ResponseDetail
│   ├── Respondent Information Card
│   │   ├── Large Avatar
│   │   ├── Display Name
│   │   ├── LINE User ID
│   │   ├── Status Message
│   │   └── Submission Time
│   │
│   ├── Answers Card
│   │   └── For Each Question:
│   │       ├── Question Title
│   │       ├── Question Description
│   │       ├── Question Type Badge
│   │       └── Answer Display
│   │           ├── Text (multiline)
│   │           ├── Array (badges)
│   │           ├── File (link)
│   │           └── JSON (formatted)
│   │
│   └── Metadata Card
│       ├── Response ID
│       ├── Form ID
│       ├── Friend ID
│       └── Submission Timestamp
│
└── Delete Confirmation Dialog
```

## Security Architecture

```
┌──────────────────────────────────────────────┐
│         Client Request                        │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│     Server Action (forms.ts)                 │
│                                               │
│  1. Authentication Check                     │
│     ├─ supabase.auth.getUser()              │
│     └─ Return error if not authenticated    │
│                                               │
│  2. Ownership Verification                   │
│     ├─ Fetch form with user_id check        │
│     └─ Return error if not owner            │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│     Database Query (Supabase)                │
│                                               │
│  3. Row Level Security (RLS)                 │
│     ├─ Policy: Users see own forms          │
│     ├─ Policy: Users see own responses      │
│     └─ Policy: Anyone can submit responses  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│     PostgreSQL Database                      │
│                                               │
│  4. Foreign Key Constraints                  │
│     ├─ form_id → forms.id                   │
│     ├─ friend_id → friends.id               │
│     └─ user_id → users.id                   │
│                                               │
│  5. Cascade Rules                            │
│     ├─ DELETE form → DELETE responses       │
│     └─ DELETE friend → SET NULL in responses│
└──────────────────────────────────────────────┘
```

## Performance Optimization Strategy

```
┌─────────────────────────────────────────────┐
│          Request Optimization                │
├─────────────────────────────────────────────┤
│                                              │
│  1. Parallel Fetching                       │
│     ├─ Promise.all([responses, stats])     │
│     └─ Reduces wait time by 50%            │
│                                              │
│  2. Database Indexes                        │
│     ├─ form_id (form_responses)            │
│     ├─ friend_id (form_responses)          │
│     ├─ submitted_at (form_responses)       │
│     └─ Speeds up queries by 10-100x        │
│                                              │
│  3. Client-Side Search                      │
│     ├─ Filter array after fetch            │
│     └─ Reduces database load               │
│                                              │
│  4. Selective Field Queries                │
│     ├─ Only fetch needed columns           │
│     └─ Reduces data transfer               │
└─────────────────────────────────────────────┘
```

## Error Handling Flow

```
Error Occurs
    │
    ├─── Authentication Error
    │       └─→ Redirect to login
    │
    ├─── Authorization Error
    │       └─→ Show "Access Denied" message
    │
    ├─── Database Error
    │       └─→ Log error + Show generic message
    │
    ├─── Validation Error
    │       └─→ Show specific field errors
    │
    └─── Network Error
            └─→ Show "Connection Error" + Retry option
```

## State Management

```
Response List Page State
├── responses: FormResponse[]
├── stats: FormStats
├── isLoading: boolean
├── filters: {
│   ├── startDate?: string
│   ├── endDate?: string
│   └── searchTerm?: string
│   }
└── (managed by React useState)

Response Detail Page State
├── response: FormResponse | null
├── isLoading: boolean
├── deleteDialogOpen: boolean
└── isDeleting: boolean
```

## File Dependencies

```
Response Pages
    │
    ├─── Import: Server Actions
    │       └── /app/actions/forms.ts
    │
    ├─── Import: UI Components
    │       ├── /components/ui/button
    │       ├── /components/ui/card
    │       ├── /components/ui/table
    │       ├── /components/ui/dialog
    │       └── /components/ui/...
    │
    └─── Import: Form Components
            ├── /components/forms/ResponseStats
            ├── /components/forms/ResponseTable
            ├── /components/forms/ResponseFilters
            ├── /components/forms/ExportButton
            ├── /components/forms/ResponseDetail
            └── /components/forms/ResponseList

Server Actions
    │
    ├─── Import: Supabase Client
    │       └── /lib/supabase/server
    │
    ├─── Import: Types
    │       └── /types/supabase
    │
    └─── Import: Next.js
            └── revalidatePath

Components
    │
    ├─── Import: UI Primitives
    │       └── /components/ui/*
    │
    ├─── Import: Utilities
    │       ├── /lib/utils (cn)
    │       └── date-fns (formatting)
    │
    └─── Import: Types
            └── /app/actions/forms (interfaces)
```

## Deployment Checklist

```
Pre-Deployment
├─ ✅ Run database migration
├─ ✅ Verify environment variables
├─ ✅ Test authentication flow
├─ ✅ Verify RLS policies
├─ ✅ Test CSV export encoding
└─ ✅ Check responsive design

Post-Deployment
├─ ✅ Monitor error logs
├─ ✅ Verify data is fetching
├─ ✅ Test export functionality
├─ ✅ Verify delete operations
└─ ✅ Check performance metrics
```

---

This architecture supports:
- Scalability: Handles growing data volumes
- Security: Multiple layers of protection
- Performance: Optimized queries and indexes
- Maintainability: Clear separation of concerns
- Extensibility: Easy to add features

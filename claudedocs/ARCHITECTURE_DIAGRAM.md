# Friends Import - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User Browser                                │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  /dashboard/friends/import (Next.js Page)                      │ │
│  │                                                                  │ │
│  │  ┌────────────────────────────────────────────────────────┐   │ │
│  │  │         ImportWizard (Main Orchestrator)               │   │ │
│  │  │                                                          │   │ │
│  │  │  Steps: Upload → Mapping → Preview → Import → Complete │   │ │
│  │  └────────────────────────────────────────────────────────┘   │ │
│  │                           │                                     │ │
│  │           ┌───────────────┼───────────────┐                   │ │
│  │           │               │               │                   │ │
│  │           ▼               ▼               ▼                   │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐        │ │
│  │  │FileUploader │  │ColumnMapper  │  │ImportPreview │        │ │
│  │  └─────────────┘  └──────────────┘  └──────────────┘        │ │
│  │                                           │                   │ │
│  │                                           ▼                   │ │
│  │                                  ┌─────────────────┐          │ │
│  │                                  │ImportProgress   │          │ │
│  │                                  └─────────────────┘          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                    │                                 │
│                                    │ Server Actions                  │
└────────────────────────────────────┼─────────────────────────────────┘
                                     │
                         ┌───────────┴────────────┐
                         │                        │
                         ▼                        ▼
              ┌──────────────────┐    ┌──────────────────┐
              │validateImportData│    │  importFriends   │
              └──────────────────┘    └──────────────────┘
                         │                        │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │  Supabase Database  │
                         │                     │
                         │  ┌───────────────┐ │
                         │  │ line_friends  │ │
                         │  ├───────────────┤ │
                         │  │ line_channels │ │
                         │  ├───────────────┤ │
                         │  │user_orgs      │ │
                         │  └───────────────┘ │
                         └─────────────────────┘
```

## Component Hierarchy

```
ImportPage
  └── ImportWizard
      ├── FileUploader (Step 1: Upload)
      │   └── File validation, drag & drop
      │
      ├── ColumnMapper (Step 2: Mapping)
      │   ├── Column detection
      │   ├── Auto-mapping suggestions
      │   └── Field mapping UI
      │
      ├── ImportPreview (Step 3: Preview)
      │   ├── Data validation
      │   ├── Error display
      │   └── Statistics cards
      │
      └── ImportProgress (Steps 4-5: Import & Complete)
          ├── Progress bar
          ├── Batch processing
          └── Results display
```

## Data Flow

```
┌─────────────┐
│  CSV File   │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  Client Side Parse   │  parseCSV()
│  (csv-parser.ts)     │  detectColumns()
└──────┬───────────────┘  suggestColumnMapping()
       │
       ▼
┌──────────────────────┐
│   Column Mapping     │  User confirms/adjusts
│   (ColumnMapper)     │  Required fields check
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Server Validation   │  validateImportData()
│  (Server Action)     │  Row-level validation
└──────┬───────────────┘  Duplicate detection
       │
       ▼
┌──────────────────────┐
│   Preview Display    │  Show first 10 rows
│  (ImportPreview)     │  Show errors
└──────┬───────────────┘  Show statistics
       │
       ▼ (User confirms)
┌──────────────────────┐
│   Batch Import       │  importFriends()
│  (Server Action)     │  100 rows per batch
└──────┬───────────────┘  Database inserts
       │
       ▼
┌──────────────────────┐
│  Results Display     │  Success/error counts
│  (ImportProgress)    │  Error details
└──────────────────────┘  Duplicate list
```

## State Management

```
ImportWizard State
├── currentStep: ImportStep
│   └── 'upload' | 'mapping' | 'preview' | 'import' | 'complete'
│
├── CSV Data
│   ├── fileName: string
│   ├── csvData: string[][]
│   └── columns: CSVColumn[]
│
├── Mapping
│   ├── mapping: ColumnMapping
│   └── { line_user_id: number, display_name: number, ... }
│
├── Validation
│   ├── previewData: ImportPreviewRow[]
│   └── errorCount: number
│
└── Import
    ├── isImporting: boolean
    ├── importProgress: number (0-100)
    └── importResult: ImportResult | null
```

## File Organization

```
lme-saas/
├── app/
│   ├── actions/
│   │   └── import.ts              ← Server-side logic
│   └── dashboard/
│       └── friends/
│           ├── import/
│           │   └── page.tsx       ← Import page (auth + wizard)
│           └── page.tsx           ← Friends list (with import button)
│
├── components/
│   ├── friends/
│   │   ├── ImportWizard.tsx       ← Main orchestrator
│   │   ├── FileUploader.tsx       ← Step 1 component
│   │   ├── ColumnMapper.tsx       ← Step 2 component
│   │   ├── ImportPreview.tsx      ← Step 3 component
│   │   └── ImportProgress.tsx     ← Steps 4-5 component
│   └── ui/
│       ├── progress.tsx           ← Progress bar (shadcn)
│       └── alert.tsx              ← Alert component (shadcn)
│
├── lib/
│   └── csv-parser.ts              ← CSV utilities
│
├── types/
│   └── import.ts                  ← Type definitions
│
└── public/
    └── sample-import.csv          ← Sample template
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│          Frontend (Browser)              │
├─────────────────────────────────────────┤
│ React 19                                 │
│ Next.js 16 (App Router)                 │
│ TypeScript 5                             │
│ Tailwind CSS 4                           │
│ shadcn/ui (Radix UI primitives)         │
│ Heroicons                                │
└─────────────────────────────────────────┘
                    │
                    │ Server Actions
                    ▼
┌─────────────────────────────────────────┐
│         Backend (Server)                 │
├─────────────────────────────────────────┤
│ Next.js Server Actions                   │
│ TypeScript 5                             │
│ Supabase Client (Auth + Database)       │
└─────────────────────────────────────────┘
                    │
                    │ Supabase API
                    ▼
┌─────────────────────────────────────────┐
│           Database                       │
├─────────────────────────────────────────┤
│ Supabase PostgreSQL                      │
│ Row Level Security (RLS)                 │
│ JSONB for custom fields                  │
└─────────────────────────────────────────┘
```

## Validation Pipeline

```
CSV Row → validateRow() → Check Required Fields
                         ↓
                    LINE User ID?
                    Display Name?
                         ↓
                    Check Optional Fields
                         ↓
                    Picture URL format?
                    Status value valid?
                         ↓
                    Check Custom Fields
                         ↓
                    Store unmapped columns
                         ↓
                    Check Duplicates
                         ↓
                    In CSV? In Database?
                         ↓
              ┌──────────┴──────────┐
              ▼                     ▼
         Valid Row            Invalid Row
              │                     │
              ▼                     ▼
        Queue for Import    Add to Error List
```

## Batch Processing Flow

```
Import Request
    ↓
Split into batches (100 rows each)
    ↓
For each batch:
    ├── Validate all rows
    ├── Filter valid rows
    ├── Check for database duplicates
    ├── Insert batch into database
    │   ├── Success → increment successCount
    │   └── Failure → increment errorCount
    └── Update progress (0-100%)
    ↓
Aggregate results
    ├── Total rows
    ├── Success count
    ├── Error count
    ├── Error details
    └── Duplicate list
    ↓
Return ImportResult
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│           User Request                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │ Authentication│  Supabase Auth
         │    Check      │  getUser()
         └───────┬───────┘
                 │ ✓ Authenticated
                 ▼
         ┌──────────────┐
         │ Authorization │  Check organization
         │    Check      │  membership
         └───────┬───────┘
                 │ ✓ Has access
                 ▼
         ┌──────────────┐
         │ Validation    │  Server-side
         │    Layer      │  validation
         └───────┬───────┘
                 │ ✓ Valid data
                 ▼
         ┌──────────────┐
         │   Database    │  RLS policies
         │   Operation   │  enforced
         └───────┬───────┘
                 │ ✓ Success
                 ▼
         ┌──────────────┐
         │   Response    │  Sanitized data
         │    Return     │  returned
         └───────────────┘
```

## Error Handling Flow

```
Error Occurs
    │
    ├── Client-Side Error
    │   ├── File validation error
    │   ├── Required field missing
    │   └── Display error alert
    │
    └── Server-Side Error
        ├── Validation error
        │   ├── Collect all errors
        │   ├── Associate with row number
        │   └── Return error list
        │
        ├── Database error
        │   ├── Rollback batch
        │   ├── Log error
        │   └── Add to error count
        │
        └── Network error
            ├── Show retry option
            └── Maintain state
```

## Performance Optimization

```
┌─────────────────────────────────────────┐
│        Performance Strategy              │
├─────────────────────────────────────────┤
│                                          │
│  Client-Side                             │
│  ├── Parse CSV locally (no upload)      │
│  ├── Show preview of 10 rows only       │
│  └── Batch UI updates                   │
│                                          │
│  Server-Side                             │
│  ├── Process 100 rows per batch         │
│  ├── Use Supabase batch insert          │
│  └── Stream progress updates            │
│                                          │
│  Database                                │
│  ├── Index on line_user_id              │
│  ├── Index on channel_id                │
│  └── JSONB for flexible schema          │
│                                          │
└─────────────────────────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────┐
│    Friends Import Feature Integration    │
├─────────────────────────────────────────┤
│                                          │
│  Entry Points                            │
│  └── Friends List → [CSV Import] button │
│                                          │
│  Database Tables                         │
│  ├── line_friends (insert)              │
│  ├── line_channels (read)               │
│  └── user_organizations (read)          │
│                                          │
│  Authentication                          │
│  ├── Supabase Auth (getUser)            │
│  └── RLS policies (enforced)            │
│                                          │
│  Exit Points                             │
│  └── Import Complete → Friends List     │
│                                          │
└─────────────────────────────────────────┘
```

## Scaling Considerations

```
Current Implementation (100k rows max)
    ├── File size: 50 MB max
    ├── Batch size: 100 rows
    └── Processing time: ~16 min for 100k rows

Future Scaling (1M+ rows)
    ├── Background job processing
    ├── Queue system (Bull/BullMQ)
    ├── Email notification on completion
    ├── Progress polling endpoint
    └── Resume capability
```

---

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Scalable batch processing
- ✅ Comprehensive error handling
- ✅ Type-safe implementation
- ✅ Security by default
- ✅ Performance optimization
- ✅ User-friendly UI/UX

**Last Updated**: 2025-10-29

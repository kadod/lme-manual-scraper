# Friends Import - Quick Start Guide

## For End Users

### How to Import Friends from CSV

1. **Navigate to Import Page**
   ```
   Dashboard → Friends → [CSV Import] button
   ```

2. **Prepare Your CSV File**
   - Required columns: `line_user_id`, `display_name`
   - Optional columns: `picture_url`, `language`, `status`
   - Any additional columns will be saved as custom fields
   - Example file: `/public/sample-import.csv`

3. **Upload File**
   - Drag & drop CSV file OR
   - Click to select file
   - Max 50MB, 100,000 rows

4. **Map Columns**
   - Review auto-suggested mappings
   - Ensure required fields are mapped:
     - LINE User ID (required)
     - Display Name (required)
   - Adjust optional fields as needed

5. **Preview Data**
   - Check first 10 rows
   - Review validation errors (if any)
   - Fix CSV and re-upload if needed

6. **Import**
   - Click "Start Import"
   - Wait for completion
   - Review results

7. **Complete**
   - View success/error counts
   - Check error details if any
   - Click "Complete" to return to friends list

### CSV Format Examples

**Minimal CSV (required fields only)**
```csv
line_user_id,display_name
U1234567890abcdef,田中太郎
U2345678901abcdef,佐藤花子
```

**Full CSV (with all fields)**
```csv
line_user_id,display_name,picture_url,language,status,company,department
U1234567890abcdef,田中太郎,https://example.com/pic1.jpg,ja,active,ABC株式会社,営業部
U2345678901abcdef,佐藤花子,https://example.com/pic2.jpg,en,active,XYZ Corp,Marketing
```

### Common Errors and Solutions

**Error**: "LINE User IDは必須です"
- **Solution**: Ensure `line_user_id` column is mapped and has values

**Error**: "表示名は必須です"
- **Solution**: Ensure `display_name` column is mapped and has values

**Error**: "LINE User IDが重複しています"
- **Solution**: Remove duplicate rows from CSV or skip duplicates

**Error**: "このLINE User IDは既に登録されています"
- **Solution**: Remove already-imported LINE User IDs from CSV

**Error**: "URLの形式が正しくありません"
- **Solution**: Ensure `picture_url` starts with http:// or https://

**Error**: "ステータスは active, blocked, unsubscribed のいずれかです"
- **Solution**: Use only valid status values

## For Developers

### Quick Integration

1. **Install Dependencies** (already done)
   ```bash
   npm install @radix-ui/react-progress
   npm install @radix-ui/react-scroll-area
   ```

2. **Files to Know**
   - Main page: `/app/dashboard/friends/import/page.tsx`
   - Wizard: `/components/friends/ImportWizard.tsx`
   - Actions: `/app/actions/import.ts`
   - Parser: `/lib/csv-parser.ts`
   - Types: `/types/import.ts`

3. **Key Functions**
   ```typescript
   // CSV parsing
   import { parseCSV, detectColumns, suggestColumnMapping } from '@/lib/csv-parser'

   // Server actions
   import { validateImportData, importFriends } from '@/app/actions/import'

   // Types
   import { ImportStep, ColumnMapping, ImportResult } from '@/types/import'
   ```

### Customization Examples

**Change batch size**
```typescript
// In /app/actions/import.ts
const BATCH_SIZE = 100 // Change to desired batch size
```

**Add custom validation**
```typescript
// In /app/actions/import.ts > validateRow()
if (data.email && !isValidEmail(data.email)) {
  errors.push({
    row: rowIndex,
    column: 'email',
    message: 'Invalid email format',
  })
}
```

**Add new field mapping**
```typescript
// In /components/friends/ColumnMapper.tsx
const OPTIONAL_FIELDS = [
  'picture_url',
  'language',
  'status',
  'email', // Add new field
] as const

const FIELD_LABELS = {
  // ... existing labels
  email: {
    label: 'Email',
    description: 'User email address (optional)',
  },
}
```

### Testing Locally

1. **Start dev server**
   ```bash
   cd /path/to/lme-saas
   npm run dev
   ```

2. **Navigate to**
   ```
   http://localhost:3000/dashboard/friends/import
   ```

3. **Use sample file**
   ```
   /public/sample-import.csv
   ```

### Troubleshooting

**Build fails with Turbopack error**
- Move project to path without Japanese characters
- Or wait for Next.js fix

**Type errors in IDE**
- Regenerate Supabase types:
  ```bash
  npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
  ```

**Import not working**
- Check Supabase connection
- Verify `line_channels` table has active channel
- Check browser console for errors

**Progress stuck at 95%**
- This is normal - waiting for final batch
- Progress simulation stops at 95% until completion

## URL Routes

- **Friends List**: `/dashboard/friends`
- **Import Page**: `/dashboard/friends/import`
- **Sample CSV**: `/sample-import.csv`

## Component Hierarchy

```
ImportPage
└── ImportWizard
    ├── FileUploader (Step 1)
    ├── ColumnMapper (Step 2)
    ├── ImportPreview (Step 3)
    └── ImportProgress (Steps 4-5)
```

## State Flow

```
ImportWizard manages:
- currentStep: 'upload' | 'mapping' | 'preview' | 'import' | 'complete'
- csvData: string[][]
- columns: CSVColumn[]
- mapping: ColumnMapping
- previewData: ImportPreviewRow[]
- importResult: ImportResult
```

## API Endpoints

All operations use Server Actions (no REST API):
- `validateImportData(csvData, mapping)`
- `importFriends(csvData, mapping, orgId, channelId)`

## Performance Tips

**For large files (50k+ rows)**:
- Use batch size 100 (default)
- Expect ~16 minutes for 100k rows
- Consider background job for very large imports (future enhancement)

**For better UX**:
- Show progress updates every 200ms
- Keep preview to 10 rows
- Stream results instead of loading all at once

## Security Checklist

- ✅ Server-side validation
- ✅ Authentication required
- ✅ Organization scope enforced
- ✅ RLS policies applied
- ✅ SQL injection prevented
- ✅ File size limits enforced

## Quick Links

- [Detailed Documentation](./friends-import-implementation.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Sample CSV](/public/sample-import.csv)

---

**Last Updated**: 2025-10-29
**Status**: Production Ready

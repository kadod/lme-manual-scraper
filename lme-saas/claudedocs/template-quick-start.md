# Template System Quick Start Guide

## Setup Instructions

### 1. Run Database Migration

Access your Supabase dashboard and run the migration:

```sql
-- File: supabase/migrations/create_message_templates.sql
-- Copy and execute the entire file in Supabase SQL Editor
```

Or if using Supabase CLI:
```bash
supabase db push
```

### 2. Verify Database Setup

Check that the table was created:
```sql
SELECT * FROM message_templates LIMIT 1;
```

### 3. Start Development Server

```bash
cd /Users/kadotani/Documents/開発プロジェクト/GitHub/lme-manual-scraper/lme-saas
npm run dev
```

### 4. Access Templates Page

Navigate to: `http://localhost:3000/dashboard/messages/templates`

## Testing Checklist

### Basic CRUD Operations

#### Create Text Template
1. Click "新規作成" button
2. Fill in:
   - Name: "ウェルカムメッセージ"
   - Category: "あいさつ"
   - Description: "新規登録ユーザー向け"
   - Type: "テキスト"
   - Content: "こんにちは {name}さん！ご登録ありがとうございます。"
3. Insert variable by clicking `{name}` button
4. Click "保存"
5. Verify card appears in list

#### Create Image Template
1. Click "新規作成"
2. Fill in:
   - Name: "キャンペーンバナー"
   - Category: "プロモーション"
   - Type: "画像"
   - Original URL: `https://example.com/image.jpg`
   - Preview URL: `https://example.com/preview.jpg`
3. Click "保存"

#### Edit Template
1. Click pencil icon on any template card
2. Modify name or content
3. Click "保存"
4. Verify changes reflected

#### Preview Template
1. Click "プレビュー" button on template card
2. Verify preview modal opens
3. Enter variable values if template has variables
4. Check "JSON" tab to see raw content
5. Close modal

#### Delete Template
1. Click trash icon on template card
2. Confirm deletion in alert dialog
3. Verify template removed from list

### Search and Filter

#### Search
1. Type in search box: "ウェルカム"
2. Verify only matching templates show
3. Clear search

#### Category Filter
1. Select "あいさつ" from category dropdown
2. Verify only greeting templates show
3. Select "すべてのカテゴリ"

#### Type Filter
1. Select "テキスト" from type dropdown
2. Verify only text templates show
3. Select "すべてのタイプ"

### Variable System

#### Test Variable Insertion
1. Create new template
2. Click `{name}` button
3. Verify `{name}` inserted at cursor position
4. Add custom variable:
   - Type "birthday" in custom variable input
   - Click "追加"
   - Verify badge appears

#### Test Variable Preview
1. Open preview for template with variables
2. Change variable value inputs
3. Verify preview updates in real-time

### Message Types

#### Flex Message Template
1. Create template with type "Flexメッセージ"
2. Enter JSON content:
```json
{
  "altText": "Flex Message",
  "contents": {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "Hello {name}!",
          "weight": "bold",
          "size": "xl"
        }
      ]
    }
  }
}
```
3. Save and preview

#### Carousel Template
1. Create template with type "カルーセル"
2. Enter JSON with multiple items
3. Preview shows JSON (visual preview not implemented)

## Common Issues

### Template Not Appearing
- Check browser console for errors
- Verify user is authenticated
- Check database RLS policies are active

### Variable Not Replacing
- Ensure variable uses curly braces: `{name}`
- Verify variable is in template's variables array
- Check variable name matches exactly

### Preview Not Loading
- Check browser console
- Verify template content is valid JSON for flex/carousel
- Check image URLs are accessible for image/video types

### Delete Not Working
- Verify you own the template (user_id matches)
- Check RLS policies in Supabase

## Advanced Usage

### Using Template in Message Creation

To integrate TemplateSelector in your message creation flow:

```tsx
import { TemplateSelector } from '@/components/messages/TemplateSelector'
import { getTemplates, applyTemplate } from '@/app/actions/templates'

export default function MessageCreationPage() {
  const [templates, setTemplates] = useState([])
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [messageContent, setMessageContent] = useState(null)

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      const result = await getTemplates()
      if (result.success) {
        setTemplates(result.data)
      }
    }
    loadTemplates()
  }, [])

  // Handle template selection
  const handleTemplateSelect = async (template, variableValues) => {
    const result = await applyTemplate({
      templateId: template.id,
      variableValues
    })

    if (result.success) {
      setMessageContent(result.data.content)
    }
  }

  return (
    <div>
      <Button onClick={() => setSelectorOpen(true)}>
        テンプレートから選択
      </Button>

      <TemplateSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        templates={templates}
        onSelect={handleTemplateSelect}
      />

      {/* Your message form here */}
    </div>
  )
}
```

### Custom Variable Population

For system variables that auto-populate during sending:
- `{name}` - Will be replaced with friend's display_name from database
- `{line_user_id}` - Will be replaced with friend's line_user_id

For custom variables:
- Must be provided when applying template
- Can be populated from friend metadata: `{custom_birthday}` → `friend.metadata.birthday`

### Category Customization

To add more categories, edit:
```tsx
// components/messages/TemplateDialog.tsx
const CATEGORIES = [
  'プロモーション',
  'お知らせ',
  'あいさつ',
  'フォローアップ',
  'イベント',
  'その他',
  'YOUR_NEW_CATEGORY', // Add here
]

// Also update color mapping in TemplateCard.tsx
const CATEGORY_COLORS = {
  // ... existing colors
  'YOUR_NEW_CATEGORY': 'bg-orange-100 text-orange-800 border-orange-200',
}
```

## Sample Templates

### Welcome Message (Text)
```
Name: 新規登録ウェルカム
Category: あいさつ
Type: テキスト
Content:
{name}さん、ご登録ありがとうございます！
あなたのLINE ID: {line_user_id}

今後、お得な情報をお届けします。
お楽しみに！
```

### Birthday Greeting (Text)
```
Name: 誕生日おめでとう
Category: あいさつ
Type: テキスト
Variables: name, birthday
Content:
{name}さん、お誕生日おめでとうございます！
{birthday}を迎えられましたね。
素敵な一年になりますように！
```

### Sale Notification (Image)
```
Name: セール告知バナー
Category: プロモーション
Type: 画像
Original URL: https://your-domain.com/sale-banner.jpg
Preview URL: https://your-domain.com/sale-banner-preview.jpg
```

## Troubleshooting

### Build Errors
If you encounter Turbopack errors with Japanese characters in path:
- This is a known Next.js issue
- Workaround: Move project to path without Japanese characters
- Or: Use webpack instead of turbopack (modify next.config)

### Type Errors
If you see TypeScript errors about table types:
- Run: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts`
- Or: Manually ensure message_templates is in types

### RLS Policy Issues
If templates don't show despite being in database:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'message_templates';

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'message_templates';

-- Test policy for current user
SELECT * FROM message_templates WHERE user_id = auth.uid();
```

## Support

For issues or questions:
1. Check browser console for errors
2. Check Supabase logs
3. Review implementation documentation in `/claudedocs/message-templates-implementation.md`
4. Verify database migration was applied correctly

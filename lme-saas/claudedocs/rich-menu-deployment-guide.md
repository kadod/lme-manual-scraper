# Rich Menu Deployment Implementation Guide

## Overview

LINE Rich Menu API連携とデプロイ機能の実装が完了しました。

## Implemented Files

### 1. LINE Rich Menu API Client
**Location**: `/lib/line/rich-menu-api.ts`

**Features**:
- `createRichMenu()` - Rich Menu作成
- `uploadRichMenuImage()` - 画像アップロード
- `setDefaultRichMenu()` - デフォルト設定
- `deleteRichMenu()` - Rich Menu削除
- `linkRichMenuToUser()` - ユーザーへの紐付け
- `unlinkRichMenuFromUser()` - ユーザーからの解除
- `getRichMenu()` - Rich Menu詳細取得
- `listRichMenus()` - Rich Menu一覧取得

**Usage Example**:
```typescript
import { createRichMenuClient } from '@/lib/line/rich-menu-api'

const client = createRichMenuClient()

// Create Rich Menu
const { richMenuId } = await client.createRichMenu({
  size: { width: 2500, height: 1686 },
  selected: true,
  name: 'Main Menu',
  chatBarText: 'Menu',
  areas: [
    {
      bounds: { x: 0, y: 0, width: 1250, height: 843 },
      action: { type: 'message', text: 'Option 1' }
    }
  ]
})

// Upload image
const imageBuffer = await downloadImage('https://example.com/image.png')
await client.uploadRichMenuImage(richMenuId, imageBuffer)

// Set as default
await client.setDefaultRichMenu(richMenuId)
```

### 2. Database Queries
**Location**: `/lib/supabase/queries/rich-menus.ts`

**Features**:
- `getRichMenus()` - Rich Menu一覧取得（フィルタ対応）
- `getRichMenuById()` - ID指定取得
- `getRichMenuAreas()` - エリア情報取得
- `createRichMenu()` - 作成
- `updateRichMenu()` - 更新
- `deleteRichMenu()` - 削除
- `updateLineRichMenuId()` - LINE ID更新
- `updateRichMenuStatus()` - ステータス更新
- `getPublishedRichMenus()` - 公開中一覧
- `getRichMenuCount()` - 件数取得

**Usage Example**:
```typescript
import { RichMenusQueries } from '@/lib/supabase/queries/rich-menus'

const queries = new RichMenusQueries(supabase)

// Get all rich menus
const result = await queries.getRichMenus(userId, {
  status: 'published',
  searchQuery: 'menu',
  limit: 10
})

// Get with areas
const richMenu = await queries.getRichMenuById(richMenuId, userId)
console.log(richMenu.data.areas)
```

### 3. Edge Function: deploy-rich-menu
**Location**: `/supabase/functions/deploy-rich-menu/index.ts`

**Features**:
- Rich Menuデータ取得
- LINE APIでRich Menu作成
- 画像ダウンロード&アップロード
- デフォルト設定（オプション）
- データベース更新

**Request**:
```json
{
  "richMenuId": "uuid",
  "setAsDefault": true
}
```

**Response**:
```json
{
  "success": true,
  "lineRichMenuId": "richmenu-xxx"
}
```

**Deployment**:
```bash
# Deploy edge function
supabase functions deploy deploy-rich-menu

# Set environment variables
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=your_token
```

### 4. Server Actions
**Location**: `/app/actions/rich-menus.ts`

**New Functions**:
- `deployRichMenu()` - Edge Function経由でデプロイ
- `setAsDefault()` - デフォルト設定
- `undeployRichMenu()` - LINEから削除&非公開化
- `linkRichMenuToUser()` - 特定ユーザーに紐付け
- `unlinkRichMenuFromUser()` - ユーザーから解除

**Usage Example**:
```typescript
import { deployRichMenu, setAsDefault } from '@/app/actions/rich-menus'

// Deploy rich menu
const result = await deployRichMenu({
  richMenuId: 'uuid',
  setAsDefault: true
})

if (result.success) {
  console.log('Deployed:', result.lineRichMenuId)
}

// Link to specific user
await linkRichMenuToUser('uuid', 'U123456789')
```

## Workflow

### 1. Create Rich Menu
```typescript
// 1. Create in database
const richMenu = await createRichMenu({
  name: 'Main Menu',
  chat_bar_text: 'Menu',
  size: { width: 2500, height: 1686 },
  selected: true,
  image_url: 'https://storage.example.com/menu.png',
  status: 'draft'
})

// 2. Create areas
await createRichMenuAreas(richMenu.id, [
  {
    bounds: { x: 0, y: 0, width: 1250, height: 843 },
    action: { type: 'message', text: 'Option 1' }
  }
])
```

### 2. Deploy to LINE
```typescript
// Deploy using edge function
const result = await deployRichMenu({
  richMenuId: richMenu.id,
  setAsDefault: false
})

if (result.success) {
  // line_rich_menu_id is now saved in database
  // status is updated to 'published'
}
```

### 3. Set as Default
```typescript
// Set as default for all users
await setAsDefault(richMenu.id)

// Or link to specific user
await linkRichMenuToUser(richMenu.id, lineUserId)
```

### 4. Undeploy
```typescript
// Remove from LINE and set status to 'draft'
await undeployRichMenu(richMenu.id)
```

## Database Schema

Rich Menusテーブルに必要なカラム:
- `line_rich_menu_id` (text, nullable) - LINE APIから返されるID
- `status` (text) - 'draft' | 'published' | 'archived'
- `image_url` (text) - Rich Menu画像のURL
- `size` (jsonb) - { width, height }
- `selected` (boolean) - 初期表示状態
- `name` (text) - Rich Menu名
- `chat_bar_text` (text) - チャットバーテキスト

Rich Menu Areasテーブル:
- `rich_menu_id` (uuid, FK) - Rich Menu ID
- `bounds` (jsonb) - { x, y, width, height }
- `action` (jsonb) - アクションオブジェクト

## Environment Variables

Required for Edge Function:
```bash
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

Required for Next.js:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
```

## Error Handling

All functions return standardized error responses:

```typescript
interface DeployResult {
  success: boolean
  lineRichMenuId?: string
  error?: string
}
```

Common errors:
- "User not authenticated" - ログインが必要
- "Rich Menu not found" - 存在しないID
- "Rich Menu not deployed" - LINEに未デプロイ
- "LINE credentials not configured" - 認証情報未設定

## Testing

```typescript
// Test deployment
const testRichMenu = {
  name: 'Test Menu',
  chat_bar_text: 'Test',
  size: { width: 2500, height: 1686 },
  selected: true,
  image_url: 'https://example.com/test.png',
  status: 'draft'
}

const created = await createRichMenu(testRichMenu)
const deployed = await deployRichMenu({
  richMenuId: created.id,
  setAsDefault: false
})

console.assert(deployed.success === true)
console.assert(deployed.lineRichMenuId !== undefined)
```

## Next Steps

1. フロントエンド実装:
   - Rich Menu一覧ページ
   - Rich Menu作成/編集フォーム
   - デプロイボタン
   - デフォルト設定UI

2. 画像管理:
   - Supabase Storageへのアップロード
   - 画像サイズ検証（2500x1686 or 2500x843）
   - プレビュー機能

3. テンプレート機能:
   - Rich Menuテンプレート保存
   - テンプレートからの作成

4. 分析機能:
   - タップ数の追跡
   - ユーザー行動分析

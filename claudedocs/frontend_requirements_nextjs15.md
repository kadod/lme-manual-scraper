# L Message SaaS フロントエンド要件定義書

**作成日**: 2025-10-29
**技術スタック**: Next.js 15 + React 19 + shadcn/ui + TypeScript
**対象**: LINE公式アカウント拡張ツール「L Message（エルメ）」

---

## 目次

1. [技術スタック詳細](#1-技術スタック詳細)
2. [画面設計全体像](#2-画面設計全体像)
3. [Next.js 15 App Router構成](#3-nextjs-15-app-router構成)
4. [shadcn/ui コンポーネント戦略](#4-shadcnui-コンポーネント戦略)
5. [状態管理・データフェッチング](#5-状態管理データフェッチング)
6. [レイアウト・UI設計](#6-レイアウトui設計)
7. [パフォーマンス最適化](#7-パフォーマンス最適化)
8. [アクセシビリティ対応](#8-アクセシビリティ対応)
9. [実装優先順位](#9-実装優先順位)

---

## 1. 技術スタック詳細

### 1.1 コア技術（Next.js 15の最新機能を活用）

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.3.0"
  }
}
```

**Next.js 15の主要機能**:
- **React 19対応**: React Compiler、Actions、Suspense強化
- **Turbopack（安定版）**: 高速ビルド・HMR
- **Partial Prerendering (PPR)**: 静的シェル + 動的コンテンツ
- **Server Actions強化**: フォーム、楽観的更新、キャッシュ制御
- **並列ルート**: 複数ビューの並行レンダリング
- **Async Request APIs**: headers(), cookies() の非同期化

### 1.2 UIフレームワーク

**shadcn/ui**:
- Radix UI ベース（アクセシビリティ組み込み）
- TailwindCSS 3.4+ 統合
- TypeScript フルサポート
- コンポーネントカスタマイズ容易

**必須shadcn/uiコンポーネント**:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add command
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add skeleton
```

### 1.3 追加ライブラリ

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.10.0",
    "zustand": "^4.4.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.0",
    "framer-motion": "^11.0.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "tiptap": "^2.1.0",
    "react-color": "^2.19.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0"
  }
}
```

**目的別ライブラリ選定**:
| 用途 | ライブラリ | 理由 |
|------|-----------|------|
| データフェッチ | TanStack Query | キャッシュ、楽観的更新、自動リフェッチ |
| テーブル | TanStack Table | ソート、フィルタ、ページネーション |
| グローバル状態 | Zustand | 軽量、TypeScript、DevTools |
| フォーム | React Hook Form + Zod | バリデーション、型安全 |
| 日付 | date-fns | 軽量、ツリーシェイク |
| グラフ | Recharts | レスポンシブ、カスタマイズ可 |
| アニメーション | Framer Motion | パフォーマンス、宣言的 |
| ドラッグ&ドロップ | DnD Kit | アクセシブル、モジュラー |
| リッチエディタ | Tiptap | カスタマイズ、拡張性 |

---

## 2. 画面設計全体像

### 2.1 メイン画面リスト（全30画面）

#### 認証・オンボーディング（3画面）
1. `/login` - ログイン
2. `/signup` - 新規登録
3. `/onboarding` - 初期設定ウィザード

#### ダッシュボード（1画面）
4. `/dashboard` - 総合ダッシュボード

#### 顧客対応（4画面）
5. `/chat` - 1:1チャット
6. `/chat/[conversationId]` - チャット詳細
7. `/customers` - 顧客リスト
8. `/customers/[customerId]` - 顧客詳細

#### メッセージ配信（6画面）
9. `/messages` - メッセージ一覧
10. `/messages/create` - メッセージ作成
11. `/messages/[id]` - メッセージ編集
12. `/messages/step` - ステップ配信一覧
13. `/messages/step/create` - ステップ配信作成
14. `/messages/broadcast` - 一斉配信

#### フォーム（3画面）
15. `/forms` - フォーム一覧
16. `/forms/create` - フォーム作成
17. `/forms/[id]` - フォーム編集

#### リッチメニュー（3画面）
18. `/rich-menu` - リッチメニュー一覧
19. `/rich-menu/create` - リッチメニュー作成
20. `/rich-menu/[id]` - リッチメニュー編集

#### 情報管理（3画面）
21. `/tags` - タグ管理
22. `/segments` - セグメント管理
23. `/friend-info` - 友だち情報フィールド管理

#### 予約管理（3画面）
24. `/reservations` - 予約一覧
25. `/reservations/calendar` - 予約カレンダー
26. `/reservations/settings` - 予約設定

#### データ分析（4画面）
27. `/analytics` - 総合分析
28. `/analytics/messages` - メッセージ分析
29. `/analytics/forms` - フォーム分析
30. `/analytics/cross` - クロス分析

#### システム設定（1画面）
31. `/settings` - システム設定

---

## 3. Next.js 15 App Router構成

### 3.1 ディレクトリ構造

```
/app
  /(auth)                          # 認証グループ（レイアウト共有）
    /login
      /page.tsx                    # ログイン画面
    /signup
      /page.tsx                    # 新規登録画面
    /onboarding
      /page.tsx                    # オンボーディング
    /layout.tsx                    # 認証レイアウト（中央配置）

  /(dashboard)                     # ダッシュボードグループ（メインレイアウト）
    /dashboard
      /page.tsx                    # ダッシュボード
      /loading.tsx                 # ローディング
    /chat
      /page.tsx                    # チャット一覧
      /[conversationId]
        /page.tsx                  # チャット詳細
      /@sidebar                    # 並列ルート: チャットサイドバー
        /page.tsx
    /customers
      /page.tsx                    # 顧客リスト
      /[customerId]
        /page.tsx                  # 顧客詳細
        /@tabs                     # 並列ルート: 顧客タブ
          /page.tsx
    /messages
      /page.tsx                    # メッセージ一覧
      /create
        /page.tsx                  # メッセージ作成
      /[id]
        /page.tsx                  # メッセージ編集
      /step
        /page.tsx                  # ステップ配信一覧
        /create
          /page.tsx
      /broadcast
        /page.tsx                  # 一斉配信
    /forms
      /page.tsx                    # フォーム一覧
      /create
        /page.tsx                  # フォーム作成
      /[id]
        /page.tsx                  # フォーム編集
        /@preview                  # 並列ルート: プレビュー
          /page.tsx
    /rich-menu
      /page.tsx                    # リッチメニュー一覧
      /create
        /page.tsx                  # リッチメニュー作成
      /[id]
        /page.tsx                  # リッチメニュー編集
    /tags
      /page.tsx                    # タグ管理
    /segments
      /page.tsx                    # セグメント管理
    /friend-info
      /page.tsx                    # 友だち情報フィールド管理
    /reservations
      /page.tsx                    # 予約一覧
      /calendar
        /page.tsx                  # 予約カレンダー
      /settings
        /page.tsx                  # 予約設定
    /analytics
      /page.tsx                    # 総合分析
      /messages
        /page.tsx                  # メッセージ分析
      /forms
        /page.tsx                  # フォーム分析
      /cross
        /page.tsx                  # クロス分析
    /settings
      /page.tsx                    # システム設定
    /layout.tsx                    # ダッシュボードレイアウト（サイドバー+ヘッダー）

  /api
    /auth
      /[...nextauth]
        /route.ts                  # NextAuth エンドポイント
    /webhooks
      /line
        /route.ts                  # LINE Webhook
    /messages
      /route.ts                    # メッセージAPI
    /forms
      /route.ts                    # フォームAPI
    /analytics
      /route.ts                    # 分析API

  /layout.tsx                      # ルートレイアウト
  /globals.css                     # グローバルスタイル
  /error.tsx                       # エラーページ
  /not-found.tsx                   # 404ページ
```

### 3.2 Next.js 15 主要機能の活用

#### 3.2.1 Partial Prerendering (PPR)

```typescript
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react'

export const experimental_ppr = true

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 静的シェル: 即座に表示 */}
      <div className="col-span-4">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
      </div>

      {/* 動的コンテンツ: ストリーミング */}
      <Suspense fallback={<MetricsCardSkeleton />}>
        <MetricsCard />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <RecentMessagesChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentCustomersTable />
      </Suspense>
    </div>
  )
}
```

#### 3.2.2 Server Actions（フォーム送信）

```typescript
// app/(dashboard)/messages/create/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const messageSchema = z.object({
  title: z.string().min(1, '件名は必須です'),
  content: z.string().min(1, 'メッセージは必須です'),
  scheduleAt: z.date().optional(),
})

export async function createMessage(formData: FormData) {
  const validatedFields = messageSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    scheduleAt: formData.get('scheduleAt'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, content, scheduleAt } = validatedFields.data

  // Supabaseへの保存
  const { data, error } = await supabase
    .from('messages')
    .insert({ title, content, schedule_at: scheduleAt })
    .select()
    .single()

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  revalidatePath('/messages')
  redirect(`/messages/${data.id}`)
}
```

```typescript
// app/(dashboard)/messages/create/page.tsx
import { createMessage } from './actions'

export default function CreateMessagePage() {
  return (
    <form action={createMessage}>
      {/* フォームフィールド */}
    </form>
  )
}
```

#### 3.2.3 並列ルート（チャット画面）

```typescript
// app/(dashboard)/chat/layout.tsx
export default function ChatLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode
  sidebar: React.ReactNode
}) {
  return (
    <div className="flex h-full">
      {/* サイドバー: 会話リスト */}
      <aside className="w-80 border-r">{sidebar}</aside>
      {/* メインコンテンツ: チャット */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

#### 3.2.4 Async Request APIs

```typescript
// app/(dashboard)/layout.tsx
import { cookies } from 'next/headers'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Next.js 15: cookies() は非同期
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'light'

  return (
    <div className={theme}>
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

---

## 4. shadcn/ui コンポーネント戦略

### 4.1 画面別コンポーネントマッピング

#### 4.1.1 ダッシュボード (`/dashboard`)

**使用コンポーネント**:
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
```

**カスタムコンポーネント**:
- `MetricsCard`: KPI表示（配信数、顧客数、開封率、CTR）
- `RecentMessagesChart`: Recharts統合
- `RecentCustomersTable`: TanStack Table統合
- `QuickActions`: よく使う操作のショートカット

**レイアウト例**:
```tsx
<div className="flex-1 space-y-4 p-8 pt-6">
  <div className="flex items-center justify-between space-y-2">
    <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
    <div className="flex items-center space-x-2">
      <Button>新規メッセージ</Button>
    </div>
  </div>
  <Tabs defaultValue="overview" className="space-y-4">
    <TabsList>
      <TabsTrigger value="overview">概要</TabsTrigger>
      <TabsTrigger value="analytics">分析</TabsTrigger>
    </TabsList>
    <TabsContent value="overview" className="space-y-4">
      {/* メトリクスカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard title="総配信数" value="12,345" />
        <MetricsCard title="アクティブ顧客" value="1,234" />
        <MetricsCard title="開封率" value="45.2%" />
        <MetricsCard title="CTR" value="12.8%" />
      </div>
      {/* グラフとテーブル */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>配信パフォーマンス</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RecentMessagesChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>最近の顧客</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentCustomersTable />
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  </Tabs>
</div>
```

#### 4.1.2 メッセージ作成 (`/messages/create`)

**使用コンポーネント**:
```typescript
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
```

**カスタムコンポーネント**:
- `MessageEditor`: Tiptap統合リッチエディタ
- `MediaUploader`: ドラッグ&ドロップ画像アップロード
- `EmojiPicker`: 絵文字選択
- `PreviewPane`: メッセージプレビュー（LINEスタイル）

**フォーム構成**:
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
    {/* メッセージタイプ選択 */}
    <Tabs defaultValue="text">
      <TabsList>
        <TabsTrigger value="text">テキスト</TabsTrigger>
        <TabsTrigger value="image">画像</TabsTrigger>
        <TabsTrigger value="card">カード</TabsTrigger>
        <TabsTrigger value="flex">Flex Message</TabsTrigger>
      </TabsList>
      <TabsContent value="text" className="space-y-4">
        {/* テキストメッセージフォーム */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>件名</FormLabel>
              <FormControl>
                <Input placeholder="メッセージの件名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メッセージ</FormLabel>
              <FormControl>
                <MessageEditor {...field} />
              </FormControl>
              <FormDescription>
                最大500文字まで入力できます
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>
    </Tabs>

    {/* 配信設定 */}
    <div className="space-y-4">
      <h3 className="text-lg font-medium">配信設定</h3>
      <FormField
        control={form.control}
        name="scheduleAt"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>配信日時</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline">
                    {field.value ? format(field.value, 'PPP') : '即時配信'}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    {/* 送信ボタン */}
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline">下書き保存</Button>
      <Button type="submit">配信する</Button>
    </div>
  </form>
</Form>
```

#### 4.1.3 顧客リスト (`/customers`)

**使用コンポーネント**:
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
```

**TanStack Table統合**:
```tsx
const columns: ColumnDef<Customer>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: 'name',
    header: '顧客名',
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={row.original.avatar} />
          <AvatarFallback>{row.original.name[0]}</AvatarFallback>
        </Avatar>
        <span>{row.getValue('name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'tags',
    header: 'タグ',
    cell: ({ row }) => (
      <div className="flex gap-1">
        {row.getValue<string[]>('tags').map((tag) => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'lastContact',
    header: '最終接触日',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">...</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>編集</DropdownMenuItem>
          <DropdownMenuItem>メッセージ送信</DropdownMenuItem>
          <DropdownMenuItem>削除</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function CustomersTable() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="顧客を検索..."
        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('name')?.setFilterValue(event.target.value)
        }
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

#### 4.1.4 リッチメニューエディタ (`/rich-menu/create`)

**使用コンポーネント**:
```typescript
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Popover } from '@/components/ui/popover'
```

**カスタムコンポーネント**:
- `RichMenuCanvas`: キャンバス（DnD Kit使用）
- `AreaSelector`: エリア分割ツール
- `ActionConfigurator`: アクション設定パネル
- `ColorPicker`: react-color統合

**レイアウト例**:
```tsx
<div className="flex h-screen">
  {/* 左パネル: ツール */}
  <aside className="w-80 border-r p-4 space-y-4">
    <h2 className="font-semibold">リッチメニュー設定</h2>
    <Tabs defaultValue="layout">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="layout">レイアウト</TabsTrigger>
        <TabsTrigger value="design">デザイン</TabsTrigger>
        <TabsTrigger value="actions">アクション</TabsTrigger>
      </TabsList>
      <TabsContent value="layout">
        {/* レイアウト選択 */}
        <Select>
          <option value="2x2">2×2グリッド</option>
          <option value="3x2">3×2グリッド</option>
          <option value="custom">カスタム</option>
        </Select>
      </TabsContent>
      <TabsContent value="design">
        {/* 色・画像設定 */}
        <div className="space-y-2">
          <Label>背景色</Label>
          <ColorPicker />
        </div>
      </TabsContent>
      <TabsContent value="actions">
        {/* アクション設定 */}
        <ActionConfigurator />
      </TabsContent>
    </Tabs>
  </aside>

  {/* 中央: キャンバス */}
  <main className="flex-1 p-8">
    <Card className="max-w-md mx-auto aspect-[3/2]">
      <RichMenuCanvas />
    </Card>
  </main>

  {/* 右パネル: プレビュー */}
  <aside className="w-80 border-l p-4">
    <h2 className="font-semibold mb-4">プレビュー</h2>
    <div className="bg-gray-100 rounded-lg p-4">
      {/* LINEスタイルプレビュー */}
      <MobilePreview />
    </div>
  </aside>
</div>
```

#### 4.1.5 フォーム作成 (`/forms/create`)

**使用コンポーネント**:
```typescript
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Accordion } from '@/components/ui/accordion'
```

**カスタムコンポーネント**:
- `FormBuilder`: ドラッグ&ドロップフォームビルダー（DnD Kit使用）
- `FieldConfigurator`: フィールド設定パネル
- `ValidationRuleBuilder`: バリデーションルール設定
- `FormPreview`: フォームプレビュー

**フォームフィールドタイプ**:
```tsx
const fieldTypes = [
  { type: 'text', label: 'テキスト', icon: '📝' },
  { type: 'email', label: 'メール', icon: '📧' },
  { type: 'tel', label: '電話番号', icon: '📞' },
  { type: 'date', label: '日付', icon: '📅' },
  { type: 'select', label: 'セレクト', icon: '📋' },
  { type: 'checkbox', label: 'チェックボックス', icon: '☑️' },
  { type: 'radio', label: 'ラジオボタン', icon: '🔘' },
  { type: 'textarea', label: 'テキストエリア', icon: '📄' },
]
```

#### 4.1.6 チャット (`/chat/[conversationId]`)

**使用コンポーネント**:
```typescript
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
```

**カスタムコンポーネント**:
- `MessageBubble`: メッセージ吹き出し（送信/受信）
- `TypingIndicator`: 入力中インジケーター
- `QuickReplies`: クイック返信ボタン
- `FileUploader`: ファイルアップロード

**レイアウト例**:
```tsx
<div className="flex h-screen">
  {/* 左: 会話リスト */}
  <aside className="w-80 border-r">
    <div className="p-4">
      <Input placeholder="会話を検索..." />
    </div>
    <ScrollArea className="h-[calc(100vh-80px)]">
      {conversations.map((conv) => (
        <ConversationItem key={conv.id} {...conv} />
      ))}
    </ScrollArea>
  </aside>

  {/* 右: チャット画面 */}
  <main className="flex-1 flex flex-col">
    {/* ヘッダー */}
    <header className="border-b p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={customer.avatar} />
          <AvatarFallback>{customer.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{customer.name}</h2>
          <Badge variant="secondary">{customer.status}</Badge>
        </div>
      </div>
      <Button variant="outline" size="sm">顧客情報</Button>
    </header>

    {/* メッセージエリア */}
    <ScrollArea className="flex-1 p-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} {...msg} />
      ))}
      <TypingIndicator />
    </ScrollArea>

    {/* 入力エリア */}
    <footer className="border-t p-4">
      <div className="flex gap-2">
        <Textarea placeholder="メッセージを入力..." />
        <Button>送信</Button>
      </div>
      <QuickReplies replies={quickReplies} />
    </footer>
  </main>
</div>
```

#### 4.1.7 分析ページ (`/analytics`)

**使用コンポーネント**:
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
```

**Recharts統合**:
```tsx
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function AnalyticsCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 配信トレンド */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>配信トレンド</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#8884d8" />
              <Line type="monotone" dataKey="opened" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* メッセージタイプ分布 */}
      <Card>
        <CardHeader>
          <CardTitle>メッセージタイプ</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} dataKey="value" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 時間帯別開封率 */}
      <Card>
        <CardHeader>
          <CardTitle>時間帯別開封率</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rate" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 4.2 コンポーネント共通化戦略

#### 4.2.1 レイアウトコンポーネント

```typescript
// components/layouts/dashboard-layout.tsx
import { Sidebar } from './sidebar'
import { Header } from './header'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

#### 4.2.2 共通UIパターン

```typescript
// components/ui/page-header.tsx
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
```

```typescript
// components/ui/empty-state.tsx
interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  )
}
```

---

## 5. 状態管理・データフェッチング

### 5.1 状態管理戦略（Zustand）

#### 5.1.1 グローバル状態の分割

```typescript
// stores/use-auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true })
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        set({ user: data.user, session: data.session, isLoading: false })
      },
      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null })
      },
      refreshSession: async () => {
        const { data } = await supabase.auth.getSession()
        set({ session: data.session, user: data.session?.user || null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
)
```

```typescript
// stores/use-chat-store.ts
import { create } from 'zustand'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  setActiveConversation: (id: string) => void
  addMessage: (conversationId: string, message: Message) => void
  markAsRead: (conversationId: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  setActiveConversation: (id) => set({ activeConversationId: id }),
  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),
  markAsRead: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    })),
}))
```

```typescript
// stores/use-ui-store.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}))
```

### 5.2 データフェッチング（TanStack Query）

#### 5.2.1 クエリ設定

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 10, // 10分（旧cacheTime）
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

```typescript
// app/providers.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

#### 5.2.2 カスタムフック（クエリ）

```typescript
// hooks/use-messages.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useMessage(id: string) {
  return useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (message: NewMessage) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Message> }) => {
      const { data, error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['messages', data.id] })
    },
  })
}
```

#### 5.2.3 楽観的更新

```typescript
// hooks/use-optimistic-message.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, content })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onMutate: async (content) => {
      // キャンセル進行中のクエリ
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] })

      // 現在の値を取得
      const previousMessages = queryClient.getQueryData(['messages', conversationId])

      // 楽観的更新
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        content,
        created_at: new Date().toISOString(),
        status: 'sending',
      }

      queryClient.setQueryData(['messages', conversationId], (old: any) => [
        ...old,
        optimisticMessage,
      ])

      return { previousMessages }
    },
    onError: (err, variables, context) => {
      // エラー時にロールバック
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', conversationId], context.previousMessages)
      }
    },
    onSettled: () => {
      // 最終的に再フェッチ
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })
}
```

### 5.3 リアルタイム更新（Supabase Realtime）

```typescript
// hooks/use-realtime-messages.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: any) => [...old, payload.new]
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, queryClient])
}
```

---

## 6. レイアウト・UI設計

### 6.1 サイドバーナビゲーション

```typescript
// components/layouts/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Mail,
  FileText,
  Menu,
  Tag,
  Calendar,
  BarChart,
  Settings,
} from 'lucide-react'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
  { name: 'チャット', href: '/chat', icon: MessageSquare },
  { name: '顧客', href: '/customers', icon: Users },
  { name: 'メッセージ', href: '/messages', icon: Mail },
  { name: 'フォーム', href: '/forms', icon: FileText },
  { name: 'リッチメニュー', href: '/rich-menu', icon: Menu },
  { name: 'タグ', href: '/tags', icon: Tag },
  { name: '予約', href: '/reservations', icon: Calendar },
  { name: '分析', href: '/analytics', icon: BarChart },
  { name: '設定', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/10 flex flex-col">
      {/* ロゴ */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">L Message</h1>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* ユーザープロフィール */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">ユーザー名</p>
            <p className="text-xs text-muted-foreground">user@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
```

### 6.2 ヘッダー

```typescript
// components/layouts/header.tsx
'use client'

import { Bell, Search, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export function Header() {
  return (
    <header className="border-b h-16 flex items-center px-6 gap-4">
      {/* 検索 */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="検索..."
            className="pl-10"
          />
        </div>
      </div>

      {/* アクション */}
      <div className="flex items-center gap-2">
        {/* ヘルプ */}
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* 通知 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="font-medium">新しいメッセージ</p>
                <p className="text-sm text-muted-foreground">
                  田中さんからメッセージが届きました
                </p>
                <p className="text-xs text-muted-foreground">5分前</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* CTA */}
        <Button>新規メッセージ</Button>
      </div>
    </header>
  )
}
```

### 6.3 レスポンシブデザイン

**ブレークポイント（TailwindCSS）**:
```typescript
// tailwind.config.ts
const config = {
  theme: {
    screens: {
      'sm': '640px',   // モバイル
      'md': '768px',   // タブレット
      'lg': '1024px',  // デスクトップ
      'xl': '1280px',  // 大画面
      '2xl': '1536px', // 超大画面
    },
  },
}
```

**レスポンシブサイドバー**:
```typescript
// components/layouts/responsive-sidebar.tsx
'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'

export function ResponsiveSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* デスクトップ: 固定サイドバー */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* モバイル: ドロワー */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
```

**レスポンシブグリッド例**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* モバイル: 1列 */}
  {/* タブレット: 2列 */}
  {/* デスクトップ: 3列 */}
  {/* 大画面: 4列 */}
</div>
```

---

## 7. パフォーマンス最適化

### 7.1 画像最適化（Next.js Image）

```typescript
import Image from 'next/image'

export function CustomerAvatar({ src, name }: { src: string; name: string }) {
  return (
    <Image
      src={src}
      alt={name}
      width={40}
      height={40}
      className="rounded-full"
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,..." // 自動生成
    />
  )
}
```

### 7.2 動的インポート

```typescript
// 重いエディタコンポーネントは動的インポート
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/rich-text-editor'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false, // クライアントサイドのみ
})

export function MessageForm() {
  return (
    <form>
      <RichTextEditor />
    </form>
  )
}
```

### 7.3 コード分割とプリフェッチ

```typescript
// app/(dashboard)/messages/page.tsx
import Link from 'next/link'

export default function MessagesPage() {
  return (
    <div>
      {/* prefetch有効: ホバーで自動プリフェッチ */}
      <Link href="/messages/create" prefetch={true}>
        新規メッセージ
      </Link>

      {/* prefetch無効: クリック時のみ */}
      <Link href="/messages/archive" prefetch={false}>
        アーカイブ
      </Link>
    </div>
  )
}
```

### 7.4 Suspenseとストリーミング

```typescript
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react'

async function MetricsCards() {
  const metrics = await fetchMetrics() // 遅いデータフェッチ
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.name}>
          <CardHeader>
            <CardTitle>{metric.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metric.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1>ダッシュボード</h1>

      {/* 遅いコンポーネントをストリーミング */}
      <Suspense fallback={<MetricsCardsSkeleton />}>
        <MetricsCards />
      </Suspense>

      {/* 速いコンポーネントは即座に表示 */}
      <QuickActions />
    </div>
  )
}
```

### 7.5 仮想化（大量データ）

```typescript
// 大量の顧客リストを効率的に表示
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedCustomerList({ customers }: { customers: Customer[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: customers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <CustomerRow customer={customers[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 7.6 キャッシュ戦略

```typescript
// app/(dashboard)/messages/[id]/page.tsx
import { unstable_cache } from 'next/cache'

const getMessage = unstable_cache(
  async (id: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single()
    return data
  },
  ['message'],
  {
    revalidate: 60, // 60秒キャッシュ
    tags: ['messages'],
  }
)

export default async function MessagePage({ params }: { params: { id: string } }) {
  const message = await getMessage(params.id)
  return <MessageDetail message={message} />
}
```

---

## 8. アクセシビリティ対応

### 8.1 キーボードナビゲーション

```typescript
// components/chat/message-input.tsx
'use client'

import { useRef, KeyboardEvent } from 'react'

export function MessageInput() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter で送信
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }

    // Escape でフォーカス解除
    if (e.key === 'Escape') {
      textareaRef.current?.blur()
    }
  }

  return (
    <Textarea
      ref={textareaRef}
      onKeyDown={handleKeyDown}
      placeholder="メッセージを入力 (Ctrl+Enterで送信)"
      aria-label="メッセージ入力"
    />
  )
}
```

### 8.2 ARIAラベル

```typescript
// components/customers/customer-table.tsx
export function CustomerTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Checkbox aria-label="すべての顧客を選択" />
          </TableHead>
          <TableHead>顧客名</TableHead>
          <TableHead>タグ</TableHead>
          <TableHead>
            <span className="sr-only">操作</span> {/* スクリーンリーダー用 */}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <Checkbox aria-label={`${customer.name}を選択`} />
            </TableCell>
            <TableCell>{customer.name}</TableCell>
            <TableCell>
              <div role="list" aria-label="タグ">
                {customer.tags.map((tag) => (
                  <Badge key={tag} role="listitem">{tag}</Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`${customer.name}の詳細を表示`}
              >
                詳細
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### 8.3 フォーカス管理

```typescript
// components/dialogs/delete-confirmation-dialog.tsx
'use client'

import { useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function DeleteConfirmationDialog({ open, onOpenChange }: DialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  // ダイアログが開いたら、キャンセルボタンにフォーカス（安全側）
  useEffect(() => {
    if (open) {
      cancelButtonRef.current?.focus()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>削除確認</DialogTitle>
          <DialogDescription>
            この操作は取り消せません。本当に削除しますか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 8.4 カラーコントラスト

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        // WCAG AAA準拠（コントラスト比 7:1以上）
        primary: {
          DEFAULT: '#0F766E', // 濃いティール
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#64748B', // グレー
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#DC2626', // 赤
          foreground: '#FFFFFF',
        },
      },
    },
  },
}
```

---

## 9. 実装優先順位

### 9.1 フェーズ1: 基盤構築（Week 1-2）

**目標**: 認証・ダッシュボード・基本レイアウト

1. **プロジェクトセットアップ**
   - Next.js 15 プロジェクト作成
   - shadcn/ui インストール
   - Supabase 接続設定
   - 環境変数設定

2. **認証実装**
   - `/login` ログイン画面
   - `/signup` 新規登録画面
   - Supabase Auth 統合
   - セッション管理（Zustand）

3. **レイアウト構築**
   - サイドバーナビゲーション
   - ヘッダー
   - レスポンシブ対応

4. **ダッシュボード**
   - `/dashboard` 画面
   - メトリクスカード（モック）
   - チャート（Recharts）
   - 空状態デザイン

**成果物**:
- ログイン可能なアプリケーション
- 基本ナビゲーション完成
- ダッシュボード表示

### 9.2 フェーズ2: コア機能（Week 3-4）

**目標**: メッセージ・顧客管理

5. **メッセージ機能**
   - `/messages` 一覧画面
   - `/messages/create` 作成画面
   - `/messages/[id]` 編集画面
   - TanStack Query 統合
   - Server Actions 実装

6. **顧客管理**
   - `/customers` 顧客リスト
   - `/customers/[customerId]` 顧客詳細
   - TanStack Table 実装
   - 検索・フィルタリング

7. **タグ管理**
   - `/tags` タグ管理画面
   - タグ作成・編集・削除
   - 顧客へのタグ付け

**成果物**:
- メッセージ作成・編集可能
- 顧客管理機能完成
- タグシステム稼働

### 9.3 フェーズ3: 拡張機能（Week 5-6）

**目標**: チャット・フォーム・リッチメニュー

8. **1:1チャット**
   - `/chat` チャット画面
   - リアルタイム更新（Supabase Realtime）
   - メッセージ送受信
   - 並列ルート活用

9. **フォーム機能**
   - `/forms` フォーム一覧
   - `/forms/create` フォームビルダー
   - ドラッグ&ドロップ（DnD Kit）
   - プレビュー機能

10. **リッチメニュー**
    - `/rich-menu` 一覧
    - `/rich-menu/create` エディタ
    - キャンバス実装
    - プレビュー機能

**成果物**:
- チャット機能稼働
- フォームビルダー完成
- リッチメニューエディタ完成

### 9.4 フェーズ4: 分析・予約（Week 7-8）

**目標**: データ分析・予約管理

11. **データ分析**
    - `/analytics` 総合分析
    - `/analytics/messages` メッセージ分析
    - `/analytics/cross` クロス分析
    - グラフ実装（Recharts）

12. **予約管理**
    - `/reservations` 予約一覧
    - `/reservations/calendar` カレンダー
    - `/reservations/settings` 設定

**成果物**:
- 分析ダッシュボード完成
- 予約システム稼働

### 9.5 フェーズ5: 最適化・テスト（Week 9-10）

**目標**: パフォーマンス・アクセシビリティ・品質

13. **パフォーマンス最適化**
    - PPR 有効化
    - 画像最適化
    - 動的インポート
    - キャッシュ戦略

14. **アクセシビリティ対応**
    - キーボードナビゲーション
    - ARIAラベル追加
    - フォーカス管理
    - コントラスト調整

15. **E2Eテスト**
    - Playwright テスト作成
    - 主要フロー検証
    - エラーハンドリング

**成果物**:
- Lighthouse Score 90+
- WCAG 2.1 AA 準拠
- E2Eテストカバレッジ 80%+

---

## 付録A: 環境変数設定

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# LINE
NEXT_PUBLIC_LINE_LIFF_ID=xxx
LINE_CHANNEL_ID=xxx
LINE_CHANNEL_SECRET=xxx
LINE_CHANNEL_ACCESS_TOKEN=xxx

# アプリ設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=L Message
```

---

## 付録B: TypeScript型定義例

```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string
          title: string
          content: string
          type: 'text' | 'image' | 'card' | 'flex'
          status: 'draft' | 'scheduled' | 'sent'
          schedule_at: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Insert>
      }
      customers: {
        Row: {
          id: string
          line_user_id: string
          name: string
          avatar: string | null
          tags: string[]
          last_contact_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Row, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Insert>
      }
      // ... 他のテーブル
    }
  }
}
```

---

## 付録C: パッケージ管理

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  }
}
```

---

## まとめ

この要件定義書は、Next.js 15の最新機能を最大限活用したL Message SaaSのフロントエンド実装ガイドです。

**重要ポイント**:
1. **Next.js 15**: PPR、Server Actions、並列ルート、Turbopack活用
2. **shadcn/ui**: アクセシブルなUIコンポーネント基盤
3. **状態管理**: Zustand（グローバル）+ TanStack Query（サーバー状態）
4. **パフォーマンス**: Suspense、ストリーミング、動的インポート、キャッシュ
5. **アクセシビリティ**: WCAG 2.1 AA準拠、キーボード対応、ARIAラベル
6. **段階的実装**: 10週間で全機能完成

この設計により、高速で保守性が高く、アクセシブルなSaaSアプリケーションを構築できます。

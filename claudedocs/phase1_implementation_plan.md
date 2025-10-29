# Phase 1 完成のための詳細実装計画書

**作成日**: 2025-10-29
**対象**: L Message SaaS - 友だち管理機能完成
**技術スタック**: Next.js 15 + Supabase + TypeScript

---

## 目次

1. [Phase 1 実装範囲の再定義](#1-phase-1-実装範囲の再定義)
2. [友だち詳細ページの完全仕様](#2-友だち詳細ページの完全仕様)
3. [セグメント管理ページの完全仕様](#3-セグメント管理ページの完全仕様)
4. [友だちインポート機能の完全仕様](#4-友だちインポート機能の完全仕様)
5. [データベース補完設計](#5-データベース補完設計)
6. [実装チェックリスト](#6-実装チェックリスト)
7. [注意事項とベストプラクティス](#7-注意事項とベストプラクティス)

---

## 1. Phase 1 実装範囲の再定義

### 1.1 Phase 1 の目標

**達成すべき状態**:
- 友だち管理機能が完全に動作する
- タグ・セグメントによる友だち分類が可能
- 友だちデータのインポート/エクスポートが可能
- 友だち詳細情報の閲覧・編集ができる

### 1.2 Phase 1 機能リスト（163機能中の該当部分）

| 機能分類 | 機能名 | 優先度 | 実装状況 |
|---------|-------|--------|---------|
| **友だち管理** | 友だちリスト表示 | 🔴 Critical | 実装済み |
| | 友だち検索・フィルタリング | 🔴 Critical | 実装済み |
| | 友だち詳細ページ | 🔴 Critical | **未実装** |
| | カスタムフィールド管理 | 🟡 High | **未実装** |
| | 友だちインポート（CSV） | 🟡 High | **未実装** |
| | 友だちエクスポート（CSV） | 🟡 High | **未実装** |
| **タグ管理** | タグ作成・編集・削除 | 🔴 Critical | 実装済み |
| | 友だちへのタグ付与 | 🔴 Critical | 実装済み |
| | タグの一括操作 | 🟡 High | 部分実装 |
| | タグ自動付与ルール | 🟢 Medium | 未実装 |
| **セグメント管理** | セグメント作成 | 🔴 Critical | **未実装** |
| | セグメント条件設定 | 🔴 Critical | **未実装** |
| | セグメント人数表示 | 🔴 Critical | **未実装** |
| | セグメントプレビュー | 🟡 High | **未実装** |
| **QRコード** | QRコード発行 | 🟢 Medium | 未実装 |
| | 流入分析 | 🟢 Medium | 未実装 |

### 1.3 Phase 1 完成の定義

- [ ] 友だちリストから詳細ページへ遷移可能
- [ ] 友だち詳細ページで全情報が確認できる
- [ ] 友だちのカスタムフィールドを編集できる
- [ ] タグの追加・削除が詳細ページからできる
- [ ] セグメント管理ページが存在する
- [ ] セグメントを作成して友だちを抽出できる
- [ ] CSVから友だちデータをインポートできる
- [ ] 友だちデータをCSVでエクスポートできる

---

## 2. 友だち詳細ページの完全仕様

### 2.1 URL構成

```
/dashboard/friends/[id]
```

### 2.2 ページレイアウト

```
┌─────────────────────────────────────────────────────────────┐
│  ← 友だちリストに戻る                                        │
├─────────────────────────────────────────────────────────────┤
│  プロフィール                    | 行動履歴                   │
│  ┌───────────────────────────┐  | ┌───────────────────────┐ │
│  │ アバター画像               │  | │ 最終インタラクション   │ │
│  │                           │  | │ フォロー日時           │ │
│  │ 表示名                    │  | │ メッセージ受信数       │ │
│  │ ステータス（フォロー中）   │  | │ メッセージ送信数       │ │
│  └───────────────────────────┘  | └───────────────────────┘ │
│                                  |                           │
│  基本情報                        | タグ                      │
│  ┌───────────────────────────┐  | ┌───────────────────────┐ │
│  │ LINE User ID              │  | │ [VIP] [会員] [東京]   │ │
│  │ 言語: ja                  │  | │ + タグを追加           │ │
│  │ フォロー状態: following    │  | └───────────────────────┘ │
│  └───────────────────────────┘  |                           │
│                                  | セグメント                │
│  カスタムフィールド              | ┌───────────────────────┐ │
│  ┌───────────────────────────┐  | │ アクティブユーザー     │ │
│  │ 電話番号: 090-1234-5678   │  | │ 東京在住               │ │
│  │ 誕生日: 1990-01-01        │  | └───────────────────────┘ │
│  │ 性別: 男性                │  |                           │
│  │ 住所: 東京都...           │  | アクション                │
│  │ メモ: VIP顧客             │  | ┌───────────────────────┐ │
│  │ [編集]                    │  | │ メッセージ送信         │ │
│  └───────────────────────────┘  | │ チャットを開く         │ │
│                                  | │ 削除                   │ │
├─────────────────────────────────┼───────────────────────────┤
│  タブナビゲーション                                          │
│  [メッセージ履歴] [フォーム回答] [予約履歴] [購入履歴]      │
├─────────────────────────────────────────────────────────────┤
│  タブコンテンツエリア                                        │
│  （選択されたタブの内容を表示）                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 データ構造

#### 2.3.1 友だち基本情報

```typescript
interface LineFriend {
  id: string
  organization_id: string
  line_channel_id: string
  line_user_id: string
  display_name: string | null
  picture_url: string | null
  status_message: string | null
  follow_status: 'following' | 'blocked' | 'unfollowed'
  language: string

  // カスタムフィールド（JSONB）
  custom_fields: {
    phone?: string
    birthday?: string
    gender?: string
    address?: string
    memo?: string
    [key: string]: any
  }

  // 行動データ
  first_followed_at: string
  last_followed_at: string | null
  last_interaction_at: string | null
  total_messages_sent: number
  total_messages_received: number

  created_at: string
  updated_at: string

  // リレーション
  tags: Tag[]
  segments: Segment[]
}

interface Tag {
  id: string
  name: string
  color: string
  description: string | null
}

interface Segment {
  id: string
  name: string
  estimated_count: number
}
```

#### 2.3.2 カスタムフィールド定義

```typescript
interface CustomFieldDefinition {
  id: string
  organization_id: string
  field_key: string        // 例: "phone", "birthday"
  field_label: string      // 例: "電話番号", "誕生日"
  field_type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  is_required: boolean
  options: string[] | null  // selectの場合の選択肢
  display_order: number
  created_at: string
}
```

### 2.4 UI Components

#### 2.4.1 FriendDetailPage Component

```typescript
// app/(dashboard)/friends/[id]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FriendProfileCard } from '@/components/friends/friend-profile-card'
import { FriendActivityCard } from '@/components/friends/friend-activity-card'
import { FriendTagsCard } from '@/components/friends/friend-tags-card'
import { FriendSegmentsCard } from '@/components/friends/friend-segments-card'
import { FriendActionsCard } from '@/components/friends/friend-actions-card'
import { FriendCustomFieldsCard } from '@/components/friends/friend-custom-fields-card'
import { FriendHistoryTabs } from '@/components/friends/friend-history-tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const experimental_ppr = true

interface PageProps {
  params: { id: string }
}

async function getFriendDetail(id: string) {
  const supabase = await createClient()

  const { data: friend, error } = await supabase
    .from('line_friends')
    .select(`
      *,
      tags:friend_tags(
        tag:tags(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !friend) return null
  return friend
}

async function getCustomFieldDefinitions(organizationId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('custom_field_definitions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('display_order')

  return data || []
}

export default async function FriendDetailPage({ params }: PageProps) {
  const friend = await getFriendDetail(params.id)

  if (!friend) {
    notFound()
  }

  const customFieldDefs = await getCustomFieldDefinitions(friend.organization_id)

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/friends">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            友だちリストに戻る
          </Button>
        </Link>
      </div>

      {/* メインコンテンツ */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 左カラム */}
        <div className="space-y-6">
          <FriendProfileCard friend={friend} />
          <FriendCustomFieldsCard
            friend={friend}
            definitions={customFieldDefs}
          />
        </div>

        {/* 右カラム */}
        <div className="space-y-6">
          <FriendActivityCard friend={friend} />
          <FriendTagsCard friend={friend} />
          <Suspense fallback={<div>Loading segments...</div>}>
            <FriendSegmentsCard friendId={friend.id} />
          </Suspense>
          <FriendActionsCard friend={friend} />
        </div>
      </div>

      {/* 履歴タブ */}
      <Suspense fallback={<div>Loading history...</div>}>
        <FriendHistoryTabs friendId={friend.id} />
      </Suspense>
    </div>
  )
}
```

#### 2.4.2 FriendCustomFieldsCard Component

```typescript
// components/friends/friend-custom-fields-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Save, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CustomFieldDefinition {
  id: string
  field_key: string
  field_label: string
  field_type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  is_required: boolean
  options: string[] | null
}

interface FriendCustomFieldsCardProps {
  friend: any
  definitions: CustomFieldDefinition[]
}

export function FriendCustomFieldsCard({ friend, definitions }: FriendCustomFieldsCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [customFields, setCustomFields] = useState(friend.custom_fields || {})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/friends/${friend.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_fields: customFields })
      })

      if (!response.ok) throw new Error('Failed to update')

      toast({
        title: '保存しました',
        description: '友だち情報を更新しました',
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: 'エラー',
        description: '保存に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const renderField = (def: CustomFieldDefinition) => {
    const value = customFields[def.field_key] || ''

    if (!isEditing) {
      return (
        <div key={def.id}>
          <Label className="text-sm text-muted-foreground">{def.field_label}</Label>
          <p className="mt-1 text-sm">{value || '-'}</p>
        </div>
      )
    }

    switch (def.field_type) {
      case 'textarea':
        return (
          <div key={def.id} className="space-y-2">
            <Label htmlFor={def.field_key}>{def.field_label}</Label>
            <Textarea
              id={def.field_key}
              value={value}
              onChange={(e) => setCustomFields({ ...customFields, [def.field_key]: e.target.value })}
              required={def.is_required}
            />
          </div>
        )

      case 'select':
        return (
          <div key={def.id} className="space-y-2">
            <Label htmlFor={def.field_key}>{def.field_label}</Label>
            <Select
              value={value}
              onValueChange={(val) => setCustomFields({ ...customFields, [def.field_key]: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {def.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      default:
        return (
          <div key={def.id} className="space-y-2">
            <Label htmlFor={def.field_key}>{def.field_label}</Label>
            <Input
              id={def.field_key}
              type={def.field_type}
              value={value}
              onChange={(e) => setCustomFields({ ...customFields, [def.field_key]: e.target.value })}
              required={def.is_required}
            />
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>カスタムフィールド</CardTitle>
            <CardDescription>友だち固有の情報を管理</CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                キャンセル
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                保存
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {definitions.map(renderField)}

        {definitions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            カスタムフィールドが設定されていません
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

### 2.5 API Routes

#### 2.5.1 友だち情報更新API

```typescript
// app/api/friends/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('line_friends')
    .select(`
      *,
      tags:friend_tags(
        tag:tags(*)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('line_friends')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
```

---

## 3. セグメント管理ページの完全仕様

### 3.1 URL構成

```
/dashboard/segments              # セグメント一覧
/dashboard/segments/new          # 新規セグメント作成
/dashboard/segments/[id]         # セグメント編集
```

### 3.2 ページレイアウト（一覧）

```
┌─────────────────────────────────────────────────────────────┐
│  セグメント管理                                              │
│  [+ 新規セグメント作成]                                      │
├─────────────────────────────────────────────────────────────┤
│  セグメント一覧                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ セグメント名        | 条件数 | 対象者数 | 更新日        ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ アクティブユーザー  | 3     | 1,234   | 2025-10-29    ││
│  │ 東京在住           | 1     | 567     | 2025-10-28    ││
│  │ VIP顧客            | 2     | 89      | 2025-10-27    ││
│  │ 休眠顧客           | 1     | 345     | 2025-10-26    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 3.3 ページレイアウト（作成・編集）

```
┌─────────────────────────────────────────────────────────────┐
│  セグメント作成                                              │
├─────────────────────────────────────────────────────────────┤
│  基本情報                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ セグメント名: [アクティブユーザー           ]           ││
│  │ 説明: [過去30日以内にアクティビティがあるユーザー]      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  抽出条件                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 条件グループ 1 (AND)                                    ││
│  │ ┌───────────────────────────────────────────────────────┐││
│  │ │ [タグ] [含む] [VIP]                    [× 削除]     │││
│  │ │ [AND]                                                │││
│  │ │ [最終インタラクション] [以内] [30日]    [× 削除]     │││
│  │ │ [AND]                                                │││
│  │ │ [フォロー状態] [等しい] [following]    [× 削除]     │││
│  │ └───────────────────────────────────────────────────────┘││
│  │ [+ 条件を追加]                                           ││
│  │                                                          ││
│  │ [OR]                                                     ││
│  │                                                          ││
│  │ 条件グループ 2 (AND)                                    ││
│  │ ┌───────────────────────────────────────────────────────┐││
│  │ │ [カスタムフィールド] [phone] [存在する]  [× 削除]   │││
│  │ └───────────────────────────────────────────────────────┘││
│  │ [+ 条件を追加]                                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  プレビュー                                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 対象者数: 1,234人                                       ││
│  │ [プレビューを表示]                                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  [キャンセル] [保存]                                         │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 データ構造

#### 3.4.1 Segment Model

```typescript
interface Segment {
  id: string
  organization_id: string
  name: string
  description: string | null
  type: 'dynamic' | 'static'
  estimated_count: number
  created_at: string
  updated_at: string

  // リレーション
  conditions: SegmentCondition[]
}

interface SegmentCondition {
  id: string
  segment_id: string

  // 条件フィールド
  field: string           // 例: "tags", "custom_fields.phone", "follow_status", "last_interaction_at"
  operator: SegmentOperator
  value: any             // 比較値（JSON）
  logic_operator: 'AND' | 'OR'

  created_at: string
}

type SegmentOperator =
  | 'eq'        // 等しい
  | 'ne'        // 等しくない
  | 'gt'        // より大きい
  | 'lt'        // より小さい
  | 'gte'       // 以上
  | 'lte'       // 以下
  | 'in'        // 含む（配列）
  | 'contains'  // 含む（文字列）
  | 'exists'    // 存在する
  | 'not_exists'// 存在しない
  | 'within'    // 期間内（日付）
```

#### 3.4.2 条件フィールドの定義

```typescript
const SEGMENT_FIELDS = [
  // 基本情報
  { value: 'follow_status', label: 'フォロー状態', type: 'select' },
  { value: 'language', label: '言語', type: 'select' },

  // 行動データ
  { value: 'first_followed_at', label: '初回フォロー日', type: 'date' },
  { value: 'last_interaction_at', label: '最終インタラクション日', type: 'date' },
  { value: 'total_messages_sent', label: '送信メッセージ数', type: 'number' },
  { value: 'total_messages_received', label: '受信メッセージ数', type: 'number' },

  // タグ
  { value: 'tags', label: 'タグ', type: 'tag' },

  // カスタムフィールド（動的に生成）
  { value: 'custom_fields.phone', label: '電話番号', type: 'text' },
  { value: 'custom_fields.birthday', label: '誕生日', type: 'date' },
  { value: 'custom_fields.gender', label: '性別', type: 'select' },
] as const

const OPERATORS_BY_TYPE = {
  text: ['eq', 'ne', 'contains', 'exists', 'not_exists'],
  number: ['eq', 'ne', 'gt', 'lt', 'gte', 'lte'],
  date: ['eq', 'ne', 'gt', 'lt', 'within'],
  select: ['eq', 'ne', 'in'],
  tag: ['contains', 'not_contains'],
}
```

### 3.5 UI Components

#### 3.5.1 SegmentListPage Component

```typescript
// app/(dashboard)/segments/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { SegmentTable } from '@/components/segments/segment-table'

export const experimental_ppr = true

async function getSegments() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('segments')
    .select(`
      *,
      conditions:segment_conditions(count)
    `)
    .order('updated_at', { ascending: false })

  return data || []
}

export default async function SegmentsPage() {
  const segments = await getSegments()

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">セグメント管理</h1>
          <p className="text-muted-foreground">
            友だちを条件で絞り込むセグメントを作成・管理
          </p>
        </div>
        <Link href="/dashboard/segments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規セグメント作成
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <SegmentTable segments={segments} />
      </Suspense>
    </div>
  )
}
```

#### 3.5.2 SegmentEditor Component

```typescript
// components/segments/segment-editor.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface SegmentCondition {
  field: string
  operator: string
  value: any
  logic_operator: 'AND' | 'OR'
}

interface SegmentEditorProps {
  segment?: any
  customFields: any[]
}

export function SegmentEditor({ segment, customFields }: SegmentEditorProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState(segment?.name || '')
  const [description, setDescription] = useState(segment?.description || '')
  const [conditions, setConditions] = useState<SegmentCondition[]>(
    segment?.conditions || [{ field: '', operator: '', value: '', logic_operator: 'AND' }]
  )
  const [estimatedCount, setEstimatedCount] = useState(segment?.estimated_count || 0)
  const [loading, setLoading] = useState(false)

  const addCondition = (logicOperator: 'AND' | 'OR' = 'AND') => {
    setConditions([...conditions, {
      field: '',
      operator: '',
      value: '',
      logic_operator: logicOperator
    }])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, updates: Partial<SegmentCondition>) => {
    setConditions(conditions.map((cond, i) =>
      i === index ? { ...cond, ...updates } : cond
    ))
  }

  const handlePreview = async () => {
    try {
      const response = await fetch('/api/segments/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions })
      })

      const data = await response.json()
      setEstimatedCount(data.count)
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'プレビューに失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const url = segment ? `/api/segments/${segment.id}` : '/api/segments'
      const method = segment ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, conditions })
      })

      if (!response.ok) throw new Error('Failed to save')

      toast({
        title: '保存しました',
        description: 'セグメントを保存しました',
      })

      router.push('/dashboard/segments')
      router.refresh()
    } catch (error) {
      toast({
        title: 'エラー',
        description: '保存に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">セグメント名</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: アクティブユーザー"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="セグメントの説明を入力"
            />
          </div>
        </CardContent>
      </Card>

      {/* 抽出条件 */}
      <Card>
        <CardHeader>
          <CardTitle>抽出条件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {conditions.map((condition, index) => (
            <div key={index} className="space-y-2 border-b pb-4 last:border-0">
              {index > 0 && (
                <div className="flex items-center gap-2">
                  <Select
                    value={condition.logic_operator}
                    onValueChange={(value: 'AND' | 'OR') =>
                      updateCondition(index, { logic_operator: value })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                {/* フィールド選択 */}
                <Select
                  value={condition.field}
                  onValueChange={(value) => updateCondition(index, { field: value })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="フィールド" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tags">タグ</SelectItem>
                    <SelectItem value="follow_status">フォロー状態</SelectItem>
                    <SelectItem value="last_interaction_at">最終インタラクション</SelectItem>
                    {customFields.map((field) => (
                      <SelectItem key={field.id} value={`custom_fields.${field.field_key}`}>
                        {field.field_label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 演算子選択 */}
                <Select
                  value={condition.operator}
                  onValueChange={(value) => updateCondition(index, { operator: value })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="条件" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eq">等しい</SelectItem>
                    <SelectItem value="ne">等しくない</SelectItem>
                    <SelectItem value="contains">含む</SelectItem>
                    <SelectItem value="gt">より大きい</SelectItem>
                    <SelectItem value="lt">より小さい</SelectItem>
                    <SelectItem value="within">以内</SelectItem>
                    <SelectItem value="exists">存在する</SelectItem>
                  </SelectContent>
                </Select>

                {/* 値入力 */}
                <Input
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  placeholder="値"
                  className="flex-1"
                />

                {/* 削除ボタン */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCondition(index)}
                  disabled={conditions.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addCondition('AND')}>
              <Plus className="mr-2 h-4 w-4" />
              AND条件を追加
            </Button>
            <Button variant="outline" size="sm" onClick={() => addCondition('OR')}>
              <Plus className="mr-2 h-4 w-4" />
              OR条件を追加
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* プレビュー */}
      <Card>
        <CardHeader>
          <CardTitle>プレビュー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{estimatedCount.toLocaleString()}人</p>
              <p className="text-sm text-muted-foreground">対象者数</p>
            </div>
            <Button variant="outline" onClick={handlePreview}>
              プレビューを更新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* アクション */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button onClick={handleSave} disabled={loading || !name}>
          保存
        </Button>
      </div>
    </div>
  )
}
```

### 3.6 セグメント計算ロジック

#### 3.6.1 セグメントプレビューAPI

```typescript
// app/api/segments/preview/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { conditions } = await request.json()

  // 条件をSQLクエリに変換
  let query = supabase.from('line_friends').select('id', { count: 'exact', head: true })

  for (const condition of conditions) {
    query = applyCondition(query, condition)
  }

  const { count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ count })
}

function applyCondition(query: any, condition: any) {
  const { field, operator, value, logic_operator } = condition

  // カスタムフィールド対応
  if (field.startsWith('custom_fields.')) {
    const fieldKey = field.replace('custom_fields.', '')

    switch (operator) {
      case 'eq':
        return query.eq(`custom_fields->>${fieldKey}`, value)
      case 'contains':
        return query.ilike(`custom_fields->>${fieldKey}`, `%${value}%`)
      case 'exists':
        return query.not('custom_fields', 'is', null).neq(`custom_fields->>${fieldKey}`, '')
      // ... その他の演算子
    }
  }

  // タグ条件
  if (field === 'tags') {
    return query.contains('tags', [value])
  }

  // 通常フィールド
  switch (operator) {
    case 'eq':
      return query.eq(field, value)
    case 'ne':
      return query.neq(field, value)
    case 'gt':
      return query.gt(field, value)
    case 'lt':
      return query.lt(field, value)
    case 'gte':
      return query.gte(field, value)
    case 'lte':
      return query.lte(field, value)
    case 'contains':
      return query.ilike(field, `%${value}%`)
    case 'within':
      // 期間内（日付）
      const days = parseInt(value)
      const date = new Date()
      date.setDate(date.getDate() - days)
      return query.gte(field, date.toISOString())
    default:
      return query
  }
}
```

---

## 4. 友だちインポート機能の完全仕様

### 4.1 URL構成

```
/dashboard/friends/import
```

### 4.2 ページレイアウト

```
┌─────────────────────────────────────────────────────────────┐
│  友だちインポート                                            │
├─────────────────────────────────────────────────────────────┤
│  ステップ 1: CSVファイルのアップロード                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ CSVフォーマット                                         ││
│  │ ┌───────────────────────────────────────────────────────┐││
│  │ │ line_user_id,display_name,phone,birthday,tags       │││
│  │ │ U1234567890,田中太郎,090-1234-5678,1990-01-01,VIP   │││
│  │ │ U0987654321,佐藤花子,080-9876-5432,1985-05-15,会員  │││
│  │ └───────────────────────────────────────────────────────┘││
│  │                                                          ││
│  │ [サンプルCSVをダウンロード]                              ││
│  │                                                          ││
│  │ ┌───────────────────────────────────────────────────────┐││
│  │ │ [ここにCSVファイルをドラッグ&ドロップ]               │││
│  │ │ または [ファイルを選択]                              │││
│  │ └───────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ステップ 2: カラムマッピング                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ CSVカラム          → エルメフィールド                  ││
│  │ ┌───────────────────────────────────────────────────────┐││
│  │ │ line_user_id    → [LINE User ID (必須)]             │││
│  │ │ display_name    → [表示名]                           │││
│  │ │ phone           → [カスタム: 電話番号]               │││
│  │ │ birthday        → [カスタム: 誕生日]                 │││
│  │ │ tags            → [タグ（カンマ区切り）]             │││
│  │ └───────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ステップ 3: インポートオプション                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [ ] 既存の友だち情報を上書きする                        ││
│  │ [ ] 新規友だちのみ追加する                              ││
│  │ [ ] タグを自動付与: [新規インポート]                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ステップ 4: プレビュー                                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ インポート予定: 2件                                     ││
│  │ 既存友だち更新: 0件                                     ││
│  │ 新規友だち追加: 2件                                     ││
│  │ エラー: 0件                                             ││
│  │                                                          ││
│  │ [プレビューを表示]                                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  [キャンセル] [インポート開始]                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 データ構造

#### 4.3.1 CSV Import Model

```typescript
interface CSVImportJob {
  id: string
  organization_id: string
  user_id: string

  // ファイル情報
  file_name: string
  file_size: number
  file_path: string  // Supabase Storage path

  // マッピング設定
  column_mapping: Record<string, string>  // { "csv_column": "friend_field" }

  // オプション
  options: {
    overwrite_existing: boolean
    skip_duplicates: boolean
    auto_tag: string | null
  }

  // 実行結果
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_rows: number
  processed_rows: number
  success_count: number
  error_count: number
  errors: Array<{
    row: number
    line_user_id: string | null
    error: string
  }>

  started_at: string | null
  completed_at: string | null
  created_at: string
}
```

### 4.4 UI Components

#### 4.4.1 FriendImportPage Component

```typescript
// app/(dashboard)/friends/import/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FileUpload } from '@/components/ui/file-upload'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import Link from 'next/link'

export default function FriendImportPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [file, setFile] = useState<File | null>(null)
  const [csvColumns, setCsvColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [options, setOptions] = useState({
    overwrite_existing: false,
    skip_duplicates: true,
    auto_tag: '',
  })
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Step 1: ファイルアップロード
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)

    // CSVヘッダー読み込み
    const text = await selectedFile.text()
    const lines = text.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())

    setCsvColumns(headers)

    // 自動マッピング
    const autoMapping: Record<string, string> = {}
    headers.forEach(col => {
      if (col === 'line_user_id') autoMapping[col] = 'line_user_id'
      if (col === 'display_name') autoMapping[col] = 'display_name'
      if (col === 'phone') autoMapping[col] = 'custom_fields.phone'
      if (col === 'birthday') autoMapping[col] = 'custom_fields.birthday'
      if (col === 'tags') autoMapping[col] = 'tags'
    })
    setColumnMapping(autoMapping)

    setStep(2)
  }

  // Step 2: カラムマッピング
  const handleMappingComplete = () => {
    setStep(3)
  }

  // Step 3: オプション設定
  const handleOptionsComplete = async () => {
    setLoading(true)
    try {
      // プレビュー生成
      const formData = new FormData()
      formData.append('file', file!)
      formData.append('column_mapping', JSON.stringify(columnMapping))
      formData.append('options', JSON.stringify(options))

      const response = await fetch('/api/friends/import/preview', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setPreview(data)
      setStep(4)
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'プレビュー生成に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Step 4: インポート実行
  const handleImport = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file!)
      formData.append('column_mapping', JSON.stringify(columnMapping))
      formData.append('options', JSON.stringify(options))

      const response = await fetch('/api/friends/import', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Import failed')

      const result = await response.json()

      toast({
        title: 'インポート完了',
        description: `${result.success_count}件の友だちをインポートしました`,
      })

      router.push('/dashboard/friends')
      router.refresh()
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'インポートに失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/friends">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              友だちリストに戻る
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-4">友だちインポート</h1>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded ${
              s <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step 1: ファイルアップロード */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>ステップ 1: CSVファイルのアップロード</CardTitle>
            <CardDescription>友だちデータのCSVファイルを選択してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>CSVフォーマット</Label>
              <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-x-auto">
{`line_user_id,display_name,phone,birthday,tags
U1234567890,田中太郎,090-1234-5678,1990-01-01,VIP
U0987654321,佐藤花子,080-9876-5432,1985-05-15,会員`}
              </pre>
            </div>

            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              サンプルCSVをダウンロード
            </Button>

            <FileUpload
              accept=".csv"
              onFileSelect={handleFileSelect}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2: カラムマッピング */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>ステップ 2: カラムマッピング</CardTitle>
            <CardDescription>CSVのカラムとエルメのフィールドを対応付けてください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {csvColumns.map((col) => (
              <div key={col} className="flex items-center gap-4">
                <Label className="w-40">{col}</Label>
                <span>→</span>
                <Select
                  value={columnMapping[col] || ''}
                  onValueChange={(value) =>
                    setColumnMapping({ ...columnMapping, [col]: value })
                  }
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="フィールドを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line_user_id">LINE User ID (必須)</SelectItem>
                    <SelectItem value="display_name">表示名</SelectItem>
                    <SelectItem value="custom_fields.phone">カスタム: 電話番号</SelectItem>
                    <SelectItem value="custom_fields.birthday">カスタム: 誕生日</SelectItem>
                    <SelectItem value="custom_fields.gender">カスタム: 性別</SelectItem>
                    <SelectItem value="tags">タグ（カンマ区切り）</SelectItem>
                    <SelectItem value="skip">スキップ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}

            <div className="flex justify-end">
              <Button onClick={handleMappingComplete}>
                次へ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: オプション設定 */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>ステップ 3: インポートオプション</CardTitle>
            <CardDescription>インポート時の動作を設定してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="overwrite"
                checked={options.overwrite_existing}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, overwrite_existing: checked as boolean })
                }
              />
              <Label htmlFor="overwrite">
                既存の友だち情報を上書きする
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip"
                checked={options.skip_duplicates}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, skip_duplicates: checked as boolean })
                }
              />
              <Label htmlFor="skip">
                重複する友だちをスキップする
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-tag">自動付与タグ</Label>
              <Input
                id="auto-tag"
                value={options.auto_tag}
                onChange={(e) =>
                  setOptions({ ...options, auto_tag: e.target.value })
                }
                placeholder="例: 新規インポート"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                戻る
              </Button>
              <Button onClick={handleOptionsComplete} disabled={loading}>
                プレビューを生成
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: プレビュー */}
      {step === 4 && preview && (
        <Card>
          <CardHeader>
            <CardTitle>ステップ 4: プレビュー</CardTitle>
            <CardDescription>インポート内容を確認してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">インポート予定</p>
                <p className="text-2xl font-bold">{preview.total_rows}件</p>
              </div>
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">既存友だち更新</p>
                <p className="text-2xl font-bold">{preview.update_count}件</p>
              </div>
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">新規友だち追加</p>
                <p className="text-2xl font-bold">{preview.insert_count}件</p>
              </div>
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">エラー</p>
                <p className="text-2xl font-bold text-destructive">{preview.error_count}件</p>
              </div>
            </div>

            {preview.errors && preview.errors.length > 0 && (
              <div className="p-4 bg-destructive/10 rounded">
                <p className="font-semibold text-destructive mb-2">エラー詳細</p>
                <ul className="text-sm space-y-1">
                  {preview.errors.slice(0, 5).map((err: any, i: number) => (
                    <li key={i}>
                      行{err.row}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                戻る
              </Button>
              <Button
                onClick={handleImport}
                disabled={loading || preview.error_count > 0}
              >
                <Upload className="mr-2 h-4 w-4" />
                インポート開始
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 4.5 Import API

#### 4.5.1 プレビューAPI

```typescript
// app/api/friends/import/preview/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Papa from 'papaparse'

export async function POST(request: Request) {
  const supabase = await createClient()
  const formData = await request.formData()

  const file = formData.get('file') as File
  const columnMapping = JSON.parse(formData.get('column_mapping') as string)
  const options = JSON.parse(formData.get('options') as string)

  // CSVパース
  const text = await file.text()
  const { data: rows } = Papa.parse(text, { header: true, skipEmptyLines: true })

  let insertCount = 0
  let updateCount = 0
  let errorCount = 0
  const errors: any[] = []

  // 各行を検証
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as any
    const lineUserId = row[Object.keys(columnMapping).find(k => columnMapping[k] === 'line_user_id') || '']

    if (!lineUserId) {
      errors.push({ row: i + 2, line_user_id: null, error: 'LINE User IDが必須です' })
      errorCount++
      continue
    }

    // 既存友だちチェック
    const { data: existing } = await supabase
      .from('line_friends')
      .select('id')
      .eq('line_user_id', lineUserId)
      .single()

    if (existing) {
      if (options.overwrite_existing) {
        updateCount++
      } else if (options.skip_duplicates) {
        // スキップ
      } else {
        errors.push({ row: i + 2, line_user_id: lineUserId, error: '既に存在する友だちです' })
        errorCount++
      }
    } else {
      insertCount++
    }
  }

  return NextResponse.json({
    total_rows: rows.length,
    insert_count: insertCount,
    update_count: updateCount,
    error_count: errorCount,
    errors: errors.slice(0, 10), // 最大10件まで
  })
}
```

#### 4.5.2 実行API

```typescript
// app/api/friends/import/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Papa from 'papaparse'

export async function POST(request: Request) {
  const supabase = await createClient()
  const formData = await request.formData()

  const file = formData.get('file') as File
  const columnMapping = JSON.parse(formData.get('column_mapping') as string)
  const options = JSON.parse(formData.get('options') as string)

  // CSVパース
  const text = await file.text()
  const { data: rows } = Papa.parse(text, { header: true, skipEmptyLines: true })

  let successCount = 0
  let errorCount = 0
  const errors: any[] = []

  // トランザクション処理
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as any

    try {
      // カラムマッピングに基づいてデータ変換
      const friendData: any = {
        line_user_id: row[Object.keys(columnMapping).find(k => columnMapping[k] === 'line_user_id') || ''],
        custom_fields: {},
      }

      // 各カラムをマッピング
      Object.entries(columnMapping).forEach(([csvCol, field]) => {
        if (field.startsWith('custom_fields.')) {
          const fieldKey = field.replace('custom_fields.', '')
          friendData.custom_fields[fieldKey] = row[csvCol]
        } else if (field === 'display_name') {
          friendData.display_name = row[csvCol]
        } else if (field === 'tags') {
          // タグは別途処理
          friendData._tags = row[csvCol]?.split(',').map((t: string) => t.trim())
        }
      })

      // 友だち登録/更新
      const { data: friend, error } = await supabase
        .from('line_friends')
        .upsert(friendData, { onConflict: 'line_user_id' })
        .select()
        .single()

      if (error) throw error

      // タグ付与
      if (friendData._tags) {
        for (const tagName of friendData._tags) {
          const { data: tag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single()

          if (tag) {
            await supabase
              .from('friend_tags')
              .upsert({ friend_id: friend.id, tag_id: tag.id })
          }
        }
      }

      // 自動タグ付与
      if (options.auto_tag) {
        const { data: autoTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', options.auto_tag)
          .single()

        if (autoTag) {
          await supabase
            .from('friend_tags')
            .upsert({ friend_id: friend.id, tag_id: autoTag.id })
        }
      }

      successCount++
    } catch (error: any) {
      errors.push({ row: i + 2, error: error.message })
      errorCount++
    }
  }

  return NextResponse.json({
    success_count: successCount,
    error_count: errorCount,
    errors,
  })
}
```

---

## 5. データベース補完設計

### 5.1 追加テーブル

#### 5.1.1 カスタムフィールド定義テーブル

```sql
-- ========================================
-- カスタムフィールド定義テーブル
-- ========================================
CREATE TABLE custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  field_key TEXT NOT NULL,         -- 例: "phone", "birthday", "gender"
  field_label TEXT NOT NULL,       -- 例: "電話番号", "誕生日", "性別"
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'textarea', 'email', 'tel', 'url')),

  is_required BOOLEAN DEFAULT FALSE,
  options TEXT[],                  -- selectの場合の選択肢
  default_value TEXT,
  placeholder TEXT,
  help_text TEXT,

  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, field_key)
);

CREATE INDEX idx_custom_field_defs_org ON custom_field_definitions(organization_id);
CREATE INDEX idx_custom_field_defs_order ON custom_field_definitions(organization_id, display_order);

-- RLS
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage custom field definitions in their org"
ON custom_field_definitions FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

#### 5.1.2 友だちインポートジョブテーブル

```sql
-- ========================================
-- 友だちインポートジョブテーブル
-- ========================================
CREATE TABLE friend_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),

  -- ファイル情報
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,  -- Supabase Storage path

  -- マッピング設定
  column_mapping JSONB NOT NULL,

  -- オプション
  options JSONB NOT NULL DEFAULT '{}',

  -- 実行結果
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_import_jobs_org ON friend_import_jobs(organization_id);
CREATE INDEX idx_import_jobs_user ON friend_import_jobs(user_id);
CREATE INDEX idx_import_jobs_status ON friend_import_jobs(status);
CREATE INDEX idx_import_jobs_created ON friend_import_jobs(created_at DESC);

-- RLS
ALTER TABLE friend_import_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their import jobs"
ON friend_import_jobs FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create import jobs in their org"
ON friend_import_jobs FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

### 5.2 既存テーブルの修正

#### 5.2.1 line_friends テーブルにGINインデックス追加

```sql
-- JSONBカスタムフィールドの高速検索用
CREATE INDEX idx_line_friends_custom_fields
ON line_friends USING GIN(custom_fields);

-- フルテキスト検索用（日本語対応）
ALTER TABLE line_friends ADD COLUMN search_vector tsvector;

CREATE INDEX idx_line_friends_search
ON line_friends USING GIN(search_vector);

-- トリガー: 検索ベクトルの自動更新
CREATE OR REPLACE FUNCTION update_line_friends_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('japanese', COALESCE(NEW.display_name, '')), 'A') ||
    setweight(to_tsvector('japanese', COALESCE(NEW.custom_fields::text, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_line_friends_search_vector
BEFORE INSERT OR UPDATE ON line_friends
FOR EACH ROW
EXECUTE FUNCTION update_line_friends_search_vector();
```

---

## 6. 実装チェックリスト

### 6.1 友だち詳細ページ

- [ ] ページルーティング設定 (`/dashboard/friends/[id]`)
- [ ] 友だち基本情報の表示
- [ ] プロフィール画像の表示
- [ ] 行動データの表示（最終インタラクション、フォロー日時、メッセージ数）
- [ ] タグの表示と追加・削除機能
- [ ] セグメントの表示
- [ ] カスタムフィールドの表示
- [ ] カスタムフィールドの編集機能
- [ ] 編集保存API (`PATCH /api/friends/[id]`)
- [ ] 履歴タブ（メッセージ履歴、フォーム回答、予約履歴、購入履歴）
- [ ] アクションボタン（メッセージ送信、チャットを開く、削除）
- [ ] レスポンシブデザイン対応
- [ ] ローディング状態の表示
- [ ] エラーハンドリング

### 6.2 セグメント管理ページ

- [ ] セグメント一覧ページ (`/dashboard/segments`)
- [ ] セグメント作成ページ (`/dashboard/segments/new`)
- [ ] セグメント編集ページ (`/dashboard/segments/[id]`)
- [ ] セグメント基本情報入力（名前、説明）
- [ ] 条件追加・削除機能
- [ ] フィールド選択セレクトボックス
- [ ] 演算子選択セレクトボックス
- [ ] 値入力フィールド
- [ ] AND/OR条件の切り替え
- [ ] カスタムフィールドの動的読み込み
- [ ] プレビュー機能（対象者数表示）
- [ ] プレビューAPI (`POST /api/segments/preview`)
- [ ] セグメント保存API (`POST /api/segments`, `PATCH /api/segments/[id]`)
- [ ] セグメント削除機能
- [ ] セグメント一覧の表示
- [ ] レスポンシブデザイン対応

### 6.3 友だちインポート機能

- [ ] インポートページ (`/dashboard/friends/import`)
- [ ] CSVファイルアップロード機能
- [ ] ドラッグ&ドロップ対応
- [ ] CSVヘッダーの読み込み
- [ ] カラムマッピング機能
- [ ] 自動マッピング機能
- [ ] インポートオプション設定
- [ ] プレビュー生成機能
- [ ] プレビューAPI (`POST /api/friends/import/preview`)
- [ ] インポート実行API (`POST /api/friends/import`)
- [ ] エラー表示
- [ ] サンプルCSVダウンロード機能
- [ ] インポートジョブの履歴表示
- [ ] バックグラウンド処理（大量データ対応）
- [ ] プログレスバー表示

### 6.4 データベース

- [ ] `custom_field_definitions` テーブル作成
- [ ] `friend_import_jobs` テーブル作成
- [ ] `line_friends` テーブルにGINインデックス追加
- [ ] 検索ベクトルの追加とトリガー設定
- [ ] RLSポリシーの設定
- [ ] マイグレーションファイルの作成
- [ ] 初期データのシード

### 6.5 UI/UX

- [ ] shadcn/ui コンポーネントの統一
- [ ] ローディングスケルトンの実装
- [ ] エラーバウンダリの実装
- [ ] トースト通知の実装
- [ ] モバイル対応
- [ ] キーボードショートカット対応（Esc, Enter等）
- [ ] アクセシビリティ対応（ARIA属性）

### 6.6 テスト

- [ ] 友だち詳細ページのE2Eテスト
- [ ] セグメント作成フローのE2Eテスト
- [ ] インポート機能のE2Eテスト
- [ ] APIエンドポイントのユニットテスト
- [ ] セグメント条件計算のユニットテスト
- [ ] CSVパース機能のユニットテスト

---

## 7. 注意事項とベストプラクティス

### 7.1 パフォーマンス最適化

#### 7.1.1 セグメント計算の最適化

```typescript
// 悪い例: N+1クエリ
for (const friend of friends) {
  const tags = await getTags(friend.id)
  const matches = checkConditions(tags, conditions)
}

// 良い例: 一括取得
const friends = await supabase
  .from('line_friends')
  .select(`
    *,
    tags:friend_tags(tag:tags(*))
  `)
```

#### 7.1.2 大量データのインポート

```typescript
// バッチ処理（100件ずつ）
const BATCH_SIZE = 100
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE)
  await supabase.from('line_friends').upsert(batch)
}
```

### 7.2 セキュリティ

#### 7.2.1 CSVインジェクション対策

```typescript
// セル内容のサニタイズ
function sanitizeCellValue(value: string): string {
  // 先頭の特殊文字を削除
  if (value.startsWith('=') || value.startsWith('+') ||
      value.startsWith('-') || value.startsWith('@')) {
    return "'" + value
  }
  return value
}
```

#### 7.2.2 ファイルサイズ制限

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('ファイルサイズが大きすぎます')
}
```

### 7.3 エラーハンドリング

#### 7.3.1 ユーザーフレンドリーなエラーメッセージ

```typescript
try {
  await importFriends(data)
} catch (error) {
  if (error.code === 'DUPLICATE_KEY') {
    toast({
      title: '重複エラー',
      description: 'すでに登録されている友だちが含まれています',
      variant: 'destructive',
    })
  } else if (error.code === 'INVALID_FORMAT') {
    toast({
      title: 'フォーマットエラー',
      description: 'CSVファイルの形式が正しくありません',
      variant: 'destructive',
    })
  } else {
    toast({
      title: 'エラー',
      description: '予期しないエラーが発生しました',
      variant: 'destructive',
    })
  }
}
```

### 7.4 ユーザビリティ

#### 7.4.1 段階的な情報表示

```typescript
// 初期表示は基本情報のみ
<FriendDetailPage>
  <BasicInfo />

  {/* タブで詳細情報を切り替え */}
  <Tabs>
    <TabsList>
      <TabsTrigger>メッセージ履歴</TabsTrigger>
      <TabsTrigger>フォーム回答</TabsTrigger>
      <TabsTrigger>予約履歴</TabsTrigger>
    </TabsList>

    <TabsContent>
      <Suspense fallback={<Loading />}>
        <MessageHistory />
      </Suspense>
    </TabsContent>
  </Tabs>
</FriendDetailPage>
```

#### 7.4.2 プログレス表示

```typescript
<ImportWizard>
  <StepIndicator currentStep={step} totalSteps={4} />

  {step === 1 && <FileUploadStep />}
  {step === 2 && <ColumnMappingStep />}
  {step === 3 && <OptionsStep />}
  {step === 4 && <PreviewStep />}
</ImportWizard>
```

### 7.5 データ整合性

#### 7.5.1 トランザクション処理

```typescript
// Supabaseトランザクション
const { data, error } = await supabase.rpc('import_friends_with_tags', {
  friends_data: friendsData,
  tags_data: tagsData,
})
```

#### 7.5.2 バリデーション

```typescript
import { z } from 'zod'

const friendSchema = z.object({
  line_user_id: z.string().min(1, 'LINE User IDは必須です'),
  display_name: z.string().optional(),
  custom_fields: z.object({
    phone: z.string().regex(/^\d{2,4}-\d{2,4}-\d{4}$/, '電話番号の形式が正しくありません').optional(),
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '誕生日の形式が正しくありません').optional(),
  }).optional(),
})
```

---

## まとめ

### Phase 1 完成までの実装ステップ

1. **Week 1**: 友だち詳細ページの実装
   - Day 1-2: ページレイアウトとUIコンポーネント
   - Day 3-4: カスタムフィールド編集機能
   - Day 5: API実装とテスト

2. **Week 2**: セグメント管理機能の実装
   - Day 1-2: セグメント一覧と作成ページ
   - Day 3-4: 条件エディタとプレビュー機能
   - Day 5: API実装とテスト

3. **Week 3**: インポート機能の実装
   - Day 1-2: ファイルアップロードとマッピング
   - Day 3-4: プレビューとインポート実行
   - Day 5: エラーハンドリングとテスト

4. **Week 4**: 統合テストと最適化
   - Day 1-2: E2Eテスト
   - Day 3-4: パフォーマンス最適化
   - Day 5: バグ修正とドキュメント更新

### 推定工数

| 機能 | 工数 | 難易度 |
|-----|------|--------|
| 友だち詳細ページ | 5-7日 | 中 |
| セグメント管理 | 5-7日 | 高 |
| インポート機能 | 5-7日 | 中 |
| データベース設計 | 2-3日 | 中 |
| テスト・最適化 | 3-5日 | 中 |
| **合計** | **20-29日** | - |

### 成功の定義

Phase 1が完成したと言えるのは、以下がすべて達成された時:

- [ ] 友だち詳細ページから全情報が確認・編集できる
- [ ] セグメントを作成して動的に友だちを抽出できる
- [ ] CSVから友だちデータを正常にインポートできる
- [ ] すべての機能が正常に動作する（E2Eテスト合格）
- [ ] パフォーマンスが許容範囲内（1,000件のセグメント計算が3秒以内）
- [ ] レスポンシブデザインで全デバイス対応
- [ ] ドキュメントが最新の状態

---

**作成日**: 2025-10-29
**バージョン**: 1.0
**次のアクション**: 実装開始

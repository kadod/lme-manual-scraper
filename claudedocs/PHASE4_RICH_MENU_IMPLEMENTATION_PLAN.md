# Phase 4: リッチメニュー機能 - 完全実装計画書

**作成日**: 2025-10-29
**対象フェーズ**: Phase 4 - Rich Menu System
**優先度**: High (Phase 2 Core機能)
**予想実装期間**: 5-7日

---

## 目次

1. [機能概要](#1-機能概要)
2. [データベース設計](#2-データベース設計)
3. [リッチメニューエディタUI設計](#3-リッチメニューエディタui設計)
4. [LINE Rich Menu API連携](#4-line-rich-menu-api連携)
5. [画像アップロード機能](#5-画像アップロード機能)
6. [アクション設定機能](#6-アクション設定機能)
7. [実装タスク分解](#7-実装タスク分解)
8. [テストシナリオ](#8-テストシナリオ)

---

## 1. 機能概要

### 1.1 リッチメニューとは

LINEトーク画面下部に常時表示されるタップ可能なメニュー領域。ユーザーは画像上の特定エリアをタップすることで以下のアクションを実行できます：

- **URI**: 外部リンク/LIFF/LINEアプリ内ブラウザでWebページを開く
- **Message**: 自動でメッセージを送信（ユーザーがタップすると指定テキストが送信される）
- **Postback**: サーバーにデータを送信（予約キャンセル、アンケート回答等）

### 1.2 実装する主要機能

1. **リッチメニュー一覧画面** (`/rich-menus`)
   - 作成済みリッチメニューの表示
   - ステータス管理（下書き/有効/無効）
   - デフォルト設定切替
   - 削除・複製機能

2. **リッチメニュー作成・編集画面** (`/rich-menus/new`, `/rich-menus/[id]/edit`)
   - 基本情報設定（名前、チャットバーテキスト）
   - レイアウト選択（Full: 1686px / Half: 843px）
   - グリッド分割設定（1x1～6x6の20パターン）
   - タップ領域ビジュアルエディタ
   - 各領域へのアクション設定
   - 画像アップロード（最大2.5MB、PNG/JPEG）

3. **LINE API連携**
   - Rich Menu作成API
   - Rich Menu画像アップロードAPI
   - Rich Menu削除API
   - 友だちへのリッチメニュー適用API

4. **プレビュー機能**
   - リアルタイムプレビュー（モバイル画面サイズでの表示確認）
   - タップ領域のハイライト表示
   - アクション内容の確認

### 1.3 LINE Rich Menu仕様制約

| 項目 | 仕様 |
|-----|------|
| 画像サイズ | 幅2500px × 高さ1686px (Full) または 高さ843px (Half) |
| ファイルサイズ | 最大2.5MB |
| ファイル形式 | PNG, JPEG |
| チャットバーテキスト | 最大14文字 |
| タップ領域数 | 最大20個 |
| タップ領域サイズ | 最小幅25% × 最小高さ16.67% |

---

## 2. データベース設計

### 2.1 既存テーブル（supabase_architecture.mdより）

#### rich_menus テーブル

```sql
CREATE TABLE rich_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  line_channel_id UUID NOT NULL REFERENCES line_channels(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  line_rich_menu_id TEXT, -- LINE APIから返されるID

  -- デザイン設定
  chat_bar_text TEXT NOT NULL, -- チャットバーテキスト（14文字以内）
  image_url TEXT NOT NULL, -- Storage内の画像URL
  size_width INTEGER NOT NULL DEFAULT 2500, -- 通常2500px
  size_height INTEGER NOT NULL CHECK (size_height IN (1686, 843)), -- Full: 1686, Half: 843

  -- 表示設定
  is_default BOOLEAN DEFAULT FALSE, -- デフォルトメニューかどうか
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rich_menus_organization_id ON rich_menus(organization_id);
CREATE INDEX idx_rich_menus_line_channel_id ON rich_menus(line_channel_id);
CREATE INDEX idx_rich_menus_status ON rich_menus(status);
```

#### rich_menu_areas テーブル

```sql
CREATE TABLE rich_menu_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rich_menu_id UUID NOT NULL REFERENCES rich_menus(id) ON DELETE CASCADE,

  -- エリア座標（左上を起点）
  bounds_x INTEGER NOT NULL,
  bounds_y INTEGER NOT NULL,
  bounds_width INTEGER NOT NULL,
  bounds_height INTEGER NOT NULL,

  -- アクション設定
  action_type TEXT NOT NULL CHECK (action_type IN ('uri', 'message', 'postback')),
  action_data JSONB NOT NULL, -- 例: {"uri": "https://..."} or {"text": "メニュー1"}

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rich_menu_areas_rich_menu_id ON rich_menu_areas(rich_menu_id);
```

### 2.2 action_data スキーマ定義

#### URI アクション
```json
{
  "type": "uri",
  "uri": "https://example.com/page",
  "label": "Webページを開く"
}
```

#### Message アクション
```json
{
  "type": "message",
  "text": "予約する"
}
```

#### Postback アクション
```json
{
  "type": "postback",
  "data": "action=view_reservations&user_id=123",
  "displayText": "予約一覧を表示",
  "text": "予約一覧" // オプション: ユーザーに見えるメッセージ
}
```

### 2.3 RLS（Row Level Security）ポリシー

```sql
-- rich_menus テーブル
CREATE POLICY "Users can view rich menus in their organization"
ON rich_menus FOR SELECT
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Members can create rich menus in their organization"
ON rich_menus FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Members can update rich menus in their organization"
ON rich_menus FOR UPDATE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Admins can delete rich menus in their organization"
ON rich_menus FOR DELETE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);

-- rich_menu_areas テーブル（親テーブルに依存）
CREATE POLICY "Users can view rich menu areas"
ON rich_menu_areas FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM rich_menus
    WHERE rich_menus.id = rich_menu_areas.rich_menu_id
    AND rich_menus.organization_id = (auth.jwt() -> 'organization_id')::UUID
  )
);

CREATE POLICY "Members can manage rich menu areas"
ON rich_menu_areas FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM rich_menus
    WHERE rich_menus.id = rich_menu_areas.rich_menu_id
    AND rich_menus.organization_id = (auth.jwt() -> 'organization_id')::UUID
  )
);

ALTER TABLE rich_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE rich_menu_areas ENABLE ROW LEVEL SECURITY;
```

---

## 3. リッチメニューエディタUI設計

### 3.1 画面構成（/rich-menus/new）

```
┌─────────────────────────────────────────────────────────────────┐
│ リッチメニュー作成                                    [保存] [公開] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────┐  ┌──────────────────────────────┐ │
│  │ 基本設定               │  │ プレビュー                    │ │
│  │                        │  │                              │ │
│  │ メニュー名: [_______] │  │  ┌────────────────────────┐  │ │
│  │                        │  │  │                        │  │ │
│  │ チャットバーテキスト:  │  │  │                        │  │ │
│  │ [________] (14文字)    │  │  │    モバイル画面        │  │ │
│  │                        │  │  │    プレビュー          │  │ │
│  │ サイズ:                │  │  │                        │  │ │
│  │ ○ Full (1686px)        │  │  │  [リッチメニュー画像]  │  │ │
│  │ ○ Half (843px)         │  │  │                        │  │ │
│  │                        │  │  │                        │  │ │
│  │ レイアウト選択:        │  │  └────────────────────────┘  │ │
│  │ [グリッドパターン選択] │  │                              │ │
│  │                        │  └──────────────────────────────┘ │
│  └────────────────────────┘                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 画像アップロード                                        │   │
│  │                                                         │   │
│  │  [画像をドラッグ&ドロップ または クリックして選択]      │   │
│  │  対応形式: PNG, JPEG | 最大2.5MB                        │   │
│  │  推奨サイズ: 2500 × 1686px (Full) / 2500 × 843px (Half) │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────┐       │   │
│  │  │                                              │       │   │
│  │  │          [アップロード済み画像プレビュー]    │       │   │
│  │  │                                              │       │   │
│  │  └──────────────────────────────────────────────┘       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ タップ領域設定                                          │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────┐        │   │
│  │  │        グリッド分割ビジュアルエディタ       │        │   │
│  │  │                                             │        │   │
│  │  │  ┌────┬────┬────┬────┬────┬────┐           │        │   │
│  │  │  │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │           │        │   │
│  │  │  ├────┼────┼────┼────┼────┼────┤           │        │   │
│  │  │  │ 7  │ 8  │ 9  │ 10 │ 11 │ 12 │           │        │   │
│  │  │  ├────┼────┼────┼────┼────┼────┤           │        │   │
│  │  │  │ 13 │ 14 │ 15 │ 16 │ 17 │ 18 │           │        │   │
│  │  │  └────┴────┴────┴────┴────┴────┘           │        │   │
│  │  │                                             │        │   │
│  │  │  各領域をクリックしてアクションを設定       │        │   │
│  │  └─────────────────────────────────────────────┘        │   │
│  │                                                         │   │
│  │  選択中: エリア 1                                       │   │
│  │  ┌──────────────────────────────────────┐              │   │
│  │  │ アクションタイプ: ○URI ○メッセージ ○Postback │      │   │
│  │  │                                      │              │   │
│  │  │ [アクション詳細設定フォーム]         │              │   │
│  │  └──────────────────────────────────────┘              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 コンポーネント設計

```typescript
// app/rich-menus/new/page.tsx
'use client'

import { useState } from 'react'
import { RichMenuEditor } from '@/components/rich-menus/RichMenuEditor'
import { RichMenuPreview } from '@/components/rich-menus/RichMenuPreview'

export default function NewRichMenuPage() {
  const [richMenu, setRichMenu] = useState({
    name: '',
    chatBarText: '',
    sizeHeight: 1686,
    imageUrl: '',
    areas: []
  })

  return (
    <div className="grid grid-cols-2 gap-6">
      <RichMenuEditor richMenu={richMenu} onChange={setRichMenu} />
      <RichMenuPreview richMenu={richMenu} />
    </div>
  )
}
```

### 3.3 グリッドレイアウトパターン（20種類）

LINE公式が定義する標準レイアウトパターン：

| レイアウト | グリッド | タップ領域数 | 用途 |
|-----------|---------|-------------|------|
| 1x1 | 1列×1行 | 1 | シンプルメニュー |
| 2x1 | 2列×1行 | 2 | 2択メニュー |
| 3x1 | 3列×1行 | 3 | 3択メニュー |
| 2x2 | 2列×2行 | 4 | 標準メニュー |
| 3x2 | 3列×2行 | 6 | 多機能メニュー |
| 3x3 | 3列×3行 | 9 | 豊富なメニュー |
| ... | ... | ... | ... |

**実装方針**:
- レイアウトプリセットをJSONで定義
- ユーザーはプリセットから選択（カスタムグリッドは後期フェーズで対応）

```typescript
// lib/rich-menu-layouts.ts
export const RICH_MENU_LAYOUTS = [
  {
    id: '1x1',
    name: '1列×1行',
    columns: 1,
    rows: 1,
    areas: [
      { bounds: { x: 0, y: 0, width: 2500, height: 1686 } }
    ]
  },
  {
    id: '2x1',
    name: '2列×1行',
    columns: 2,
    rows: 1,
    areas: [
      { bounds: { x: 0, y: 0, width: 1250, height: 1686 } },
      { bounds: { x: 1250, y: 0, width: 1250, height: 1686 } }
    ]
  },
  {
    id: '2x2',
    name: '2列×2行',
    columns: 2,
    rows: 2,
    areas: [
      { bounds: { x: 0, y: 0, width: 1250, height: 843 } },
      { bounds: { x: 1250, y: 0, width: 1250, height: 843 } },
      { bounds: { x: 0, y: 843, width: 1250, height: 843 } },
      { bounds: { x: 1250, y: 843, width: 1250, height: 843 } }
    ]
  },
  // 他のレイアウトパターンも同様に定義...
]
```

### 3.4 タップ領域エディタ実装

```typescript
// components/rich-menus/TapAreaEditor.tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TapArea {
  id: string
  bounds: { x: number; y: number; width: number; height: number }
  action: { type: 'uri' | 'message' | 'postback'; data: any }
}

interface TapAreaEditorProps {
  imageUrl: string
  areas: TapArea[]
  onAreasChange: (areas: TapArea[]) => void
}

export function TapAreaEditor({ imageUrl, areas, onAreasChange }: TapAreaEditorProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

  return (
    <div className="relative">
      <img src={imageUrl} alt="Rich Menu" className="w-full" />

      {areas.map((area) => (
        <div
          key={area.id}
          className={cn(
            'absolute border-2 cursor-pointer hover:bg-blue-500/20',
            selectedAreaId === area.id ? 'border-blue-500 bg-blue-500/30' : 'border-gray-400'
          )}
          style={{
            left: `${(area.bounds.x / 2500) * 100}%`,
            top: `${(area.bounds.y / 1686) * 100}%`,
            width: `${(area.bounds.width / 2500) * 100}%`,
            height: `${(area.bounds.height / 1686) * 100}%`
          }}
          onClick={() => setSelectedAreaId(area.id)}
        >
          <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
            Area {areas.indexOf(area) + 1}
          </span>
        </div>
      ))}
    </div>
  )
}
```

---

## 4. LINE Rich Menu API連携

### 4.1 Edge Function: create-rich-menu

```typescript
// supabase/functions/create-rich-menu/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_API_BASE = 'https://api.line.me/v2/bot'

serve(async (req) => {
  try {
    const { richMenuId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // リッチメニュー情報を取得
    const { data: richMenu, error } = await supabase
      .from('rich_menus')
      .select(`
        *,
        rich_menu_areas(*),
        line_channels(channel_access_token)
      `)
      .eq('id', richMenuId)
      .single()

    if (error) throw error

    const accessToken = richMenu.line_channels.channel_access_token

    // 1. LINE Rich Menu作成
    const richMenuData = {
      size: {
        width: richMenu.size_width,
        height: richMenu.size_height
      },
      selected: false,
      name: richMenu.name,
      chatBarText: richMenu.chat_bar_text,
      areas: richMenu.rich_menu_areas.map((area: any) => ({
        bounds: {
          x: area.bounds_x,
          y: area.bounds_y,
          width: area.bounds_width,
          height: area.bounds_height
        },
        action: transformAction(area.action_type, area.action_data)
      }))
    }

    const createResponse = await fetch(`${LINE_API_BASE}/richmenu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(richMenuData)
    })

    if (!createResponse.ok) {
      const error = await createResponse.json()
      throw new Error(`LINE API Error: ${error.message}`)
    }

    const { richMenuId: lineRichMenuId } = await createResponse.json()

    // 2. リッチメニュー画像をアップロード
    const imageResponse = await fetch(richMenu.image_url)
    const imageBlob = await imageResponse.blob()

    const uploadResponse = await fetch(
      `${LINE_API_BASE}/richmenu/${lineRichMenuId}/content`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          'Authorization': `Bearer ${accessToken}`
        },
        body: imageBlob
      }
    )

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload rich menu image')
    }

    // 3. Supabaseにline_rich_menu_idを保存
    await supabase
      .from('rich_menus')
      .update({
        line_rich_menu_id: lineRichMenuId,
        status: 'active'
      })
      .eq('id', richMenuId)

    // 4. デフォルトメニューの場合は全友だちに適用
    if (richMenu.is_default) {
      await fetch(
        `${LINE_API_BASE}/user/all/richmenu/${lineRichMenuId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, lineRichMenuId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function transformAction(actionType: string, actionData: any) {
  switch (actionType) {
    case 'uri':
      return {
        type: 'uri',
        uri: actionData.uri
      }
    case 'message':
      return {
        type: 'message',
        text: actionData.text
      }
    case 'postback':
      return {
        type: 'postback',
        data: actionData.data,
        displayText: actionData.displayText
      }
    default:
      throw new Error(`Unknown action type: ${actionType}`)
  }
}
```

### 4.2 LINE Rich Menu API エンドポイント一覧

| API | メソッド | URL | 用途 |
|-----|---------|-----|------|
| Rich Menu作成 | POST | `/richmenu` | リッチメニューを作成 |
| Rich Menu画像アップロード | POST | `/richmenu/{richMenuId}/content` | 画像をアップロード |
| Rich Menu削除 | DELETE | `/richmenu/{richMenuId}` | リッチメニューを削除 |
| デフォルトメニュー設定 | POST | `/user/all/richmenu/{richMenuId}` | 全友だちに適用 |
| 特定ユーザーに適用 | POST | `/user/{userId}/richmenu/{richMenuId}` | 特定友だちに適用 |
| Rich Menu取得 | GET | `/richmenu/{richMenuId}` | リッチメニュー情報取得 |

### 4.3 Server Actions（Next.js）

```typescript
// app/rich-menus/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRichMenu(formData: FormData) {
  const supabase = createClient()

  const richMenuData = {
    name: formData.get('name') as string,
    chat_bar_text: formData.get('chatBarText') as string,
    size_height: parseInt(formData.get('sizeHeight') as string),
    image_url: formData.get('imageUrl') as string,
    is_default: formData.get('isDefault') === 'true',
    status: 'draft'
  }

  const { data, error } = await supabase
    .from('rich_menus')
    .insert(richMenuData)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/rich-menus')
  return data
}

export async function publishRichMenu(richMenuId: string) {
  const supabase = createClient()

  // Edge Functionを呼び出してLINE APIに送信
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-rich-menu`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ richMenuId })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  revalidatePath('/rich-menus')
  return await response.json()
}

export async function deleteRichMenu(richMenuId: string) {
  const supabase = createClient()

  const { data: richMenu } = await supabase
    .from('rich_menus')
    .select('line_rich_menu_id, line_channels(channel_access_token)')
    .eq('id', richMenuId)
    .single()

  // LINE APIから削除
  if (richMenu?.line_rich_menu_id) {
    await fetch(
      `https://api.line.me/v2/bot/richmenu/${richMenu.line_rich_menu_id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${richMenu.line_channels.channel_access_token}`
        }
      }
    )
  }

  // Supabaseから削除
  const { error } = await supabase
    .from('rich_menus')
    .delete()
    .eq('id', richMenuId)

  if (error) throw error

  revalidatePath('/rich-menus')
}
```

---

## 5. 画像アップロード機能

### 5.1 Supabase Storage設定

```sql
-- rich-menu-images バケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('rich-menu-images', 'rich-menu-images', true);

-- RLSポリシー
CREATE POLICY "Users can upload rich menu images for their org"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rich-menu-images' AND
  (storage.foldername(name))[1] = (auth.jwt() -> 'organization_id')::TEXT
);

CREATE POLICY "Users can view rich menu images for their org"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'rich-menu-images' AND
  (storage.foldername(name))[1] = (auth.jwt() -> 'organization_id')::TEXT
);

CREATE POLICY "Users can delete rich menu images for their org"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'rich-menu-images' AND
  (storage.foldername(name))[1] = (auth.jwt() -> 'organization_id')::TEXT
);
```

### 5.2 画像アップロードコンポーネント

```typescript
// components/rich-menus/ImageUploader.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'

interface ImageUploaderProps {
  organizationId: string
  onImageUploaded: (url: string) => void
  maxSize?: number // MB
  acceptedFormats?: string[]
}

export function ImageUploader({
  organizationId,
  onImageUploaded,
  maxSize = 2.5,
  acceptedFormats = ['image/png', 'image/jpeg']
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // バリデーション
    if (!acceptedFormats.includes(file.type)) {
      alert('PNG または JPEG 形式の画像のみアップロード可能です')
      return
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`ファイルサイズは ${maxSize}MB 以下にしてください`)
      return
    }

    setUploading(true)

    try {
      // プレビュー表示
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Supabase Storageにアップロード
      const fileName = `${organizationId}/${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage
        .from('rich-menu-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from('rich-menu-images')
        .getPublicUrl(fileName)

      onImageUploaded(urlData.publicUrl)

    } catch (error) {
      console.error('Upload error:', error)
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUploaded('')
  }

  return (
    <div className="space-y-4">
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">クリックしてアップロード</span> またはドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPEG (最大 {maxSize}MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={acceptedFormats.join(',')}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      ) : (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full rounded-lg" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {uploading && (
        <div className="text-center text-sm text-gray-500">
          アップロード中...
        </div>
      )}
    </div>
  )
}
```

### 5.3 画像サイズバリデーション

```typescript
// lib/image-validation.ts
export async function validateRichMenuImage(file: File, expectedHeight: 1686 | 843) {
  return new Promise<{ valid: boolean; error?: string }>((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      // サイズチェック
      if (img.width !== 2500) {
        resolve({ valid: false, error: '画像の幅は2500pxである必要があります' })
        return
      }

      if (img.height !== expectedHeight) {
        resolve({
          valid: false,
          error: `画像の高さは${expectedHeight}pxである必要があります`
        })
        return
      }

      resolve({ valid: true })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ valid: false, error: '画像の読み込みに失敗しました' })
    }

    img.src = objectUrl
  })
}
```

---

## 6. アクション設定機能

### 6.1 アクション設定フォーム

```typescript
// components/rich-menus/ActionForm.tsx
'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface ActionFormProps {
  initialAction?: {
    type: 'uri' | 'message' | 'postback'
    data: any
  }
  onChange: (action: any) => void
}

export function ActionForm({ initialAction, onChange }: ActionFormProps) {
  const [actionType, setActionType] = useState(initialAction?.type || 'uri')
  const [actionData, setActionData] = useState(initialAction?.data || {})

  const handleTypeChange = (type: string) => {
    setActionType(type as any)
    setActionData({}) // リセット
    onChange({ type, data: {} })
  }

  const handleDataChange = (key: string, value: any) => {
    const newData = { ...actionData, [key]: value }
    setActionData(newData)
    onChange({ type: actionType, data: newData })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>アクションタイプ</Label>
        <RadioGroup value={actionType} onValueChange={handleTypeChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="uri" id="uri" />
            <Label htmlFor="uri">URI（Webページを開く）</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="message" id="message" />
            <Label htmlFor="message">メッセージ（テキストを送信）</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="postback" id="postback" />
            <Label htmlFor="postback">Postback（データを送信）</Label>
          </div>
        </RadioGroup>
      </div>

      {actionType === 'uri' && (
        <div>
          <Label htmlFor="uri-input">URL</Label>
          <Input
            id="uri-input"
            type="url"
            placeholder="https://example.com"
            value={actionData.uri || ''}
            onChange={(e) => handleDataChange('uri', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            LINE内ブラウザで開かれます。LIFFアプリのURLも指定可能です。
          </p>
        </div>
      )}

      {actionType === 'message' && (
        <div>
          <Label htmlFor="message-input">送信するメッセージ</Label>
          <Textarea
            id="message-input"
            placeholder="予約する"
            value={actionData.text || ''}
            onChange={(e) => handleDataChange('text', e.target.value)}
            maxLength={300}
          />
          <p className="text-xs text-gray-500 mt-1">
            ユーザーがタップすると、このテキストが自動送信されます。
          </p>
        </div>
      )}

      {actionType === 'postback' && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="postback-data">Postbackデータ</Label>
            <Input
              id="postback-data"
              placeholder="action=view_reservations"
              value={actionData.data || ''}
              onChange={(e) => handleDataChange('data', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              サーバーに送信されるデータ（クエリパラメータ形式）
            </p>
          </div>
          <div>
            <Label htmlFor="postback-display">表示テキスト（オプション）</Label>
            <Input
              id="postback-display"
              placeholder="予約一覧を表示"
              value={actionData.displayText || ''}
              onChange={(e) => handleDataChange('displayText', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              ユーザーに見えるメッセージ（省略可）
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 6.2 Postback処理（LINE Webhook）

Postbackアクションがトリガーされた場合の処理を `process-line-webhook` Edge Functionで実装：

```typescript
// supabase/functions/process-line-webhook/index.ts（追加部分）

async function handlePostback(supabase: any, event: any) {
  const data = new URLSearchParams(event.postback.data)
  const action = data.get('action')

  switch (action) {
    case 'view_reservations':
      // 予約一覧を表示するLIFFアプリURLを返信
      await sendMessage(
        supabase,
        event.source.userId,
        {
          type: 'text',
          text: '予約一覧はこちら: https://liff.line.me/xxx/reservations'
        }
      )
      break

    case 'cancel_reservation':
      // 予約キャンセル処理
      const reservationId = data.get('reservation_id')
      await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', reservationId)

      await sendMessage(
        supabase,
        event.source.userId,
        {
          type: 'text',
          text: '予約をキャンセルしました。'
        }
      )
      break

    default:
      console.log('Unknown postback action:', action)
  }

  // analytics_eventsに記録
  await supabase
    .from('analytics_events')
    .insert({
      event_type: 'postback',
      event_data: {
        action,
        raw_data: event.postback.data
      }
    })
}
```

---

## 7. 実装タスク分解

### 7.1 Phase 4.1: データベース・Storage準備（1日）

- [ ] rich_menus, rich_menu_areasテーブル作成
- [ ] RLSポリシー設定
- [ ] rich-menu-images Storageバケット作成
- [ ] Storage RLSポリシー設定
- [ ] インデックス作成

### 7.2 Phase 4.2: リッチメニュー一覧画面（1日）

- [ ] `/rich-menus` ページ作成
- [ ] リッチメニュー一覧取得API
- [ ] 一覧表示コンポーネント
- [ ] ステータス管理（draft/active/inactive）
- [ ] デフォルト設定切替
- [ ] 削除機能

### 7.3 Phase 4.3: リッチメニュー作成画面（2日）

- [ ] `/rich-menus/new` ページ作成
- [ ] 基本情報フォーム（名前、チャットバーテキスト、サイズ）
- [ ] レイアウトプリセット選択UI
- [ ] グリッド分割ビジュアルエディタ
- [ ] タップ領域ハイライト表示
- [ ] モバイルプレビューコンポーネント

### 7.4 Phase 4.4: 画像アップロード機能（1日）

- [ ] ImageUploaderコンポーネント
- [ ] ドラッグ&ドロップ対応
- [ ] 画像サイズバリデーション（2500×1686 or 2500×843）
- [ ] ファイルサイズチェック（最大2.5MB）
- [ ] プレビュー表示
- [ ] Supabase Storage連携

### 7.5 Phase 4.5: アクション設定機能（1日）

- [ ] ActionFormコンポーネント
- [ ] URIアクション設定
- [ ] Messageアクション設定
- [ ] Postbackアクション設定
- [ ] アクションデータのJSONB保存

### 7.6 Phase 4.6: LINE API連携（1-2日）

- [ ] create-rich-menu Edge Function作成
- [ ] LINE Rich Menu作成API連携
- [ ] 画像アップロードAPI連携
- [ ] デフォルトメニュー設定API連携
- [ ] 削除API連携
- [ ] Postback処理（Webhook）

### 7.7 Phase 4.7: テスト・最適化（1日）

- [ ] E2Eテスト（リッチメニュー作成～公開）
- [ ] 画像アップロードテスト
- [ ] LINE実機テスト
- [ ] エラーハンドリング強化
- [ ] パフォーマンス最適化

---

## 8. テストシナリオ

### 8.1 機能テスト

#### テストケース1: リッチメニュー作成（基本フロー）
1. `/rich-menus/new` にアクセス
2. メニュー名「テストメニュー」を入力
3. チャットバーテキスト「メニュー」を入力
4. サイズ「Full (1686px)」を選択
5. レイアウト「2x2」を選択
6. 画像をアップロード（2500×1686px、PNG）
7. エリア1にURIアクション「https://example.com」を設定
8. 「保存」をクリック
9. リッチメニューがdraftステータスで保存されることを確認

#### テストケース2: リッチメニュー公開
1. 作成したリッチメニューの「公開」ボタンをクリック
2. Edge Functionが実行され、LINE APIにリッチメニューが作成される
3. line_rich_menu_idが保存される
4. ステータスが「active」に変更される
5. LINE実機でリッチメニューが表示される

#### テストケース3: 画像アップロードバリデーション
1. 不正な画像サイズ（2500×2000px）をアップロード
2. エラーメッセージ「画像の高さは1686pxである必要があります」が表示される
3. ファイルサイズ3MBの画像をアップロード
4. エラーメッセージ「ファイルサイズは2.5MB以下にしてください」が表示される

#### テストケース4: タップ領域アクション
1. エリア1に「Message」アクション「予約する」を設定
2. エリア2に「Postback」アクション「action=view_menu」を設定
3. LINE実機でエリア1をタップ
4. 「予約する」メッセージが自動送信される
5. エリア2をタップ
6. Postback Webhookが発火し、処理が実行される

### 8.2 Edge Case テスト

- [ ] 同時に複数のリッチメニューをデフォルト設定（最後に設定したものが優先）
- [ ] リッチメニュー削除時、LINE APIからも削除される
- [ ] 画像URLが無効な場合のエラーハンドリング
- [ ] 20個以上のタップ領域を設定しようとした場合のバリデーション
- [ ] チャットバーテキスト15文字入力時のバリデーション

### 8.3 パフォーマンステスト

- [ ] 大容量画像（2.5MB）のアップロード時間
- [ ] リッチメニュー一覧の読み込み速度（100件のリッチメニュー）
- [ ] LINE API連携のタイムアウト処理

### 8.4 セキュリティテスト

- [ ] RLSポリシーが正しく機能している（他組織のリッチメニューが見えない）
- [ ] Storage RLSポリシーが正しく機能している（他組織の画像が見えない）
- [ ] 不正なアクションデータを保存しようとした場合の検証

---

## まとめ

### Phase 4 実装の重要ポイント

1. **ビジュアルエディタの直感性**
   - ユーザーがドラッグ&ドロップで簡単にタップ領域を設定できるUI
   - リアルタイムプレビューで即座に確認可能

2. **LINE API連携の堅牢性**
   - Edge Functionでの適切なエラーハンドリング
   - API呼び出し失敗時のリトライロジック
   - Webhook処理の確実性

3. **画像管理の最適化**
   - Supabase Storageの効率的な利用
   - 適切なバリデーションとエラーメッセージ
   - CDN経由での高速配信

4. **拡張性の確保**
   - カスタムグリッドレイアウト対応（将来的に）
   - 複数リッチメニューの切り替え機能（タグベース）
   - A/Bテスト機能（将来的に）

### 次フェーズへの接続

Phase 4完了後、以下の機能との連携を実装：
- **Phase 5: 予約管理** - リッチメニューから予約ページへの誘導
- **Phase 6: フォーム** - リッチメニューからフォーム回答への誘導
- **Phase 7: 分析** - リッチメニュータップ率の分析

---

**実装開始の準備完了**: このドキュメントに基づき、Phase 4の実装を開始できます。

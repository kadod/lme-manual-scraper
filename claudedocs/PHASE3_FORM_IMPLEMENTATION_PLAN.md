# Phase 3: フォーム機能 完全実装計画書

**作成日**: 2025-10-29
**対象**: L Message SaaS - フォーム作成・回答管理機能
**推定期間**: Week 6-7 (2週間)
**優先度**: 🟢 Medium (Phase 3 - Advanced)

---

## 📋 エグゼクティブサマリー

Phase 3では、エルメの主要機能の一つである「フォーム作成機能」を実装します。この機能により、ユーザーはノーコードでアンケート、予約、申し込みフォームを作成でき、LINE友だちから回答を収集し、自動応答と連携させることができます。

### Phase 3の目標

- **フォームビルダー**: ドラッグ&ドロップで11種類のフィールドタイプを配置
- **フォーム回答管理**: 回答データの収集、閲覧、CSVエクスポート
- **公開URL生成**: フォームをLINE外部で公開できるURL発行
- **自動応答連携**: フォーム送信後のサンクスメッセージとタグ付与
- **条件分岐機能**: 回答内容に応じた動的フォーム表示

---

## 🎯 機能要件定義

### 1. フォーム作成機能

#### 1.1 フォームビルダー UI

**画面**: `/dashboard/forms/new`

**主要機能**:
- ドラッグ&ドロップによるフィールド配置
- フィールドの追加・削除・並び替え
- フォームプレビュー（リアルタイム）
- フォーム設定（タイトル、説明文、送信ボタンテキスト）
- デザインカスタマイズ（テーマカラー、背景画像）

**UXフロー**:
```
1. 「新規フォーム作成」ボタンクリック
2. フォームタイトル入力
3. 左サイドバーからフィールドをドラッグ
4. フィールド設定（ラベル、必須項目、バリデーション）
5. プレビュー確認
6. 保存 → 公開URL発行
```

#### 1.2 フォームフィールドタイプ（11種類）

**仕様出典**: `lme_saas_features_complete.md` - Line 119

| No | フィールドタイプ | 説明 | バリデーション |
|----|----------------|------|---------------|
| 1 | **テキスト（1行）** | 短い文字入力 | 最大文字数、文字種制限 |
| 2 | **テキスト（複数行）** | 長文入力 | 最大文字数 |
| 3 | **メールアドレス** | メール入力 | メール形式検証 |
| 4 | **電話番号** | 電話番号入力 | 電話番号形式検証 |
| 5 | **数値** | 数値入力 | 最小値/最大値、整数/小数 |
| 6 | **日付** | 日付選択 | 日付範囲制限 |
| 7 | **時刻** | 時刻選択 | 時刻範囲制限 |
| 8 | **単一選択（ラジオボタン）** | 1つだけ選択 | 必須/任意 |
| 9 | **複数選択（チェックボックス）** | 複数選択可能 | 最小/最大選択数 |
| 10 | **ドロップダウン** | プルダウンメニュー | 必須/任意 |
| 11 | **ファイルアップロード** | ファイル添付 | ファイル種類、最大サイズ |

#### 1.3 フィールド共通設定項目

```typescript
interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  description?: string
  required: boolean
  order: number

  // バリデーション
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
    allowedFileTypes?: string[]
    maxFileSize?: number
  }

  // 選択肢（ラジオ、チェックボックス、ドロップダウン用）
  options?: {
    value: string
    label: string
  }[]

  // 条件分岐
  conditions?: {
    showIf?: {
      fieldId: string
      operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan'
      value: string
    }[]
  }
}
```

#### 1.4 フォーム設定項目

```typescript
interface Form {
  id: string
  organizationId: string
  channelId: string

  // 基本情報
  title: string
  description?: string
  status: 'draft' | 'published' | 'closed'

  // 公開設定
  publicUrl: string
  isPublic: boolean
  publishedAt?: Date
  closedAt?: Date

  // デザイン
  theme: {
    primaryColor: string
    backgroundColor: string
    fontFamily: string
  }

  // ボタン設定
  submitButtonText: string

  // 回答後の動作
  afterSubmit: {
    showMessage: boolean
    messageText?: string
    redirectUrl?: string
    addTags?: string[] // タグIDの配列
    sendLineMessage?: {
      enabled: boolean
      messageId?: string
    }
  }

  // 制限
  limits: {
    maxSubmissions?: number
    oneSubmissionPerUser: boolean
    requireAuthentication: boolean
  }

  // 通知設定
  notifications: {
    enabled: boolean
    emailRecipients?: string[]
    lineNotify?: boolean
  }

  // メタデータ
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
```

---

### 2. フォーム回答管理機能

#### 2.1 回答一覧画面

**画面**: `/dashboard/forms/[id]/submissions`

**主要機能**:
- 回答データの一覧表示（テーブル形式）
- フィルタリング（日付範囲、友だち、タグ）
- ソート機能（送信日時、友だち名）
- 検索機能（回答内容で検索）
- 回答詳細表示（モーダル）
- 一括操作（削除、タグ付与、CSVエクスポート）

**テーブルカラム例**:
| 送信日時 | 友だち名 | フィールド1 | フィールド2 | ... | アクション |
|---------|---------|-----------|-----------|-----|----------|
| 2025-10-29 10:30 | 田中太郎 | 回答内容 | 回答内容 | ... | 詳細/削除 |

#### 2.2 回答詳細表示

**機能**:
- 全フィールドの回答内容表示
- 送信元友だち情報表示
- IPアドレス、User-Agent表示
- タグ付与/削除
- LINE通知送信
- 回答の編集（管理者のみ）
- 回答の削除

#### 2.3 CSVエクスポート

**出力形式**:
```csv
送信日時,友だち名,LINEユーザーID,フィールド1,フィールド2,...
2025-10-29 10:30:00,田中太郎,U1234567890,回答1,回答2,...
```

**エクスポート設定**:
- 期間指定エクスポート
- フィールド選択エクスポート
- 文字コード選択（UTF-8, Shift-JIS）
- フィルタ適用後のエクスポート

---

### 3. 公開URL生成機能

#### 3.1 URL生成仕様

**URL形式**:
```
https://yourdomain.com/f/{form_slug}
```

**機能**:
- 短縮URL生成
- カスタムスラッグ設定
- QRコード生成（公開URL用）
- URL埋め込みコード生成（iframe）

#### 3.2 フォーム公開ページ

**画面**: `/f/[form_slug]`

**主要機能**:
- レスポンシブデザイン（PC/スマホ対応）
- フォーム送信処理
- バリデーションエラー表示
- 送信完了メッセージ表示
- LIFF連携（LINE内ブラウザで開いた場合、友だち情報を自動取得）

**LIFF連携フロー**:
```
1. LINEトーク内でフォームURLをクリック
2. LIFF起動 → LINE友だち情報取得
3. フォーム回答を友だちに紐付けて保存
4. サンクスメッセージ自動送信
```

---

### 4. 自動応答連携機能

#### 4.1 サンクスメッセージ送信

**トリガー**: フォーム送信完了時

**設定項目**:
```typescript
interface FormAutoReply {
  enabled: boolean
  messageType: 'text' | 'flex' | 'template'
  messageContent: LineMessage
  delaySeconds: number // 送信遅延（秒）
}
```

**メッセージテンプレート例**:
```
ご回答ありがとうございました！
内容を確認次第、担当者よりご連絡いたします。

【回答内容】
お名前: {{field_name}}
メールアドレス: {{field_email}}
```

#### 4.2 タグ自動付与

**トリガー**: フォーム送信完了時

**設定項目**:
- 付与するタグの選択（複数可）
- 条件付き付与（特定の回答内容の場合のみ）

**条件例**:
```
フィールド「興味のある商品」が「プランA」の場合
→ タグ「プランA希望者」を自動付与
```

#### 4.3 ステップ配信トリガー

**トリガー**: フォーム送信完了時

**設定項目**:
- ステップ配信キャンペーンの選択
- トリガー条件（無条件 or 回答内容で条件分岐）

---

## 🗄️ データベーススキーマ設計

### 3テーブル構成

#### Table 1: `forms` (フォームマスター)

```sql
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES line_channels(id) ON DELETE CASCADE,

  -- 基本情報
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL, -- 公開URL用スラッグ
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'closed'

  -- 公開設定
  is_public BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,

  -- デザイン設定
  theme JSONB DEFAULT '{"primaryColor": "#00B900", "backgroundColor": "#FFFFFF"}',
  submit_button_text TEXT DEFAULT '送信する',

  -- 回答後の動作
  after_submit JSONB DEFAULT '{}', -- afterSubmit interface

  -- 制限設定
  limits JSONB DEFAULT '{}', -- limits interface

  -- 通知設定
  notifications JSONB DEFAULT '{}', -- notifications interface

  -- 統計情報
  total_submissions INTEGER DEFAULT 0,

  -- メタデータ
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_forms_org ON forms(organization_id);
CREATE INDEX idx_forms_channel ON forms(channel_id);
CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_forms_status ON forms(status);

-- RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage forms in their organizations"
ON forms FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

#### Table 2: `form_fields` (フォームフィールド定義)

```sql
CREATE TABLE form_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,

  -- フィールド基本情報
  type TEXT NOT NULL, -- 'text', 'textarea', 'email', 'tel', 'number', 'date', 'time', 'radio', 'checkbox', 'select', 'file'
  label TEXT NOT NULL,
  placeholder TEXT,
  description TEXT,
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL, -- 表示順

  -- バリデーション設定
  validation JSONB DEFAULT '{}',

  -- 選択肢（radio, checkbox, select用）
  options JSONB, -- [{value: "value1", label: "Label 1"}, ...]

  -- 条件分岐
  conditions JSONB, -- {showIf: [{fieldId: "xxx", operator: "equals", value: "value"}]}

  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_form_fields_form ON form_fields(form_id);
CREATE INDEX idx_form_fields_order ON form_fields(form_id, order_index);

-- RLS
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage form fields in their organizations"
ON form_fields FOR ALL
USING (
  form_id IN (
    SELECT id FROM forms
    WHERE organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  )
);
```

#### Table 3: `form_responses` (フォーム回答データ)

```sql
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES line_friends(id) ON DELETE SET NULL,

  -- 回答データ
  response_data JSONB NOT NULL, -- {fieldId: value, fieldId: value, ...}

  -- 送信者情報
  ip_address INET,
  user_agent TEXT,

  -- LIFF情報
  liff_context JSONB, -- LIFF経由の場合のコンテキスト情報

  -- メタデータ
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_form_responses_form ON form_responses(form_id);
CREATE INDEX idx_form_responses_friend ON form_responses(friend_id);
CREATE INDEX idx_form_responses_submitted ON form_responses(submitted_at DESC);

-- RLS
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses in their organizations"
ON form_responses FOR SELECT
USING (
  form_id IN (
    SELECT id FROM forms
    WHERE organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Anyone can insert form responses"
ON form_responses FOR INSERT
WITH CHECK (true);
```

---

## 🏗️ アーキテクチャ設計

### フロントエンド画面構成（4画面）

#### 1. `/dashboard/forms` - フォーム一覧

**コンポーネント構成**:
```
forms/
├── page.tsx (一覧画面)
├── components/
│   ├── FormList.tsx (フォームカード一覧)
│   ├── FormCard.tsx (個別フォームカード)
│   ├── FormFilters.tsx (フィルタUI)
│   └── FormStats.tsx (統計サマリー)
```

**表示情報**:
- フォームタイトル
- ステータス（下書き/公開中/終了）
- 回答数
- 作成日時
- アクション（編集/回答閲覧/複製/削除）

#### 2. `/dashboard/forms/new` - フォーム作成

**コンポーネント構成**:
```
forms/new/
├── page.tsx (メイン画面)
├── components/
│   ├── FormBuilder.tsx (ビルダーメイン)
│   ├── FieldPalette.tsx (フィールド一覧サイドバー)
│   ├── FieldEditor.tsx (フィールド設定パネル)
│   ├── FormPreview.tsx (プレビュー)
│   ├── FormSettings.tsx (フォーム設定ダイアログ)
│   └── fields/
│       ├── TextField.tsx
│       ├── EmailField.tsx
│       ├── RadioField.tsx
│       └── ... (各フィールドタイプコンポーネント)
```

**レイアウト**:
```
┌─────────────────────────────────────────────────────┐
│ Header: フォーム作成                       [保存][公開] │
├───────┬─────────────────────────┬───────────────────┤
│       │                         │                   │
│ Field │   Form Builder Area     │   Field Editor    │
│ Palet │                         │                   │
│       │   (Drag & Drop)         │   (Settings)      │
│       │                         │                   │
│       ├─────────────────────────┤                   │
│       │   Preview               │                   │
│       │   (Real-time)           │                   │
└───────┴─────────────────────────┴───────────────────┘
```

#### 3. `/dashboard/forms/[id]/edit` - フォーム編集

**機能**: `/dashboard/forms/new` と同じUI、データロード機能追加

#### 4. `/dashboard/forms/[id]/submissions` - 回答一覧

**コンポーネント構成**:
```
forms/[id]/submissions/
├── page.tsx (回答一覧画面)
├── components/
│   ├── SubmissionTable.tsx (回答テーブル)
│   ├── SubmissionFilters.tsx (フィルタ)
│   ├── SubmissionDetail.tsx (詳細モーダル)
│   ├── ExportDialog.tsx (エクスポート設定)
│   └── BulkActions.tsx (一括操作)
```

**表示情報**:
- 送信日時
- 友だち名（LINE表示名）
- 各フィールドの回答内容（カラム化）
- アクション（詳細/削除）

#### 5. `/f/[slug]` - 公開フォームページ

**コンポーネント構成**:
```
(public)/
├── f/
│   └── [slug]/
│       ├── page.tsx (公開フォーム)
│       └── components/
│           ├── PublicFormLayout.tsx
│           ├── FormField.tsx (フィールド描画)
│           ├── SubmitButton.tsx
│           └── ThankYouMessage.tsx
```

**特徴**:
- レスポンシブデザイン
- LIFF連携（LINE内ブラウザ対応）
- リアルタイムバリデーション
- プログレスバー（複数ページフォームの場合）

---

### バックエンド処理フロー

#### 1. フォーム作成フロー

```typescript
// POST /api/forms

1. フォーム基本情報をformsテーブルに挿入
2. スラッグ生成（ユニークチェック）
3. フォームフィールドをform_fieldsテーブルに一括挿入
4. 公開URL生成
5. フォームIDを返却
```

#### 2. フォーム回答送信フロー

```typescript
// POST /api/forms/[slug]/submit

1. スラッグからフォーム取得
2. フォームステータス確認（published かチェック）
3. 回答データバリデーション
   - 必須項目チェック
   - データ型チェック
   - バリデーションルール適用
4. LIFF経由の場合、LINE友だち情報取得
5. form_responsesテーブルに挿入
6. forms.total_submissions をインクリメント
7. 自動応答処理（Edge Function呼び出し）
   - サンクスメッセージ送信
   - タグ自動付与
   - ステップ配信トリガー
8. 通知処理（メール/LINE Notify）
9. 送信完了レスポンス
```

#### 3. 回答一覧取得フロー

```typescript
// GET /api/forms/[id]/submissions

1. フォームID検証（RLS自動適用）
2. クエリパラメータ解析
   - page, limit (ページネーション)
   - sort, order (ソート)
   - filters (フィルタ条件)
3. form_responsesテーブルからデータ取得
4. JOIN line_friends で友だち情報付与
5. レスポンス整形
```

---

### Edge Functions（2関数）

#### 1. `process-form-submission`

**役割**: フォーム送信後の自動処理

**トリガー**: Database Trigger（form_responses INSERT後）

**処理内容**:
```typescript
export async function processFormSubmission(payload: FormSubmissionPayload) {
  const { formId, responseId, friendId } = payload

  // 1. フォーム設定取得
  const form = await supabase.from('forms').select('*').eq('id', formId).single()

  // 2. サンクスメッセージ送信
  if (form.after_submit.sendLineMessage?.enabled && friendId) {
    await sendLineMessage({
      to: friendId,
      messageId: form.after_submit.sendLineMessage.messageId
    })
  }

  // 3. タグ自動付与
  if (form.after_submit.addTags?.length && friendId) {
    await addTagsToFriend(friendId, form.after_submit.addTags)
  }

  // 4. 通知送信
  if (form.notifications.enabled) {
    await sendNotifications(form, responseId)
  }

  // 5. ステップ配信トリガー（今後実装）
  // await triggerStepCampaign(friendId, formId)
}
```

#### 2. `export-form-responses`

**役割**: フォーム回答のCSVエクスポート

**トリガー**: HTTP Request（ユーザー操作）

**処理内容**:
```typescript
export async function exportFormResponses(request: Request) {
  const { formId, filters, fields } = await request.json()

  // 1. データ取得（フィルタ適用）
  const responses = await fetchResponses(formId, filters)

  // 2. CSV変換
  const csv = convertToCSV(responses, fields)

  // 3. Supabase Storageにアップロード
  const fileName = `form_${formId}_${Date.now()}.csv`
  const { data } = await supabase.storage
    .from('exports')
    .upload(fileName, csv)

  // 4. ダウンロードURL生成（1時間有効）
  const { data: { signedUrl } } = await supabase.storage
    .from('exports')
    .createSignedUrl(fileName, 3600)

  return { url: signedUrl }
}
```

---

## 🎨 UI/UX設計

### フォームビルダーのインタラクション

#### ドラッグ&ドロップ実装

**ライブラリ**: `@dnd-kit/core` + `@dnd-kit/sortable`

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

function FormBuilder() {
  const [fields, setFields] = useState<FormField[]>([])

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id)
      const newIndex = fields.findIndex(f => f.id === over.id)

      setFields(arrayMove(fields, oldIndex, newIndex))
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields} strategy={verticalListSortingStrategy}>
        {fields.map(field => (
          <SortableField key={field.id} field={field} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

#### リアルタイムプレビュー

**実装**: フォームビルダーの変更を即座にプレビューに反映

```typescript
const [formData, setFormData] = useState<Form>({...})
const [fields, setFields] = useState<FormField[]>([])

// プレビューコンポーネント
function FormPreview({ form, fields }) {
  return (
    <div style={{ backgroundColor: form.theme.backgroundColor }}>
      <h2>{form.title}</h2>
      <p>{form.description}</p>

      {fields.map(field => (
        <FormFieldPreview key={field.id} field={field} />
      ))}

      <Button style={{ backgroundColor: form.theme.primaryColor }}>
        {form.submitButtonText}
      </Button>
    </div>
  )
}
```

---

### フィールド設定パネルのUI

**shadcn/ui Components**:
- `Input` - テキスト入力
- `Textarea` - 説明文入力
- `Switch` - 必須項目トグル
- `Select` - フィールドタイプ選択
- `Accordion` - 詳細設定の折りたたみ
- `Tabs` - 基本設定/バリデーション/条件分岐のタブ切り替え

**レイアウト例**:
```tsx
<div className="w-80 border-l bg-white p-6">
  <h3>フィールド設定</h3>

  <Tabs defaultValue="basic">
    <TabsList>
      <TabsTrigger value="basic">基本</TabsTrigger>
      <TabsTrigger value="validation">検証</TabsTrigger>
      <TabsTrigger value="conditions">条件</TabsTrigger>
    </TabsList>

    <TabsContent value="basic">
      <Label>ラベル</Label>
      <Input value={field.label} onChange={...} />

      <Label>プレースホルダー</Label>
      <Input value={field.placeholder} onChange={...} />

      <div className="flex items-center gap-2">
        <Switch checked={field.required} onCheckedChange={...} />
        <Label>必須項目</Label>
      </div>
    </TabsContent>

    <TabsContent value="validation">
      {/* バリデーション設定UI */}
    </TabsContent>

    <TabsContent value="conditions">
      {/* 条件分岐設定UI */}
    </TabsContent>
  </Tabs>
</div>
```

---

## 🔐 セキュリティ設計

### 1. フォーム送信時のセキュリティ

**CSRF対策**:
- Next.js Server Actionsを使用（自動的にCSRF保護）
- 公開フォームには独自のトークン検証

**Rate Limiting**:
```typescript
// Edge Functionでレート制限実装
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15分
  maxRequests: 5, // 最大5回
}

// IPアドレスベースの制限
if (await isRateLimited(ipAddress)) {
  return new Response('Too Many Requests', { status: 429 })
}
```

**スパム対策**:
- reCAPTCHA v3統合（オプション）
- ハニーポット（隠しフィールド）
- 送信間隔チェック

### 2. データ保護

**個人情報の暗号化**:
```sql
-- メールアドレス、電話番号など機密情報を暗号化
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 暗号化して保存
UPDATE form_responses
SET response_data = jsonb_set(
  response_data,
  '{email}',
  to_jsonb(pgp_sym_encrypt(email_value, 'encryption_key'))
);
```

**RLS（Row Level Security）**:
- すべてのテーブルにRLS適用済み
- 組織IDベースのアクセス制御
- 公開フォーム送信はINSERTのみ許可

---

## 📊 パフォーマンス最適化

### 1. フォームビルダーの最適化

**仮想化リスト**:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

// フィールドが50個以上の場合に仮想化
function FieldList({ fields }) {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: fields.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      {virtualizer.getVirtualItems().map((virtualItem) => (
        <FieldRow key={virtualItem.key} field={fields[virtualItem.index]} />
      ))}
    </div>
  )
}
```

### 2. 回答一覧のページネーション

**サーバーサイドページネーション**:
```typescript
// GET /api/forms/[id]/submissions?page=1&limit=50

const { data, count } = await supabase
  .from('form_responses')
  .select('*, line_friends(display_name, picture_url)', { count: 'exact' })
  .eq('form_id', formId)
  .range((page - 1) * limit, page * limit - 1)
  .order('submitted_at', { ascending: false })

return {
  data,
  pagination: {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  }
}
```

### 3. CSVエクスポートの非同期処理

**バックグラウンドジョブ**:
```typescript
// 大量データ（1000件以上）の場合、非同期処理
if (totalRecords > 1000) {
  // ジョブキューに追加
  await queueExportJob({
    formId,
    userId,
    filters,
    email: user.email
  })

  return { message: 'エクスポート処理を開始しました。完了後メールでお知らせします。' }
} else {
  // 即座にエクスポート
  const csv = await generateCSV(formId, filters)
  return { url: csv.downloadUrl }
}
```

---

## ✅ 実装チェックリスト（2週間）

### Week 1: フォーム作成機能

#### Day 1-2: データベース構築
- [ ] `forms` テーブル作成
- [ ] `form_fields` テーブル作成
- [ ] `form_responses` テーブル作成
- [ ] RLSポリシー設定
- [ ] インデックス作成
- [ ] Supabase型定義生成（`supabase gen types typescript`）

#### Day 3-4: フォームビルダーUI
- [ ] フォーム一覧画面実装（`/dashboard/forms`）
- [ ] フォーム作成画面レイアウト（`/dashboard/forms/new`）
- [ ] FieldPalette（フィールド一覧サイドバー）実装
- [ ] DnD機能実装（@dnd-kit/core）
- [ ] フィールド追加・削除機能

#### Day 5: フィールドタイプ実装（Part 1）
- [ ] TextField（1行テキスト）
- [ ] TextareaField（複数行テキスト）
- [ ] EmailField（メールアドレス）
- [ ] TelField（電話番号）
- [ ] NumberField（数値）

### Week 2: 回答管理・公開機能

#### Day 6: フィールドタイプ実装（Part 2）
- [ ] DateField（日付）
- [ ] TimeField（時刻）
- [ ] RadioField（単一選択）
- [ ] CheckboxField（複数選択）
- [ ] SelectField（ドロップダウン）
- [ ] FileUploadField（ファイルアップロード）

#### Day 7: フィールド設定パネル
- [ ] FieldEditor実装（右サイドバー）
- [ ] バリデーション設定UI
- [ ] 条件分岐設定UI（基本）
- [ ] オプション設定（ラジオ・チェックボックス用）

#### Day 8: プレビュー・保存機能
- [ ] リアルタイムプレビュー実装
- [ ] フォーム保存API（POST /api/forms）
- [ ] フォーム更新API（PATCH /api/forms/[id]）
- [ ] スラッグ生成ロジック
- [ ] 公開URL生成

#### Day 9: 公開フォームページ
- [ ] 公開フォーム画面実装（`/f/[slug]`）
- [ ] フォーム送信API（POST /api/forms/[slug]/submit）
- [ ] バリデーション実装（フロントエンド）
- [ ] サンクスメッセージ表示
- [ ] エラーハンドリング

#### Day 10: 回答管理機能
- [ ] 回答一覧画面実装（`/dashboard/forms/[id]/submissions`）
- [ ] 回答データ取得API（GET /api/forms/[id]/submissions）
- [ ] フィルタ・ソート機能
- [ ] 回答詳細モーダル
- [ ] 回答削除機能

#### Day 11: CSVエクスポート
- [ ] CSVエクスポート機能実装
- [ ] エクスポート設定ダイアログ
- [ ] Edge Function: `export-form-responses`
- [ ] Supabase Storage設定（exportsバケット）

#### Day 12: 自動応答連携
- [ ] Edge Function: `process-form-submission`
- [ ] サンクスメッセージ送信機能
- [ ] タグ自動付与機能
- [ ] 通知機能（メール/LINE Notify）

#### Day 13: LIFF連携
- [ ] LIFF設定（LINE Developers）
- [ ] LIFF SDK統合
- [ ] LINE友だち情報取得機能
- [ ] LIFF経由フォーム送信テスト

#### Day 14: テスト・デバッグ
- [ ] フォーム作成フローテスト
- [ ] 全フィールドタイプの動作確認
- [ ] バリデーションテスト
- [ ] 回答送信テスト
- [ ] CSVエクスポートテスト
- [ ] 自動応答テスト
- [ ] パフォーマンステスト
- [ ] バグフィックス

---

## 🚀 実装順序の推奨フロー

### 優先順位付け

**Phase 3-1: 基本機能（必須）**
1. フォーム作成（テキストフィールドのみ）
2. フォーム保存・公開
3. 公開フォームページ
4. 回答送信・保存
5. 回答一覧表示

**Phase 3-2: 拡張機能（重要）**
6. 全フィールドタイプ実装
7. バリデーション機能
8. CSVエクスポート
9. 回答詳細・削除

**Phase 3-3: 高度な機能（オプション）**
10. 条件分岐機能
11. LIFF連携
12. 自動応答連携
13. A/Bテスト機能

---

## 📝 コード実装例

### 1. フォーム作成API（Server Action）

```typescript
// app/dashboard/forms/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createForm(formData: {
  title: string
  description?: string
  fields: FormField[]
}) {
  const supabase = await createClient()

  // 1. スラッグ生成
  const slug = generateSlug(formData.title)

  // 2. フォーム挿入
  const { data: form, error: formError } = await supabase
    .from('forms')
    .insert({
      title: formData.title,
      description: formData.description,
      slug,
      status: 'draft',
    })
    .select()
    .single()

  if (formError) throw formError

  // 3. フィールド一括挿入
  const fieldsToInsert = formData.fields.map((field, index) => ({
    form_id: form.id,
    ...field,
    order_index: index,
  }))

  const { error: fieldsError } = await supabase
    .from('form_fields')
    .insert(fieldsToInsert)

  if (fieldsError) throw fieldsError

  revalidatePath('/dashboard/forms')

  return { formId: form.id, slug: form.slug }
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${base}-${randomSuffix}`
}
```

### 2. フォーム送信API（Public Endpoint）

```typescript
// app/api/forms/[slug]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient()
  const { slug } = params
  const body = await request.json()

  // 1. フォーム取得
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*, form_fields(*)')
    .eq('slug', slug)
    .single()

  if (formError || form.status !== 'published') {
    return NextResponse.json({ error: 'Form not found or not published' }, { status: 404 })
  }

  // 2. バリデーション
  const validationErrors = validateFormData(form.form_fields, body.responseData)
  if (validationErrors.length > 0) {
    return NextResponse.json({ errors: validationErrors }, { status: 400 })
  }

  // 3. 回答保存
  const { data: response, error: responseError } = await supabase
    .from('form_responses')
    .insert({
      form_id: form.id,
      friend_id: body.friendId || null,
      response_data: body.responseData,
      ip_address: request.ip,
      user_agent: request.headers.get('user-agent'),
    })
    .select()
    .single()

  if (responseError) {
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
  }

  // 4. 回答数インクリメント
  await supabase
    .from('forms')
    .update({ total_submissions: form.total_submissions + 1 })
    .eq('id', form.id)

  // 5. Edge Function呼び出し（自動応答処理）
  await fetch(`${process.env.SUPABASE_URL}/functions/v1/process-form-submission`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      formId: form.id,
      responseId: response.id,
      friendId: body.friendId,
    }),
  })

  return NextResponse.json({ success: true, responseId: response.id })
}

function validateFormData(fields: FormField[], data: Record<string, any>): string[] {
  const errors: string[] = []

  fields.forEach(field => {
    const value = data[field.id]

    // 必須項目チェック
    if (field.required && !value) {
      errors.push(`${field.label}は必須項目です`)
    }

    // バリデーションルール適用
    if (field.validation) {
      if (field.validation.minLength && value.length < field.validation.minLength) {
        errors.push(`${field.label}は${field.validation.minLength}文字以上で入力してください`)
      }

      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        errors.push(`${field.label}は${field.validation.maxLength}文字以内で入力してください`)
      }

      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern)
        if (!regex.test(value)) {
          errors.push(`${field.label}の形式が正しくありません`)
        }
      }
    }
  })

  return errors
}
```

### 3. フォームビルダーコンポーネント

```typescript
// app/dashboard/forms/new/components/FormBuilder.tsx
'use client'

import { useState } from 'react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { FieldPalette } from './FieldPalette'
import { SortableField } from './SortableField'
import { FieldEditor } from './FieldEditor'
import { FormPreview } from './FormPreview'
import { Button } from '@/components/ui/button'
import { createForm } from '../actions'

export function FormBuilder() {
  const [form, setForm] = useState<Form>({
    title: '新規フォーム',
    description: '',
    theme: { primaryColor: '#00B900', backgroundColor: '#FFFFFF' },
    submitButtonText: '送信する',
  })

  const [fields, setFields] = useState<FormField[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `フィールド ${fields.length + 1}`,
      required: false,
      order: fields.length,
    }

    setFields([...fields, newField])
    setSelectedFieldId(newField.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleFieldUpdate = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await createForm({ ...form, fields })
      alert('フォームを保存しました')
      // リダイレクト処理
    } catch (error) {
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const selectedField = fields.find(f => f.id === selectedFieldId)

  return (
    <div className="flex h-screen">
      {/* 左: フィールドパレット */}
      <FieldPalette onAddField={handleAddField} />

      {/* 中央: ビルダー */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="text-3xl font-bold border-none focus:outline-none"
            />
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields} strategy={verticalListSortingStrategy}>
              {fields.map(field => (
                <SortableField
                  key={field.id}
                  field={field}
                  isSelected={field.id === selectedFieldId}
                  onClick={() => setSelectedFieldId(field.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* プレビューセクション */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">プレビュー</h3>
            <FormPreview form={form} fields={fields} />
          </div>
        </div>
      </div>

      {/* 右: フィールド設定 */}
      {selectedField && (
        <FieldEditor
          field={selectedField}
          onUpdate={(updates) => handleFieldUpdate(selectedField.id, updates)}
          onClose={() => setSelectedFieldId(null)}
        />
      )}
    </div>
  )
}
```

---

## 🧪 テスト戦略

### 1. ユニットテスト

**テスト対象**:
- バリデーション関数
- スラッグ生成関数
- CSVエクスポート関数

**ツール**: Jest + React Testing Library

```typescript
// __tests__/forms/validation.test.ts
import { validateFormData } from '@/lib/forms/validation'

describe('validateFormData', () => {
  it('should validate required fields', () => {
    const fields = [
      { id: '1', label: 'Name', required: true }
    ]
    const data = {}

    const errors = validateFormData(fields, data)
    expect(errors).toContain('Nameは必須項目です')
  })

  it('should validate email format', () => {
    const fields = [
      { id: '1', label: 'Email', type: 'email', validation: { pattern: '^[^@]+@[^@]+\.[^@]+$' } }
    ]
    const data = { '1': 'invalid-email' }

    const errors = validateFormData(fields, data)
    expect(errors.length).toBeGreaterThan(0)
  })
})
```

### 2. 統合テスト

**テスト対象**:
- フォーム作成フロー
- フォーム送信フロー
- 回答データ取得

**ツール**: Playwright

```typescript
// e2e/forms.spec.ts
import { test, expect } from '@playwright/test'

test('create and submit form', async ({ page }) => {
  // 1. ログイン
  await page.goto('/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password')
  await page.click('button[type=submit]')

  // 2. フォーム作成
  await page.goto('/dashboard/forms/new')
  await page.fill('input[placeholder="フォームタイトル"]', 'テストフォーム')

  // 3. フィールド追加
  await page.click('[data-field-type="text"]')
  await page.fill('[name="field-label"]', 'お名前')

  // 4. 保存
  await page.click('button:has-text("保存")')
  await expect(page).toHaveURL(/\/dashboard\/forms/)

  // 5. 公開フォームにアクセス
  const slug = await page.textContent('[data-form-slug]')
  await page.goto(`/f/${slug}`)

  // 6. フォーム送信
  await page.fill('[name="field_1"]', '山田太郎')
  await page.click('button[type=submit]')
  await expect(page.locator('text=送信完了')).toBeVisible()
})
```

---

## 📈 成功指標（KPI）

### 開発完了の定義

- [ ] 11種類すべてのフィールドタイプが動作する
- [ ] フォーム作成から送信までのフルフロー完了
- [ ] CSVエクスポート機能が動作する
- [ ] 自動応答連携（サンクスメッセージ・タグ付与）が動作する
- [ ] パフォーマンステスト通過（フォーム送信1秒以内）
- [ ] E2Eテストカバレッジ80%以上
- [ ] ドキュメント整備完了

### パフォーマンス目標

- フォームビルダーの初期ロード: < 2秒
- フォーム送信レスポンス: < 1秒
- 回答一覧の表示: < 1.5秒（100件）
- CSVエクスポート: < 5秒（1000件）

---

## 🔄 Phase 4への引き継ぎ事項

### Phase 4で実装予定の関連機能

1. **リッチメニュー連携**: フォームURLをリッチメニューのアクションに設定
2. **ステップ配信連携**: フォーム送信をトリガーにステップ配信開始
3. **予約管理連携**: フォーム回答から予約データを自動作成
4. **クロス分析**: フォーム回答データを分析軸に追加

### データベース拡張の余地

- `form_fields` テーブルに新しいフィールドタイプを追加可能
- `form_responses.response_data` はJSONBなので柔軟に拡張可能
- 将来的に `form_pages` テーブルを追加して複数ページフォーム対応

---

## 📚 参考リソース

### 技術ドキュメント

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [dnd-kit Documentation](https://docs.dndkit.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [LINE Messaging API](https://developers.line.biz/ja/docs/messaging-api/)
- [LIFF Documentation](https://developers.line.biz/ja/docs/liff/)

### 類似製品の参考

- Typeform: https://www.typeform.com/
- Google Forms: https://www.google.com/forms/about/
- Jotform: https://www.jotform.com/
- エルメフォーム機能: （マニュアル分析済み）

---

## 🎓 学習リソース

### 実装前に学習すべき内容

1. **ドラッグ&ドロップ**: dnd-kit基礎
2. **フォームバリデーション**: React Hook Form + Zod
3. **JSONBクエリ**: PostgreSQLのJSONB操作
4. **Edge Functions**: Supabase Functionsの基礎
5. **LIFF**: LINE Front-end Frameworkの基本

---

## 📞 サポート・質問

Phase 3実装中に疑問点があれば、以下を確認してください：

1. **このドキュメント**: まず全体を再読
2. **元の要件定義**: `/claudedocs/REQUIREMENTS_V2.md`
3. **機能一覧**: `/claudedocs/lme_saas_features_complete.md` Line 115-136
4. **実装TODO**: `/claudedocs/implementation_todo_v2.md` Line 708-712

---

**作成者**: Claude (Anthropic)
**最終更新**: 2025-10-29
**バージョン**: 1.0
**ステータス**: Ready for Implementation

---

**Next Steps**: Phase 3実装開始 → Day 1「データベース構築」から着手

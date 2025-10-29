# フォーム分析機能 - クイックスタート

## 🚀 5分でセットアップ

### ステップ1: データベースマイグレーション（2分）

Supabase Dashboard → SQL Editor で実行:

```sql
-- ファイルの内容をコピー&ペースト
/supabase/migrations/20251029_create_forms_tables.sql
```

### ステップ2: 型定義の再生成（1分）

```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  > types/supabase.ts
```

### ステップ3: 開発サーバー起動（30秒）

```bash
npm run dev
```

### ステップ4: アクセス確認（30秒）

```
http://localhost:3000/dashboard/forms
```

### ステップ5: テストデータ投入（1分）

```sql
-- Supabase Dashboard → SQL Editor

-- 1. サンプルフォーム作成
INSERT INTO forms (organization_id, title, fields, status)
VALUES (
  'YOUR_ORG_ID'::uuid,
  'テストアンケート',
  '[
    {"id": "q1", "type": "radio", "label": "満足度", "options": ["満足", "普通", "不満"]},
    {"id": "q2", "type": "textarea", "label": "コメント"}
  ]'::jsonb,
  'active'
);

-- 2. サンプル回答追加
INSERT INTO form_responses (form_id, response_data, metadata, submitted_at, completion_time_seconds)
SELECT
  id,
  '{"q1": "満足", "q2": "とても良いです"}'::jsonb,
  '{"device": "mobile"}'::jsonb,
  NOW(),
  45
FROM forms WHERE title = 'テストアンケート';
```

---

## 📊 主要機能

### 分析ダッシュボード
```
/dashboard/forms/[id]/analytics
```

**表示内容**:
- ✅ 回答数統計（総数、完了、離脱、完了率）
- ✅ 回答推移グラフ（30日分）
- ✅ フィールド別分析（円グラフ、棒グラフ）
- ✅ デバイス分析
- ✅ ワードクラウド

---

## 🔧 よく使うコマンド

### データベース

```sql
-- 統計を手動計算
SELECT calculate_form_statistics('form-id'::uuid, CURRENT_DATE);

-- フィールド集計
SELECT aggregate_field_responses('form-id'::uuid, 'field-id');

-- トレンド取得
SELECT * FROM get_response_trends('form-id'::uuid, 30);

-- 回答データ確認
SELECT COUNT(*) FROM form_responses WHERE form_id = 'form-id'::uuid;
```

### 開発

```bash
# 開発サーバー
npm run dev

# ビルド（注意: 日本語パスでエラー）
npm run build

# 型チェック
npx tsc --noEmit

# Supabase ローカル
supabase start
supabase migration up
```

---

## 🎯 使用例

### Server Action から分析データ取得

```typescript
import { getFormAnalyticsAction } from '@/app/actions/forms'

// 30日分の分析データ取得
const analytics = await getFormAnalyticsAction(formId, 30)

console.log(analytics.overallStats)
// {
//   totalResponses: 150,
//   completedResponses: 142,
//   abandonedResponses: 8,
//   avgCompletionTime: 45.2,
//   completionRate: 94.67
// }
```

### コンポーネントで表示

```tsx
import { AnalyticsDashboard } from '@/components/forms/AnalyticsDashboard'

<AnalyticsDashboard
  formId={formId}
  analytics={analytics}
  wordCloudData={wordCloudData}
/>
```

---

## ⚠️ トラブルシューティング

### 問題: データが表示されない

```sql
-- 1. テーブル確認
SELECT * FROM forms;
SELECT * FROM form_responses;
SELECT * FROM form_analytics;

-- 2. RLS 確認
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename LIKE 'form%';

-- 3. 統計再計算
SELECT calculate_form_statistics('your-form-id'::uuid, CURRENT_DATE);
```

### 問題: 型エラー

```bash
# 型定義を再生成
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  > types/supabase.ts
```

### 問題: ビルドエラー（Turbopack）

**原因**: プロジェクトパスに日本語文字

**対処**:
- 開発環境では `npm run dev` を使用（問題なし）
- 本番ビルドはプロジェクトを英語パスに移動

---

## 📚 ドキュメント

1. **FORMS_ANALYTICS_README.md** - 概要と機能説明
2. **FORMS_ANALYTICS_IMPLEMENTATION.md** - 詳細技術仕様
3. **FORMS_ANALYTICS_SETUP.md** - 詳細セットアップガイド
4. **FORMS_ANALYTICS_QUICKSTART.md** - このファイル

---

## 🎨 カスタマイズ

### グラフの色を変更

```tsx
// components/forms/ResponseChart.tsx
<Line stroke="#YOUR_COLOR" />
<Bar fill="#YOUR_COLOR" />
```

### 集計期間を変更

```typescript
// デフォルト: 30日
const analytics = await getFormAnalyticsAction(formId, 30)

// 7日に変更
const analytics = await getFormAnalyticsAction(formId, 7)
```

### ワードクラウドの単語数を変更

```typescript
// デフォルト: 50単語
const words = await getTextFieldWordsAction(formId, fieldId, 50)

// 100単語に変更
const words = await getTextFieldWordsAction(formId, fieldId, 100)
```

---

## 📊 データ構造

### Form
```typescript
{
  id: string
  organization_id: string
  title: string
  fields: FormField[]
  status: 'draft' | 'active' | 'closed'
}
```

### FormResponse
```typescript
{
  id: string
  form_id: string
  response_data: Record<string, any>
  metadata: {
    device?: string
    browser?: string
  }
  submitted_at: string
  completion_time_seconds: number
}
```

### Analytics
```typescript
{
  trends: ResponseTrend[]
  overallStats: {
    totalResponses: number
    completedResponses: number
    abandonedResponses: number
    avgCompletionTime: number
    completionRate: number
  }
  deviceBreakdown: Record<string, number>
  fieldStats: Record<string, any>
}
```

---

## ✅ チェックリスト

セットアップ完了チェック:

- [ ] データベースマイグレーション実行
- [ ] 型定義生成
- [ ] 開発サーバー起動
- [ ] フォーム一覧ページ表示
- [ ] テストフォーム作成
- [ ] テスト回答投入
- [ ] 分析ページ表示
- [ ] グラフ表示確認
- [ ] ワードクラウド表示確認
- [ ] デバイス分析表示確認

すべてチェックできたら完了です！ 🎉

---

## 🚨 重要な注意事項

1. **Supabase プロジェクトID**: 自分のプロジェクトIDに置き換える
2. **organization_id**: 自分の組織IDに置き換える
3. **日本語パス**: ビルド時はプロジェクトを英語パスに移動
4. **型定義**: マイグレーション後は必ず再生成

---

## 🎯 次のステップ

1. ✅ 基本セットアップ完了
2. 📊 実際のデータで動作確認
3. 🎨 UI をカスタマイズ
4. 📈 追加の分析機能を実装
5. 🚀 本番環境にデプロイ

---

**作成日**: 2025-10-29
**バージョン**: 1.0.0

質問がある場合は `/claudedocs/` 内の詳細ドキュメントを参照してください。

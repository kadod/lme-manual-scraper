# フォーム分析機能 セットアップガイド

## クイックスタート

### 1. データベースマイグレーション

Supabase Dashboard にアクセスし、SQL Editor で以下のファイルの内容を実行してください:

```
/supabase/migrations/20251029_create_forms_tables.sql
```

または、Supabase CLI を使用:

```bash
cd /path/to/lme-saas
supabase migration up
```

### 2. Supabase 型定義の再生成

```bash
npx supabase gen types typescript \
  --project-id <your-project-id> \
  --schema public \
  > types/supabase.ts
```

プロジェクトIDは Supabase Dashboard の Settings > General から確認できます。

### 3. 環境変数の確認

`.env.local` に以下が設定されていることを確認:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 依存パッケージのインストール確認

既にインストール済みのはずですが、念のため確認:

```bash
npm install
```

必要なパッケージ:
- recharts@^3.3.0
- d3-cloud@^1.2.7

### 5. 開発サーバー起動

```bash
npm run dev
```

### 6. アクセス確認

ブラウザで以下にアクセス:

```
http://localhost:3000/dashboard/forms
```

---

## データベース構造の確認

### テーブル作成確認

Supabase Dashboard > Table Editor で以下のテーブルが作成されているか確認:

- ✅ forms
- ✅ form_responses
- ✅ form_analytics

### RLS ポリシー確認

各テーブルで Row Level Security が有効になっているか確認:

```sql
-- Table Editor > [table name] > Settings > Row Level Security
-- Status: Enabled
```

### 関数確認

Supabase Dashboard > Database > Functions で以下が作成されているか確認:

- ✅ calculate_form_statistics
- ✅ aggregate_field_responses
- ✅ get_response_trends
- ✅ update_analytics_on_response (trigger function)

---

## テストデータの投入

### 1. サンプルフォームの作成

```sql
-- Supabase Dashboard > SQL Editor で実行

INSERT INTO forms (
  organization_id,
  title,
  description,
  fields,
  status
) VALUES (
  'your-organization-id'::uuid,
  'サンプルアンケート',
  'テスト用のサンプルフォームです',
  '[
    {
      "id": "name",
      "type": "text",
      "label": "お名前",
      "required": true
    },
    {
      "id": "satisfaction",
      "type": "radio",
      "label": "満足度",
      "required": true,
      "options": ["とても満足", "満足", "普通", "不満", "とても不満"]
    },
    {
      "id": "comment",
      "type": "textarea",
      "label": "ご意見・ご感想",
      "required": false
    }
  ]'::jsonb,
  'active'
);
```

### 2. サンプル回答の作成

```sql
-- フォームIDを確認
SELECT id, title FROM forms ORDER BY created_at DESC LIMIT 1;

-- サンプル回答を投入（form_id を上記で取得したIDに置き換える）
INSERT INTO form_responses (
  form_id,
  response_data,
  metadata,
  submitted_at,
  completion_time_seconds
) VALUES
  (
    'your-form-id'::uuid,
    '{"name": "山田太郎", "satisfaction": "満足", "comment": "とても良いサービスです"}'::jsonb,
    '{"device": "mobile", "browser": "Safari"}'::jsonb,
    NOW(),
    45
  ),
  (
    'your-form-id'::uuid,
    '{"name": "佐藤花子", "satisfaction": "とても満足", "comment": "使いやすいです"}'::jsonb,
    '{"device": "desktop", "browser": "Chrome"}'::jsonb,
    NOW() - INTERVAL '1 day',
    32
  ),
  (
    'your-form-id'::uuid,
    '{"name": "鈴木一郎", "satisfaction": "普通", "comment": "改善の余地があります"}'::jsonb,
    '{"device": "tablet", "browser": "Firefox"}'::jsonb,
    NOW() - INTERVAL '2 days',
    58
  );
```

### 3. 分析データの生成

トリガーが自動実行されますが、手動で実行することも可能:

```sql
-- 今日の統計を計算
SELECT calculate_form_statistics('your-form-id'::uuid, CURRENT_DATE);

-- 過去3日分の統計を計算
SELECT calculate_form_statistics('your-form-id'::uuid, CURRENT_DATE - INTERVAL '1 day');
SELECT calculate_form_statistics('your-form-id'::uuid, CURRENT_DATE - INTERVAL '2 days');
```

---

## 動作確認

### 1. フォーム一覧ページ

```
http://localhost:3000/dashboard/forms
```

作成したフォームが表示されることを確認。

### 2. フォーム詳細ページ

フォームカードをクリックして詳細ページに移動。

```
http://localhost:3000/dashboard/forms/[form-id]
```

### 3. 分析ページ

詳細ページから「分析」タブまたはボタンをクリック。

```
http://localhost:3000/dashboard/forms/[form-id]/analytics
```

以下が表示されることを確認:
- ✅ 概要統計カード（総回答数、完了数、離脱数、完了率、平均回答時間）
- ✅ 回答推移グラフ
- ✅ フィールド別分析（円グラフ、棒グラフ）
- ✅ デバイス別分析

### 4. ワードクラウド

テキストフィールドがある場合、フィールド分析タブでワードクラウドが表示されることを確認。

---

## トラブルシューティング

### エラー: "Failed to fetch analytics"

**原因**: データベース関数が作成されていない

**対処法**:
```sql
-- Supabase Dashboard > SQL Editor で確認
SELECT routine_name FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
AND routine_schema = 'public'
AND routine_name LIKE '%form%';
```

関数が表示されない場合、マイグレーションファイルを再実行。

### エラー: "Permission denied"

**原因**: RLS ポリシーが正しく設定されていない

**対処法**:
1. ユーザーの organization_id を確認
2. JWT に organization_id が含まれているか確認
3. RLS ポリシーを確認

```sql
-- ポリシー確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('forms', 'form_responses', 'form_analytics');
```

### エラー: "Type error"

**原因**: Supabase 型定義が古い

**対処法**:
```bash
npx supabase gen types typescript \
  --project-id <your-project-id> \
  > types/supabase.ts
```

### グラフが表示されない

**原因**: データが不足している

**対処法**:
1. 回答データが存在するか確認
2. `form_analytics` テーブルにデータがあるか確認

```sql
-- 回答データ確認
SELECT COUNT(*) FROM form_responses WHERE form_id = 'your-form-id'::uuid;

-- 分析データ確認
SELECT * FROM form_analytics WHERE form_id = 'your-form-id'::uuid;
```

データがない場合、統計を手動計算:
```sql
SELECT calculate_form_statistics('your-form-id'::uuid, CURRENT_DATE);
```

---

## パフォーマンスチューニング

### インデックス確認

```sql
-- インデックス一覧
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('forms', 'form_responses', 'form_analytics')
ORDER BY tablename, indexname;
```

必要なインデックスが作成されていることを確認。

### クエリパフォーマンス確認

```sql
-- 実行計画確認
EXPLAIN ANALYZE
SELECT * FROM form_responses
WHERE form_id = 'your-form-id'::uuid
ORDER BY submitted_at DESC
LIMIT 100;
```

Seq Scan ではなく Index Scan が使用されていることを確認。

### キャッシュ設定

Next.js の `revalidatePath()` が正しく機能しているか確認:

```typescript
// app/actions/forms.ts で確認
revalidatePath('/dashboard/forms')
revalidatePath(`/dashboard/forms/${formId}`)
```

---

## セキュリティチェック

### 1. RLS 有効化確認

```sql
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('forms', 'form_responses', 'form_analytics');
```

すべて `rowsecurity = true` であることを確認。

### 2. ポリシーテスト

```sql
-- 自分の組織のデータのみ取得できることを確認
SET request.jwt.claims.organization_id TO 'your-organization-id';
SELECT * FROM forms;
```

### 3. API キーの確認

- ANON KEY を使用していることを確認
- SERVICE ROLE KEY をクライアント側で使用していないことを確認

---

## 本番環境デプロイ

### 1. 環境変数設定

Vercel/Netlify などで以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### 2. マイグレーション実行

本番環境の Supabase プロジェクトでマイグレーションを実行。

### 3. 型定義更新

本番環境のプロジェクトIDで型定義を生成:

```bash
npx supabase gen types typescript \
  --project-id <production-project-id> \
  > types/supabase.ts
```

### 4. ビルドとデプロイ

```bash
npm run build
```

ビルドが成功したらデプロイ。

---

## サポート

問題が解決しない場合は、以下を確認してください:

1. `/claudedocs/FORMS_ANALYTICS_IMPLEMENTATION.md` - 詳細な実装ドキュメント
2. Supabase Dashboard > Logs - エラーログ
3. Browser Console - クライアントサイドエラー
4. Network Tab - API リクエスト/レスポンス

---

セットアップ完了日: 2025-10-29
バージョン: 1.0.0

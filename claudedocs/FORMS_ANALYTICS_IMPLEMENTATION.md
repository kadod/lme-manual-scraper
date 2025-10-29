# フォーム分析機能 実装完了レポート

## 実装概要

LME SaaSプラットフォームにフォーム分析機能を実装しました。アンケートや申し込みフォームの回答データを収集し、詳細な分析とインサイトを提供する機能です。

## 実装内容

### 1. データベーススキーマ

**ファイル**: `/supabase/migrations/20251029_create_forms_tables.sql`

#### テーブル構成

##### forms テーブル
- フォームのメタデータと設定を保存
- フィールド: id, organization_id, title, description, fields (JSONB), settings (JSONB), status, created_by, timestamps
- ステータス: draft, active, closed

##### form_responses テーブル
- ユーザーからの回答データを保存
- フィールド: id, form_id, line_friend_id, response_data (JSONB), metadata (JSONB), submitted_at, completion_time_seconds
- メタデータ: デバイス、ブラウザ、IP、ユーザーエージェント

##### form_analytics テーブル
- 日別の集計データをキャッシュ（パフォーマンス最適化）
- フィールド: form_id, date, total_responses, completed_responses, abandoned_responses, avg_completion_time_seconds, field_statistics (JSONB), device_statistics (JSONB)

#### データベース関数

1. **calculate_form_statistics(p_form_id, p_date)**
   - 指定日の統計を計算・更新
   - 回答数、完了率、平均回答時間、デバイス統計を集計

2. **aggregate_field_responses(p_form_id, p_field_id, p_start_date, p_end_date)**
   - フィールド別の集計
   - 選択肢フィールド: 各選択肢の選択回数
   - 数値フィールド: 平均、中央値、最小値、最大値
   - テキストフィールド: 回答数とサンプル

3. **get_response_trends(p_form_id, p_days)**
   - 指定期間の回答推移を取得
   - 日別の回答数、完了数、平均回答時間

#### セキュリティ

- Row Level Security (RLS) 有効化
- 組織ごとのデータ分離
- 権限ベースのアクセス制御（owner, admin, member）

---

### 2. データアクセス層

**ファイル**: `/lib/supabase/queries/forms.ts`

#### 主要関数

##### フォーム管理
- `getForms()`: 組織のフォーム一覧取得
- `getForm(formId)`: 単一フォーム取得
- `createForm(form)`: フォーム作成
- `updateForm(formId, updates)`: フォーム更新
- `deleteForm(formId)`: フォーム削除

##### 回答管理
- `getFormResponses(formId, options)`: 回答一覧取得（ページネーション対応）
- `getResponseCount(formId)`: 回答数取得

##### 分析機能
- `getResponseTrends(formId, days)`: 回答推移取得
- `getFieldStatistics(formId, fieldId)`: フィールド別統計
- `getFormAnalytics(formId, startDate, endDate)`: 期間別分析データ
- `getFormOverallStats(formId)`: 全体統計
- `getDeviceBreakdown(formId)`: デバイス別分布
- `getTextFieldWords(formId, fieldId, limit)`: ワードクラウド用データ

##### ユーティリティ
- `recalculateFormStatistics(formId, date)`: 統計再計算

---

### 3. サーバーアクション

**ファイル**: `/app/actions/forms.ts`

Next.js Server Actionsとして実装。キャッシュ戦略とエラーハンドリングを含む。

#### 主要アクション

- `getFormsAction()`: フォーム一覧取得
- `getFormAction(formId)`: フォーム詳細取得
- `createFormAction(formData)`: フォーム作成
- `updateFormAction(formId, updates)`: フォーム更新
- `deleteFormAction(formId)`: フォーム削除
- `getFormResponsesAction(formId, options)`: 回答取得
- `getFormAnalyticsAction(formId, days)`: 分析データ取得
- `getTextFieldWordsAction(formId, fieldId, limit)`: ワードクラウドデータ取得
- `exportResponsesAction(formId)`: CSV エクスポート

すべてのアクションで `revalidatePath()` を使用してキャッシュを適切に管理。

---

### 4. UIコンポーネント

#### AnalyticsDashboard
**ファイル**: `/components/forms/AnalyticsDashboard.tsx`

メインの分析ダッシュボードコンポーネント。

**機能:**
- 概要統計カード（総回答数、完了数、離脱数、完了率、平均回答時間）
- タブ式UI（回答推移、フィールド分析、デバイス分析）
- レスポンシブデザイン

**Props:**
```typescript
interface AnalyticsDashboardProps {
  formId: string
  analytics: {
    trends: ResponseTrend[]
    overallStats: OverallStats
    deviceBreakdown: Record<string, number>
    fieldStats: Record<string, any>
    form: Form
  }
  wordCloudData?: Record<string, Word[]>
}
```

#### ResponseChart
**ファイル**: `/components/forms/ResponseChart.tsx`

Recharts を使用したチャートコンポーネント。

**種類:**
- `ResponseChart`: 単一データ系列（折れ線/棒グラフ）
- `ResponseTrendChart`: 複数データ系列（総回答数 vs 完了回答数）

**機能:**
- 日付フォーマット
- インタラクティブなツールチップ
- レスポンシブ対応

#### FieldAnalytics
**ファイル**: `/components/forms/FieldAnalytics.tsx`

フィールドタイプ別の分析ビジュアライゼーション。

**対応フィールドタイプ:**

1. **選択肢フィールド (select/radio/checkbox)**
   - 円グラフ: 選択肢の分布
   - 横棒グラフ: 選択肢別回答数

2. **数値フィールド (number)**
   - 統計カード: 回答数、平均、中央値、最小値、最大値

3. **テキストフィールド (text/textarea)**
   - 回答数表示
   - サンプル回答一覧（最新10件）

#### WordCloud
**ファイル**: `/components/forms/WordCloud.tsx`

D3-cloud を使用したワードクラウドビジュアライゼーション。

**機能:**
- テキスト回答から単語を抽出
- 頻度に応じたフォントサイズ
- ランダム回転（0度 or 90度）
- ホバーエフェクト
- 頻出単語トップ10リスト

**実装詳細:**
- SVG ベースのレンダリング
- レスポンシブサイズ調整
- カスタムカラー（頻度に応じた透明度）

---

### 5. 分析ページ

**ファイル**: `/app/dashboard/forms/[id]/analytics/page.tsx`

#### 機能
- フォーム分析ダッシュボード表示
- データ取得とワードクラウド生成
- ローディング状態管理
- エラーハンドリング

#### UI構成
- ヘッダー: フォームに戻るボタン、回答一覧リンク、CSVエクスポートボタン
- 分析ダッシュボード: Suspense でラップ

#### データフロー
1. フォームIDからanalytics取得（30日分）
2. テキストフィールドのワードクラウドデータ取得
3. AnalyticsDashboardにデータを渡す
4. エラー時は再読み込みボタン表示

---

## 技術スタック

### フロントエンド
- **Next.js 16**: App Router、Server Components、Server Actions
- **React 19**: 最新機能対応
- **TypeScript**: 型安全性
- **Recharts 3.3.0**: グラフライブラリ
- **D3-cloud 1.2.7**: ワードクラウド生成
- **date-fns 4.1.0**: 日付フォーマット
- **Tailwind CSS**: スタイリング
- **Radix UI**: UIコンポーネント基盤

### バックエンド
- **Supabase**: PostgreSQL データベース、認証
- **PostgreSQL 関数**: サーバーサイド集計
- **Row Level Security**: セキュリティポリシー

---

## パフォーマンス最適化

### 1. キャッシング戦略

#### データベースレベル
- `form_analytics` テーブルで日別集計をキャッシュ
- トリガーで自動更新

#### アプリケーションレベル
- Next.js の `revalidatePath()` でページキャッシュ管理
- Server Actionsでデータフェッチを最適化

### 2. クエリ最適化

#### インデックス
```sql
-- Forms
CREATE INDEX idx_forms_organization_id ON forms(organization_id);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_created_at ON forms(created_at DESC);

-- Responses
CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_submitted_at ON form_responses(submitted_at DESC);
CREATE INDEX idx_form_responses_form_submitted ON form_responses(form_id, submitted_at DESC);

-- Analytics
CREATE INDEX idx_form_analytics_form_date ON form_analytics(form_id, date DESC);
```

#### 選択的フィールド取得
- 必要なフィールドのみ SELECT
- JSONB フィールドの効率的な処理

### 3. フロントエンド最適化

- **Code Splitting**: コンポーネント別の遅延読み込み
- **Suspense**: 段階的レンダリング
- **useMemo**: 計算結果のメモ化
- **ResponsiveContainer**: チャートのレスポンシブ対応

---

## セキュリティ機能

### 1. Row Level Security (RLS)

すべてのテーブルで RLS を有効化。

#### Forms テーブル
- SELECT: 組織メンバーのみ閲覧可能
- INSERT: member 以上が作成可能
- UPDATE: member 以上が更新可能
- DELETE: admin 以上が削除可能

#### Form Responses テーブル
- SELECT: 組織のフォームの回答のみ閲覧可能
- INSERT: アクティブなフォームへの回答のみ許可

#### Form Analytics テーブル
- SELECT: 組織のフォームの分析データのみ閲覧可能

### 2. データ検証

- Server Actions でのバリデーション
- TypeScript 型チェック
- データベース制約

### 3. 組織間データ分離

- JWT の organization_id を使用
- すべてのクエリで組織フィルタリング

---

## 集計機能の詳細

### 1. 時系列集計

**対応期間:**
- 日別 (default)
- 週別（アプリケーション層で実装可能）
- 月別（アプリケーション層で実装可能）

**集計内容:**
- 総回答数
- 完了回答数
- 平均回答時間

### 2. フィールド別集計

#### 選択肢フィールド (select/radio/checkbox)
```typescript
{
  "選択肢A": 45,
  "選択肢B": 23,
  "選択肢C": 12
}
```

#### 数値フィールド (number)
```typescript
{
  count: 80,
  sum: 4500,
  avg: 56.25,
  min: 10,
  max: 100,
  median: 55
}
```

#### テキストフィールド (text/textarea)
```typescript
{
  count: 60,
  sample_responses: ["回答1", "回答2", ...]
}
```

### 3. デバイス分析

```typescript
{
  "mobile": 120,
  "desktop": 45,
  "tablet": 15,
  "unknown": 5
}
```

### 4. ワードクラウド

テキスト回答から単語を抽出し、頻度を計算。

**処理フロー:**
1. テキストフィールドの全回答を取得
2. 単語分割（スペース区切り）
3. 短い単語（2文字以下）をフィルタリング
4. 小文字化
5. 頻度カウント
6. 上位N件を返す

**制限事項:**
- 現在は簡易的な単語分割（スペース区切り）
- 日本語の形態素解析は未実装
- ストップワード除去は未実装

---

## 使用方法

### 1. データベースマイグレーション実行

```bash
cd /Users/kadotani/Documents/開発プロジェクト/GitHub/lme-manual-scraper/lme-saas
supabase migration up
```

または Supabase Dashboard から SQL を実行:
```sql
-- /supabase/migrations/20251029_create_forms_tables.sql の内容を実行
```

### 2. Supabase型定義の再生成

```bash
npx supabase gen types typescript --project-id <your-project-id> > types/supabase.ts
```

### 3. アプリケーション起動

```bash
npm run dev
```

### 4. フォーム分析ページへアクセス

```
/dashboard/forms/[form-id]/analytics
```

---

## 今後の拡張可能性

### 1. 高度な分析機能

- **クロス集計**: 複数フィールド間の相関分析
- **コホート分析**: 時期別の回答者グループ比較
- **ファネル分析**: フォームの離脱ポイント特定
- **A/Bテスト**: フォームバリエーションの比較

### 2. 自然言語処理

- **日本語形態素解析**: MeCab/Kuromoji 統合
- **センチメント分析**: 回答の感情分析
- **トピック抽出**: LDAなどのトピックモデリング
- **固有表現抽出**: 人名、地名、組織名の抽出

### 3. エクスポート機能

- **PDF レポート生成**: グラフ付きレポート
- **Excel エクスポート**: 複数シートでの詳細データ
- **自動レポート送信**: メール/Slack 通知

### 4. リアルタイム機能

- **Supabase Realtime**: リアルタイム回答更新
- **WebSocket**: ライブダッシュボード
- **通知システム**: 新規回答アラート

### 5. AI/機械学習

- **回答予測**: 過去データから回答パターン予測
- **異常検知**: スパム回答の自動検出
- **レコメンデーション**: 類似フォームの提案

### 6. インテグレーション

- **Google Analytics**: トラッキング統合
- **Google Sheets**: 自動同期
- **Zapier/Make**: ワークフロー自動化
- **Slack/Teams**: 通知統合

---

## トラブルシューティング

### 問題1: ビルドエラー（Turbopack）

**症状:**
```
byte index 11 is not a char boundary; it is inside '開' (bytes 10..13)
```

**原因:**
プロジェクトパスに日本語文字が含まれており、Turbopack がパースできない。

**対処法:**
1. プロジェクトを英語パスに移動
2. または Next.js 15 以前のバージョンを使用（webpack ビルド）

### 問題2: TypeScript型エラー

**症状:**
```
Argument of type '"forms"' is not assignable to parameter
```

**原因:**
Supabase 型定義が古い。

**対処法:**
```bash
npx supabase gen types typescript --project-id <your-project-id> > types/supabase.ts
```

### 問題3: RLS ポリシーエラー

**症状:**
データが取得できない。

**対処法:**
1. organization_id が JWT に含まれているか確認
2. ユーザーロールが適切か確認
3. Supabase Dashboard で RLS ポリシーを確認

### 問題4: パフォーマンス問題

**症状:**
大量データで分析が遅い。

**対処法:**
1. インデックスが作成されているか確認
2. `form_analytics` テーブルのキャッシュを活用
3. ページネーションを実装
4. データベース関数で集計を実行

---

## ファイル構成

```
/Users/kadotani/Documents/開発プロジェクト/GitHub/lme-manual-scraper/lme-saas/

├── supabase/
│   └── migrations/
│       └── 20251029_create_forms_tables.sql  # データベーススキーマ
│
├── lib/
│   └── supabase/
│       └── queries/
│           └── forms.ts                       # データアクセス関数
│
├── app/
│   ├── actions/
│   │   └── forms.ts                           # Server Actions
│   │
│   └── dashboard/
│       └── forms/
│           └── [id]/
│               └── analytics/
│                   └── page.tsx               # 分析ページ
│
└── components/
    └── forms/
        ├── AnalyticsDashboard.tsx             # メインダッシュボード
        ├── ResponseChart.tsx                   # チャートコンポーネント
        ├── FieldAnalytics.tsx                  # フィールド分析
        └── WordCloud.tsx                       # ワードクラウド
```

---

## 依存パッケージ

```json
{
  "recharts": "^3.3.0",           // グラフ描画
  "d3-cloud": "^1.2.7",           // ワードクラウド生成
  "date-fns": "^4.1.0",           // 日付処理
  "@heroicons/react": "^2.2.0",  // アイコン
  "@radix-ui/*": "^1.x.x",        // UI コンポーネント
  "next": "16.0.1",               // フレームワーク
  "react": "19.2.0",              // UI ライブラリ
  "@supabase/ssr": "^0.7.0",      // Supabase SSR
  "@supabase/supabase-js": "^2.77.0" // Supabase クライアント
}
```

---

## まとめ

フォーム分析機能の実装が完了しました。以下の機能が利用可能です:

✅ **実装済み**
- データベーススキーマ（forms, form_responses, form_analytics）
- RLS セキュリティポリシー
- 集計用データベース関数
- データアクセス層（queries/forms.ts）
- Server Actions（actions/forms.ts）
- 分析ダッシュボード UI
- 回答推移グラフ（折れ線、棒グラフ）
- フィールド別分析（円グラフ、棒グラフ、統計カード）
- デバイス別分析
- ワードクラウド
- CSV エクスポート機能

⚠️ **注意事項**
- Turbopack が日本語パスをサポートしていないため、ビルド時にエラーが発生する可能性があります
- Supabase 型定義の再生成が必要です
- 本番環境では適切なキャッシュ戦略の設定を推奨します

🔄 **次のステップ**
1. データベースマイグレーションの実行
2. Supabase型定義の再生成
3. 開発サーバーでの動作確認
4. 必要に応じて追加機能の実装

---

実装日: 2025-10-29
実装者: Claude (Backend Architect)
プロジェクト: LME SaaS Platform

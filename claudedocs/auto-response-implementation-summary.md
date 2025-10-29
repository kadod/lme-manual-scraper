# 自動応答処理システム実装完了

## 実装内容

### 1. データベーススキーマ

#### マイグレーションファイル
- `/lme-saas/supabase/migrations/20251030_create_auto_response_tables_v2.sql`
  - auto_response_rules: 自動応答ルール
  - auto_response_keywords: キーワードトリガー
  - auto_response_scenarios: シナリオ定義
  - auto_response_scenario_steps: シナリオステップ
  - auto_response_conversations: アクティブな会話
  - auto_response_logs: 実行ログ
  - auto_response_stats: 統計データ

- `/lme-saas/supabase/migrations/20251030_auto_response_rls.sql`
  - 全テーブルにRLSポリシーを設定
  - マルチテナント対応のセキュリティ設定

- `/lme-saas/supabase/migrations/20251030_auto_response_cron.sql`
  - タイムアウト処理用のCron Job設定

### 2. Edge Functions

#### メイン処理
- `/lme-saas/supabase/functions/process-auto-response/index.ts`
  - 自動応答のメイン処理
  - キーワードマッチングとシナリオ処理の振り分け
  - LINE APIへのメッセージ送信
  - アクション実行と応答ログ記録

#### キーワードマッチング
- `/lme-saas/supabase/functions/process-auto-response/keyword-matcher.ts`
  - キーワードベースのルールマッチング
  - 完全一致、部分一致、正規表現対応
  - 時間条件、タグ条件、セグメント条件の評価

#### シナリオ処理
- `/lme-saas/supabase/functions/process-auto-response/scenario-processor.ts`
  - 多段階会話シナリオの処理
  - ユーザー入力の検証
  - 分岐処理（条件による次ステップ決定）
  - 会話状態の更新とコンテキスト保存

#### アクション実行
- `/lme-saas/supabase/functions/process-auto-response/action-executor.ts`
  - タグ追加・削除
  - カスタムフィールド更新
  - シナリオ開始
  - ステップ配信開始

#### タイムアウト処理
- `/lme-saas/supabase/functions/timeout-inactive-conversations/index.ts`
  - 10分ごとに実行されるCron Job
  - 非アクティブな会話を自動終了
  - シナリオ統計の更新

### 3. Webhook統合

#### 更新ファイル
- `/lme-saas/supabase/functions/process-line-webhook/index.ts`
  - handleMessage関数を更新
  - ユーザーメッセージ受信時に自動応答処理を呼び出し
  - Fire-and-forget方式で非同期実行

- `/lme-saas/supabase/functions/_cron.yml`
  - タイムアウト処理をCron設定に追加

## 処理フロー

### 1. メッセージ受信時
```
LINE Webhook → process-line-webhook → process-auto-response
                                    ↓
                           キーワードマッチング
                                    ↓
                           シナリオ処理（進行中の場合）
                                    ↓
                           応答メッセージ送信
                                    ↓
                           アクション実行
                                    ↓
                           ログ記録
```

### 2. キーワードマッチング
1. アクティブな会話があるか確認
2. なければキーワードルールを優先順位順に評価
3. 条件チェック（時間、曜日、タグ、セグメント）
4. マッチしたら応答メッセージとアクションを返す

### 3. シナリオ処理
1. 現在のステップを取得
2. ユーザー入力を検証
3. 検証失敗時はリトライ（最大3回）
4. 検証成功時は次ステップを決定（分岐処理）
5. コンテキストを更新して会話状態を保存
6. 次ステップのメッセージを返す

### 4. タイムアウト処理
1. Cron Jobが10分ごとに実行
2. アクティブな会話を取得
3. 最終操作時刻とタイムアウト設定を比較
4. タイムアウトした会話を終了
5. シナリオ統計を更新

## 主要な機能

### キーワードルール
- 優先順位による評価順序制御
- 複数のマッチタイプ（完全/部分/正規表現）
- 時間条件（営業時間、曜日指定）
- タグ/セグメント条件

### シナリオ
- 多段階会話フロー
- ユーザー入力の検証（テキスト、数値、メール、電話、正規表現）
- 分岐処理（条件による次ステップ決定）
- コンテキスト保存（ユーザー入力の蓄積）
- タイムアウト設定
- リトライ制限

### アクション
- タグ追加・削除
- カスタムフィールド更新
- 別シナリオの開始
- ステップ配信の開始

### セキュリティ
- Row Level Security (RLS) による完全なマルチテナント対応
- ユーザーは自分のリソースのみアクセス可能
- サービスロールによる安全な実行

## 使用例

### 簡単なキーワード応答
```sql
INSERT INTO auto_response_rules (user_id, name, priority, response_type, response_content)
VALUES (
  'user-uuid',
  '営業時間案内',
  10,
  'text',
  '{"text": "営業時間は平日9:00-18:00です。"}'
);

INSERT INTO auto_response_keywords (rule_id, keyword, match_type)
VALUES ('rule-uuid', '営業時間', 'partial');
```

### シナリオ（予約受付）
```sql
-- ルール作成
INSERT INTO auto_response_rules (user_id, name, priority, response_type, response_content)
VALUES (
  'user-uuid',
  '予約受付シナリオ',
  20,
  'scenario',
  '{"scenario_id": "scenario-uuid"}'
);

-- シナリオ作成
INSERT INTO auto_response_scenarios (rule_id, name, timeout_minutes, max_retries)
VALUES ('rule-uuid', '予約受付フロー', 30, 3);

-- ステップ作成
INSERT INTO auto_response_scenario_steps (scenario_id, step_order, step_id, step_type, message, next_step_id)
VALUES
  ('scenario-uuid', 1, 'step1', 'message', '{"type":"text","text":"予約を承ります。お名前を教えてください。"}', 'step2'),
  ('scenario-uuid', 2, 'step2', 'question', '{"type":"text","text":"お電話番号を教えてください。"}', 'step3');
```

## 次のステップ

1. フロントエンドUI実装
   - ルール作成・編集画面
   - シナリオビルダー（ドラッグ&ドロップ）
   - 実行ログ確認画面
   - 統計ダッシュボード

2. 追加機能
   - AI応答機能（OpenAI統合）
   - 条件分岐の拡張（より複雑な条件式）
   - A/Bテスト機能
   - 応答テンプレートライブラリ

3. テスト
   - ユニットテスト
   - 統合テスト
   - 負荷テスト

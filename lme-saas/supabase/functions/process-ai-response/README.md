# Process AI Response Edge Function

OpenAI APIを使用してLINEメッセージに対するAI応答を生成するEdge Function。

## 機能

- OpenAI Chat Completions API統合
- 友だち情報コンテキスト注入（名前、タグ、カスタムフィールド）
- 会話履歴管理
- 応答検証とサニタイズ
- コスト追跡とトークン使用量モニタリング
- レート制限と使用制限管理
- 禁止ワードフィルタリング
- エラー/タイムアウト時のフォールバック応答

## ファイル構成

```
process-ai-response/
├── index.ts              # メイン処理
├── openai-client.ts      # OpenAI APIクライアント
├── prompt-builder.ts     # プロンプト構築ロジック
├── response-validator.ts # 応答検証とサニタイズ
└── README.md            # このファイル
```

## リクエスト形式

```typescript
POST /functions/v1/process-ai-response

{
  "friend_id": "uuid",
  "message_text": "こんにちは！",
  "conversation_history": [ // オプション
    {
      "role": "user",
      "content": "前回のメッセージ",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "user_id": "uuid" // オプション（friend.user_idから取得可能）
}
```

## レスポンス形式

### 成功時
```typescript
{
  "success": true,
  "response": "AIが生成した応答",
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50,
    "total_tokens": 150,
    "estimated_cost": 0.002
  },
  "warnings": ["Response may contain URLs"]
}
```

### エラー時
```typescript
{
  "success": false,
  "error": "Error message"
}
```

### フォールバック時
```typescript
{
  "success": true,
  "response": "設定されたフォールバック応答",
  "code": "TIMEOUT" | "RATE_LIMIT" | "ERROR" | "LIMIT_EXCEEDED"
}
```

## 環境変数

```bash
# 必須（Supabase自動設定）
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# オプション（ユーザーai_settings優先）
OPENAI_API_KEY=sk-xxx
OPENAI_ORG_ID=org-xxx
```

## データベーステーブル

### ai_settings
```sql
CREATE TABLE ai_settings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  openai_api_key TEXT,
  openai_org_id TEXT,
  model VARCHAR(100) DEFAULT 'gpt-4-turbo-preview',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  system_prompt TEXT,
  custom_instructions TEXT,
  is_enabled BOOLEAN DEFAULT false,
  monthly_token_limit INTEGER DEFAULT 100000,
  monthly_budget_usd DECIMAL(10,2) DEFAULT 100.00,
  prohibited_words TEXT[],
  max_response_length INTEGER DEFAULT 5000,
  default_response TEXT,
  timeout_response TEXT,
  error_response TEXT
);
```

### ai_usage_logs
```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID,
  model VARCHAR(100),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  estimated_cost_usd DECIMAL(10,6),
  response_time_ms INTEGER,
  status VARCHAR(50), -- success/error/timeout/rate_limit
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### ai_conversations
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  role VARCHAR(20), -- user/assistant/system
  content TEXT,
  tokens INTEGER,
  model VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## セットアップ

### 1. マイグレーション実行
```bash
supabase db push
```

### 2. AI設定作成
```sql
INSERT INTO ai_settings (
  user_id,
  openai_api_key,
  model,
  system_prompt,
  is_enabled
) VALUES (
  'user-uuid',
  'sk-xxx',
  'gpt-3.5-turbo',
  'あなたは親切なカスタマーサポートです。',
  true
);
```

### 3. Edge Functionデプロイ
```bash
supabase functions deploy process-ai-response
```

## 使用例

### curlから
```bash
curl -X POST https://xxx.supabase.co/functions/v1/process-ai-response \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "friend_id": "friend-uuid",
    "message_text": "予約できますか？"
  }'
```

### TypeScriptから
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const { data, error } = await supabase.functions.invoke(
  'process-ai-response',
  {
    body: {
      friend_id: 'friend-uuid',
      message_text: '予約できますか？',
    },
  }
);
```

## 処理フロー

1. リクエスト受信とバリデーション
2. 友だち情報取得（名前、タグ、カスタムフィールド）
3. AI設定取得と使用制限チェック
4. 会話履歴取得（最新10件）
5. システムプロンプト構築
6. OpenAI API呼び出し（リトライ付き）
7. 応答検証（禁止ワード、文字数制限、PII検出）
8. LINE形式へのフォーマット
9. 使用ログ記録
10. 会話履歴保存
11. レスポンス返却

## エラーハンドリング

### 認証エラー
- 無効なAPIキー → エラー応答返却（リトライなし）

### レート制限エラー
- OpenAI API制限 → フォールバック応答返却

### タイムアウトエラー
- 30秒超過 → タイムアウト応答返却

### 使用制限エラー
- 月間トークン制限超過 → 制限超過メッセージ返却
- 月間予算超過 → 制限超過メッセージ返却

### 検証エラー
- 禁止ワード検出 → エラー応答返却
- 不適切コンテンツ → エラー応答返却

## コスト管理

### トークン数推定
```typescript
// 日本語: 約2.5文字/トークン
// 英語: 約4文字/トークン
```

### コスト計算
```typescript
// GPT-4 Turbo: $0.01/1K prompt + $0.03/1K completion
// GPT-3.5 Turbo: $0.0005/1K prompt + $0.0015/1K completion
```

### 使用状況確認
```sql
-- 月間トークン使用量
SELECT get_monthly_token_usage('user-uuid');

-- 月間コスト
SELECT get_monthly_ai_cost('user-uuid');

-- 使用可否チェック
SELECT can_use_ai('user-uuid');
```

## セキュリティ

### APIキー保護
- データベース内で暗号化推奨
- RLSポリシーで保護
- Service Roleのみアクセス可能

### RLSポリシー
```sql
-- ユーザーは自分の設定のみ閲覧/編集
CREATE POLICY "Users can manage own settings"
  ON ai_settings
  USING (auth.uid() = user_id);

-- Service Roleはログ挿入可能
CREATE POLICY "Service role can insert logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (true);
```

### 応答サニタイズ
- HTMLタグ除去
- スクリプトタグ除去
- PII検出と警告
- 禁止ワードフィルタリング

## パフォーマンス

### 平均応答時間
- GPT-3.5 Turbo: 1-3秒
- GPT-4: 3-10秒

### タイムアウト
- デフォルト: 30秒
- 設定可能（openai-client.ts）

### リトライ
- 最大3回
- 遅延: 1秒 × 試行回数

## モニタリング

### 重要メトリクス
```sql
-- 成功率
SELECT
  COUNT(*) FILTER (WHERE status = 'success') * 100.0 / COUNT(*) as success_rate
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- 平均応答時間
SELECT AVG(response_time_ms)
FROM ai_usage_logs
WHERE status = 'success'
  AND created_at >= NOW() - INTERVAL '24 hours';

-- エラー分布
SELECT status, COUNT(*)
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY status;
```

## トラブルシューティング

### APIキーエラー
```
Error: OpenAI API error: Incorrect API key provided
→ ai_settings.openai_api_keyを確認
```

### タイムアウト
```
Code: TIMEOUT
→ max_tokensを減らす
→ モデルをGPT-3.5に変更
```

### コスト超過
```
Code: LIMIT_EXCEEDED
→ monthly_budget_usdを確認
→ 使用ログで詳細確認
```

### 応答品質低下
```
→ temperatureを調整（0.7推奨）
→ system_promptを見直し
→ 会話履歴を活用
```

## ログ確認

### Edge Functionログ
```bash
supabase functions logs process-ai-response
```

### 使用ログクエリ
```sql
SELECT
  created_at,
  model,
  total_tokens,
  estimated_cost_usd,
  response_time_ms,
  status
FROM ai_usage_logs
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 50;
```

## 将来の拡張

- ストリーミング応答対応
- Function Calling統合
- プロンプトテンプレート管理
- A/Bテスト機能
- 多言語対応強化
- 画像入力対応（GPT-4V）

## 参考リンク

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [実装ガイド](/claudedocs/ai-response-implementation.md)

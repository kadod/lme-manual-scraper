# AI応答処理 実装ガイド

## 概要

OpenAI APIを使用したAI応答生成Edge Functionの実装。
LINEメッセージに対して、友だち情報とコンテキストを活用したパーソナライズされた応答を生成。

## アーキテクチャ

### データベース構造

#### ai_settings
ユーザーごとのOpenAI設定を管理。

```sql
- openai_api_key: 暗号化されたAPIキー
- model: 使用するGPTモデル
- temperature: 応答の創造性 (0.0-1.0)
- max_tokens: 最大トークン数
- system_prompt: システムプロンプト
- custom_instructions: カスタム指示
- is_enabled: AI機能の有効/無効
- monthly_token_limit: 月間トークン制限
- monthly_budget_usd: 月間予算制限
- prohibited_words: 禁止ワードリスト
```

#### ai_usage_logs
API使用状況とコストを追跡。

```sql
- model: 使用モデル
- prompt_tokens: 入力トークン数
- completion_tokens: 出力トークン数
- total_tokens: 合計トークン数
- estimated_cost_usd: 推定コスト
- response_time_ms: 応答時間
- status: success/error/timeout/rate_limit
```

#### ai_conversations
会話履歴を保存（コンテキスト維持用）。

```sql
- friend_id: 友だちID
- role: user/assistant/system
- content: メッセージ内容
- tokens: トークン数
- model: 使用モデル
```

### Edge Function構造

```
process-ai-response/
├── index.ts              # メイン処理
├── openai-client.ts      # OpenAI APIクライアント
├── prompt-builder.ts     # プロンプト構築
└── response-validator.ts # 応答検証
```

## 処理フロー

### 1. リクエスト受信
```typescript
{
  friend_id: string;
  message_text: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
  }>;
}
```

### 2. 友だち情報取得
- 基本情報 (display_name, custom_fields)
- タグ情報
- 最終やり取り日時

### 3. AI設定取得
- OpenAI設定
- 使用制限チェック
- 月間トークン/予算チェック

### 4. プロンプト構築
```
System: あなたは{organization_name}のAIアシスタントです。
        {custom_instructions}

【顧客情報】
名前: {friend_name}
タグ: {tags}
カスタムフィールド:
- {key}: {value}
最終やり取り: {days}日前

{conversation_history}

User: {message}
```

### 5. OpenAI API呼び出し
- Chat Completions API使用
- リトライロジック（最大3回）
- タイムアウト処理（30秒）
- エラーハンドリング

### 6. 応答検証
- 禁止ワードチェック
- 文字数制限チェック（LINE: 5000文字）
- PII検出（メール、電話番号、カード番号）
- 不適切コンテンツチェック
- HTMLタグサニタイズ

### 7. フォールバック処理
```typescript
// タイムアウト時
return { response: timeout_response };

// レート制限時
return { response: 'しばらく時間をおいてからお試しください。' };

// エラー時
return { response: error_response };

// 使用制限超過時
return { response: '利用上限に達しています。' };
```

### 8. ログ記録
- 使用トークン数
- 推定コスト
- 応答時間
- 成功/失敗ステータス

### 9. 会話履歴保存
- ユーザーメッセージ
- アシスタント応答
- トークン数

## セキュリティ

### API キー管理
```typescript
// 環境変数から取得
const apiKey = Deno.env.get('OPENAI_API_KEY');

// またはユーザー設定から（暗号化）
const apiKey = aiSettings.openai_api_key;
```

### RLS ポリシー
- ユーザーは自分のai_settingsのみ閲覧/編集可能
- Service Roleはai_usage_logs/ai_conversationsに挿入可能
- ユーザーは自分のログのみ閲覧可能

### レート制限
- OpenAI APIの制限に準拠
- カスタムレート制限実装可能
- 月間トークン/予算制限

## コスト管理

### トークン数推定
```typescript
// 日本語: 1トークン ≈ 2.5文字
// 英語: 1トークン ≈ 4文字

function estimateTokens(text: string): number {
  const japaneseChars = (text.match(/[\u3000-\u9faf]/g) || []).length;
  const otherChars = text.length - japaneseChars;
  return Math.ceil(japaneseChars / 2.5 + otherChars / 4);
}
```

### コスト計算
```typescript
// GPT-4 Turbo: $0.01 / 1K prompt, $0.03 / 1K completion
// GPT-3.5 Turbo: $0.0005 / 1K prompt, $0.0015 / 1K completion

const promptCost = (promptTokens / 1000) * pricing.prompt;
const completionCost = (completionTokens / 1000) * pricing.completion;
const totalCost = promptCost + completionCost;
```

### 使用状況モニタリング
```sql
-- 月間使用量取得
SELECT get_monthly_token_usage(user_id);

-- 月間コスト取得
SELECT get_monthly_ai_cost(user_id);

-- 使用可否チェック
SELECT can_use_ai(user_id);
```

## エラーハンドリング

### エラータイプ

1. **認証エラー**
   - 無効なAPIキー
   - 組織IDエラー
   - → リトライしない、エラー応答返却

2. **レート制限エラー**
   - OpenAI API制限超過
   - → フォールバック応答返却

3. **タイムアウトエラー**
   - 30秒以内に応答なし
   - → タイムアウト応答返却

4. **API エラー**
   - 無効なリクエスト
   - モデルが見つからない
   - → エラー応答返却

5. **検証エラー**
   - 禁止ワード検出
   - 不適切コンテンツ
   - → エラー応答返却

### ログ記録
```typescript
await supabase.from('ai_usage_logs').insert({
  status: 'error',
  error_message: error.message,
  // ... other fields
});
```

## 環境変数

```bash
# Supabase (自動設定)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# OpenAI (オプション: ユーザー設定優先)
OPENAI_API_KEY=sk-xxx
OPENAI_ORG_ID=org-xxx
```

## 使用例

### Edge Functionの呼び出し
```typescript
const response = await fetch(
  'https://xxx.supabase.co/functions/v1/process-ai-response',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      friend_id: 'friend-uuid',
      message_text: 'こんにちは！予約できますか？',
    }),
  }
);

const result = await response.json();
console.log(result.response); // AI応答
console.log(result.usage);    // トークン使用量
```

### Server Actionから呼び出し
```typescript
export async function processAIResponse(
  friendId: string,
  messageText: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.functions.invoke(
    'process-ai-response',
    {
      body: {
        friend_id: friendId,
        message_text: messageText,
      },
    }
  );

  if (error) throw error;
  return data;
}
```

## テスト

### ローカルテスト
```bash
# Edge Function起動
supabase functions serve process-ai-response

# テストリクエスト
curl -X POST http://localhost:54321/functions/v1/process-ai-response \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{
    "friend_id": "test-friend-id",
    "message_text": "こんにちは"
  }'
```

### デプロイ
```bash
# 環境変数設定（必要な場合）
supabase secrets set OPENAI_API_KEY=sk-xxx

# デプロイ
supabase functions deploy process-ai-response
```

## パフォーマンス最適化

### 会話履歴の最適化
- 最新10件のみ保持
- トークン制限の40%を履歴に割り当て
- 古いメッセージは自動削除

### キャッシュ戦略
- 友だち情報: リクエストごとに取得（最新情報必要）
- AI設定: キャッシュ可能（変更頻度低い）
- タグ情報: キャッシュ可能

### 並列処理
```typescript
// 並列データ取得
const [friend, aiSettings, tags] = await Promise.all([
  getFriend(friendId),
  getAISettings(userId),
  getFriendTags(friendId),
]);
```

## モニタリング

### 重要メトリクス
- 平均応答時間
- 成功率
- 月間トークン使用量
- 月間コスト
- エラー率（タイプ別）

### アラート設定
- 予算の80%到達時
- トークン制限の80%到達時
- エラー率が10%超過時

## 将来の拡張

### ストリーミング対応
```typescript
// OpenAI Streaming API使用
stream: true

// Server-Sent Eventsで返却
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
  },
});
```

### Function Calling
```typescript
// ツール定義
tools: [
  {
    type: 'function',
    function: {
      name: 'get_reservation_slots',
      description: '予約可能な時間枠を取得',
      parameters: { /* ... */ },
    },
  },
]
```

### プロンプトテンプレート管理
- 業種別テンプレート
- シナリオ別テンプレート
- A/Bテスト機能

## トラブルシューティング

### よくある問題

1. **API キーエラー**
   - ai_settingsテーブルのopenai_api_keyを確認
   - 環境変数OPENAI_API_KEYを確認

2. **タイムアウト**
   - max_tokensを減らす
   - タイムアウト時間を延長

3. **コスト超過**
   - monthly_budget_usdを確認
   - 使用ログを確認

4. **応答品質低下**
   - temperatureを調整
   - system_promptを見直し
   - モデルをアップグレード

## 参考資料

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [LINE Messaging API](https://developers.line.biz/ja/docs/messaging-api/)

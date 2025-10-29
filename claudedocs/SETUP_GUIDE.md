# メッセージスケジューリングシステム セットアップガイド

## 前提条件

- Supabaseプロジェクト作成済み
- Supabase CLI インストール済み
- LINE Developersアカウントとチャネル作成済み

---

## ステップ1: データベーススキーマ適用

### 1.1 Supabase SQL Editorを開く

Supabase Dashboard → SQL Editor

### 1.2 メインスキーマを実行

`/claudedocs/message_scheduling_schema.sql` の内容を貼り付けて実行

### 1.3 ヘルパー関数を実行

`/claudedocs/message_helper_functions.sql` の内容を貼り付けて実行

### 1.4 確認

```sql
-- テーブル確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('messages', 'message_recipients');

-- 関数確認
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%message%';
```

---

## ステップ2: Edge Functionsデプロイ

### 2.1 Supabase CLIセットアップ

```bash
# インストール (未インストールの場合)
npm install -g supabase

# ログイン
supabase login

# プロジェクトリンク
cd /path/to/lme-saas
supabase link --project-ref YOUR_PROJECT_REF
```

### 2.2 Functionsデプロイ

```bash
# send-line-message
supabase functions deploy send-line-message

# process-scheduled-messages
supabase functions deploy process-scheduled-messages

# process-line-webhook
supabase functions deploy process-line-webhook
```

### 2.3 環境変数設定

```bash
# LINE認証情報
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=YOUR_CHANNEL_ACCESS_TOKEN
supabase secrets set LINE_CHANNEL_SECRET=YOUR_CHANNEL_SECRET

# Supabase認証情報 (自動設定されますが確認)
supabase secrets list
```

---

## ステップ3: Cron Job設定

### 3.1 pg_cron有効化

Supabase Dashboard → Database → Extensions

`pg_cron` を有効化

### 3.2 Cron Job作成

SQL Editorで以下を実行:

```sql
-- process-scheduled-messages を毎分実行
SELECT cron.schedule(
  'process-scheduled-messages',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-scheduled-messages',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body:='{}'::jsonb
    ) AS request_id;
  $$
);
```

**YOUR_PROJECT_REF**: Supabaseプロジェクト参照ID
**YOUR_SERVICE_ROLE_KEY**: Supabase Settings → API → service_role key

### 3.3 Cron Job確認

```sql
-- 登録されているCron Jobを確認
SELECT * FROM cron.job;

-- 実行履歴確認
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## ステップ4: LINE Webhook設定

### 4.1 LINE Developers Console

https://developers.line.biz/console/

### 4.2 Messaging API設定

チャネル設定 → Messaging API

**Webhook URL**:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-line-webhook
```

**Webhook送信**: 利用する

**検証**: 緑のチェックマークが表示されればOK

### 4.3 応答設定

応答設定:
- 応答メッセージ: オフ
- Webhook: オン

---

## ステップ5: 環境変数設定 (Next.js)

### 5.1 .env.local更新

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# LINE Configuration
LINE_CHANNEL_ACCESS_TOKEN=YOUR_CHANNEL_ACCESS_TOKEN
LINE_CHANNEL_SECRET=YOUR_CHANNEL_SECRET

# Service Role Key (サーバーサイドのみ)
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

---

## ステップ6: テスト

### 6.1 メッセージ送信テスト

```typescript
// テストスクリプト: test-message-sending.ts
import { sendMessageNow } from '@/lib/actions/messages'

async function testMessageSending() {
  const result = await sendMessageNow({
    type: 'text',
    content: { type: 'text', text: 'テストメッセージ' },
    targetType: 'manual',
    targetIds: ['YOUR_FRIEND_ID'], // 既存の友だちIDを指定
  })

  console.log('送信結果:', result)
}

testMessageSending()
```

実行:
```bash
npx tsx test-message-sending.ts
```

### 6.2 スケジューリングテスト

```typescript
// テストスクリプト: test-scheduled-message.ts
import { scheduleMessage } from '@/lib/actions/messages'

async function testScheduledMessage() {
  // 5分後に送信予約
  const scheduledAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const result = await scheduleMessage({
    type: 'text',
    content: { type: 'text', text: '予約メッセージテスト' },
    targetType: 'manual',
    targetIds: ['YOUR_FRIEND_ID'],
    scheduledAt,
  })

  console.log('予約結果:', result)
  console.log('送信予定時刻:', scheduledAt)
}

testScheduledMessage()
```

### 6.3 Webhook受信テスト

LINE公式アカウントにメッセージを送信して、データベースを確認:

```sql
-- 友だちの最終インタラクション時刻が更新されているか確認
SELECT line_user_id, display_name, last_interaction_at
FROM friends
ORDER BY last_interaction_at DESC
LIMIT 5;
```

---

## ステップ7: モニタリング設定

### 7.1 Supabase Logsで確認

Supabase Dashboard → Edge Functions → Logs

各Function実行ログを確認

### 7.2 データベースクエリ

```sql
-- 送信中のメッセージ
SELECT * FROM messages WHERE status = 'sending';

-- 最近完了したメッセージ
SELECT
  id,
  type,
  sent_count,
  delivered_count,
  read_count,
  click_count,
  error_count,
  completed_at
FROM messages
WHERE status = 'completed'
ORDER BY completed_at DESC
LIMIT 10;

-- エラー分析
SELECT
  error_message,
  COUNT(*) as count
FROM message_recipients
WHERE status = 'failed'
GROUP BY error_message
ORDER BY count DESC;
```

### 7.3 配信パフォーマンス

```sql
-- 配信パフォーマンスビュー
SELECT * FROM message_delivery_performance
ORDER BY created_at DESC
LIMIT 10;

-- ユーザー別統計
SELECT * FROM get_user_message_summary('YOUR_USER_ID');
```

---

## トラブルシューティング

### 問題1: Edge Functionがデプロイできない

**原因**: Supabase CLIのバージョンが古い

**解決策**:
```bash
npm update -g supabase
supabase --version
```

### 問題2: Cron Jobが実行されない

**原因**: pg_cron拡張が有効化されていない、またはURL/Keyが間違っている

**解決策**:
```sql
-- pg_cron確認
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Cron Job再登録
SELECT cron.unschedule('process-scheduled-messages');
-- 再度スケジュール登録
```

### 問題3: LINE Webhookが受信できない

**原因**: 署名検証失敗、または環境変数未設定

**解決策**:
```bash
# Edge Function環境変数確認
supabase secrets list

# Webhook URL確認
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-line-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 問題4: メッセージが送信されない

**原因**: LINE認証情報が無効、またはレート制限

**解決策**:
```bash
# LINE API疎通確認
curl -X POST https://api.line.me/v2/bot/message/push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "to": "USER_ID",
    "messages": [{"type": "text", "text": "test"}]
  }'
```

### 問題5: RLSエラーでデータが取得できない

**原因**: RLSポリシーが正しく設定されていない

**解決策**:
```sql
-- RLS確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('messages', 'message_recipients');

-- 一時的にRLS無効化してテスト
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
-- テスト後、必ず再有効化
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

---

## 次のステップ

1. **フロントエンド実装**
   - メッセージ作成フォーム
   - 送信履歴一覧
   - 統計ダッシュボード

2. **分析機能追加**
   - A/Bテスト
   - 開封率分析
   - クリック追跡

3. **拡張機能**
   - リッチメニュー統合
   - ステップ配信
   - 自動応答

---

## サポート

問題が解決しない場合:

1. Supabase Logs確認
2. Edge Function実行ログ確認
3. データベースクエリで状態確認
4. LINE Developers Consoleでエラーログ確認

---

**セットアップ完了後、必ず本番環境で十分なテストを実施してください。**

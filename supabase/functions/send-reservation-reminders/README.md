# Send Reservation Reminders Edge Function

自動予約リマインダー送信用のSupabase Edge Function

## 概要

このEdge Functionは、予約時刻の24時間前と1時間前に自動的にLINEメッセージでリマインダーを送信します。カスタムリマインド時間にも対応しています。

## 機能

- **自動リマインダー送信**: 予約時刻の24時間前と1時間前に自動送信
- **カスタムリマインド時間**: 任意の時間にリマインダーを設定可能
- **予約情報の送信**: 日時、場所、メモを含む詳細情報
- **キャンセルURL**: ワンクリックでキャンセル可能なURL
- **送信記録**: 送信結果とエラーをデータベースに記録
- **レート制限対応**: LINE API制限(500メッセージ/秒)を考慮
- **エラーハンドリング**: ブロックユーザー、無効ユーザーの処理

## データベーススキーマ

### reservations テーブル
```sql
id                   UUID PRIMARY KEY
account_id           UUID (accounts参照)
friend_id            UUID (friends参照)
reservation_datetime TIMESTAMPTZ (予約日時)
location             TEXT (場所)
notes                TEXT (メモ)
status               TEXT (active/cancelled/completed)
created_at           TIMESTAMPTZ
updated_at           TIMESTAMPTZ
```

### reservation_reminders テーブル
```sql
id              UUID PRIMARY KEY
reservation_id  UUID (reservations参照)
reminder_type   TEXT (24_hours/1_hour/custom)
remind_at       TIMESTAMPTZ (送信予定時刻)
sent_at         TIMESTAMPTZ (送信完了時刻)
error_message   TEXT (エラーメッセージ)
created_at      TIMESTAMPTZ
```

## セットアップ

### 1. データベースマイグレーション

```bash
# マイグレーションを実行
supabase migration up
```

### 2. 環境変数設定

Supabaseダッシュボードで以下の環境変数を設定:

- `SUPABASE_URL`: SupabaseプロジェクトURL
- `SUPABASE_SERVICE_ROLE_KEY`: サービスロールキー
- `LINE_CHANNEL_ACCESS_TOKEN`: LINEチャネルアクセストークン
- `APP_BASE_URL`: アプリケーションのベースURL (キャンセルURL生成用)

### 3. Edge Functionデプロイ

```bash
# Edge Functionをデプロイ
supabase functions deploy send-reservation-reminders
```

### 4. Cron設定 (オプション1: Supabase Cron)

`_cron.yml` に以下を追加済み:

```yaml
- name: send-reservation-reminders
  schedule: "0 * * * *" # 毎時0分に実行
  description: Send LINE reminder messages for upcoming reservations
```

### 5. Cron設定 (オプション2: pg_cron)

pg_cron拡張が有効な場合:

```sql
-- pg_cron拡張を有効化
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Cronジョブを登録
SELECT cron.schedule(
  'send-reservation-reminders',
  '0 * * * *',  -- 毎時0分に実行
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-reservation-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    )
  );
  $$
);

-- ジョブ確認
SELECT * FROM cron.job;

-- ジョブ削除 (必要な場合)
SELECT cron.unschedule('send-reservation-reminders');
```

## 動作フロー

1. **Cronトリガー**: 毎時0分に実行
2. **リマインド対象取得**:
   - 現在時刻から70分以内に送信予定のリマインダーを取得
   - `sent_at` がNULLのものが対象
3. **予約状態確認**:
   - 予約がキャンセル済みの場合はスキップ
   - ユーザーがブロック済みの場合はスキップ
4. **メッセージ送信**:
   - LINE Messaging APIでプッシュメッセージ送信
   - 予約情報とキャンセルURLを含む
5. **送信記録**:
   - 成功時: `sent_at` に現在時刻を記録
   - 失敗時: `sent_at` と `error_message` を記録
6. **レスポンス**:
   - 送信数、エラー数、処理数を返す

## メッセージフォーマット

```
【予約リマインダー】明日のご予約について

[ユーザー名]様

ご予約のリマインダーをお送りします。

【予約情報】
日時: 2025年10月30日(水曜日) 14:00
場所: 東京オフィス
メモ: 資料持参

キャンセルが必要な場合は、以下のURLからお手続きください。
https://example.com/cancel-reservation/uuid

ご来店をお待ちしております。
```

## API使用方法

### 手動トリガー (テスト用)

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/send-reservation-reminders \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### レスポンス例

```json
{
  "success": true,
  "sentCount": 15,
  "errorCount": 2,
  "totalProcessed": 17,
  "errors": [
    "Reminder uuid-1: User is blocked",
    "Reminder uuid-2: Invalid LINE user"
  ]
}
```

## カスタムリマインダーの追加

```sql
-- カスタム時間でリマインダーを追加
INSERT INTO reservation_reminders (
  reservation_id,
  reminder_type,
  remind_at
) VALUES (
  'reservation-uuid',
  'custom',
  '2025-10-30 09:00:00+00'  -- 任意の送信時刻
);
```

## モニタリング

### 送信状況確認

```sql
-- 本日の送信状況
SELECT
  reminder_type,
  COUNT(*) as total,
  COUNT(sent_at) as sent,
  COUNT(error_message) as errors
FROM reservation_reminders
WHERE remind_at >= CURRENT_DATE
GROUP BY reminder_type;

-- 失敗したリマインダー
SELECT
  rr.*,
  r.reservation_datetime,
  r.location,
  f.display_name
FROM reservation_reminders rr
JOIN reservations r ON r.id = rr.reservation_id
JOIN friends f ON f.id = r.friend_id
WHERE rr.error_message IS NOT NULL
ORDER BY rr.created_at DESC;
```

### ログ確認

```bash
# Edge Functionログを確認
supabase functions logs send-reservation-reminders
```

## トラブルシューティング

### リマインダーが送信されない

1. **Cron設定確認**: `_cron.yml` またはpg_cronが正しく設定されているか
2. **環境変数確認**: 必要な環境変数が全て設定されているか
3. **予約時刻確認**: 予約時刻が未来であることを確認
4. **リマインダーレコード確認**: `reservation_reminders`テーブルにレコードが存在するか

```sql
SELECT * FROM reservation_reminders
WHERE sent_at IS NULL
AND remind_at <= NOW() + INTERVAL '1 hour';
```

### LINE送信エラー

- **Invalid User**: ユーザーがLINEをブロックまたは削除
- **Rate Limit**: 送信速度が速すぎる (次回実行で再試行)
- **Invalid Token**: `LINE_CHANNEL_ACCESS_TOKEN` が無効

### パフォーマンス

- 1実行あたり最大100件のリマインダーを処理
- レート制限: 100ms間隔で送信 (最大600件/分)
- 処理時間: 平均10秒 (100件の場合)

## セキュリティ考慮事項

- **RLS (Row Level Security)**: ユーザーは自分の予約とリマインダーのみ閲覧可能
- **Service Role**: Edge Functionはservice_roleで全てのリマインダーを処理
- **キャンセルURL**: UUIDベースで推測不可能
- **ブロックユーザー対応**: ブロック済みユーザーには送信しない

## ライセンス

プロジェクトライセンスに従う

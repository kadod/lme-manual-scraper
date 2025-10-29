# ステップ配信キャンペーン機能 - クイックスタートガイド

**対象**: 開発者
**所要時間**: 15分

---

## 1. セットアップ（5分）

### 環境変数設定
```bash
# .env.local に追加
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 依存関係インストール
```bash
cd lme-saas
npm install
# reactflow, date-fns, 各種 Radix UI パッケージが自動インストール済み
```

---

## 2. データベース設定（5分）

### Supabase Dashboard で実行

1. **SQL Editor を開く**
   - Supabase Dashboard → SQL Editor

2. **マイグレーションファイルを実行**
   ```sql
   -- supabase/migrations/20251029_step_campaigns_rls.sql の内容を貼り付けて実行
   ```

3. **実行内容の確認**
   - RLS ポリシー作成
   - ヘルパー関数作成
   - トリガー作成
   - インデックス作成

### または CLI で実行
```bash
supabase db push
```

---

## 3. Edge Function デプロイ（3分）

### Supabase CLI を使用
```bash
# Edge Function をデプロイ
supabase functions deploy process-step-campaigns

# Cron を有効化
supabase functions cron enable process-step-campaigns
```

### または Dashboard で設定
1. Edge Functions → Deploy
2. process-step-campaigns をデプロイ
3. Cron → Enable (スケジュール: `*/1 * * * *`)

---

## 4. 開発サーバー起動（2分）

```bash
# 開発サーバー起動
npm run dev

# ブラウザで開く
open http://localhost:3000/dashboard/messages/step-campaigns
```

---

## 5. 動作確認（5分）

### テストキャンペーン作成

1. **一覧ページにアクセス**
   ```
   http://localhost:3000/dashboard/messages/step-campaigns
   ```

2. **「新規キャンペーン」ボタンをクリック**

3. **基本情報を入力**
   - 名前: `テストキャンペーン`
   - 説明: `動作確認用`

4. **トリガータブで設定**
   - トリガータイプ: `友だち追加`

5. **ステップタブでステップ追加**
   - **ステップ1**:
     - 名前: `ウェルカムメッセージ`
     - 待機時間: `0`分
     - メッセージ: `ようこそ！友だち追加ありがとうございます。`

   - **ステップ2**:
     - 名前: `フォローアップ`
     - 待機時間: `1`分
     - メッセージ: `何かお困りのことがあればお気軽にお問い合わせください。`

6. **プレビュータブで確認**
   - フローチャートを確認
   - サマリー情報を確認

7. **「保存して開始」をクリック**

### 確認ポイント

- [x] キャンペーンが一覧に表示される
- [x] ステータスが「アクティブ」になっている
- [x] 詳細ページでフローが表示される

---

## 6. Edge Function 動作確認

### ログ確認
```bash
# Supabase Dashboard → Edge Functions → Logs
# または CLI
supabase functions logs process-step-campaigns --follow
```

### 期待されるログ
```
Starting step campaign processing...
Processing 0 logs...
Processing complete. Processed: 0, Errors: 0
```

### テストデータ挿入（手動）
```sql
-- step_campaign_logs にテストデータを挿入
INSERT INTO step_campaign_logs (
  step_campaign_id,
  line_friend_id,
  current_step_number,
  status,
  started_at,
  next_send_at
) VALUES (
  'your-campaign-id',  -- キャンペーンID
  'your-friend-id',    -- 友だちID
  0,
  'active',
  NOW(),
  NOW() - INTERVAL '1 minute'  -- 1分前（即座に処理される）
);
```

---

## よく使うコマンド

### 開発
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番起動
npm start

# Lint
npm run lint
```

### Supabase
```bash
# ローカル Supabase 起動
supabase start

# マイグレーション適用
supabase db push

# Edge Function デプロイ
supabase functions deploy process-step-campaigns

# ログ確認
supabase functions logs process-step-campaigns

# データベース接続
supabase db connect
```

---

## トラブルシューティング

### キャンペーンが表示されない
```bash
# RLS ポリシーを確認
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'step_%';

# マイグレーション再実行
supabase db push --force
```

### Edge Function が動作しない
```bash
# Cron 設定を確認
# Supabase Dashboard → Edge Functions → Cron

# ログを確認
supabase functions logs process-step-campaigns --follow

# 手動実行
curl -X POST https://your-project.supabase.co/functions/v1/process-step-campaigns \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}"
```

### フローチャートが表示されない
```typescript
// CampaignFlowChart.tsx で確認
import 'reactflow/dist/style.css'  // この行があるか確認
```

---

## 主要ファイルの場所

### Server Actions
```
/app/actions/campaigns.ts
```

### Components
```
/components/messages/
├── CampaignList.tsx
├── CampaignEditor.tsx
├── StepBuilder.tsx
├── StepCard.tsx
├── TriggerSelector.tsx
├── CampaignFlowChart.tsx
├── CampaignStats.tsx
└── SubscriberList.tsx
```

### Pages
```
/app/dashboard/messages/step-campaigns/
├── page.tsx          # 一覧
├── new/page.tsx      # 新規作成
└── [id]/page.tsx     # 詳細
```

### Edge Function
```
/supabase/functions/process-step-campaigns/index.ts
```

### Migration
```
/supabase/migrations/20251029_step_campaigns_rls.sql
```

---

## API リファレンス

### Server Actions

```typescript
import {
  createCampaign,
  updateCampaign,
  pauseCampaign,
  resumeCampaign,
  deleteCampaign,
  duplicateCampaign
} from '@/app/actions/campaigns'

// キャンペーン作成
const result = await createCampaign(
  {
    name: 'キャンペーン名',
    description: '説明',
    trigger_type: 'friend_add',
    trigger_config: {},
    line_channel_id: 'channel-id'
  },
  [
    {
      step_number: 1,
      name: 'ステップ1',
      delay_value: 0,
      delay_unit: 'minutes',
      message_type: 'text',
      message_content: { type: 'text', text: 'メッセージ' }
    }
  ]
)

// エラーハンドリング
if (result.error) {
  console.error(result.error)
} else {
  console.log('作成成功:', result.data)
}
```

---

## 次のステップ

### すぐに実装できる機能
1. **リアルタイム更新**
   ```typescript
   // Supabase Realtime を使用
   const subscription = supabase
     .channel('campaigns')
     .on('postgres_changes', {
       event: 'UPDATE',
       schema: 'public',
       table: 'step_campaigns'
     }, (payload) => {
       // UI を更新
     })
     .subscribe()
   ```

2. **条件分岐**
   ```typescript
   // StepCard.tsx に条件設定UIを追加
   // Edge Function で条件評価を実装
   ```

3. **A/B テスト**
   ```typescript
   // step_campaign_steps に variant カラムを追加
   // ランダムに variant を選択して配信
   ```

---

## サポート

### ドキュメント
- [詳細実装ドキュメント](./step_campaigns_implementation.md)
- [実装完了報告](./IMPLEMENTATION_COMPLETE.md)
- [ファイル構造](./file_structure.txt)

### 問い合わせ
- プロジェクトの Issue を作成
- 開発チームに連絡

---

**作成日**: 2025-10-29
**最終更新**: 2025-10-29
**バージョン**: 1.0.0

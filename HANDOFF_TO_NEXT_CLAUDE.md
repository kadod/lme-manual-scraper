# 🚀 Next Claude への完璧な引き継ぎ指示文

## 📋 プロジェクト概要

**L Message SaaS完全再現プロジェクト** の実装フェーズに入ります。

既に以下が完了しています：
- ✅ 193ページのマニュアルから163機能を完全抽出
- ✅ Next.js 15（App Router + PPR）でのフロントエンド設計完了（31画面）
- ✅ Supabase（27テーブル + 7 Edge Functions）でのバックエンド設計完了
- ✅ Next.js 15プロジェクト初期化完了（`/lme-saas` ディレクトリ）
- ✅ shadcn/ui + Heroicons セットアップ完了
- ✅ Supabase接続設定完了
- ✅ ログイン画面 + ダッシュボード画面作成完了

---

## 🎯 あなたのミッション

### 現在の状況
```
/Users/kadotani/Documents/開発プロジェクト/GitHub/lme-manual-scraper/
├── claudedocs/                          # 📚 完全要件定義ドキュメント
│   ├── REQUIREMENTS_V2.md              # 🌟 統合要件定義書（必読！）
│   ├── lme_saas_features_complete.md   # 163機能完全リスト
│   ├── frontend_requirements_nextjs15.md # Next.js 15設計
│   ├── supabase_architecture.md        # Supabase完全設計
│   └── implementation_todo_v2.md       # 12週間実装ガイド
└── lme-saas/                            # 🚀 Next.js 15プロジェクト（ここで作業）
    ├── app/
    │   ├── login/page.tsx              # ✅ ログイン画面（完成）
    │   └── dashboard/page.tsx          # ✅ ダッシュボード（完成）
    ├── lib/supabase/
    │   ├── client.ts                   # ✅ クライアント接続
    │   └── server.ts                   # ✅ サーバー接続
    └── .env.local                       # ⚠️ Supabase認証情報を設定してください
```

---

## 📖 最初に読むべきドキュメント

### 1️⃣ 統合要件定義書（最重要）
```bash
cat ../claudedocs/REQUIREMENTS_V2.md
```
- プロジェクト全体像
- 技術スタック
- システムアーキテクチャ
- 実装ロードマップ

### 2️⃣ 実装TODOガイド
```bash
cat ../claudedocs/implementation_todo_v2.md
```
- 12週間分の詳細実装手順
- コピペ可能なコマンド
- すべてのコードスニペット

---

## 🛠️ 実装開始手順

### Step 1: Supabaseプロジェクトを作成
```bash
# 1. https://supabase.com でプロジェクト作成
# 2. Project Settings → API から以下を取得:
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. .env.localを更新
cd lme-saas
```

`.env.local` に以下を設定：
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Step 2: データベーススキーマを作成

`../claudedocs/supabase_architecture.md` を開き、27テーブルのSQL文を実行：

```sql
-- Supabase SQL Editor で実行
-- 1. organizations テーブル
-- 2. users テーブル
-- 3. user_organizations テーブル
-- ... (全27テーブル)
```

**重要**: RLSポリシーも必ず設定してください（マルチテナント対応）

### Step 3: 開発サーバー起動
```bash
cd lme-saas
npm run dev
```

http://localhost:3000 でアクセス可能

---

## 📝 実装優先順位（Phase別）

### 🔴 Phase 1: 友だち管理（Week 3）
**次にやること**:
```bash
# 1. 友だちリスト画面作成
mkdir -p app/friends
touch app/friends/page.tsx

# 2. タグ管理画面
mkdir -p app/friends/tags
touch app/friends/tags/page.tsx

# 3. セグメント画面
mkdir -p app/friends/segments
touch app/friends/segments/page.tsx
```

**参考コード**: `../claudedocs/implementation_todo_v2.md` の Phase 2 を参照

### 🟡 Phase 2: メッセージ配信（Week 4-5）
```bash
# 一斉配信機能
mkdir -p app/messages
touch app/messages/page.tsx
touch app/messages/new/page.tsx

# ステップ配信機能
mkdir -p app/messages/step-campaigns
touch app/messages/step-campaigns/page.tsx
touch app/messages/step-campaigns/new/page.tsx
```

### 🟢 Phase 3: フォーム（Week 6）
```bash
mkdir -p app/forms
touch app/forms/page.tsx
touch app/forms/new/page.tsx
```

---

## 🎨 UI実装ルール

### Heroicons使用（絵文字禁止）
```tsx
// ❌ 絶対にダメ
<span>📧</span>
<button>🔒 ログイン</button>

// ✅ 正しい
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

<EnvelopeIcon className="h-5 w-5" />
<LockClosedIcon className="h-5 w-5" />
```

### shadcn/ui使用
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell } from '@/components/ui/table'
```

### Supabase接続
```tsx
// Client Component
'use client'
import { createClient } from '@/lib/supabase/client'

// Server Component
import { createClient } from '@/lib/supabase/server'
```

---

## 🔍 重要な設計ポイント

### 1. マルチテナント対応
すべてのデータに `organization_id` を含める：
```typescript
const { data } = await supabase
  .from('friends')
  .select('*')
  .eq('organization_id', user.organization_id) // 必須！
```

### 2. Realtime更新
```typescript
// メッセージ配信状況をリアルタイム監視
supabase
  .channel('message-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'message_recipients'
  }, (payload) => {
    console.log('配信状況更新:', payload)
  })
  .subscribe()
```

### 3. Edge Functions
```typescript
// Edge Function呼び出し例
const { data, error } = await supabase.functions.invoke('send-line-message', {
  body: { messageId: 'xxx' }
})
```

---

## 📚 開発時の参照ドキュメント

### Next.js 15公式ドキュメント
```bash
# 以下をContext7 MCPで取得可能
- App Router
- Server Actions
- Partial Prerendering (PPR)
- Parallel Routes
```

### Supabase公式ドキュメント
```bash
# 以下をContext7 MCPで取得可能
- Supabase Auth
- Realtime
- Edge Functions
- Storage
```

---

## ⚡ クイックコマンド集

### 新しいページ作成
```bash
mkdir -p app/[page-name]
touch app/[page-name]/page.tsx
```

### shadcn/uiコンポーネント追加
```bash
npx shadcn@latest add [component-name]
```

### Supabase型生成
```bash
npx supabase gen types typescript --project-id [project-id] > lib/database.types.ts
```

### ビルド確認
```bash
npm run build
```

---

## 🚨 実装時の注意事項

### ❌ やってはいけないこと
1. **絵文字を使わない** → Heroiconsを使用
2. **TODO コメントを残さない** → 完全実装すること
3. **モックデータを作らない** → 本物のSupabaseデータを使用
4. **main/masterブランチで作業しない** → feature branchを作成

### ✅ 必ずやること
1. **全機能を完全実装** → 半端な実装は不可
2. **Heroicons使用** → UI一貫性のため
3. **Supabase RLS確認** → セキュリティ最優先
4. **型安全性確保** → TypeScriptを活用

---

## 🎯 最終目標

### 12週間後に完成すべき機能
- ✅ 友だち管理（リスト、タグ、セグメント）
- ✅ メッセージ配信（一斉、ステップ、予約）
- ✅ 1:1チャット（Realtime）
- ✅ フォーム作成・管理
- ✅ リッチメニューエディタ
- ✅ 予約管理（イベント、レッスン、サロン）
- ✅ データ分析（ダッシュボード、クロス分析、URL計測）
- ✅ 自動応答設定
- ✅ システム設定

---

## 📞 困ったときの参照先

### コードスニペットが欲しい
→ `../claudedocs/implementation_todo_v2.md` を参照

### データベース設計を確認したい
→ `../claudedocs/supabase_architecture.md` を参照

### 画面設計を確認したい
→ `../claudedocs/frontend_requirements_nextjs15.md` を参照

### 全機能リストを見たい
→ `../claudedocs/lme_saas_features_complete.md` を参照

---

## 🚀 実装開始コマンド

```bash
# 1. ディレクトリ移動
cd /Users/kadotani/Documents/開発プロジェクト/GitHub/lme-manual-scraper/lme-saas

# 2. 要件定義を読む
cat ../claudedocs/REQUIREMENTS_V2.md

# 3. 実装TODOを読む
cat ../claudedocs/implementation_todo_v2.md

# 4. Supabaseプロジェクト作成（手動）
# → https://supabase.com

# 5. .env.local更新
vim .env.local

# 6. 開発サーバー起動
npm run dev

# 7. 実装開始！
# Phase 1: 友だち管理から始めてください
```

---

## 💬 引き継ぎメッセージ

前のClaudeより：

> 「193ページのマニュアルからL Message SaaSの全機能（163個）を抽出し、完全な要件定義を作成しました。Next.js 15 + Supabase + Heroicons + shadcn/ui で実装開始できる状態です。
>
> すでにプロジェクト初期化、ログイン画面、ダッシュボード画面は完成しています。次は友だち管理機能から実装を開始してください。
>
> `../claudedocs/REQUIREMENTS_V2.md` と `../claudedocs/implementation_todo_v2.md` を読めば、すぐに実装を開始できます。頑張ってください！」

---

## 📋 チェックリスト

実装開始前に確認：
- [ ] `../claudedocs/REQUIREMENTS_V2.md` を読んだ
- [ ] `../claudedocs/implementation_todo_v2.md` を読んだ
- [ ] Supabaseプロジェクトを作成した
- [ ] `.env.local` に認証情報を設定した
- [ ] データベース27テーブルを作成した
- [ ] RLSポリシーを設定した
- [ ] `npm run dev` でサーバーが起動することを確認した
- [ ] `/login` でログイン画面が表示されることを確認した

すべてチェックできたら、Phase 1（友だち管理）の実装を開始してください！

---

**作成日**: 2025-10-29
**作成者**: Claude (Previous Session)
**プロジェクト**: L Message SaaS完全再現
**ステータス**: 実装フェーズ開始可能 🚀

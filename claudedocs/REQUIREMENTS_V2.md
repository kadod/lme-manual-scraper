# L Message SaaS - 完全要件定義書 v2.0

> **プロジェクト目的**: 193ページのマニュアルから抽出した「エルメ（L Message）」の全機能を完全再現したステップ配信SaaSを構築する

## 📋 ドキュメント構成

この要件定義書は4つの詳細ドキュメントを統合したマスター文書です：

1. **[機能完全リスト](./lme_saas_features_complete.md)** - 163機能の完全抽出と分類
2. **[フロントエンド要件](./frontend_requirements_nextjs15.md)** - Next.js 15アーキテクチャ（31画面設計）
3. **[バックエンドアーキテクチャ](./supabase_architecture.md)** - Supabase完全設計（27テーブル + Edge Functions）
4. **[実装TODO](./implementation_todo_v2.md)** - Claude Code実行用12フェーズ実装ガイド

---

## 🎯 エグゼクティブサマリー

### プロジェクト概要

**L Message SaaS** は、LINE公式アカウントを活用したステップ配信・顧客管理プラットフォームです。本プロジェクトは、既存のL Messageマニュアル（193ページ）から全機能を抽出し、最新技術スタック（Next.js 15 + Supabase）で完全再現することを目指します。

### 技術スタック

| レイヤー | 技術 | バージョン | 役割 |
|---------|------|----------|------|
| **Frontend** | Next.js | 15.x | App Router, PPR, Server Actions |
| **UI Framework** | React | 19.x | React Compiler, Suspense |
| **Backend** | Supabase | Latest | PostgreSQL, Realtime, Auth, Storage, Edge Functions |
| **Language** | TypeScript | 5.x | Full type safety |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Components** | shadcn/ui | Latest | Accessible components |
| **State** | Zustand | Latest | Global state management |
| **Data Fetching** | TanStack Query | v5 | Server state management |

### 主要機能カテゴリー（9分野・163機能）

1. **顧客対応** (Customer Service) - 1:1チャット、リッチメニュー、フォーム、自動応答、通知、モバイルアプリ
2. **メッセージ配信** (Messaging) - ステップ配信、あいさつメッセージ、テンプレート、一斉配信、関連機能
3. **情報管理** (Data Management) - 友だちリスト、タグ、セグメント、QRコード、友だち情報
4. **予約管理** (Reservations) - イベント予約、レッスン予約、サロン予約、リマインダー、関連機能
5. **販促ツール** (Promotional) - 商品販売、ポップアップ
6. **データ分析** (Analytics) - クロス分析、URL計測、コンバージョン、CSVエクスポート
7. **システム設定・契約** (System) - アカウント管理、プラン管理、LINE連携
8. **その他システム** (Other Systems) - スタッフ管理、システムユーティリティ
9. **有料プラン限定** (Premium) - アクションスケジュール、ASP管理、アカウント切り替え、データコピー

### データベース設計概要

- **27テーブル**: Organizations, Users, LINE Channels, Friends, Tags, Messages, Step Campaigns, Rich Menus, Forms, Reservations, Analytics
- **Row Level Security (RLS)**: マルチテナント対応（organization_id ベース）
- **5 Storage Buckets**: Rich Menu画像、メッセージ添付、フォームアップロード、ユーザーアバター、組織アセット
- **7 Edge Functions**: LINE送信、Webhook処理、予約リマインダー、ステップ処理、分析集計

### 実装優先順位（5フェーズ）

| フェーズ | 期間 | 主要機能 | 優先度 |
|---------|------|---------|-------|
| **Phase 1 - MVP** | Week 1-4 | 認証、友だち管理、基本メッセージ配信、1:1チャット | 🔴 Critical |
| **Phase 2 - Core** | Week 5-6 | ステップ配信、タグ管理、セグメント、リッチメニュー | 🟡 High |
| **Phase 3 - Advanced** | Week 7-8 | フォーム、予約管理、自動応答、データ分析 | 🟢 Medium |
| **Phase 4 - Premium** | Week 9-10 | 販促ツール、高度な分析、スタッフ管理 | 🔵 Low |
| **Phase 5 - Enterprise** | Week 11-12 | 有料プラン機能、ASP管理、データコピー | ⚪ Optional |

---

## 🏗️ システムアーキテクチャ

### 全体構成図（テキストベース）

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
│                    (Next.js 15 Frontend)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  App Router + PPR + Server Actions + React 19          │ │
│  │  - Authentication Pages (Login/Signup)                 │ │
│  │  - Dashboard (Analytics Overview)                      │ │
│  │  - Messaging (Step Campaigns, Broadcast)               │ │
│  │  - Friends Management (List, Tags, Segments)           │ │
│  │  - Forms & Rich Menu Builder                           │ │
│  │  - Reservations (Events, Lessons, Salons)              │ │
│  │  - Analytics (Cross Analysis, URL Tracking)            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Platform                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database (27 Tables + RLS)                 │ │
│  │  - organizations, users, line_channels                 │ │
│  │  - friends, tags, segments                             │ │
│  │  - messages, step_campaigns, message_templates         │ │
│  │  - rich_menus, forms, form_submissions                 │ │
│  │  - reservations, reservation_types, reservation_slots  │ │
│  │  - analytics_events, analytics_reports                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Realtime Subscriptions                                │ │
│  │  - Message status updates (sent/delivered/read)        │ │
│  │  - Friend list changes (new friends, unfollows)        │ │
│  │  - Reservation updates (new bookings, cancellations)   │ │
│  │  - Chat messages (1:1 real-time chat)                  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Auth (JWT-based Multi-tenant)                         │ │
│  │  - Email/Password authentication                       │ │
│  │  - User sessions with organization context             │ │
│  │  - RLS policies for data isolation                     │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Storage (5 Buckets)                                   │ │
│  │  - rich-menu-images (PNG/JPG, public)                  │ │
│  │  - message-attachments (Images/Videos, private)        │ │
│  │  - form-uploads (User submissions, private)            │ │
│  │  - user-avatars (Profile images, public)               │ │
│  │  - organization-assets (Logos/Branding, private)       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Edge Functions (7 Functions)                          │ │
│  │  1. send-line-message (Send to LINE Messaging API)     │ │
│  │  2. line-webhook (Handle LINE webhook events)          │ │
│  │  3. process-step-campaign (Scheduled step processing)  │ │
│  │  4. send-reservation-reminders (Cron job for alerts)   │ │
│  │  5. aggregate-analytics (Daily analytics calculation)  │ │
│  │  6. process-form-submission (Handle form webhooks)     │ │
│  │  7. update-friend-info (Sync LINE friend data)         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    LINE Platform API                        │
│  - Messaging API (Push/Multicast/Broadcast)                │
│  - Webhook Events (Message, Follow, Unfollow, Postback)    │
│  - Rich Menu API (Create, Update, Link)                    │
│  - User Profile API (Get friend information)               │
└─────────────────────────────────────────────────────────────┘
```

### Supabase役割分担

| サービス | 担当範囲 | 具体例 |
|---------|---------|--------|
| **PostgreSQL Database** | 全永続データ管理 | 27テーブル（友だち、メッセージ、予約、分析など） |
| **Realtime** | リアルタイム更新配信 | メッセージ配信状況、予約更新、チャット、友だち変更 |
| **Auth** | 認証・認可 | JWT発行、マルチテナントRLS、セッション管理 |
| **Storage** | ファイル保存 | リッチメニュー画像、添付ファイル、アバター（5バケット） |
| **Edge Functions** | サーバーサイドロジック | LINE API連携、Webhook処理、Cron処理（7関数） |

---

## 📱 フロントエンド設計（31画面）

### 画面カテゴリー別一覧

#### 1. 認証系 (3画面)
- `/login` - ログイン画面
- `/signup` - サインアップ画面
- `/forgot-password` - パスワードリセット画面

#### 2. ダッシュボード (2画面)
- `/dashboard` - 分析概要ダッシュボード
- `/dashboard/notifications` - 通知センター

#### 3. メッセージ配信系 (5画面)
- `/messages` - メッセージ一覧
- `/messages/new` - 新規メッセージ作成
- `/messages/step-campaigns` - ステップ配信管理
- `/messages/step-campaigns/new` - 新規ステップ配信作成
- `/messages/templates` - テンプレート管理

#### 4. 友だち管理系 (5画面)
- `/friends` - 友だちリスト
- `/friends/[id]` - 友だち詳細
- `/friends/tags` - タグ管理
- `/friends/segments` - セグメント管理
- `/friends/import` - 友だちインポート

#### 5. フォーム系 (3画面)
- `/forms` - フォーム一覧
- `/forms/new` - 新規フォーム作成
- `/forms/[id]/submissions` - フォーム回答一覧

#### 6. リッチメニュー系 (2画面)
- `/rich-menus` - リッチメニュー一覧
- `/rich-menus/new` - 新規リッチメニュー作成

#### 7. 予約管理系 (4画面)
- `/reservations` - 予約一覧
- `/reservations/types` - 予約タイプ管理
- `/reservations/calendar` - カレンダービュー
- `/reservations/settings` - 予約設定

#### 8. 分析系 (3画面)
- `/analytics` - 総合分析
- `/analytics/cross-analysis` - クロス分析
- `/analytics/url-tracking` - URL計測

#### 9. 設定系 (4画面)
- `/settings/profile` - プロフィール設定
- `/settings/line-channel` - LINE連携設定
- `/settings/organization` - 組織設定
- `/settings/billing` - プラン・請求設定

### Next.js 15 主要機能活用

#### Partial Prerendering (PPR)
```typescript
// app/dashboard/page.tsx
export const experimental_ppr = true

export default async function DashboardPage() {
  return (
    <>
      {/* Static Shell: 即座に表示 */}
      <DashboardLayout>
        <Suspense fallback={<AnalyticsSkeleton />}>
          {/* Dynamic Content: 非同期データ取得 */}
          <AnalyticsWidget />
        </Suspense>
      </DashboardLayout>
    </>
  )
}
```

#### Server Actions
```typescript
// app/messages/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMessage(formData: FormData) {
  const supabase = createClient()
  const message = formData.get('message') as string

  const { error } = await supabase
    .from('messages')
    .insert({ content: message, status: 'pending' })

  if (error) throw error
  revalidatePath('/messages')
}
```

#### Parallel Routes (同時UI表示)
```
app/
  @chat/
    page.tsx          # チャットサイドバー
  @main/
    page.tsx          # メインコンテンツ
  layout.tsx          # 両方を同時レンダリング
```

### UI Component Mapping（shadcn/ui）

| 機能 | shadcn/ui Component | 用途 |
|-----|---------------------|------|
| メッセージ作成 | Textarea, Select, Button | メッセージ入力フォーム |
| 友だちリスト | Table, Badge, Avatar | 友だち一覧表示 |
| ステップ配信 | Card, Accordion, Calendar | 配信設定UI |
| タグ管理 | Dialog, Input, Badge | タグCRUD操作 |
| フォームビルダー | Tabs, DragDrop, Switch | フォーム作成UI |
| リッチメニュー | AspectRatio, Popover | メニュー設計 |
| 予約カレンダー | Calendar, Sheet, TimePicker | 予約管理UI |
| 分析ダッシュボード | Chart, Card, Tooltip | データ可視化 |

---

## 🗄️ バックエンド設計（27テーブル）

### データベーステーブル一覧

#### 1. コアテーブル（5テーブル）
- `organizations` - 組織情報
- `users` - ユーザー情報
- `user_organizations` - ユーザー・組織関連
- `line_channels` - LINE公式アカウント連携
- `friends` - LINE友だち情報

#### 2. メッセージ配信（7テーブル）
- `messages` - メッセージマスター
- `message_recipients` - 配信先管理
- `step_campaigns` - ステップ配信キャンペーン
- `step_campaign_steps` - ステップ配信ステップ
- `message_templates` - メッセージテンプレート
- `scheduled_messages` - 予約配信
- `broadcast_messages` - 一斉配信

#### 3. 友だち管理（4テーブル）
- `tags` - タグマスター
- `friend_tags` - 友だちタグ関連
- `segments` - セグメント定義
- `segment_members` - セグメントメンバー

#### 4. フォーム（3テーブル）
- `forms` - フォームマスター
- `form_fields` - フォームフィールド定義
- `form_submissions` - フォーム回答

#### 5. リッチメニュー（2テーブル）
- `rich_menus` - リッチメニューマスター
- `rich_menu_areas` - タップ領域定義

#### 6. 予約管理（4テーブル）
- `reservation_types` - 予約タイプ（イベント/レッスン/サロン）
- `reservation_slots` - 予約枠
- `reservations` - 予約実績
- `reservation_reminders` - リマインダー

#### 7. 分析（2テーブル）
- `analytics_events` - イベントログ
- `analytics_reports` - 集計レポート

### 代表的なテーブル設計例

#### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE POLICY "Users can view organizations they belong to"
ON organizations FOR SELECT
USING (
  id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

#### Friends Table
```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  display_name TEXT,
  picture_url TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'blocked'
  metadata JSONB DEFAULT '{}',
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  unfollowed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, line_user_id)
);

CREATE POLICY "Users can view friends in their organization"
ON friends FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'broadcast', 'step', 'scheduled', 'auto_reply'
  content JSONB NOT NULL, -- LINE message format
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Functions 設計

#### 1. send-line-message
**役割**: LINE Messaging APIへメッセージ送信
**トリガー**: Database trigger (messages.status = 'pending')
**処理フロー**:
1. メッセージ取得
2. 送信先リスト取得
3. LINE API Push/Multicast実行
4. message_recipients.status更新（'sent'/'failed'）
5. Realtime経由で配信状況通知

#### 2. line-webhook
**役割**: LINE Webhookイベント処理
**トリガー**: HTTP POST from LINE Platform
**処理フロー**:
1. Webhook署名検証
2. イベントタイプ判定（message/follow/unfollow/postback）
3. 該当テーブル更新（friends/analytics_events）
4. 自動応答トリガー判定
5. Realtime経由でUI更新通知

#### 3. process-step-campaign
**役割**: ステップ配信スケジュール処理
**トリガー**: Cron (毎分実行)
**処理フロー**:
1. 実行待ちステップ取得（scheduled_at <= NOW()）
2. 配信条件チェック（友だちステータス、タグ等）
3. メッセージ作成 → send-line-message呼び出し
4. 次ステップスケジュール登録

#### 4. send-reservation-reminders
**役割**: 予約リマインダー送信
**トリガー**: Cron (1時間ごと)
**処理フロー**:
1. リマインド対象予約取得（予約時刻の24時間前/1時間前）
2. リマインダーメッセージ作成
3. send-line-message呼び出し
4. reservation_reminders.sent_at更新

#### 5. aggregate-analytics
**役割**: 日次分析データ集計
**トリガー**: Cron (毎日午前2時)
**処理フロー**:
1. analytics_eventsから前日データ集計
2. メッセージ配信数、開封率、クリック率計算
3. 友だち増減数、ブロック率計算
4. analytics_reportsテーブル保存

---

## 🔐 セキュリティ設計

### Row Level Security (RLS) ポリシー

すべてのテーブルに対して以下のRLSポリシーを適用：

```sql
-- SELECT Policy: 自分の組織のデータのみ閲覧可能
CREATE POLICY "Users can view own organization data"
ON {table_name} FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

-- INSERT Policy: 自分の組織にのみデータ作成可能
CREATE POLICY "Users can insert into own organization"
ON {table_name} FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

-- UPDATE Policy: 自分の組織のデータのみ更新可能
CREATE POLICY "Users can update own organization data"
ON {table_name} FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

-- DELETE Policy: 自分の組織のデータのみ削除可能（管理者のみ）
CREATE POLICY "Admins can delete own organization data"
ON {table_name} FOR DELETE
USING (
  organization_id IN (
    SELECT uo.organization_id
    FROM user_organizations uo
    WHERE uo.user_id = auth.uid()
    AND uo.role = 'admin'
  )
);
```

### 環境変数管理

```bash
# .env.local (フロントエンド)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_LINE_LIFF_ID=xxxx-yyyyyy

# Supabase Secrets (Edge Functions)
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=yyy
DATABASE_URL=postgresql://...
```

---

## 📊 パフォーマンス最適化

### データベース最適化

#### インデックス設計
```sql
-- Friends テーブル
CREATE INDEX idx_friends_org_status ON friends(organization_id, status);
CREATE INDEX idx_friends_line_user_id ON friends(line_user_id);

-- Messages テーブル
CREATE INDEX idx_messages_org_status ON messages(organization_id, status);
CREATE INDEX idx_messages_scheduled_at ON messages(scheduled_at) WHERE status = 'scheduled';

-- Analytics Events テーブル
CREATE INDEX idx_analytics_events_org_created ON analytics_events(organization_id, created_at DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
```

#### マテリアライズドビュー（集計用）
```sql
CREATE MATERIALIZED VIEW mv_daily_analytics AS
SELECT
  organization_id,
  DATE(created_at) AS date,
  event_type,
  COUNT(*) AS event_count
FROM analytics_events
GROUP BY organization_id, DATE(created_at), event_type;

CREATE UNIQUE INDEX idx_mv_daily_analytics ON mv_daily_analytics(organization_id, date, event_type);

-- 日次更新（Cron Job）
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_analytics;
```

### フロントエンド最適化

#### コード分割
```typescript
// Dynamic Imports for heavy components
const RichMenuBuilder = dynamic(() => import('@/components/RichMenuBuilder'), {
  loading: () => <Skeleton className="h-[600px]" />,
  ssr: false
})

const AnalyticsChart = dynamic(() => import('@/components/AnalyticsChart'), {
  loading: () => <ChartSkeleton />
})
```

#### 仮想化（大量データ表示）
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

// 10,000件の友だちリストを効率的に表示
const FriendsList = ({ friends }) => {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: friends.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // 行の高さ
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key} style={{ height: `${virtualItem.size}px` }}>
            <FriendRow friend={friends[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🚀 実装ロードマップ（12週間）

### Phase 1: 環境構築・認証 (Week 1-2)
- Next.js 15プロジェクト初期化
- Supabaseプロジェクト作成
- データベーススキーマ作成（27テーブル）
- 認証機能実装（Login/Signup）
- ダッシュボードレイアウト作成

### Phase 2: 友だち管理 (Week 3)
- 友だちリスト画面
- タグ管理機能
- セグメント機能
- LINE Webhook受信

### Phase 3: メッセージ配信 (Week 4-5)
- 一斉配信機能
- ステップ配信作成
- メッセージテンプレート
- 配信履歴・分析

### Phase 4: フォーム (Week 6)
- フォームビルダー
- フォーム回答管理
- 自動返信連携

### Phase 5: リッチメニュー (Week 7)
- リッチメニューエディタ
- 画像アップロード
- LINE API連携

### Phase 6: 予約管理 (Week 8)
- 予約タイプ設定
- カレンダービュー
- 予約受付・リマインダー

### Phase 7: 分析機能 (Week 9)
- ダッシュボード分析
- クロス分析
- URL計測

### Phase 8: 1:1チャット (Week 10)
- リアルタイムチャット
- チャット履歴
- オペレーター管理

### Phase 9: 自動応答 (Week 11)
- キーワード応答
- シナリオ設定
- 条件分岐

### Phase 10: システム設定 (Week 12)
- プラン管理
- 請求設定
- スタッフ管理
- 最終テスト・デプロイ

---

## 📝 用語集（L Message固有用語）

| 用語 | 説明 |
|-----|------|
| **ステップ配信** | 友だち追加後、設定した日数・時間に自動でメッセージを配信する機能 |
| **リッチメニュー** | LINEトーク画面下部に表示されるタップ可能なメニュー |
| **セグメント** | 友だちを特定条件で絞り込むグループ（タグの組み合わせ等） |
| **クロス分析** | 複数の指標を掛け合わせてデータを分析する機能 |
| **あいさつメッセージ** | 友だち追加時に自動送信されるウェルカムメッセージ |
| **予約タイプ** | イベント予約、レッスン予約、サロン予約の3種類 |
| **アクションスケジュール** | 特定条件で自動実行されるアクション（タグ追加等） |
| **ASP管理** | 外部システム連携用のAPI管理機能（有料プラン限定） |

---

## ✅ 実装チェックリスト

### 環境構築
- [ ] Next.js 15プロジェクト作成
- [ ] Supabaseプロジェクト作成
- [ ] 環境変数設定（.env.local）
- [ ] Supabase CLI インストール
- [ ] shadcn/ui 初期化

### データベース
- [ ] 27テーブル作成SQL実行
- [ ] RLSポリシー設定
- [ ] インデックス作成
- [ ] Storage Buckets作成（5バケット）
- [ ] Edge Functions デプロイ（7関数）

### 認証
- [ ] Supabase Auth設定
- [ ] Login画面
- [ ] Signup画面
- [ ] Password Reset画面
- [ ] 認証ミドルウェア

### 友だち管理
- [ ] 友だちリスト画面
- [ ] 友だち詳細画面
- [ ] タグ管理機能
- [ ] セグメント機能
- [ ] LINE Webhook受信

### メッセージ配信
- [ ] 一斉配信画面
- [ ] ステップ配信作成画面
- [ ] メッセージテンプレート管理
- [ ] 配信履歴画面
- [ ] LINE API連携（send-line-message）

### フォーム
- [ ] フォームビルダー画面
- [ ] フォーム回答一覧
- [ ] 自動返信設定

### リッチメニュー
- [ ] リッチメニューエディタ
- [ ] 画像アップロード機能
- [ ] LINE API連携（Rich Menu API）

### 予約管理
- [ ] 予約タイプ設定画面
- [ ] カレンダービュー
- [ ] 予約受付フォーム
- [ ] リマインダー機能

### 分析
- [ ] ダッシュボード分析画面
- [ ] クロス分析画面
- [ ] URL計測機能
- [ ] CSVエクスポート

### システム設定
- [ ] プロフィール設定
- [ ] LINE連携設定
- [ ] 組織設定
- [ ] プラン・請求設定

---

## 🔗 関連ドキュメント

- **[機能完全リスト](./lme_saas_features_complete.md)** - 163機能の完全抽出と詳細分類
- **[フロントエンド要件](./frontend_requirements_nextjs15.md)** - Next.js 15アーキテクチャと31画面設計
- **[バックエンドアーキテクチャ](./supabase_architecture.md)** - Supabase完全設計（27テーブル + Edge Functions）
- **[実装TODO](./implementation_todo_v2.md)** - Claude Code実行用12フェーズ実装ガイド
- **[カテゴリページ分析](./category_pages_analysis.md)** - 50カテゴリページの分析結果
- **[記事ページ分析](./article_pages_analysis.md)** - 122記事ページの分析結果
- **[ケーススタディ分析](./case_study_pages_analysis.md)** - 12ケーススタディの分析結果

---

## 📞 実装サポート

### Claude Codeで実装開始する場合

1. **環境構築から始める**:
```bash
# 実装TODOを開く
cat /Users/kadotani/Documents/開発プロジェクト/GitHub/lme-manual-scraper/claudedocs/implementation_todo_v2.md
```

2. **フェーズ別に実装**:
- Phase 1（Week 1-2）: 環境構築・認証
- Phase 2（Week 3）: 友だち管理
- Phase 3（Week 4-5）: メッセージ配信
- ... 以降は implementation_todo_v2.md を参照

3. **各フェーズでやること**:
- [ ] TODOファイルの該当フェーズを読む
- [ ] コマンドをコピペして実行
- [ ] コードスニペットを該当ファイルに配置
- [ ] 動作確認して次のフェーズへ

### より詳細な情報が必要な場合

- **機能仕様の詳細**: `lme_saas_features_complete.md` を参照
- **画面設計の詳細**: `frontend_requirements_nextjs15.md` を参照
- **データベース設計の詳細**: `supabase_architecture.md` を参照
- **実装手順の詳細**: `implementation_todo_v2.md` を参照

---

## 📄 ライセンス

このプロジェクトはL Message SaaSの完全再現を目的としています。実装時は著作権・商標権に注意してください。

---

**Last Updated**: 2025-10-29
**Version**: 2.0
**Status**: Requirements Complete - Ready for Implementation

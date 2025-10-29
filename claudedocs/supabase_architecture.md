# L Message SaaS - Supabase完全アーキテクチャ設計

**作成日**: 2025-10-29
**対象**: L Message（エルメッセージ）SaaS バックエンド
**技術スタック**: Supabase (PostgreSQL 15+ / Realtime / Auth / Storage / Edge Functions)

---

## 目次

1. [アーキテクチャ概要](#1-アーキテクチャ概要)
2. [Supabase機能の役割分担](#2-supabase機能の役割分担)
3. [データベース設計（PostgreSQL）](#3-データベース設計postgresql)
4. [認証・権限管理（Auth）](#4-認証権限管理auth)
5. [リアルタイム更新（Realtime）](#5-リアルタイム更新realtime)
6. [ファイルストレージ（Storage）](#6-ファイルストレージstorage)
7. [サーバーレス関数（Edge Functions）](#7-サーバーレス関数edge-functions)
8. [Row Level Security（RLS）ポリシー](#8-row-level-securityrlsポリシー)
9. [データフロー図](#9-データフロー図)
10. [パフォーマンス最適化](#10-パフォーマンス最適化)

---

## 1. アーキテクチャ概要

### 1.1 システム構成

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 14)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ユーザー  │  │メッセージ│  │顧客管理  │  │予約管理  │   │
│  │管理画面  │  │送信画面  │  │画面      │  │画面      │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼─────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 15+ (Database)                           │   │
│  │  - 全データ永続化                                    │   │
│  │  - トランザクション管理                              │   │
│  │  - フルテキスト検索                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase Auth                                       │   │
│  │  - ユーザー認証（Email/Password、OAuth）            │   │
│  │  - JWT発行・検証                                     │   │
│  │  - マルチテナント権限管理                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase Realtime                                   │   │
│  │  - WebSocketベースのリアルタイム更新                 │   │
│  │  - メッセージ送信状態のライブ監視                    │   │
│  │  - 予約状況のリアルタイム同期                        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase Storage                                    │   │
│  │  - リッチメニュー画像                                │   │
│  │  - アップロード画像                                  │   │
│  │  - プロフィール画像                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Edge Functions (Deno Runtime)                       │   │
│  │  - LINE API連携                                      │   │
│  │  - メッセージ送信処理                                │   │
│  │  - 予約通知バッチ                                    │   │
│  │  - データ分析集計                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  LINE API        │
                    │  - Messaging API │
                    │  - LIFF API      │
                    └──────────────────┘
```

### 1.2 マルチテナント設計方針

- **organization_id**: すべてのデータテーブルに含む
- **RLS**: 組織単位でのデータ分離を保証
- **Auth**: `auth.users`の`raw_user_meta_data.organization_id`で管理

---

## 2. Supabase機能の役割分担

### 2.1 PostgreSQL Database

**担当範囲**:
- 全ビジネスデータの永続化
- トランザクション処理（ACID保証）
- 複雑なクエリ実行（JOIN, Aggregation）
- フルテキスト検索（日本語対応）
- マルチテナントデータ分離（RLS）

**主要データ**:
- ユーザー・組織データ
- LINE友だち・タグ・セグメント
- メッセージ・ステップ配信・リッチメニュー
- 予約・フォーム・分析データ

### 2.2 Supabase Auth

**担当範囲**:
- ユーザー認証（Email/Password、Google OAuth）
- JWT発行・検証
- セッション管理
- パスワードリセット
- 組織単位のアクセス制御

**認証フロー**:
1. ユーザー登録 → `auth.users`にレコード作成
2. ログイン → JWTトークン発行
3. API呼び出し → JWTでRLS適用
4. 組織切替 → `user_organizations`で権限確認

### 2.3 Supabase Realtime

**担当範囲**:
- メッセージ送信状態のライブ更新
- 予約状況のリアルタイム同期
- ダッシュボードの自動更新
- 複数ユーザーの同時編集検知

**リアルタイム対象テーブル**:
- `messages` - メッセージ送信状態
- `reservations` - 予約状況
- `line_friends` - 友だち追加/ブロック
- `step_campaign_logs` - ステップ配信進捗
- `analytics_events` - リアルタイム分析

### 2.4 Supabase Storage

**担当範囲**:
- リッチメニュー画像（最大2.5MB）
- メッセージ画像・動画
- フォーム添付ファイル
- ユーザープロフィール画像
- CSV/Excelインポートファイル

**バケット構成**:
- `rich-menus/` - リッチメニュー画像
- `message-media/` - メッセージ添付ファイル
- `form-attachments/` - フォーム添付
- `avatars/` - プロフィール画像
- `imports/` - データインポートファイル

### 2.5 Edge Functions

**担当範囲**:
- LINE API連携（Messaging API, LIFF）
- メッセージ送信処理（バッチ・即時）
- 予約通知・リマインダー送信
- データ分析集計（日次・週次・月次）
- Webhook受信（LINE Webhook）

**Function一覧**:
- `send-line-message` - メッセージ送信
- `process-line-webhook` - LINE Webhook処理
- `send-reservation-reminder` - 予約リマインダー
- `aggregate-analytics` - 分析データ集計
- `export-data` - データエクスポート

---

## 3. データベース設計（PostgreSQL）

### 3.1 ER図概要

```
organizations ──┬── users
                ├── line_channels
                ├── line_friends ──┬── friend_tags
                │                  ├── form_responses
                │                  ├── reservations
                │                  └── analytics_events
                ├── messages ──── message_recipients
                ├── step_campaigns ──┬── step_campaign_steps
                │                    └── step_campaign_logs
                ├── rich_menus ──── rich_menu_areas
                ├── tags
                ├── segments ──── segment_conditions
                ├── forms ──── form_fields
                ├── schedules ──── schedule_slots
                └── url_mappings
```

### 3.2 テーブル定義

#### 3.2.1 ユーザー・組織管理

```sql
-- ========================================
-- 組織テーブル（マルチテナントの基盤）
-- ========================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL識別子（例: acme-corp）
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  settings JSONB DEFAULT '{}', -- 組織設定（タイムゾーン、言語等）
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);

-- ========================================
-- ユーザーテーブル（Supabase Authと連携）
-- ========================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'readonly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  last_login_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}', -- UIプリファレンス
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- ========================================
-- ユーザー組織関連（複数組織所属対応）
-- ========================================
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'readonly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_organization_id ON user_organizations(organization_id);
```

#### 3.2.2 LINE連携

```sql
-- ========================================
-- LINEチャネルテーブル
-- ========================================
CREATE TABLE line_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel_id TEXT NOT NULL UNIQUE,
  channel_secret TEXT NOT NULL, -- 暗号化推奨
  channel_access_token TEXT NOT NULL, -- 暗号化推奨
  webhook_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  settings JSONB DEFAULT '{}', -- webhook設定、自動応答設定等
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_line_channels_organization_id ON line_channels(organization_id);
CREATE INDEX idx_line_channels_channel_id ON line_channels(channel_id);

-- ========================================
-- LINE友だちテーブル（顧客管理の核）
-- ========================================
CREATE TABLE line_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  line_channel_id UUID NOT NULL REFERENCES line_channels(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL, -- LINE固有のユーザーID
  display_name TEXT,
  picture_url TEXT,
  status_message TEXT,
  follow_status TEXT NOT NULL DEFAULT 'following' CHECK (follow_status IN ('following', 'blocked', 'unfollowed')),
  language TEXT DEFAULT 'ja',

  -- カスタムフィールド
  custom_fields JSONB DEFAULT '{}', -- 自由に拡張可能（例: {phone: "090-1234-5678", birthday: "1990-01-01"}）

  -- 行動データ
  first_followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_followed_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ,
  total_messages_sent INTEGER DEFAULT 0,
  total_messages_received INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(line_channel_id, line_user_id)
);

CREATE INDEX idx_line_friends_organization_id ON line_friends(organization_id);
CREATE INDEX idx_line_friends_line_channel_id ON line_friends(line_channel_id);
CREATE INDEX idx_line_friends_line_user_id ON line_friends(line_user_id);
CREATE INDEX idx_line_friends_follow_status ON line_friends(follow_status);
CREATE INDEX idx_line_friends_last_interaction_at ON line_friends(last_interaction_at);

-- GINインデックス（JSONB検索高速化）
CREATE INDEX idx_line_friends_custom_fields ON line_friends USING GIN(custom_fields);
```

#### 3.2.3 タグ・セグメント管理

```sql
-- ========================================
-- タグテーブル（友だち分類）
-- ========================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6', -- Hex color
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_tags_organization_id ON tags(organization_id);

-- ========================================
-- 友だち-タグ中間テーブル
-- ========================================
CREATE TABLE friend_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_friend_id UUID NOT NULL REFERENCES line_friends(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(line_friend_id, tag_id)
);

CREATE INDEX idx_friend_tags_line_friend_id ON friend_tags(line_friend_id);
CREATE INDEX idx_friend_tags_tag_id ON friend_tags(tag_id);

-- ========================================
-- セグメントテーブル（動的な友だちグループ）
-- ========================================
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'dynamic' CHECK (type IN ('dynamic', 'static')),
  estimated_count INTEGER DEFAULT 0, -- キャッシュ用
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_segments_organization_id ON segments(organization_id);

-- ========================================
-- セグメント条件テーブル（AND/OR条件）
-- ========================================
CREATE TABLE segment_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  field TEXT NOT NULL, -- 例: "custom_fields.age", "follow_status", "tags"
  operator TEXT NOT NULL CHECK (operator IN ('eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'in', 'contains', 'exists')),
  value JSONB NOT NULL, -- 比較値
  logic_operator TEXT NOT NULL DEFAULT 'AND' CHECK (logic_operator IN ('AND', 'OR')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_segment_conditions_segment_id ON segment_conditions(segment_id);

-- 例: 30歳以上の「VIP」タグを持つ友だち
-- Condition 1: field="custom_fields.age", operator="gte", value=30
-- Condition 2: field="tags", operator="contains", value="VIP", logic_operator="AND"
```

#### 3.2.4 メッセージ管理

```sql
-- ========================================
-- メッセージテーブル（送信履歴）
-- ========================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  line_channel_id UUID NOT NULL REFERENCES line_channels(id) ON DELETE CASCADE,

  -- メッセージ基本情報
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'audio', 'flex', 'template')),
  content JSONB NOT NULL, -- LINE Message objectのJSON

  -- 送信設定
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'segment', 'tags', 'manual')),
  target_ids UUID[], -- segment_ids or tag_ids
  scheduled_at TIMESTAMPTZ, -- NULL = 即時送信

  -- 送信状態
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled')),

  -- 統計
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,

  -- メタデータ
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_organization_id ON messages(organization_id);
CREATE INDEX idx_messages_line_channel_id ON messages(line_channel_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_scheduled_at ON messages(scheduled_at);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ========================================
-- メッセージ受信者テーブル（個別送信ステータス）
-- ========================================
CREATE TABLE message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  line_friend_id UUID NOT NULL REFERENCES line_friends(id) ON DELETE CASCADE,

  -- 送信状態
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  error_message TEXT,

  -- 行動トラッキング
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(message_id, line_friend_id)
);

CREATE INDEX idx_message_recipients_message_id ON message_recipients(message_id);
CREATE INDEX idx_message_recipients_line_friend_id ON message_recipients(line_friend_id);
CREATE INDEX idx_message_recipients_status ON message_recipients(status);
```

#### 3.2.5 ステップ配信（シナリオ）

```sql
-- ========================================
-- ステップ配信キャンペーンテーブル
-- ========================================
CREATE TABLE step_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  line_channel_id UUID NOT NULL REFERENCES line_channels(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- トリガー設定
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('friend_add', 'tag_add', 'form_submit', 'manual')),
  trigger_config JSONB DEFAULT '{}', -- トリガー固有設定

  -- ステータス
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),

  -- 統計
  total_subscribers INTEGER DEFAULT 0,
  active_subscribers INTEGER DEFAULT 0,
  completed_subscribers INTEGER DEFAULT 0,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_step_campaigns_organization_id ON step_campaigns(organization_id);
CREATE INDEX idx_step_campaigns_status ON step_campaigns(status);

-- ========================================
-- ステップ配信ステップテーブル
-- ========================================
CREATE TABLE step_campaign_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_campaign_id UUID NOT NULL REFERENCES step_campaigns(id) ON DELETE CASCADE,

  step_number INTEGER NOT NULL, -- ステップ順序（1, 2, 3...）
  name TEXT NOT NULL,

  -- 送信タイミング
  delay_value INTEGER NOT NULL, -- 遅延時間の値
  delay_unit TEXT NOT NULL CHECK (delay_unit IN ('minutes', 'hours', 'days')), -- 遅延時間の単位

  -- メッセージ内容
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'flex', 'template')),
  message_content JSONB NOT NULL,

  -- 分岐条件（オプション）
  condition JSONB, -- 例: {"type": "tag_exists", "tag_id": "xxx"}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(step_campaign_id, step_number)
);

CREATE INDEX idx_step_campaign_steps_campaign_id ON step_campaign_steps(step_campaign_id);
CREATE INDEX idx_step_campaign_steps_step_number ON step_campaign_steps(step_campaign_id, step_number);

-- ========================================
-- ステップ配信ログテーブル（個別進捗管理）
-- ========================================
CREATE TABLE step_campaign_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_campaign_id UUID NOT NULL REFERENCES step_campaigns(id) ON DELETE CASCADE,
  line_friend_id UUID NOT NULL REFERENCES line_friends(id) ON DELETE CASCADE,

  current_step_number INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),

  started_at TIMESTAMPTZ DEFAULT NOW(),
  next_send_at TIMESTAMPTZ, -- 次回送信予定日時
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(step_campaign_id, line_friend_id)
);

CREATE INDEX idx_step_campaign_logs_campaign_id ON step_campaign_logs(step_campaign_id);
CREATE INDEX idx_step_campaign_logs_line_friend_id ON step_campaign_logs(line_friend_id);
CREATE INDEX idx_step_campaign_logs_next_send_at ON step_campaign_logs(next_send_at) WHERE status = 'active';
CREATE INDEX idx_step_campaign_logs_status ON step_campaign_logs(status);
```

#### 3.2.6 リッチメニュー

```sql
-- ========================================
-- リッチメニューテーブル
-- ========================================
CREATE TABLE rich_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  line_channel_id UUID NOT NULL REFERENCES line_channels(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  line_rich_menu_id TEXT, -- LINE APIから返されるID

  -- デザイン設定
  chat_bar_text TEXT NOT NULL, -- チャットバーテキスト（14文字以内）
  image_url TEXT NOT NULL, -- Storage内の画像URL
  size_width INTEGER NOT NULL DEFAULT 2500, -- 通常2500px
  size_height INTEGER NOT NULL CHECK (size_height IN (1686, 843)), -- Full: 1686, Half: 843

  -- 表示設定
  is_default BOOLEAN DEFAULT FALSE, -- デフォルトメニューかどうか
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rich_menus_organization_id ON rich_menus(organization_id);
CREATE INDEX idx_rich_menus_line_channel_id ON rich_menus(line_channel_id);
CREATE INDEX idx_rich_menus_status ON rich_menus(status);

-- ========================================
-- リッチメニューエリアテーブル（タップ領域）
-- ========================================
CREATE TABLE rich_menu_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rich_menu_id UUID NOT NULL REFERENCES rich_menus(id) ON DELETE CASCADE,

  -- エリア座標（左上を起点）
  bounds_x INTEGER NOT NULL,
  bounds_y INTEGER NOT NULL,
  bounds_width INTEGER NOT NULL,
  bounds_height INTEGER NOT NULL,

  -- アクション設定
  action_type TEXT NOT NULL CHECK (action_type IN ('uri', 'message', 'postback')),
  action_data JSONB NOT NULL, -- 例: {"uri": "https://..."} or {"text": "メニュー1"}

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rich_menu_areas_rich_menu_id ON rich_menu_areas(rich_menu_id);
```

#### 3.2.7 フォーム管理

```sql
-- ========================================
-- フォームテーブル
-- ========================================
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  -- 設定
  settings JSONB DEFAULT '{}', -- 例: {"require_login": true, "allow_multiple": false}

  -- ステータス
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),

  -- 統計
  total_responses INTEGER DEFAULT 0,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forms_organization_id ON forms(organization_id);
CREATE INDEX idx_forms_status ON forms(status);

-- ========================================
-- フォームフィールドテーブル
-- ========================================
CREATE TABLE form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,

  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'tel', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'time', 'file')),
  label TEXT NOT NULL,
  placeholder TEXT,

  -- バリデーション
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB DEFAULT '{}', -- 例: {"min": 1, "max": 100, "pattern": "^[0-9]+$"}

  -- 選択肢（select, radio, checkbox用）
  options JSONB, -- 例: ["選択肢1", "選択肢2", "選択肢3"]

  -- 表示順序
  display_order INTEGER NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_display_order ON form_fields(form_id, display_order);

-- ========================================
-- フォーム回答テーブル
-- ========================================
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  line_friend_id UUID REFERENCES line_friends(id) ON DELETE SET NULL, -- 回答者（匿名可）

  -- 回答データ
  responses JSONB NOT NULL, -- 例: {"field_id_1": "回答1", "field_id_2": "回答2"}

  -- メタデータ
  ip_address INET,
  user_agent TEXT,

  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_line_friend_id ON form_responses(line_friend_id);
CREATE INDEX idx_form_responses_submitted_at ON form_responses(submitted_at DESC);
```

#### 3.2.8 予約管理

```sql
-- ========================================
-- スケジュールテーブル（予約枠設定）
-- ========================================
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- スケジュール設定
  duration_minutes INTEGER NOT NULL, -- 1予約あたりの時間（分）
  buffer_minutes INTEGER DEFAULT 0, -- 予約間のバッファ時間
  max_bookings_per_slot INTEGER DEFAULT 1, -- 同時予約可能数

  -- 公開設定
  is_public BOOLEAN DEFAULT TRUE,
  booking_url TEXT, -- 公開予約URL

  -- ステータス
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedules_organization_id ON schedules(organization_id);
CREATE INDEX idx_schedules_status ON schedules(status);

-- ========================================
-- 予約枠テーブル（個別時間枠）
-- ========================================
CREATE TABLE schedule_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,

  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  capacity INTEGER DEFAULT 1, -- この枠の定員
  booked_count INTEGER DEFAULT 0, -- 現在の予約数

  -- ステータス
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'blocked')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_schedule_slots_schedule_id ON schedule_slots(schedule_id);
CREATE INDEX idx_schedule_slots_start_time ON schedule_slots(start_time);
CREATE INDEX idx_schedule_slots_status ON schedule_slots(status);

-- ========================================
-- 予約テーブル（実際の予約データ）
-- ========================================
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  schedule_slot_id UUID NOT NULL REFERENCES schedule_slots(id) ON DELETE CASCADE,
  line_friend_id UUID REFERENCES line_friends(id) ON DELETE SET NULL,

  -- 予約者情報
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,

  -- 予約内容
  notes TEXT,
  custom_data JSONB DEFAULT '{}', -- カスタムフィールド

  -- ステータス
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),

  -- リマインダー
  reminder_sent_at TIMESTAMPTZ,

  -- メタデータ
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservations_organization_id ON reservations(organization_id);
CREATE INDEX idx_reservations_schedule_id ON reservations(schedule_id);
CREATE INDEX idx_reservations_schedule_slot_id ON reservations(schedule_slot_id);
CREATE INDEX idx_reservations_line_friend_id ON reservations(line_friend_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_created_at ON reservations(created_at DESC);
```

#### 3.2.9 分析・トラッキング

```sql
-- ========================================
-- 分析イベントテーブル（行動トラッキング）
-- ========================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  line_friend_id UUID REFERENCES line_friends(id) ON DELETE SET NULL,

  -- イベント情報
  event_type TEXT NOT NULL, -- 例: "message_sent", "link_clicked", "form_submitted", "reservation_created"
  event_data JSONB DEFAULT '{}', -- イベント固有データ

  -- セッション情報
  session_id TEXT,

  -- メタデータ
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- パーティショニング（月単位で分割推奨）
CREATE INDEX idx_analytics_events_organization_id ON analytics_events(organization_id);
CREATE INDEX idx_analytics_events_line_friend_id ON analytics_events(line_friend_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_data ON analytics_events USING GIN(event_data);

-- ========================================
-- URLクリック追跡テーブル
-- ========================================
CREATE TABLE url_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  short_code TEXT NOT NULL UNIQUE, -- 短縮URL識別子（例: "abc123"）
  original_url TEXT NOT NULL,

  -- 関連エンティティ
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,

  -- 統計
  click_count INTEGER DEFAULT 0,
  unique_click_count INTEGER DEFAULT 0,

  -- 有効期限
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_url_mappings_organization_id ON url_mappings(organization_id);
CREATE INDEX idx_url_mappings_short_code ON url_mappings(short_code);
CREATE INDEX idx_url_mappings_message_id ON url_mappings(message_id);

-- ========================================
-- URLクリックログテーブル
-- ========================================
CREATE TABLE url_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_mapping_id UUID NOT NULL REFERENCES url_mappings(id) ON DELETE CASCADE,
  line_friend_id UUID REFERENCES line_friends(id) ON DELETE SET NULL,

  -- クリック情報
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_url_clicks_url_mapping_id ON url_clicks(url_mapping_id);
CREATE INDEX idx_url_clicks_line_friend_id ON url_clicks(line_friend_id);
CREATE INDEX idx_url_clicks_clicked_at ON url_clicks(clicked_at DESC);
```

#### 3.2.10 システムテーブル

```sql
-- ========================================
-- 監査ログテーブル（管理操作記録）
-- ========================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- 操作情報
  action TEXT NOT NULL, -- 例: "user.created", "message.sent", "settings.updated"
  resource_type TEXT NOT NULL, -- 例: "user", "message", "organization"
  resource_id UUID,

  -- 変更内容
  changes JSONB, -- 例: {"before": {...}, "after": {...}}

  -- メタデータ
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ========================================
-- Webhook配信ログテーブル（LINE Webhook受信記録）
-- ========================================
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_channel_id UUID REFERENCES line_channels(id) ON DELETE SET NULL,

  -- Webhook内容
  event_type TEXT NOT NULL, -- 例: "message", "follow", "unfollow", "postback"
  payload JSONB NOT NULL,

  -- 処理状態
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  error_message TEXT,

  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_line_channel_id ON webhook_logs(line_channel_id);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
```

---

## 4. 認証・権限管理（Auth）

### 4.1 認証フロー

```sql
-- ========================================
-- トリガー: auth.usersにユーザー作成時、usersテーブルにも追加
-- ========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, organization_id, email, display_name, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'organization_id')::UUID,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4.2 ロール定義

| Role | 権限 | 説明 |
|------|------|------|
| `owner` | すべての操作 | 組織オーナー（課金管理、削除権限） |
| `admin` | 管理操作（ユーザー管理以外） | 管理者（設定変更、メッセージ送信） |
| `member` | 基本操作 | 一般メンバー（閲覧、メッセージ作成） |
| `readonly` | 閲覧のみ | 読み取り専用ユーザー |

### 4.3 JWT Claimsカスタマイズ

```sql
-- ========================================
-- JWTにorganization_idとroleを追加
-- ========================================
CREATE OR REPLACE FUNCTION custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  user_role TEXT;
  org_id UUID;
BEGIN
  -- ユーザー情報取得
  SELECT role, organization_id INTO user_role, org_id
  FROM public.users
  WHERE id = (event->>'user_id')::UUID;

  -- JWT claimsに追加
  claims := event->'claims';
  claims := jsonb_set(claims, '{organization_id}', to_jsonb(org_id));
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supabase Authフックとして登録（Dashboard UIから）
```

---

## 5. リアルタイム更新（Realtime）

### 5.1 Realtime有効化設定

```sql
-- ========================================
-- Publication設定（Realtime有効化）
-- ========================================

-- メッセージ送信状態のリアルタイム更新
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_recipients;

-- 予約状況のリアルタイム同期
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_slots;

-- 友だち追加/ブロック
ALTER PUBLICATION supabase_realtime ADD TABLE line_friends;

-- ステップ配信進捗
ALTER PUBLICATION supabase_realtime ADD TABLE step_campaign_logs;

-- 分析イベント（ダッシュボード自動更新用）
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_events;
```

### 5.2 フロントエンド購読例

```typescript
// メッセージ送信状態の監視
const messageChannel = supabase
  .channel('message-status')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages',
      filter: `organization_id=eq.${organizationId}`,
    },
    (payload) => {
      console.log('Message updated:', payload.new);
      // UIを更新
    }
  )
  .subscribe();

// 予約リアルタイム同期
const reservationChannel = supabase
  .channel('reservations')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'reservations',
      filter: `organization_id=eq.${organizationId}`,
    },
    (payload) => {
      console.log('Reservation changed:', payload);
      // カレンダーUIを更新
    }
  )
  .subscribe();
```

---

## 6. ファイルストレージ（Storage）

### 6.1 バケット構成

```sql
-- ========================================
-- Storage Buckets設定
-- ========================================

-- 1. リッチメニュー画像バケット
-- パス: rich-menus/{organization_id}/{rich_menu_id}.png
-- サイズ: 最大2.5MB
-- 形式: PNG, JPEG
-- 公開: true

-- 2. メッセージ添付ファイルバケット
-- パス: message-media/{organization_id}/{message_id}/{filename}
-- サイズ: 最大10MB
-- 形式: 画像 (PNG, JPEG), 動画 (MP4), 音声 (MP3)
-- 公開: true

-- 3. フォーム添付ファイルバケット
-- パス: form-attachments/{organization_id}/{form_id}/{response_id}/{filename}
-- サイズ: 最大5MB
-- 形式: PDF, Excel, Word, 画像
-- 公開: false（認証必須）

-- 4. プロフィール画像バケット
-- パス: avatars/{user_id}.png
-- サイズ: 最大1MB
-- 形式: PNG, JPEG
-- 公開: true

-- 5. データインポートバケット
-- パス: imports/{organization_id}/{import_id}/{filename}
-- サイズ: 最大50MB
-- 形式: CSV, Excel
-- 公開: false（認証必須）
```

### 6.2 Storage RLSポリシー

```sql
-- ========================================
-- rich-menusバケットのRLS
-- ========================================
CREATE POLICY "Users can upload rich menu images for their org"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rich-menus' AND
  (storage.foldername(name))[1] = (auth.jwt() -> 'organization_id')::TEXT
);

CREATE POLICY "Users can view rich menu images for their org"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'rich-menus' AND
  (storage.foldername(name))[1] = (auth.jwt() -> 'organization_id')::TEXT
);

CREATE POLICY "Users can delete rich menu images for their org"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'rich-menus' AND
  (storage.foldername(name))[1] = (auth.jwt() -> 'organization_id')::TEXT
);

-- ========================================
-- message-mediaバケットのRLS
-- ========================================
CREATE POLICY "Users can upload message media for their org"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-media' AND
  (storage.foldername(name))[1] = (auth.jwt() -> 'organization_id')::TEXT
);

CREATE POLICY "Users can view message media for their org"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-media' AND
  (storage.foldername(name))[1] = (auth.jwt() -> 'organization_id')::TEXT
);

-- ========================================
-- avatarsバケットのRLS（自分のプロフィール画像のみ）
-- ========================================
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  name = auth.uid()::TEXT || '.png'
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');
```

---

## 7. サーバーレス関数（Edge Functions）

### 7.1 Edge Functions一覧

| Function名 | トリガー | 処理内容 | 実行頻度 |
|-----------|---------|---------|---------|
| `send-line-message` | HTTP POST | LINE Messaging APIでメッセージ送信 | On-demand |
| `process-line-webhook` | Webhook | LINE Webhookイベントを処理 | Real-time |
| `send-reservation-reminder` | Cron (1時間ごと) | 予約リマインダー送信 | Hourly |
| `aggregate-analytics` | Cron (日次 0:00) | 分析データの日次集計 | Daily |
| `export-data` | HTTP POST | CSV/Excelデータエクスポート | On-demand |
| `process-step-campaigns` | Cron (10分ごと) | ステップ配信の次ステップ送信 | Every 10min |
| `cleanup-expired-urls` | Cron (日次 2:00) | 期限切れURL短縮リンク削除 | Daily |

### 7.2 Edge Function実装例

#### 7.2.1 `send-line-message`

```typescript
// supabase/functions/send-line-message/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';

serve(async (req) => {
  try {
    const { messageId } = await req.json();

    // Supabase Clientの初期化
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // メッセージデータ取得
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .select(`
        *,
        line_channels(channel_access_token),
        message_recipients(line_friend_id, line_friends(line_user_id))
      `)
      .eq('id', messageId)
      .single();

    if (msgError) throw msgError;

    // ステータスを「送信中」に更新
    await supabase
      .from('messages')
      .update({ status: 'sending' })
      .eq('id', messageId);

    // 各友だちにメッセージ送信
    const accessToken = message.line_channels.channel_access_token;
    let sentCount = 0;
    let errorCount = 0;

    for (const recipient of message.message_recipients) {
      try {
        const response = await fetch(`${LINE_MESSAGING_API}/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            to: recipient.line_friends.line_user_id,
            messages: [message.content],
          }),
        });

        if (response.ok) {
          sentCount++;
          await supabase
            .from('message_recipients')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', recipient.id);
        } else {
          errorCount++;
          const error = await response.json();
          await supabase
            .from('message_recipients')
            .update({
              status: 'failed',
              error_message: error.message
            })
            .eq('id', recipient.id);
        }
      } catch (error) {
        errorCount++;
        await supabase
          .from('message_recipients')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', recipient.id);
      }
    }

    // メッセージステータスを「完了」に更新
    await supabase
      .from('messages')
      .update({
        status: 'completed',
        sent_count: sentCount,
        error_count: errorCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', messageId);

    return new Response(
      JSON.stringify({ success: true, sentCount, errorCount }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

#### 7.2.2 `process-line-webhook`

```typescript
// supabase/functions/process-line-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

serve(async (req) => {
  try {
    const signature = req.headers.get('x-line-signature');
    const body = await req.text();

    // Supabase Clientの初期化
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Webhook署名検証
    const events = JSON.parse(body).events;

    for (const event of events) {
      // Webhook Logに記録
      const { data: webhookLog } = await supabase
        .from('webhook_logs')
        .insert({
          event_type: event.type,
          payload: event,
          status: 'pending'
        })
        .select()
        .single();

      try {
        // イベント種類によって処理を分岐
        switch (event.type) {
          case 'follow':
            await handleFollow(supabase, event);
            break;
          case 'unfollow':
            await handleUnfollow(supabase, event);
            break;
          case 'message':
            await handleMessage(supabase, event);
            break;
          case 'postback':
            await handlePostback(supabase, event);
            break;
        }

        // 処理成功
        await supabase
          .from('webhook_logs')
          .update({
            status: 'processed',
            processed_at: new Date().toISOString()
          })
          .eq('id', webhookLog.id);

      } catch (error) {
        // 処理失敗
        await supabase
          .from('webhook_logs')
          .update({
            status: 'failed',
            error_message: error.message,
            processed_at: new Date().toISOString()
          })
          .eq('id', webhookLog.id);
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
});

// フォローイベント処理
async function handleFollow(supabase: any, event: any) {
  const { data: channel } = await supabase
    .from('line_channels')
    .select('*')
    .eq('channel_id', event.source.userId)
    .single();

  // 友だち追加
  await supabase
    .from('line_friends')
    .upsert({
      line_channel_id: channel.id,
      organization_id: channel.organization_id,
      line_user_id: event.source.userId,
      follow_status: 'following',
      first_followed_at: new Date().toISOString(),
      last_followed_at: new Date().toISOString()
    }, { onConflict: 'line_channel_id,line_user_id' });
}

// アンフォローイベント処理
async function handleUnfollow(supabase: any, event: any) {
  await supabase
    .from('line_friends')
    .update({
      follow_status: 'unfollowed'
    })
    .eq('line_user_id', event.source.userId);
}

// メッセージイベント処理
async function handleMessage(supabase: any, event: any) {
  // line_friendsのlast_interaction_atを更新
  await supabase
    .from('line_friends')
    .update({
      last_interaction_at: new Date().toISOString(),
      total_messages_received: supabase.rpc('increment_message_count')
    })
    .eq('line_user_id', event.source.userId);

  // analytics_eventsに記録
  await supabase
    .from('analytics_events')
    .insert({
      event_type: 'message_received',
      event_data: {
        message_type: event.message.type,
        message_id: event.message.id
      }
    });
}

// Postbackイベント処理（リッチメニュー、ボタン等）
async function handlePostback(supabase: any, event: any) {
  // Postbackデータを解析して適切な処理を実行
  const data = new URLSearchParams(event.postback.data);
  const action = data.get('action');

  // 例: 予約キャンセル
  if (action === 'cancel_reservation') {
    const reservationId = data.get('reservation_id');
    await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', reservationId);
  }
}
```

#### 7.2.3 `send-reservation-reminder`

```typescript
// supabase/functions/send-reservation-reminder/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // 24時間後の予約を取得（リマインダー未送信）
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        *,
        line_friends(line_user_id),
        schedule_slots(start_time),
        line_channels(channel_access_token)
      `)
      .eq('status', 'confirmed')
      .is('reminder_sent_at', null)
      .lte('schedule_slots.start_time', tomorrow.toISOString())
      .gte('schedule_slots.start_time', new Date().toISOString());

    if (error) throw error;

    let sentCount = 0;

    // 各予約にリマインダーメッセージ送信
    for (const reservation of reservations) {
      const message = {
        type: 'text',
        text: `【予約リマインダー】\n\nお客様名: ${reservation.customer_name}\n予約日時: ${new Date(reservation.schedule_slots.start_time).toLocaleString('ja-JP')}\n\nご来店をお待ちしております。`
      };

      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${reservation.line_channels.channel_access_token}`,
        },
        body: JSON.stringify({
          to: reservation.line_friends.line_user_id,
          messages: [message],
        }),
      });

      if (response.ok) {
        await supabase
          .from('reservations')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', reservation.id);
        sentCount++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, sentCount }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

#### 7.2.4 `process-step-campaigns`

```typescript
// supabase/functions/process-step-campaigns/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // 送信予定時刻を過ぎたステップ配信ログを取得
    const { data: logs, error } = await supabase
      .from('step_campaign_logs')
      .select(`
        *,
        step_campaigns(
          id,
          line_channel_id,
          line_channels(channel_access_token)
        ),
        line_friends(line_user_id)
      `)
      .eq('status', 'active')
      .lte('next_send_at', new Date().toISOString());

    if (error) throw error;

    let processedCount = 0;

    for (const log of logs) {
      // 次のステップを取得
      const nextStepNumber = log.current_step_number + 1;

      const { data: nextStep } = await supabase
        .from('step_campaign_steps')
        .select('*')
        .eq('step_campaign_id', log.step_campaign_id)
        .eq('step_number', nextStepNumber)
        .single();

      if (!nextStep) {
        // 最終ステップ完了
        await supabase
          .from('step_campaign_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', log.id);
        continue;
      }

      // メッセージ送信
      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${log.step_campaigns.line_channels.channel_access_token}`,
        },
        body: JSON.stringify({
          to: log.line_friends.line_user_id,
          messages: [nextStep.message_content],
        }),
      });

      if (response.ok) {
        // 次回送信予定日時を計算
        const nextSendAt = new Date();
        if (nextStep.delay_unit === 'minutes') {
          nextSendAt.setMinutes(nextSendAt.getMinutes() + nextStep.delay_value);
        } else if (nextStep.delay_unit === 'hours') {
          nextSendAt.setHours(nextSendAt.getHours() + nextStep.delay_value);
        } else if (nextStep.delay_unit === 'days') {
          nextSendAt.setDate(nextSendAt.getDate() + nextStep.delay_value);
        }

        // ログ更新
        await supabase
          .from('step_campaign_logs')
          .update({
            current_step_number: nextStepNumber,
            next_send_at: nextSendAt.toISOString()
          })
          .eq('id', log.id);

        processedCount++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, processedCount }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

### 7.3 Cron設定（Supabase Dashboard）

```yaml
# supabase/functions/cron.yaml
functions:
  - name: send-reservation-reminder
    schedule: "0 * * * *" # 毎時0分

  - name: process-step-campaigns
    schedule: "*/10 * * * *" # 10分ごと

  - name: aggregate-analytics
    schedule: "0 0 * * *" # 毎日0:00

  - name: cleanup-expired-urls
    schedule: "0 2 * * *" # 毎日2:00
```

---

## 8. Row Level Security（RLS）ポリシー

### 8.1 基本ポリシー（全テーブル共通）

```sql
-- ========================================
-- マルチテナント基本ポリシー
-- ========================================

-- 組織テーブル: 自分の組織のみ参照可能
CREATE POLICY "Users can view their own organization"
ON organizations FOR SELECT
TO authenticated
USING (
  id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Owners can update their organization"
ON organizations FOR UPDATE
TO authenticated
USING (
  id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'owner'
  )
);

-- ========================================
-- ユーザーテーブル: 同じ組織のユーザーのみ参照可能
-- ========================================
CREATE POLICY "Users can view users in their organization"
ON users FOR SELECT
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Admins can insert users in their organization"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Admins can update users in their organization"
ON users FOR UPDATE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- ========================================
-- LINE友だちテーブル: 組織単位でアクセス制御
-- ========================================
CREATE POLICY "Users can view friends in their organization"
ON line_friends FOR SELECT
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Members can insert friends in their organization"
ON line_friends FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Members can update friends in their organization"
ON line_friends FOR UPDATE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Admins can delete friends in their organization"
ON line_friends FOR DELETE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);

-- ========================================
-- メッセージテーブル: 組織単位でアクセス制御
-- ========================================
CREATE POLICY "Users can view messages in their organization"
ON messages FOR SELECT
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Members can create messages in their organization"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Members can update their own messages"
ON messages FOR UPDATE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  created_by = auth.uid()
);

CREATE POLICY "Admins can delete messages in their organization"
ON messages FOR DELETE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);

-- ========================================
-- 予約テーブル: 組織単位でアクセス制御
-- ========================================
CREATE POLICY "Users can view reservations in their organization"
ON reservations FOR SELECT
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Members can create reservations in their organization"
ON reservations FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

CREATE POLICY "Members can update reservations in their organization"
ON reservations FOR UPDATE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- ========================================
-- 読み取り専用ユーザーの制限
-- ========================================
CREATE POLICY "Readonly users cannot insert"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role != 'readonly'
  )
);

CREATE POLICY "Readonly users cannot update"
ON messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role != 'readonly'
  )
);

CREATE POLICY "Readonly users cannot delete"
ON messages FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role != 'readonly'
  )
);
```

### 8.2 全テーブルのRLS有効化

```sql
-- ========================================
-- 全テーブルのRLS有効化
-- ========================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_campaign_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rich_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE rich_menu_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
```

---

## 9. データフロー図

### 9.1 メッセージ送信フロー

```
┌─────────────────────────────────────────────────────────────────┐
│  1. メッセージ作成（Frontend）                                  │
│     - 管理画面でメッセージ作成                                  │
│     - ターゲット選択（全体/セグメント/タグ/手動）              │
│     - 送信予約設定（即時 or スケジュール）                     │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. メッセージ保存（PostgreSQL）                               │
│     INSERT INTO messages (type, content, target_type, ...)      │
│     - status: 'draft' or 'scheduled'                            │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. ターゲット解決（PostgreSQL）                               │
│     - セグメント条件評価                                        │
│     - タグフィルタリング                                        │
│     - 友だちリスト取得                                          │
│     INSERT INTO message_recipients (message_id, line_friend_id) │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. メッセージ送信（Edge Function: send-line-message）         │
│     - LINE Messaging API呼び出し                                │
│     - 各友だちに個別送信                                        │
│     - 送信結果をmessage_recipientsに記録                       │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. リアルタイム更新（Realtime）                               │
│     - messagesテーブルのUPDATE検知                             │
│     - Frontend UIを自動更新                                     │
│     - ダッシュボードの統計更新                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 LINE Webhook処理フロー

```
┌─────────────────────────────────────────────────────────────────┐
│  LINE Platform                                                   │
│  - ユーザーがLINEでアクション（フォロー/メッセージ送信等）     │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Edge Function: process-line-webhook                            │
│  - Webhook受信                                                  │
│  - 署名検証                                                      │
│  - webhook_logsに記録                                           │
└────────────────────────────┬────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  follow  │  │ unfollow │  │ message  │
        └─────┬────┘  └─────┬────┘  └─────┬────┘
              │             │             │
              ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL更新                                                  │
│  - line_friends UPSERT                                          │
│  - analytics_events INSERT                                      │
│  - 関連テーブル更新                                             │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Realtime通知                                                    │
│  - line_friendsテーブル変更をSubscribe                         │
│  - Frontend UIリアルタイム更新                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 ステップ配信フロー

```
┌─────────────────────────────────────────────────────────────────┐
│  1. ステップ配信作成（Frontend）                               │
│     - キャンペーン設定                                          │
│     - トリガー設定（友だち追加/タグ追加等）                     │
│     - ステップ定義（各ステップのメッセージ・遅延時間）         │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. データベース保存（PostgreSQL）                             │
│     INSERT INTO step_campaigns (...)                            │
│     INSERT INTO step_campaign_steps (step_number, delay_value...) │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. トリガー発火（例: 友だち追加）                             │
│     - LINE Webhookで友だち追加検知                              │
│     - step_campaign_logsに登録                                  │
│     - next_send_at = NOW() + first_step_delay                   │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. 定期実行（Edge Function: process-step-campaigns）          │
│     - Cron: 10分ごと                                            │
│     - next_send_at <= NOW() のログを取得                        │
│     - 次のステップ送信                                          │
│     - current_step_number++                                     │
│     - next_send_at更新                                          │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. リアルタイム進捗表示（Realtime）                           │
│     - step_campaign_logsテーブル変更をSubscribe                │
│     - ダッシュボードで進捗状況を可視化                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. パフォーマンス最適化

### 10.1 インデックス戦略

```sql
-- ========================================
-- 複合インデックス（頻繁なクエリパターン）
-- ========================================

-- メッセージ送信履歴の組織別・日付降順
CREATE INDEX idx_messages_org_created ON messages(organization_id, created_at DESC);

-- 友だちの組織別・フォロー状態・最終インタラクション
CREATE INDEX idx_friends_org_status_interaction ON line_friends(
  organization_id,
  follow_status,
  last_interaction_at DESC
);

-- 予約の組織別・ステータス・作成日
CREATE INDEX idx_reservations_org_status_created ON reservations(
  organization_id,
  status,
  created_at DESC
);

-- ステップ配信ログの次回送信予定日時（Cron用）
CREATE INDEX idx_step_logs_next_send ON step_campaign_logs(next_send_at)
WHERE status = 'active';

-- 分析イベントの組織別・イベント種類・日付
CREATE INDEX idx_analytics_org_type_created ON analytics_events(
  organization_id,
  event_type,
  created_at DESC
);
```

### 10.2 パーティショニング（大規模データ対応）

```sql
-- ========================================
-- analytics_eventsテーブルの月次パーティショニング
-- ========================================
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 2025年1月パーティション
CREATE TABLE analytics_events_2025_01 PARTITION OF analytics_events
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- 2025年2月パーティション
CREATE TABLE analytics_events_2025_02 PARTITION OF analytics_events
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- 自動パーティション作成（PostgreSQL 14+）
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
  partition_date DATE;
  partition_name TEXT;
  start_date TEXT;
  end_date TEXT;
BEGIN
  partition_date := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  partition_name := 'analytics_events_' || TO_CHAR(partition_date, 'YYYY_MM');
  start_date := partition_date::TEXT;
  end_date := (partition_date + INTERVAL '1 month')::TEXT;

  EXECUTE FORMAT(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF analytics_events FOR VALUES FROM (%L) TO (%L)',
    partition_name, start_date, end_date
  );
END;
$$ LANGUAGE plpgsql;

-- 毎月1日に自動実行（Supabase Cron）
```

### 10.3 マテリアライズドビュー（集計高速化）

```sql
-- ========================================
-- ダッシュボード用の集計マテリアライズドビュー
-- ========================================
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT
  m.organization_id,
  COUNT(DISTINCT m.id) AS total_messages,
  SUM(m.sent_count) AS total_sent,
  COUNT(DISTINCT lf.id) AS total_friends,
  COUNT(DISTINCT lf.id) FILTER (WHERE lf.follow_status = 'following') AS active_friends,
  COUNT(DISTINCT r.id) AS total_reservations,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'confirmed') AS confirmed_reservations
FROM organizations o
LEFT JOIN messages m ON m.organization_id = o.id
LEFT JOIN line_friends lf ON lf.organization_id = o.id
LEFT JOIN reservations r ON r.organization_id = o.id
GROUP BY m.organization_id;

CREATE UNIQUE INDEX idx_dashboard_stats_org ON dashboard_stats(organization_id);

-- 1時間ごとにリフレッシュ（Edge Function or pg_cron）
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
```

### 10.4 Connection Pooling設定

```typescript
// Supabase Client設定（Next.js）
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-connection-pooling': 'true', // Connection Pooling有効化
      },
    },
  }
);
```

### 10.5 キャッシュ戦略

```typescript
// Next.js App Routerのキャッシュ設定
// app/api/friends/route.ts
export const revalidate = 60; // 60秒キャッシュ

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: friends, error } = await supabase
    .from('line_friends')
    .select('*')
    .eq('organization_id', organizationId);

  return Response.json(friends, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
```

---

## まとめ

### Supabase機能の役割分担

| Supabase機能 | 担当範囲 | 主要用途 |
|-------------|---------|---------|
| **PostgreSQL** | 全データ永続化 | ユーザー・友だち・メッセージ・予約等すべてのビジネスデータ |
| **Auth** | 認証・権限管理 | ユーザー登録/ログイン、JWT発行、マルチテナント権限制御 |
| **Realtime** | リアルタイム更新 | メッセージ送信状態、予約状況、ダッシュボード自動更新 |
| **Storage** | ファイル保存 | リッチメニュー画像、メッセージ添付、フォーム添付 |
| **Edge Functions** | サーバーレス処理 | LINE API連携、メッセージ送信、予約リマインダー、分析集計 |

### データベース設計のポイント

1. **マルチテナント対応**: すべてのテーブルに`organization_id`を含め、RLSで完全分離
2. **リアルタイム対応**: 頻繁に更新されるテーブル（messages, reservations等）をRealtime有効化
3. **拡張性**: JSONBカラムで柔軟にカスタムフィールド追加可能
4. **パフォーマンス**: 適切なインデックス・パーティショニング・マテリアライズドビューで最適化

### セキュリティ

- **RLS**: 全テーブルでRow Level Securityを有効化、組織単位で完全分離
- **JWT**: カスタムClaimsで組織IDとロールを埋め込み、API呼び出しごとに検証
- **Storage**: バケットごとにRLSポリシー設定、組織単位でアクセス制御

### 運用

- **Edge Functions**: Cronで定期実行（予約リマインダー、ステップ配信、分析集計）
- **監視**: audit_logs, webhook_logsで全操作を記録
- **スケーラビリティ**: Connection Pooling、パーティショニング、マテリアライズドビューで大規模対応

---

**次のステップ**:
1. Supabase ProjectをDashboardで作成
2. 上記SQLを実行してテーブル・RLS・インデックスを構築
3. Edge Functionsをデプロイ
4. Next.js Frontend開発開始

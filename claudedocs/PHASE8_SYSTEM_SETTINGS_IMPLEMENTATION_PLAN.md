# Phase 8: システム設定 - 実装計画書

**作成日**: 2025-10-30
**対象フェーズ**: Phase 8 (Week 12)
**技術スタック**: Next.js 16 + React 19 + Supabase + shadcn/ui

---

## 📊 1. 概要

### 1.1 目的
L Message SaaSの最終フェーズとして、システム全体の設定・管理機能を実装します。
組織設定、ユーザー管理、LINE連携、プラン・請求、システムユーティリティなど、
アプリケーション全体の運用に必要な管理機能を提供します。

### 1.2 主要機能（5画面）

1. **プロフィール設定** (`/dashboard/settings/profile`)
   - ユーザー情報編集
   - アバター画像アップロード
   - パスワード変更
   - メール通知設定
   - 言語・タイムゾーン設定

2. **組織設定** (`/dashboard/settings/organization`)
   - 組織情報編集
   - ブランディング設定（ロゴ、カラー）
   - スタッフ管理（招待、権限管理）
   - 組織削除

3. **LINE連携設定** (`/dashboard/settings/line`)
   - LINE公式アカウント連携
   - Webhook設定
   - チャネルアクセストークン管理
   - 連携テスト

4. **プラン・請求設定** (`/dashboard/settings/billing`)
   - 現在のプラン表示
   - プラン変更（Free/Pro/Enterprise）
   - 請求履歴
   - 支払い方法管理
   - 使用量確認

5. **システムユーティリティ** (`/dashboard/settings/system`)
   - データエクスポート（CSV/JSON）
   - データインポート
   - API キー管理
   - Webhook ログ
   - システムログ

### 1.3 技術選定理由

| カテゴリ | 技術 | 選定理由 |
|---------|------|---------|
| **ファイルアップロード** | Supabase Storage | 統合されたストレージ、RLS対応 |
| **画像処理** | Next.js Image | 自動最適化、WebP変換 |
| **支払い処理** | Stripe | 業界標準、豊富なAPI |
| **権限管理** | Supabase RLS | データベースレベルでの権限制御 |
| **メール送信** | Resend | Next.js推奨、シンプルAPI |

---

## 🗄️ 2. データベース設計

### 2.1 既存テーブルの拡張

#### 2.1.1 organizations テーブル拡張
```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS
  logo_url TEXT,
  primary_color TEXT DEFAULT '#00B900',
  secondary_color TEXT DEFAULT '#06C755',
  timezone TEXT DEFAULT 'Asia/Tokyo',
  locale TEXT DEFAULT 'ja',
  website_url TEXT,
  contact_email TEXT,
  billing_email TEXT;
```

#### 2.1.2 users テーブル拡張
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  phone_number TEXT,
  timezone TEXT DEFAULT 'Asia/Tokyo',
  locale TEXT DEFAULT 'ja',
  notification_settings JSONB DEFAULT '{
    "email": {
      "message_sent": true,
      "form_submitted": true,
      "reservation_created": true,
      "weekly_report": true
    },
    "push": {
      "message_failed": true,
      "reservation_reminder": true
    }
  }',
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  last_login_at TIMESTAMPTZ,
  last_login_ip INET;
```

### 2.2 新規テーブル

#### 2.2.1 invitations（招待管理）
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'readonly')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  invited_by UUID REFERENCES users(id),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_org ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status) WHERE status = 'pending';
```

#### 2.2.2 subscriptions（プラン・請求管理）
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'paused')),

  -- Stripe連携
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- プラン詳細
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- 使用量制限
  limits JSONB DEFAULT '{
    "friends": 1000,
    "messages_per_month": 5000,
    "staff_accounts": 3,
    "forms": 10,
    "rich_menus": 5,
    "api_calls_per_day": 1000
  }',

  -- 使用量カウンター
  usage JSONB DEFAULT '{
    "friends": 0,
    "messages_this_month": 0,
    "staff_accounts": 1,
    "forms": 0,
    "rich_menus": 0,
    "api_calls_today": 0
  }',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### 2.2.3 payment_methods（支払い方法）
```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account')),
  is_default BOOLEAN DEFAULT false,

  -- カード情報（Stripeから取得）
  card_brand TEXT, -- 'visa', 'mastercard', 'amex'
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- 銀行口座情報
  bank_name TEXT,
  bank_last4 TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_org ON payment_methods(organization_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(organization_id, is_default) WHERE is_default = true;
```

#### 2.2.4 invoices（請求履歴）
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,

  -- 請求情報
  amount_total INTEGER NOT NULL, -- 総額（円）
  amount_subtotal INTEGER NOT NULL,
  amount_tax INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'jpy',

  -- ステータス
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),

  -- 期間
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- 支払い情報
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  payment_method_id UUID REFERENCES payment_methods(id),

  -- PDFダウンロード
  invoice_pdf_url TEXT,

  -- 明細（JSONB）
  line_items JSONB DEFAULT '[]',
  /*
  line_items構造例:
  [
    {
      "description": "Pro プラン (2025年10月分)",
      "quantity": 1,
      "unit_amount": 9800,
      "amount": 9800
    }
  ]
  */

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_period ON invoices(period_start, period_end);
```

#### 2.2.5 api_keys（API キー管理）
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- キー情報
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- 'lm_' + 最初の8文字
  key_hash TEXT UNIQUE NOT NULL, -- SHA-256 ハッシュ

  -- 権限
  permissions JSONB DEFAULT '[]', -- ['read:friends', 'write:messages', 'read:analytics']

  -- 制限
  rate_limit INTEGER DEFAULT 1000, -- 1日あたりのリクエスト数
  allowed_ips TEXT[] DEFAULT '{}', -- 許可するIPアドレス

  -- ステータス
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(organization_id, is_active) WHERE is_active = true;
```

#### 2.2.6 audit_logs（監査ログ）
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- アクション情報
  action TEXT NOT NULL, -- 'user.login', 'message.sent', 'friend.deleted', 'settings.updated'
  resource_type TEXT NOT NULL, -- 'user', 'message', 'friend', 'organization'
  resource_id UUID,

  -- 詳細
  details JSONB DEFAULT '{}',
  /*
  details構造例:
  {
    "changes": {
      "before": {"status": "draft"},
      "after": {"status": "sent"}
    },
    "metadata": {
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    }
  }
  */

  -- IPアドレス
  ip_address INET,
  user_agent TEXT,

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- パーティショニング（大量ログ対応）
-- 月次パーティション推奨
```

#### 2.2.7 system_settings（システム設定）
```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,

  -- 一般設定
  settings JSONB DEFAULT '{
    "general": {
      "date_format": "yyyy/MM/dd",
      "time_format": "HH:mm",
      "week_starts_on": "sunday"
    },
    "notifications": {
      "enable_email": true,
      "enable_slack": false,
      "slack_webhook_url": null
    },
    "security": {
      "require_2fa": false,
      "password_expiry_days": 90,
      "session_timeout_minutes": 60
    },
    "api": {
      "enable_webhooks": true,
      "webhook_retry_attempts": 3,
      "webhook_timeout_seconds": 30
    },
    "data_retention": {
      "analytics_events_days": 365,
      "audit_logs_days": 90,
      "message_logs_days": 180
    }
  }',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_settings_org ON system_settings(organization_id);
```

### 2.3 RLS（Row Level Security）ポリシー

```sql
-- invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations in their organization"
ON invitations FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage invitations"
ON invitations FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subscription in their organization"
ON subscriptions FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Owners can manage subscription"
ON subscriptions FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage payment methods"
ON payment_methods FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoices in their organization"
ON invoices FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API keys"
ON api_keys FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs in their organization"
ON audit_logs FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system settings in their organization"
ON system_settings FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage system settings"
ON system_settings FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);
```

### 2.4 ヘルパー関数

#### 2.4.1 使用量チェック関数
```sql
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_organization_id UUID,
  p_resource TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_usage INTEGER;
BEGIN
  SELECT
    (limits->>p_resource)::INTEGER,
    (usage->>p_resource)::INTEGER
  INTO v_limit, v_usage
  FROM subscriptions
  WHERE organization_id = p_organization_id;

  RETURN v_usage < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2.4.2 使用量更新関数
```sql
CREATE OR REPLACE FUNCTION increment_usage(
  p_organization_id UUID,
  p_resource TEXT,
  p_amount INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET usage = jsonb_set(
    usage,
    ARRAY[p_resource],
    to_jsonb((usage->>p_resource)::INTEGER + p_amount)
  ),
  updated_at = NOW()
  WHERE organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2.4.3 監査ログ記録関数
```sql
CREATE OR REPLACE FUNCTION log_audit(
  p_organization_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_details JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_organization_id,
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    inet_client_addr(),
    current_setting('application_name', true)
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎨 3. 画面設計

### 3.1 プロフィール設定 (`/dashboard/settings/profile`)

#### 3.1.1 レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│ プロフィール設定                                             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐                                              │
│ │             │  基本情報                                    │
│ │  アバター   │  名前: [田中 太郎____________]              │
│ │             │  メール: tanaka@example.com (変更不可)     │
│ │ [変更]      │  電話番号: [090-1234-5678____]              │
│ └─────────────┘  タイムゾーン: [Asia/Tokyo ▼]             │
│                  言語: [日本語 ▼]                           │
│                                                              │
│ パスワード変更                                               │
│ 現在のパスワード: [**************]                           │
│ 新しいパスワード: [______________]                           │
│ 新しいパスワード（確認）: [______________]                   │
│                                                              │
│ 通知設定                                                     │
│ ☑ メッセージ送信完了通知                                    │
│ ☑ フォーム回答受信通知                                      │
│ ☑ 予約作成通知                                              │
│ ☑ 週次レポート送信                                          │
│                                                              │
│ 二段階認証                                                   │
│ ○ 無効  ● 有効 (推奨)                                      │
│ [QRコード表示]                                              │
│                                                              │
│ セッション情報                                               │
│ 最終ログイン: 2025/10/30 14:32 (192.168.1.1)               │
│ アクティブセッション: 2個                                   │
│ [すべてのセッションをログアウト]                            │
│                                                              │
│                              [キャンセル] [保存]            │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 組織設定 (`/dashboard/settings/organization`)

#### 3.2.1 レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│ 組織設定                                                     │
├─────────────────────────────────────────────────────────────┤
│ 基本情報                                                     │
│ 組織名: [株式会社サンプル____________]                      │
│ スラッグ: sample-corp (URL: lme.jp/sample-corp)            │
│ ウェブサイト: [https://example.com_]                        │
│ 連絡先メール: [contact@example.com_]                        │
│                                                              │
│ ブランディング                                               │
│ ┌─────────────┐                                              │
│ │             │  ロゴ画像                                    │
│ │    ロゴ     │  [ファイルを選択] logo.png                  │
│ │             │  推奨: 200x200px, PNG/JPG                   │
│ └─────────────┘                                              │
│                                                              │
│ プライマリカラー: [#00B900] ■                               │
│ セカンダリカラー: [#06C755] ■                               │
│                                                              │
│ スタッフ管理                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ メール           │ ロール │ ステータス │ アクション     │ │
│ │──────────────────────────────────────────────────────── │ │
│ │ owner@example    │ Owner  │ Active    │ -              │ │
│ │ admin@example    │ Admin  │ Active    │ 編集 削除      │ │
│ │ member@example   │ Member │ Pending   │ 再送 削除      │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [+ スタッフを招待]                                           │
│                                                              │
│ 危険な操作                                                   │
│ [組織を削除] ← 全データが完全に削除されます                │
│                                                              │
│                              [キャンセル] [保存]            │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 LINE連携設定 (`/dashboard/settings/line`)

#### 3.3.1 レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│ LINE連携設定                                                 │
├─────────────────────────────────────────────────────────────┤
│ 連携ステータス: ● 接続済み                                  │
│                                                              │
│ チャネル情報                                                 │
│ チャネル名: サンプル公式アカウント                           │
│ Basic ID: @sample-bot                                       │
│ チャネルID: 1234567890                                      │
│                                                              │
│ 認証情報                                                     │
│ チャネルシークレット: [********] [表示]                      │
│ チャネルアクセストークン: [********...] [表示] [再生成]     │
│                                                              │
│ Webhook設定                                                 │
│ Webhook URL: https://lme-saas.com/api/webhook/line         │
│ [URLをコピー]                                               │
│                                                              │
│ ステータス: ● 有効                                          │
│ 最終受信: 2025/10/30 14:32                                 │
│ エラー数: 0                                                 │
│                                                              │
│ 接続テスト                                                   │
│ [テストメッセージを送信]                                    │
│ └─ ✅ 送信成功 (2025/10/30 14:35)                          │
│                                                              │
│ Webhook ログ                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 日時              │ イベント      │ ステータス │ 詳細  │ │
│ │──────────────────────────────────────────────────────── │ │
│ │ 2025/10/30 14:32 │ message       │ 200       │ 詳細  │ │
│ │ 2025/10/30 14:30 │ follow        │ 200       │ 詳細  │ │
│ │ 2025/10/30 14:28 │ postback      │ 200       │ 詳細  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ [LINE連携を解除]                                            │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 プラン・請求設定 (`/dashboard/settings/billing`)

#### 3.4.1 レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│ プラン・請求                                                 │
├─────────────────────────────────────────────────────────────┤
│ 現在のプラン: Pro プラン                    [プラン変更]   │
│ 次回更新日: 2025/11/30                                      │
│ 月額: ¥9,800                                                │
│                                                              │
│ 使用状況                                                     │
│ ┌──────────────────────────────────────┐                    │
│ │ 友だち数: 456 / 10,000 (4.6%)        │ ■■□□□□□□□□ │
│ │ 月間配信数: 2,345 / 50,000 (4.7%)    │ ■■□□□□□□□□ │
│ │ スタッフ: 3 / 10 (30%)               │ ■■■□□□□□□□ │
│ │ フォーム: 5 / 無制限                 │ -              │
│ │ API呼び出し: 234 / 10,000/日 (2.3%)  │ ■□□□□□□□□□ │
│ └──────────────────────────────────────┘                    │
│                                                              │
│ 支払い方法                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ● Visa **** 1234 (有効期限: 12/2026)        [デフォルト]│ │
│ │   [削除]                                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [+ 支払い方法を追加]                                        │
│                                                              │
│ 請求履歴                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 請求日        │ プラン │ 金額      │ ステータス │ PDF  │ │
│ │──────────────────────────────────────────────────────── │ │
│ │ 2025/10/01   │ Pro    │ ¥9,800   │ 支払済     │ DL   │ │
│ │ 2025/09/01   │ Pro    │ ¥9,800   │ 支払済     │ DL   │ │
│ │ 2025/08/01   │ Pro    │ ¥9,800   │ 支払済     │ DL   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ プラン比較                                                   │
│ ┌───────────────┬───────────────┬───────────────┐            │
│ │ Free         │ Pro           │ Enterprise    │            │
│ │──────────────────────────────────────────────│            │
│ │ ¥0           │ ¥9,800/月     │ カスタム      │            │
│ │ 友だち: 1,000│ 友だち: 10,000│ 友だち: 無制限│            │
│ │ 配信: 5,000  │ 配信: 50,000  │ 配信: 無制限  │            │
│ │ スタッフ: 3  │ スタッフ: 10  │ スタッフ: 無制限│          │
│ │              │ [現在のプラン] │ [お問い合わせ]│            │
│ └───────────────┴───────────────┴───────────────┘            │
│                                                              │
│ [プランをキャンセル]                                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.5 システムユーティリティ (`/dashboard/settings/system`)

#### 3.5.1 レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│ システムユーティリティ                                       │
├─────────────────────────────────────────────────────────────┤
│ データエクスポート                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ エクスポート対象:                                        │ │
│ │ ☑ 友だちリスト  ☑ タグ  ☑ セグメント                   │ │
│ │ ☑ メッセージ履歴  ☑ フォーム回答  ☑ 予約データ        │ │
│ │ ☑ 分析データ                                            │ │
│ │                                                          │ │
│ │ 形式: ○ CSV  ○ JSON  ○ Excel                          │ │
│ │                                                          │ │
│ │ 期間: [2025/01/01] ～ [2025/10/30]                     │ │
│ │                                                          │ │
│ │ [エクスポート開始]                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ データインポート                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ インポート対象:                                          │ │
│ │ ○ 友だちリスト  ○ タグ                                 │ │
│ │                                                          │ │
│ │ ファイル: [ファイルを選択] friends_import.csv           │ │
│ │                                                          │ │
│ │ 重複時の処理: [スキップ ▼]                             │ │
│ │                                                          │ │
│ │ [プレビュー] [インポート開始]                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ API キー管理                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 名前       │ キー            │ 権限       │ 作成日     │ │
│ │──────────────────────────────────────────────────────── │ │
│ │ 本番API    │ lm_prod******* │ Full      │ 2025/10/01 │ │
│ │ テスト用   │ lm_test******* │ Read Only │ 2025/10/15 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [+ 新しいAPIキーを作成]                                     │
│                                                              │
│ 監査ログ                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 日時              │ ユーザー │ アクション      │ 詳細  │ │
│ │──────────────────────────────────────────────────────── │ │
│ │ 2025/10/30 14:32 │ 田中太郎 │ message.sent    │ 詳細  │ │
│ │ 2025/10/30 14:30 │ 佐藤花子 │ friend.deleted  │ 詳細  │ │
│ │ 2025/10/30 14:28 │ 田中太郎 │ settings.updated│ 詳細  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ システム情報                                                 │
│ バージョン: v1.2.3                                          │
│ ビルド日時: 2025/10/25 12:00                               │
│ データベース: Supabase                                      │
│ ストレージ使用量: 2.5 GB / 10 GB (25%)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 4. Server Actions実装

### 4.1 プロフィール管理

#### 4.1.1 app/actions/profile.ts
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
  full_name: string
  phone_number?: string
  timezone: string
  locale: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('users')
    .update({
      full_name: data.full_name,
      phone_number: data.phone_number,
      timezone: data.timezone,
      locale: data.locale,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/settings/profile')
  return { success: true }
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const file = formData.get('avatar') as File
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('user-avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(fileName)

  const { error } = await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/settings/profile')
  return { success: true, avatar_url: publicUrl }
}

export async function changePassword(data: {
  current_password: string
  new_password: string
}) {
  const supabase = await createClient()

  // 現在のパスワードで認証確認
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: (await supabase.auth.getUser()).data.user?.email!,
    password: data.current_password
  })

  if (signInError) throw new Error('Current password is incorrect')

  // パスワード更新
  const { error } = await supabase.auth.updateUser({
    password: data.new_password
  })

  if (error) throw error

  return { success: true }
}

export async function updateNotificationSettings(settings: {
  email: Record<string, boolean>
  push: Record<string, boolean>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('users')
    .update({ notification_settings: settings })
    .eq('id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/settings/profile')
  return { success: true }
}
```

### 4.2 組織管理

#### 4.2.1 app/actions/organization.ts
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'

export async function updateOrganization(data: {
  name: string
  website_url?: string
  contact_email?: string
  primary_color: string
  secondary_color: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single()

  if (!userOrg || !['owner', 'admin'].includes(userOrg.role)) {
    throw new Error('Permission denied')
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      name: data.name,
      website_url: data.website_url,
      contact_email: data.contact_email,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      updated_at: new Date().toISOString()
    })
    .eq('id', userOrg.organization_id)

  if (error) throw error

  revalidatePath('/dashboard/settings/organization')
  return { success: true }
}

export async function uploadLogo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!userOrg) throw new Error('Organization not found')

  const file = formData.get('logo') as File
  const fileExt = file.name.split('.').pop()
  const fileName = `${userOrg.organization_id}/logo.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('organization-assets')
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('organization-assets')
    .getPublicUrl(fileName)

  const { error } = await supabase
    .from('organizations')
    .update({ logo_url: publicUrl })
    .eq('id', userOrg.organization_id)

  if (error) throw error

  revalidatePath('/dashboard/settings/organization')
  return { success: true, logo_url: publicUrl }
}

export async function inviteStaff(data: {
  email: string
  role: 'admin' | 'member' | 'readonly'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single()

  if (!userOrg || userOrg.role !== 'owner') {
    throw new Error('Permission denied')
  }

  // 招待トークン生成
  const token = nanoid(32)

  const { error } = await supabase
    .from('invitations')
    .insert({
      organization_id: userOrg.organization_id,
      email: data.email,
      role: data.role,
      token,
      invited_by: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })

  if (error) throw error

  // メール送信（Resend）
  await sendInvitationEmail(data.email, token)

  revalidatePath('/dashboard/settings/organization')
  return { success: true }
}

export async function removeStaff(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single()

  if (!userOrg || userOrg.role !== 'owner') {
    throw new Error('Permission denied')
  }

  const { error } = await supabase
    .from('user_organizations')
    .delete()
    .eq('user_id', userId)
    .eq('organization_id', userOrg.organization_id)

  if (error) throw error

  revalidatePath('/dashboard/settings/organization')
  return { success: true }
}

async function sendInvitationEmail(email: string, token: string) {
  // Resend実装
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

  // TODO: Resend API呼び出し
  console.log('Send invitation email to:', email, 'URL:', inviteUrl)
}
```

### 4.3 Stripe連携

#### 4.3.1 app/actions/billing.ts
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia'
})

export async function getSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!userOrg) throw new Error('Organization not found')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', userOrg.organization_id)
    .single()

  return subscription
}

export async function changePlan(plan: 'free' | 'pro' | 'enterprise') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single()

  if (!userOrg || userOrg.role !== 'owner') {
    throw new Error('Permission denied')
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', userOrg.organization_id)
    .single()

  if (!subscription) throw new Error('Subscription not found')

  // Stripe サブスクリプション更新
  if (subscription.stripe_subscription_id) {
    const priceId = getPriceIdForPlan(plan)

    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      items: [{
        id: subscription.stripe_price_id,
        price: priceId
      }]
    })
  }

  // データベース更新
  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan,
      updated_at: new Date().toISOString()
    })
    .eq('organization_id', userOrg.organization_id)

  if (error) throw error

  return { success: true }
}

export async function addPaymentMethod(paymentMethodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!userOrg) throw new Error('Organization not found')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', userOrg.organization_id)
    .single()

  if (!subscription?.stripe_customer_id) {
    throw new Error('Stripe customer not found')
  }

  // Stripe に支払い方法を追加
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: subscription.stripe_customer_id
  })

  // データベースに保存
  const { error } = await supabase
    .from('payment_methods')
    .insert({
      organization_id: userOrg.organization_id,
      stripe_payment_method_id: paymentMethodId,
      type: paymentMethod.type,
      card_brand: paymentMethod.card?.brand,
      card_last4: paymentMethod.card?.last4,
      card_exp_month: paymentMethod.card?.exp_month,
      card_exp_year: paymentMethod.card?.exp_year
    })

  if (error) throw error

  return { success: true }
}

export async function getInvoices() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!userOrg) throw new Error('Organization not found')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('organization_id', userOrg.organization_id)
    .order('period_start', { ascending: false })
    .limit(12)

  return invoices
}

function getPriceIdForPlan(plan: string): string {
  const priceIds = {
    free: '',
    pro: process.env.STRIPE_PRO_PRICE_ID!,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!
  }
  return priceIds[plan]
}
```

---

## ⚡ 5. Edge Functions設計

### 5.1 process-stripe-webhook

#### 5.1.1 機能仕様
- **トリガー**: Stripe Webhook
- **処理時間**: <200ms
- **主な処理**: サブスクリプション更新、請求書作成

#### 5.1.2 実装
```typescript
// supabase/functions/process-stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-10-28.acacia'
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabase, event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object)
        break

      case 'invoice.paid':
        await handleInvoicePaid(supabase, event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, event.data.object)
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function handleSubscriptionUpdate(supabase: any, subscription: any) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleInvoicePaid(supabase: any, invoice: any) {
  await supabase
    .from('invoices')
    .upsert({
      stripe_invoice_id: invoice.id,
      organization_id: await getOrgIdFromCustomer(supabase, invoice.customer),
      amount_total: invoice.amount_paid,
      amount_subtotal: invoice.subtotal,
      amount_tax: invoice.tax,
      status: 'paid',
      paid: true,
      paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
      period_start: new Date(invoice.period_start * 1000).toISOString(),
      period_end: new Date(invoice.period_end * 1000).toISOString(),
      invoice_pdf_url: invoice.invoice_pdf
    }, {
      onConflict: 'stripe_invoice_id'
    })
}

async function getOrgIdFromCustomer(supabase: any, customerId: string): Promise<string> {
  const { data } = await supabase
    .from('subscriptions')
    .select('organization_id')
    .eq('stripe_customer_id', customerId)
    .single()

  return data?.organization_id
}
```

### 5.2 cleanup-expired-invitations

#### 5.2.1 機能仕様
- **トリガー**: Cron（毎日午前3時）
- **処理時間**: <10秒
- **主な処理**: 期限切れ招待の削除

#### 5.2.2 実装
```typescript
// supabase/functions/cleanup-expired-invitations/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: expired, error } = await supabase
    .from('invitations')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())
    .select()

  if (error) {
    console.error('Cleanup error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  console.log(`Expired ${expired?.length || 0} invitations`)

  return new Response(
    JSON.stringify({
      success: true,
      expired_count: expired?.length || 0
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
})
```

---

## 🚀 6. 実装手順（優先順位順）

### Phase 8-1: データベース構築（2時間）
1. ✅ 既存テーブル拡張（organizations, users）
2. ✅ invitations テーブル作成
3. ✅ subscriptions テーブル作成
4. ✅ payment_methods テーブル作成
5. ✅ invoices テーブル作成
6. ✅ api_keys テーブル作成
7. ✅ audit_logs テーブル作成
8. ✅ system_settings テーブル作成
9. ✅ RLSポリシー設定
10. ✅ ヘルパー関数作成

### Phase 8-2: プロフィール設定実装（3時間）
1. ✅ `/dashboard/settings/profile` ページ作成
2. ✅ プロフィール編集フォーム実装
3. ✅ アバターアップロード実装
4. ✅ パスワード変更実装
5. ✅ 通知設定実装
6. ✅ Server Actions実装

### Phase 8-3: 組織設定実装（3時間）
1. ✅ `/dashboard/settings/organization` ページ作成
2. ✅ 組織情報編集実装
3. ✅ ロゴアップロード実装
4. ✅ スタッフ招待機能実装
5. ✅ スタッフ管理実装
6. ✅ Server Actions実装

### Phase 8-4: LINE連携設定実装（2時間）
1. ✅ `/dashboard/settings/line` ページ作成
2. ✅ LINE連携情報表示
3. ✅ Webhook設定表示
4. ✅ 接続テスト実装
5. ✅ Webhookログ表示

### Phase 8-5: プラン・請求設定実装（4時間）
1. ✅ `/dashboard/settings/billing` ページ作成
2. ✅ Stripe連携設定
3. ✅ プラン表示・変更実装
4. ✅ 支払い方法管理実装
5. ✅ 請求履歴表示
6. ✅ 使用量表示実装
7. ✅ Stripe Webhook実装

### Phase 8-6: システムユーティリティ実装（3時間）
1. ✅ `/dashboard/settings/system` ページ作成
2. ✅ データエクスポート実装
3. ✅ データインポート実装
4. ✅ APIキー管理実装
5. ✅ 監査ログ表示実装

### Phase 8-7: Edge Functions実装（2時間）
1. ✅ process-stripe-webhook 実装
2. ✅ cleanup-expired-invitations 実装
3. ✅ Cron設定
4. ✅ デプロイ・動作確認

### Phase 8-8: テスト・最適化（2時間）
1. ✅ 各画面の動作確認
2. ✅ Stripe連携テスト
3. ✅ エラーハンドリング確認
4. ✅ セキュリティチェック

---

## ✅ 7. チェックリスト

### データベース
- [ ] 既存テーブル拡張完了
- [ ] invitations テーブル作成完了
- [ ] subscriptions テーブル作成完了
- [ ] payment_methods テーブル作成完了
- [ ] invoices テーブル作成完了
- [ ] api_keys テーブル作成完了
- [ ] audit_logs テーブル作成完了
- [ ] system_settings テーブル作成完了
- [ ] 全インデックス作成完了
- [ ] RLSポリシー設定完了
- [ ] ヘルパー関数作成完了

### 画面実装
- [ ] プロフィール設定画面完成
- [ ] 組織設定画面完成
- [ ] LINE連携設定画面完成
- [ ] プラン・請求設定画面完成
- [ ] システムユーティリティ画面完成

### 機能実装
- [ ] プロフィール編集機能
- [ ] アバターアップロード機能
- [ ] パスワード変更機能
- [ ] 通知設定機能
- [ ] 組織情報編集機能
- [ ] ロゴアップロード機能
- [ ] スタッフ招待機能
- [ ] スタッフ管理機能
- [ ] LINE連携表示機能
- [ ] Webhook設定表示
- [ ] プラン変更機能
- [ ] 支払い方法管理機能
- [ ] 請求履歴表示
- [ ] データエクスポート機能
- [ ] データインポート機能
- [ ] APIキー管理機能
- [ ] 監査ログ表示

### Stripe連携
- [ ] Stripe設定完了
- [ ] Stripe Webhook設定完了
- [ ] サブスクリプション作成テスト
- [ ] 支払い方法追加テスト
- [ ] プラン変更テスト
- [ ] 請求書生成テスト

### Edge Functions
- [ ] process-stripe-webhook 実装完了
- [ ] cleanup-expired-invitations 実装完了
- [ ] Cron設定完了
- [ ] 全関数デプロイ完了

### テスト
- [ ] プロフィール設定テスト
- [ ] 組織設定テスト
- [ ] LINE連携テスト
- [ ] Stripe連携テスト
- [ ] エクスポート/インポートテスト
- [ ] APIキー発行テスト
- [ ] セキュリティテスト

---

## 🎯 8. 成功指標

### 機能完成度
- ✅ 5画面すべて実装完了
- ✅ プロフィール設定機能動作
- ✅ 組織管理機能動作
- ✅ Stripe連携動作
- ✅ データエクスポート/インポート動作

### パフォーマンス
- プロフィール更新: <1秒
- ファイルアップロード: <5秒
- Stripe Webhook処理: <200ms
- データエクスポート: <10秒（1万件）

### セキュリティ
- パスワード変更時の再認証: 100%
- RLS適用率: 100%
- 監査ログ記録率: 100%
- Stripe Webhook署名検証: 100%

---

## 📚 9. 参考資料

### 公式ドキュメント
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

### 関連ドキュメント
- `/claudedocs/REQUIREMENTS_V2.md` - 全体要件
- `/claudedocs/implementation_todo_v2.md` - 実装TODO
- `/claudedocs/supabase_architecture.md` - データベース設計

---

**Phase 8要件分析完了**

このドキュメントに基づいて実装を開始してください。
各フェーズの詳細実装コードは、10個のTask agentが生成します。

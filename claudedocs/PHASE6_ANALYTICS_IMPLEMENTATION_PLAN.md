# Phase 6: アナリティクスダッシュボード実装計画書

**作成日**: 2025-10-30
**対象フェーズ**: Phase 6 (Week 9)
**技術スタック**: Next.js 16 + React 19 + Supabase + Recharts + shadcn/ui

---

## 📊 1. 概要

### 1.1 目的
L Message SaaSにおける包括的なデータ分析・可視化機能の実装。
友だち数、配信数、開封率、クリック率などの主要KPIを時系列・セグメント別に分析し、
マーケティング施策の効果測定とデータドリブンな意思決定を支援する。

### 1.2 主要機能（4画面）
1. **アナリティクスダッシュボード** (`/dashboard/analytics`)
   - 主要KPI表示（友だち数、配信数、開封率、クリック率）
   - 時系列グラフ（日次・週次・月次）
   - 期間選択機能
   - リアルタイム更新

2. **クロス分析** (`/dashboard/analytics/cross-analysis`)
   - 複数指標の掛け合わせ分析
   - セグメント別比較
   - タグ別パフォーマンス
   - メッセージタイプ別分析
   - カスタム軸設定

3. **URL計測** (`/dashboard/analytics/url-tracking`)
   - 短縮URL自動生成
   - クリック数トラッキング
   - リファラー分析
   - デバイス別分析
   - 時系列クリック推移

4. **カスタムレポート** (`/dashboard/analytics/reports`)
   - レポートテンプレート作成
   - スケジュール設定（日次・週次・月次）
   - メール自動送信
   - PDF/CSVエクスポート

### 1.3 技術選定理由

| カテゴリ | 技術 | 選定理由 |
|---------|------|---------|
| **チャートライブラリ** | Recharts | React 19対応、宣言的API、shadcn/ui統合容易、軽量 |
| **データ集計** | PostgreSQL Materialized Views | リアルタイム性とパフォーマンスのバランス |
| **リアルタイム更新** | Supabase Realtime | WebSocket経由の効率的なデータ同期 |
| **URL短縮** | Nano ID | 衝突リスク低、短いURL生成、サーバーレス最適 |
| **レポート生成** | Edge Functions + PDF-lib | サーバーレス、オンデマンド処理 |

---

## 🗄️ 2. データベース設計

### 2.1 テーブル構成

#### 2.1.1 analytics_events（イベントログテーブル）
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES line_channels(id) ON DELETE CASCADE,

  -- イベント基本情報
  event_type TEXT NOT NULL, -- 'message_sent', 'message_delivered', 'message_opened', 'link_clicked', 'friend_added', 'friend_blocked'
  event_category TEXT NOT NULL, -- 'messaging', 'friends', 'engagement'

  -- 関連エンティティ
  friend_id UUID REFERENCES line_friends(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  url_tracking_id UUID REFERENCES url_tracking(id) ON DELETE SET NULL,

  -- イベントメタデータ
  metadata JSONB DEFAULT '{}', -- デバイス情報、リファラー、カスタムプロパティ

  -- タイムスタンプ
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- インデックス用
  date_partition DATE GENERATED ALWAYS AS (DATE(event_timestamp)) STORED
);

-- インデックス（パフォーマンス最適化）
CREATE INDEX idx_analytics_events_org_type ON analytics_events(organization_id, event_type);
CREATE INDEX idx_analytics_events_org_date ON analytics_events(organization_id, date_partition DESC);
CREATE INDEX idx_analytics_events_friend ON analytics_events(friend_id) WHERE friend_id IS NOT NULL;
CREATE INDEX idx_analytics_events_message ON analytics_events(message_id) WHERE message_id IS NOT NULL;
CREATE INDEX idx_analytics_events_url ON analytics_events(url_tracking_id) WHERE url_tracking_id IS NOT NULL;
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(event_timestamp DESC);

-- パーティショニング（大量データ対応、オプション）
-- 月次パーティション（1年分のデータで有効）
CREATE TABLE analytics_events_2025_10 PARTITION OF analytics_events
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
```

**event_type 一覧**:
- `message_sent`: メッセージ送信完了
- `message_delivered`: メッセージ配信完了（LINE API確認）
- `message_opened`: メッセージ開封
- `link_clicked`: URL クリック
- `friend_added`: 友だち追加
- `friend_blocked`: ブロック
- `form_submitted`: フォーム送信
- `reservation_created`: 予約作成
- `rich_menu_tapped`: リッチメニュータップ

#### 2.1.2 analytics_reports（集計レポートテーブル）
```sql
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- レポート期間
  report_date DATE NOT NULL,
  report_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'

  -- KPI集計値
  metrics JSONB NOT NULL, -- 各種KPIをJSON形式で保存
  /*
  metrics構造例:
  {
    "friends": {
      "total": 1234,
      "new": 45,
      "blocked": 3,
      "active_rate": 0.95
    },
    "messages": {
      "sent": 567,
      "delivered": 550,
      "opened": 340,
      "open_rate": 0.62,
      "click_rate": 0.15
    },
    "engagement": {
      "link_clicks": 85,
      "form_submissions": 12,
      "reservations": 8
    }
  }
  */

  -- セグメント別集計
  segment_breakdown JSONB DEFAULT '{}',

  -- タイムスタンプ
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- ユニーク制約
  UNIQUE(organization_id, report_date, report_type)
);

-- インデックス
CREATE INDEX idx_analytics_reports_org_date ON analytics_reports(organization_id, report_date DESC);
CREATE INDEX idx_analytics_reports_type ON analytics_reports(report_type);
```

#### 2.1.3 url_tracking（URL計測テーブル）
```sql
CREATE TABLE url_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- URL情報
  short_code TEXT UNIQUE NOT NULL, -- 例: "abc123" (8文字のNano ID)
  original_url TEXT NOT NULL,
  short_url TEXT NOT NULL, -- 完全URL: "https://lme.jp/l/abc123"

  -- 関連エンティティ
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES step_campaigns(id) ON DELETE SET NULL,

  -- 計測設定
  title TEXT, -- URL の説明
  tags TEXT[] DEFAULT '{}', -- 分類用タグ

  -- 集計値（キャッシュ）
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0, -- ユニーク友だち数
  last_clicked_at TIMESTAMPTZ,

  -- ステータス
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ, -- 有効期限（オプション）

  -- タイムスタンプ
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_url_tracking_org ON url_tracking(organization_id);
CREATE INDEX idx_url_tracking_short_code ON url_tracking(short_code);
CREATE INDEX idx_url_tracking_message ON url_tracking(message_id) WHERE message_id IS NOT NULL;
CREATE UNIQUE INDEX idx_url_tracking_short_code_active ON url_tracking(short_code) WHERE is_active = true;
```

#### 2.1.4 url_clicks（URLクリック詳細ログ）
```sql
CREATE TABLE url_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_tracking_id UUID NOT NULL REFERENCES url_tracking(id) ON DELETE CASCADE,

  -- クリック元情報
  friend_id UUID REFERENCES line_friends(id) ON DELETE SET NULL,
  line_user_id TEXT, -- 非友だちの場合

  -- クリック詳細
  referrer TEXT, -- リファラー
  user_agent TEXT, -- User-Agent文字列
  device_type TEXT, -- 'mobile', 'tablet', 'desktop', 'unknown'
  os TEXT, -- 'iOS', 'Android', 'Windows', etc.
  browser TEXT, -- 'Chrome', 'Safari', 'LINE', etc.

  -- IPアドレス（プライバシー考慮、匿名化推奨）
  ip_address INET,
  country_code TEXT, -- 2文字国コード

  -- タイムスタンプ
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_url_clicks_tracking ON url_clicks(url_tracking_id, clicked_at DESC);
CREATE INDEX idx_url_clicks_friend ON url_clicks(friend_id) WHERE friend_id IS NOT NULL;
CREATE INDEX idx_url_clicks_date ON url_clicks(DATE(clicked_at));
```

#### 2.1.5 custom_reports（カスタムレポートテーブル）
```sql
CREATE TABLE custom_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- レポート基本情報
  name TEXT NOT NULL,
  description TEXT,

  -- レポート設定
  report_config JSONB NOT NULL,
  /*
  report_config構造例:
  {
    "metrics": ["friends_total", "messages_sent", "open_rate"],
    "dimensions": ["date", "segment"],
    "filters": {
      "date_range": "last_30_days",
      "tags": ["vip", "premium"]
    },
    "visualization": "line_chart"
  }
  */

  -- スケジュール設定
  schedule_enabled BOOLEAN DEFAULT false,
  schedule_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'custom'
  schedule_config JSONB DEFAULT '{}',
  /*
  schedule_config構造例:
  {
    "time": "09:00",
    "day_of_week": "monday", // weekly の場合
    "day_of_month": 1, // monthly の場合
    "timezone": "Asia/Tokyo"
  }
  */

  -- メール送信設定
  email_enabled BOOLEAN DEFAULT false,
  email_recipients TEXT[] DEFAULT '{}',
  email_subject TEXT,

  -- 最終実行情報
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,

  -- ステータス
  is_active BOOLEAN DEFAULT true,

  -- タイムスタンプ
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_custom_reports_org ON custom_reports(organization_id);
CREATE INDEX idx_custom_reports_next_run ON custom_reports(next_run_at) WHERE schedule_enabled = true AND is_active = true;
```

#### 2.1.6 custom_report_executions（レポート実行履歴）
```sql
CREATE TABLE custom_report_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  custom_report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,

  -- 実行情報
  execution_status TEXT NOT NULL, -- 'pending', 'running', 'completed', 'failed'
  execution_type TEXT NOT NULL, -- 'manual', 'scheduled'

  -- 結果データ
  result_data JSONB, -- 集計結果
  file_url TEXT, -- PDF/CSV ファイルのURL

  -- エラー情報
  error_message TEXT,

  -- タイムスタンプ
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_report_executions_report ON custom_report_executions(custom_report_id, created_at DESC);
CREATE INDEX idx_report_executions_status ON custom_report_executions(execution_status);
```

### 2.2 Materialized Views（高速集計用）

#### 2.2.1 日次集計ビュー
```sql
CREATE MATERIALIZED VIEW mv_daily_analytics AS
SELECT
  organization_id,
  DATE(event_timestamp) AS report_date,
  event_type,
  event_category,
  COUNT(*) AS event_count,
  COUNT(DISTINCT friend_id) AS unique_friends,
  jsonb_object_agg(
    COALESCE(metadata->>'device_type', 'unknown'),
    COUNT(*)
  ) FILTER (WHERE metadata->>'device_type' IS NOT NULL) AS device_breakdown
FROM analytics_events
GROUP BY organization_id, DATE(event_timestamp), event_type, event_category;

CREATE UNIQUE INDEX idx_mv_daily_analytics
  ON mv_daily_analytics(organization_id, report_date, event_type, event_category);

-- 日次更新（Edge Function経由）
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_analytics;
```

#### 2.2.2 メッセージパフォーマンス集計
```sql
CREATE MATERIALIZED VIEW mv_message_performance AS
SELECT
  m.id AS message_id,
  m.organization_id,
  m.name AS message_name,
  m.type AS message_type,
  COUNT(DISTINCT mr.friend_id) AS total_sent,
  COUNT(DISTINCT ae_delivered.friend_id) AS total_delivered,
  COUNT(DISTINCT ae_opened.friend_id) AS total_opened,
  COUNT(DISTINCT ae_clicked.friend_id) AS total_clicked,
  ROUND(
    COUNT(DISTINCT ae_opened.friend_id)::NUMERIC /
    NULLIF(COUNT(DISTINCT mr.friend_id), 0) * 100,
    2
  ) AS open_rate,
  ROUND(
    COUNT(DISTINCT ae_clicked.friend_id)::NUMERIC /
    NULLIF(COUNT(DISTINCT ae_opened.friend_id), 0) * 100,
    2
  ) AS click_rate
FROM messages m
LEFT JOIN message_recipients mr ON m.id = mr.message_id
LEFT JOIN analytics_events ae_delivered
  ON m.id = ae_delivered.message_id
  AND ae_delivered.event_type = 'message_delivered'
LEFT JOIN analytics_events ae_opened
  ON m.id = ae_opened.message_id
  AND ae_opened.event_type = 'message_opened'
LEFT JOIN analytics_events ae_clicked
  ON m.id = ae_clicked.message_id
  AND ae_clicked.event_type = 'link_clicked'
WHERE m.status = 'sent'
GROUP BY m.id, m.organization_id, m.name, m.type;

CREATE UNIQUE INDEX idx_mv_message_performance ON mv_message_performance(message_id);
```

### 2.3 RLS（Row Level Security）ポリシー

```sql
-- analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics in their organization"
ON analytics_events FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert analytics events"
ON analytics_events FOR INSERT
WITH CHECK (true); -- Edge Functionsから挿入

-- analytics_reports
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage reports in their organization"
ON analytics_reports FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- url_tracking
ALTER TABLE url_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage URL tracking in their organization"
ON url_tracking FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- custom_reports
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage custom reports in their organization"
ON custom_reports FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);
```

---

## 🎨 3. 画面設計

### 3.1 アナリティクスダッシュボード (`/dashboard/analytics`)

#### 3.1.1 レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│ アナリティクス                                               │
│ ┌─────────────────┐ ┌─────────────────┐                    │
│ │ 期間選択         │ │ セグメント      │ [エクスポート]   │
│ │ [今日▼]         │ │ [全体▼]         │                   │
│ └─────────────────┘ └─────────────────┘                    │
├─────────────────────────────────────────────────────────────┤
│ 主要KPI                                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │👥 友だち数   │ │📨 配信数     │ │📖 開封率     │        │
│ │ 1,234        │ │ 5,678        │ │ 62.5%        │        │
│ │ +12% ↑      │ │ +8% ↑       │ │ +3.2% ↑     │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │🖱️ クリック率  │ │🚫 ブロック率 │ │✨ アクティブ率│        │
│ │ 15.3%        │ │ 2.1%         │ │ 94.5%        │        │
│ │ +1.5% ↑     │ │ -0.3% ↓     │ │ +0.8% ↑     │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│ 時系列グラフ                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [友だち数] [配信数] [開封率] [クリック率]                │ │
│ │                                                          │ │
│ │  1200│                                            ╱─    │ │
│ │      │                                      ╱─╱─       │ │
│ │  1000│                              ╱─╱─╱─             │ │
│ │      │                        ╱─╱─                     │ │
│ │   800│                  ╱─╱─                           │ │
│ │      │            ╱─╱─                                 │ │
│ │   600│──────╱─╱─                                       │ │
│ │      └────────────────────────────────────────────────  │ │
│ │       1日  7日  14日 21日 28日                         │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ セグメント別パフォーマンス                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ セグメント  │ 友だち数 │ 開封率 │ クリック率 │ エンゲージ│ │
│ │──────────────────────────────────────────────────────── │ │
│ │ VIP顧客     │   234   │ 78.5% │  23.1%    │   高      │ │
│ │ 新規友だち   │   567   │ 45.2% │   8.7%    │   低      │ │
│ │ 休眠顧客     │   89    │ 12.3% │   2.1%    │   低      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 3.1.2 コンポーネント構成
```typescript
// app/dashboard/analytics/page.tsx
export default async function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      <KPICards />
      <TimeSeriesChart />
      <SegmentPerformanceTable />
    </div>
  )
}
```

### 3.2 クロス分析 (`/dashboard/analytics/cross-analysis`)

#### 3.2.1 レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│ クロス分析                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 分析軸設定                                               │ │
│ │ X軸: [セグメント ▼]                                     │ │
│ │ Y軸: [メッセージタイプ ▼]                               │ │
│ │ 指標: [開封率 ▼]                                        │ │
│ │ 期間: [過去30日 ▼]                      [分析実行]     │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ヒートマップ表示                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              │ テキスト │ 画像  │ 動画  │ Flex │        │ │
│ │──────────────────────────────────────────────────────── │ │
│ │ VIP顧客      │  78.5%  │ 82.1% │ 75.3% │ 88.9% │        │ │
│ │ 新規友だち    │  45.2%  │ 51.7% │ 38.9% │ 62.4% │        │ │
│ │ 休眠顧客      │  12.3%  │ 15.8% │  9.2% │ 18.5% │        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ 詳細テーブル                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ セグメント × メッセージタイプ │ 開封率 │ 配信数 │ 開封数│ │
│ │──────────────────────────────────────────────────────── │ │
│ │ VIP顧客 × Flex              │ 88.9% │  100  │   89  │ │
│ │ VIP顧客 × 画像              │ 82.1% │  150  │  123  │ │
│ │ 新規友だち × Flex            │ 62.4% │  200  │  125  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 URL計測 (`/dashboard/analytics/url-tracking`)

#### 3.3.1 レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│ URL計測                                        [+ 新規URL]  │
├─────────────────────────────────────────────────────────────┤
│ URL一覧                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ タイトル        │ 短縮URL        │ クリック数 │ アクション│ │
│ │──────────────────────────────────────────────────────── │ │
│ │ キャンペーンLP   │ lme.jp/l/abc123│   245    │ 📊 詳細  │ │
│ │ 商品ページ      │ lme.jp/l/def456│   189    │ 📊 詳細  │ │
│ │ 予約フォーム     │ lme.jp/l/ghi789│   132    │ 📊 詳細  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ URL詳細（選択時表示）                                         │
│ ┌──────────────────┐ ┌──────────────────┐                  │
│ │ 総クリック数      │ │ ユニーククリック │                  │
│ │ 245              │ │ 198              │                  │
│ └──────────────────┘ └──────────────────┘                  │
│                                                              │
│ 時系列クリック推移                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │   50│                                            ●        │ │
│ │     │                                      ●              │ │
│ │   40│                                ●                    │ │
│ │     │                          ●                          │ │
│ │   30│                    ●                                │ │
│ │     └──────────────────────────────────────────────────  │ │
│ │       1日   2日   3日   4日   5日   6日   7日            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ デバイス別・リファラー分析                                   │
│ ┌──────────────┐ ┌──────────────┐                          │
│ │ デバイス     │ │ リファラー    │                          │
│ │ Mobile: 70% │ │ LINE: 85%    │                          │
│ │ Desktop: 25%│ │ Direct: 10%  │                          │
│ │ Tablet: 5%  │ │ Other: 5%    │                          │
│ └──────────────┘ └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 カスタムレポート (`/dashboard/analytics/reports`)

#### 3.4.1 レイアウト構成
```
┌─────────────────────────────────────────────────────────────┐
│ カスタムレポート                           [+ 新規レポート]  │
├─────────────────────────────────────────────────────────────┤
│ レポート一覧                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ レポート名  │ スケジュール │ 最終実行   │ アクション    │ │
│ │──────────────────────────────────────────────────────── │ │
│ │ 週次KPI     │ 毎週月曜9:00 │ 2日前     │ 📧 実行 編集  │ │
│ │ 月次まとめ   │ 毎月1日9:00  │ 28日前    │ 📧 実行 編集  │ │
│ │ セグメント分析│ 手動        │ 5日前     │ 📧 実行 編集  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ レポート作成/編集ダイアログ                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ レポート名: [週次KPIレポート]                             │ │
│ │                                                          │ │
│ │ 指標選択:                                                │ │
│ │ ☑ 友だち数   ☑ 配信数   ☑ 開封率   ☑ クリック率        │ │
│ │                                                          │ │
│ │ スケジュール:                                            │ │
│ │ ● 自動送信 ○ 手動実行                                   │ │
│ │ 頻度: [週次 ▼]  曜日: [月曜 ▼]  時刻: [09:00 ▼]       │ │
│ │                                                          │ │
│ │ 送信先メール:                                            │ │
│ │ [admin@example.com] [+ 追加]                            │ │
│ │                                                          │ │
│ │ 出力形式: ☑ PDF  ☑ CSV                                  │ │
│ │                                                          │ │
│ │                              [キャンセル] [保存]        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 4. チャートライブラリ設計（Recharts）

### 4.1 Recharts選定理由
- **React 19完全対応**: 最新のReact仕様に準拠
- **宣言的API**: コンポーネントベースで直感的
- **shadcn/ui統合**: スタイリング統一が容易
- **軽量**: 依存関係が少なく、バンドルサイズ最小
- **カスタマイズ性**: Tailwind CSSと組み合わせ可能

### 4.2 依存関係インストール
```bash
npm install recharts
npm install date-fns # 日付フォーマット用
```

### 4.3 共通チャートコンポーネント

#### 4.3.1 TimeSeriesChart（時系列グラフ）
```typescript
// components/analytics/time-series-chart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TimeSeriesData {
  date: string
  friends: number
  messages: number
  openRate: number
  clickRate: number
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[]
  title?: string
  metrics?: ('friends' | 'messages' | 'openRate' | 'clickRate')[]
}

export function TimeSeriesChart({
  data,
  title = '時系列推移',
  metrics = ['friends', 'messages', 'openRate', 'clickRate']
}: TimeSeriesChartProps) {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'M/d', { locale: ja })
  }

  const metricConfig = {
    friends: { key: 'friends', name: '友だち数', color: '#00B900', yAxisId: 'left' },
    messages: { key: 'messages', name: '配信数', color: '#3B82F6', yAxisId: 'left' },
    openRate: { key: 'openRate', name: '開封率(%)', color: '#F59E0B', yAxisId: 'right' },
    clickRate: { key: 'clickRate', name: 'クリック率(%)', color: '#EF4444', yAxisId: 'right' }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              className="text-xs"
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
            />
            <Tooltip
              labelFormatter={formatDate}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)'
              }}
            />
            <Legend />

            {metrics.map(metric => {
              const config = metricConfig[metric]
              return (
                <Line
                  key={config.key}
                  yAxisId={config.yAxisId}
                  type="monotone"
                  dataKey={config.key}
                  name={config.name}
                  stroke={config.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

#### 4.3.2 BarChart（棒グラフ）
```typescript
// components/analytics/bar-chart.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BarChartData {
  name: string
  value: number
  [key: string]: string | number
}

interface BarChartProps {
  data: BarChartData[]
  title?: string
  dataKey?: string
  xAxisKey?: string
  color?: string
}

export function BarChartComponent({
  data,
  title = '比較分析',
  dataKey = 'value',
  xAxisKey = 'name',
  color = '#00B900'
}: BarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={xAxisKey} className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)'
              }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

#### 4.3.3 PieChart（円グラフ）
```typescript
// components/analytics/pie-chart.tsx
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PieChartData {
  name: string
  value: number
}

interface PieChartProps {
  data: PieChartData[]
  title?: string
  colors?: string[]
}

const DEFAULT_COLORS = ['#00B900', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function PieChartComponent({
  data,
  title = '割合',
  colors = DEFAULT_COLORS
}: PieChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

## 🔧 5. API設計

### 5.1 Server Actions

#### 5.1.1 アナリティクスデータ取得
```typescript
// app/dashboard/analytics/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AnalyticsFilters {
  startDate: string
  endDate: string
  segmentId?: string
  channelId?: string
}

export async function getAnalyticsOverview(filters: AnalyticsFilters) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 組織ID取得
  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!userOrg) throw new Error('Organization not found')

  // KPI集計
  const { data: reports } = await supabase
    .from('analytics_reports')
    .select('*')
    .eq('organization_id', userOrg.organization_id)
    .gte('report_date', filters.startDate)
    .lte('report_date', filters.endDate)
    .eq('report_type', 'daily')
    .order('report_date', { ascending: true })

  if (!reports) return { kpis: {}, timeSeries: [] }

  // KPI計算
  const kpis = calculateKPIs(reports)

  // 時系列データ整形
  const timeSeries = reports.map(report => ({
    date: report.report_date,
    friends: report.metrics.friends?.total || 0,
    messages: report.metrics.messages?.sent || 0,
    openRate: report.metrics.messages?.open_rate || 0,
    clickRate: report.metrics.messages?.click_rate || 0
  }))

  return { kpis, timeSeries }
}

function calculateKPIs(reports: any[]) {
  const latest = reports[reports.length - 1]?.metrics || {}
  const previous = reports[reports.length - 2]?.metrics || {}

  return {
    friendsTotal: latest.friends?.total || 0,
    friendsChange: calculateChange(latest.friends?.total, previous.friends?.total),
    messagesTotal: latest.messages?.sent || 0,
    messagesChange: calculateChange(latest.messages?.sent, previous.messages?.sent),
    openRate: latest.messages?.open_rate || 0,
    openRateChange: calculateChange(latest.messages?.open_rate, previous.messages?.open_rate),
    clickRate: latest.messages?.click_rate || 0,
    clickRateChange: calculateChange(latest.messages?.click_rate, previous.messages?.click_rate)
  }
}

function calculateChange(current: number, previous: number): number {
  if (!previous) return 0
  return ((current - previous) / previous) * 100
}
```

#### 5.1.2 クロス分析データ取得
```typescript
// app/dashboard/analytics/cross-analysis/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export interface CrossAnalysisConfig {
  xAxis: 'segment' | 'tag' | 'message_type' | 'device'
  yAxis: 'segment' | 'tag' | 'message_type' | 'device'
  metric: 'open_rate' | 'click_rate' | 'conversion_rate'
  startDate: string
  endDate: string
}

export async function getCrossAnalysisData(config: CrossAnalysisConfig) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!userOrg) throw new Error('Organization not found')

  // クロス集計クエリ実行
  const { data, error } = await supabase.rpc('cross_analyze', {
    p_organization_id: userOrg.organization_id,
    p_x_axis: config.xAxis,
    p_y_axis: config.yAxis,
    p_metric: config.metric,
    p_start_date: config.startDate,
    p_end_date: config.endDate
  })

  if (error) throw error

  return data
}
```

#### 5.1.3 URL短縮作成
```typescript
// app/dashboard/analytics/url-tracking/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function createShortUrl(originalUrl: string, title?: string, messageId?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!userOrg) throw new Error('Organization not found')

  // 短縮コード生成（8文字、衝突リスク極小）
  const shortCode = nanoid(8)
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/l/${shortCode}`

  const { data, error } = await supabase
    .from('url_tracking')
    .insert({
      organization_id: userOrg.organization_id,
      short_code: shortCode,
      original_url: originalUrl,
      short_url: shortUrl,
      title,
      message_id: messageId,
      created_by: user.id
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getUrlTrackingStats(urlTrackingId: string) {
  const supabase = await createClient()

  // URL基本情報
  const { data: urlData } = await supabase
    .from('url_tracking')
    .select('*')
    .eq('id', urlTrackingId)
    .single()

  if (!urlData) throw new Error('URL not found')

  // クリック統計
  const { data: clicks } = await supabase
    .from('url_clicks')
    .select('*')
    .eq('url_tracking_id', urlTrackingId)

  // デバイス別集計
  const deviceBreakdown = clicks?.reduce((acc, click) => {
    const device = click.device_type || 'unknown'
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // リファラー集計
  const referrerBreakdown = clicks?.reduce((acc, click) => {
    const referrer = click.referrer || 'direct'
    acc[referrer] = (acc[referrer] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 日次クリック推移
  const dailyClicks = clicks?.reduce((acc, click) => {
    const date = click.clicked_at.split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    url: urlData,
    totalClicks: clicks?.length || 0,
    uniqueClicks: new Set(clicks?.map(c => c.friend_id).filter(Boolean)).size,
    deviceBreakdown,
    referrerBreakdown,
    dailyClicks
  }
}
```

#### 5.1.4 カスタムレポート管理
```typescript
// app/dashboard/analytics/reports/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CustomReportConfig {
  name: string
  description?: string
  reportConfig: {
    metrics: string[]
    dimensions: string[]
    filters: Record<string, any>
    visualization: 'table' | 'line_chart' | 'bar_chart'
  }
  scheduleEnabled: boolean
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly'
  scheduleConfig?: {
    time: string
    dayOfWeek?: string
    dayOfMonth?: number
    timezone: string
  }
  emailEnabled: boolean
  emailRecipients?: string[]
  emailSubject?: string
}

export async function createCustomReport(config: CustomReportConfig) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userOrg } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!userOrg) throw new Error('Organization not found')

  // 次回実行時刻計算
  const nextRunAt = config.scheduleEnabled
    ? calculateNextRun(config.scheduleFrequency!, config.scheduleConfig!)
    : null

  const { data, error } = await supabase
    .from('custom_reports')
    .insert({
      organization_id: userOrg.organization_id,
      name: config.name,
      description: config.description,
      report_config: config.reportConfig,
      schedule_enabled: config.scheduleEnabled,
      schedule_frequency: config.scheduleFrequency,
      schedule_config: config.scheduleConfig,
      email_enabled: config.emailEnabled,
      email_recipients: config.emailRecipients,
      email_subject: config.emailSubject,
      next_run_at: nextRunAt,
      created_by: user.id
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/analytics/reports')
  return data
}

export async function executeCustomReport(reportId: string) {
  const supabase = await createClient()

  // レポート設定取得
  const { data: report } = await supabase
    .from('custom_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (!report) throw new Error('Report not found')

  // 実行履歴記録
  const { data: execution } = await supabase
    .from('custom_report_executions')
    .insert({
      custom_report_id: reportId,
      execution_status: 'running',
      execution_type: 'manual'
    })
    .select()
    .single()

  // Edge Function呼び出し（レポート生成）
  const { data: result, error } = await supabase.functions.invoke('generate-report', {
    body: { reportId, executionId: execution?.id }
  })

  if (error) {
    await supabase
      .from('custom_report_executions')
      .update({
        execution_status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', execution?.id)
    throw error
  }

  return result
}

function calculateNextRun(frequency: string, config: any): string {
  const now = new Date()
  const [hour, minute] = config.time.split(':').map(Number)

  let nextRun = new Date()
  nextRun.setHours(hour, minute, 0, 0)

  if (frequency === 'daily') {
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }
  } else if (frequency === 'weekly') {
    const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      .indexOf(config.dayOfWeek)
    const daysUntilTarget = (targetDay - nextRun.getDay() + 7) % 7
    nextRun.setDate(nextRun.getDate() + (daysUntilTarget || 7))
  } else if (frequency === 'monthly') {
    nextRun.setDate(config.dayOfMonth)
    if (nextRun <= now) {
      nextRun.setMonth(nextRun.getMonth() + 1)
    }
  }

  return nextRun.toISOString()
}
```

### 5.2 PostgreSQL関数（RPC）

#### 5.2.1 クロス分析関数
```sql
CREATE OR REPLACE FUNCTION cross_analyze(
  p_organization_id UUID,
  p_x_axis TEXT,
  p_y_axis TEXT,
  p_metric TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  x_value TEXT,
  y_value TEXT,
  metric_value NUMERIC
) AS $$
BEGIN
  -- 動的クロス集計
  -- 実装は p_x_axis, p_y_axis, p_metric の組み合わせに応じて分岐

  IF p_metric = 'open_rate' THEN
    RETURN QUERY
    SELECT
      CASE p_x_axis
        WHEN 'segment' THEN s.name
        WHEN 'tag' THEN t.name
        WHEN 'message_type' THEN m.type
        ELSE 'unknown'
      END AS x_value,
      CASE p_y_axis
        WHEN 'segment' THEN s2.name
        WHEN 'tag' THEN t2.name
        WHEN 'message_type' THEN m2.type
        ELSE 'unknown'
      END AS y_value,
      ROUND(
        COUNT(DISTINCT ae_opened.friend_id)::NUMERIC /
        NULLIF(COUNT(DISTINCT ae_sent.friend_id), 0) * 100,
        2
      ) AS metric_value
    FROM analytics_events ae_sent
    LEFT JOIN analytics_events ae_opened
      ON ae_sent.friend_id = ae_opened.friend_id
      AND ae_sent.message_id = ae_opened.message_id
      AND ae_opened.event_type = 'message_opened'
    -- JOIN条件は p_x_axis, p_y_axis に応じて動的に構築
    WHERE ae_sent.organization_id = p_organization_id
      AND ae_sent.event_type = 'message_sent'
      AND DATE(ae_sent.event_timestamp) BETWEEN p_start_date AND p_end_date
    GROUP BY x_value, y_value;
  END IF;

  -- 他の指標も同様に実装
END;
$$ LANGUAGE plpgsql;
```

---

## ⚡ 6. Edge Functions設計

### 6.1 aggregate-analytics（日次集計）

#### 6.1.1 関数仕様
- **トリガー**: Cron（毎日午前2時）
- **処理時間**: 約5-10分（1万イベント/組織）
- **並列処理**: 組織ごとに並列実行

#### 6.1.2 実装
```typescript
// supabase/functions/aggregate-analytics/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 集計対象日（前日）
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - 1)
    const dateStr = targetDate.toISOString().split('T')[0]

    // 全組織取得
    const { data: organizations } = await supabase
      .from('organizations')
      .select('id')

    if (!organizations) {
      return new Response(JSON.stringify({ error: 'No organizations found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 組織ごとに集計
    const results = await Promise.all(
      organizations.map(org => aggregateForOrganization(supabase, org.id, dateStr))
    )

    // Materialized View更新
    await supabase.rpc('refresh_materialized_views')

    return new Response(
      JSON.stringify({
        success: true,
        date: dateStr,
        organizationsProcessed: results.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Aggregation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

async function aggregateForOrganization(
  supabase: any,
  organizationId: string,
  date: string
) {
  // イベントログ集計
  const { data: events } = await supabase
    .from('analytics_events')
    .select('event_type, friend_id, message_id, metadata')
    .eq('organization_id', organizationId)
    .gte('event_timestamp', `${date}T00:00:00Z`)
    .lt('event_timestamp', `${date}T23:59:59Z`)

  if (!events || events.length === 0) {
    return { organizationId, date, metrics: {} }
  }

  // KPI計算
  const metrics = {
    friends: {
      total: await getFriendsTotal(supabase, organizationId, date),
      new: countEventsByType(events, 'friend_added'),
      blocked: countEventsByType(events, 'friend_blocked'),
      active_rate: 0 // 計算ロジック
    },
    messages: {
      sent: countEventsByType(events, 'message_sent'),
      delivered: countEventsByType(events, 'message_delivered'),
      opened: countEventsByType(events, 'message_opened'),
      open_rate: calculateOpenRate(events),
      click_rate: calculateClickRate(events)
    },
    engagement: {
      link_clicks: countEventsByType(events, 'link_clicked'),
      form_submissions: countEventsByType(events, 'form_submitted'),
      reservations: countEventsByType(events, 'reservation_created')
    }
  }

  // レポートテーブル保存
  const { error } = await supabase
    .from('analytics_reports')
    .upsert({
      organization_id: organizationId,
      report_date: date,
      report_type: 'daily',
      metrics,
      calculated_at: new Date().toISOString()
    }, {
      onConflict: 'organization_id,report_date,report_type'
    })

  if (error) throw error

  return { organizationId, date, metrics }
}

function countEventsByType(events: any[], type: string): number {
  return events.filter(e => e.event_type === type).length
}

function calculateOpenRate(events: any[]): number {
  const sent = countEventsByType(events, 'message_sent')
  const opened = countEventsByType(events, 'message_opened')
  return sent > 0 ? Math.round((opened / sent) * 100 * 100) / 100 : 0
}

function calculateClickRate(events: any[]): number {
  const opened = countEventsByType(events, 'message_opened')
  const clicked = countEventsByType(events, 'link_clicked')
  return opened > 0 ? Math.round((clicked / opened) * 100 * 100) / 100 : 0
}

async function getFriendsTotal(supabase: any, organizationId: string, date: string): Promise<number> {
  const { count } = await supabase
    .from('line_friends')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .lte('first_added_at', `${date}T23:59:59Z`)

  return count || 0
}
```

### 6.2 process-url-click（URLクリック処理）

#### 6.2.1 関数仕様
- **トリガー**: HTTP Request（/l/:shortCode アクセス時）
- **処理時間**: <100ms
- **レスポンス**: 302 Redirect

#### 6.2.2 実装
```typescript
// supabase/functions/process-url-click/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const shortCode = url.pathname.split('/').pop()

  if (!shortCode) {
    return new Response('Not Found', { status: 404 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 短縮URL取得
  const { data: urlTracking } = await supabase
    .from('url_tracking')
    .select('*')
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .single()

  if (!urlTracking) {
    return new Response('URL not found', { status: 404 })
  }

  // 有効期限チェック
  if (urlTracking.expires_at && new Date(urlTracking.expires_at) < new Date()) {
    return new Response('URL expired', { status: 410 })
  }

  // クリック情報解析
  const userAgent = req.headers.get('user-agent') || ''
  const referrer = req.headers.get('referer') || ''
  const deviceInfo = parseUserAgent(userAgent)

  // クリックログ記録（非同期、リダイレクトを遅延させない）
  supabase
    .from('url_clicks')
    .insert({
      url_tracking_id: urlTracking.id,
      referrer,
      user_agent: userAgent,
      device_type: deviceInfo.deviceType,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      clicked_at: new Date().toISOString()
    })
    .then(() => {
      // クリック数カウンター更新
      return supabase.rpc('increment_url_clicks', {
        url_id: urlTracking.id
      })
    })
    .catch(console.error)

  // アナリティクスイベント記録
  supabase
    .from('analytics_events')
    .insert({
      organization_id: urlTracking.organization_id,
      event_type: 'link_clicked',
      event_category: 'engagement',
      url_tracking_id: urlTracking.id,
      message_id: urlTracking.message_id,
      metadata: { device: deviceInfo, referrer },
      event_timestamp: new Date().toISOString()
    })
    .catch(console.error)

  // リダイレクト
  return Response.redirect(urlTracking.original_url, 302)
})

function parseUserAgent(userAgent: string) {
  // 簡易User-Agent解析
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent)
  const isTablet = /Tablet|iPad/i.test(userAgent)

  let deviceType = 'desktop'
  if (isMobile) deviceType = 'mobile'
  if (isTablet) deviceType = 'tablet'

  let os = 'unknown'
  if (/Windows/i.test(userAgent)) os = 'Windows'
  if (/Mac OS/i.test(userAgent)) os = 'macOS'
  if (/iPhone|iPad/i.test(userAgent)) os = 'iOS'
  if (/Android/i.test(userAgent)) os = 'Android'

  let browser = 'unknown'
  if (/Chrome/i.test(userAgent)) browser = 'Chrome'
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari'
  if (/Firefox/i.test(userAgent)) browser = 'Firefox'
  if (/LINE/i.test(userAgent)) browser = 'LINE'

  return { deviceType, os, browser }
}
```

### 6.3 generate-report（レポート生成）

#### 6.3.1 関数仕様
- **トリガー**: Cron（スケジュール設定に応じて） + 手動実行
- **処理時間**: 約30秒-2分
- **出力**: PDF/CSV + メール送信

#### 6.3.2 実装
```typescript
// supabase/functions/generate-report/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { reportId, executionId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // レポート設定取得
    const { data: report } = await supabase
      .from('custom_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (!report) throw new Error('Report not found')

    // データ集計
    const reportData = await aggregateReportData(supabase, report)

    // PDF生成（オプション）
    let fileUrl = null
    if (report.report_config.output_format?.includes('pdf')) {
      fileUrl = await generatePDF(supabase, reportData, report)
    }

    // CSV生成（オプション）
    if (report.report_config.output_format?.includes('csv')) {
      await generateCSV(supabase, reportData, report)
    }

    // メール送信
    if (report.email_enabled && report.email_recipients?.length > 0) {
      await sendReportEmail(supabase, report, reportData, fileUrl)
    }

    // 実行履歴更新
    await supabase
      .from('custom_report_executions')
      .update({
        execution_status: 'completed',
        result_data: reportData,
        file_url: fileUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', executionId)

    // 次回実行時刻更新
    if (report.schedule_enabled) {
      const nextRunAt = calculateNextRun(report.schedule_frequency, report.schedule_config)
      await supabase
        .from('custom_reports')
        .update({
          last_run_at: new Date().toISOString(),
          next_run_at: nextRunAt
        })
        .eq('id', reportId)
    }

    return new Response(
      JSON.stringify({ success: true, fileUrl }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Report generation error:', error)

    // エラー記録
    await supabase
      .from('custom_report_executions')
      .update({
        execution_status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', executionId)

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

async function aggregateReportData(supabase: any, report: any) {
  const { metrics, dimensions, filters } = report.report_config

  // データ集計ロジック（metrics, dimensions に応じて動的に構築）
  // 例: 週次KPIレポート
  const { data: reports } = await supabase
    .from('analytics_reports')
    .select('*')
    .eq('organization_id', report.organization_id)
    .eq('report_type', 'daily')
    .order('report_date', { ascending: false })
    .limit(7) // 直近7日分

  return reports
}

async function generatePDF(supabase: any, data: any, report: any): Promise<string> {
  // PDF生成ライブラリを使用（例: pdf-lib）
  // ここでは簡略化のため省略

  // Storage にアップロード
  const fileName = `reports/${report.id}_${Date.now()}.pdf`
  const { data: upload, error } = await supabase.storage
    .from('organization-assets')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf'
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('organization-assets')
    .getPublicUrl(fileName)

  return publicUrl
}

async function sendReportEmail(
  supabase: any,
  report: any,
  data: any,
  attachmentUrl: string | null
) {
  // メール送信サービス連携（例: Resend, SendGrid）
  // ここでは簡略化のため省略

  const emailBody = formatReportEmail(data, report)

  // メール送信API呼び出し
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'reports@lme-saas.com',
      to: report.email_recipients,
      subject: report.email_subject || `レポート: ${report.name}`,
      html: emailBody,
      attachments: attachmentUrl ? [{ url: attachmentUrl }] : []
    })
  })
}

function formatReportEmail(data: any, report: any): string {
  // HTMLメール本文生成
  return `
    <h1>${report.name}</h1>
    <p>${report.description}</p>
    <table>
      <!-- データテーブル -->
    </table>
  `
}
```

---

## 🚀 7. 実装手順（優先順位順）

### 7.1 Phase 6-1: データベース構築（2時間）

**タスク**:
1. ✅ analytics_events テーブル作成
2. ✅ analytics_reports テーブル作成
3. ✅ url_tracking テーブル作成
4. ✅ url_clicks テーブル作成
5. ✅ custom_reports テーブル作成
6. ✅ custom_report_executions テーブル作成
7. ✅ RLSポリシー設定
8. ✅ Materialized Views作成

**検証コマンド**:
```bash
# Supabase SQL Editor で実行
SELECT * FROM analytics_events LIMIT 1;
SELECT * FROM analytics_reports LIMIT 1;
SELECT * FROM url_tracking LIMIT 1;
```

### 7.2 Phase 6-2: アナリティクスダッシュボード実装（4時間）

**タスク**:
1. ✅ `/dashboard/analytics/page.tsx` 作成
2. ✅ KPIカードコンポーネント実装
3. ✅ 時系列グラフ実装（Recharts）
4. ✅ 期間選択機能実装
5. ✅ Server Actions実装（getAnalyticsOverview）
6. ✅ セグメント別パフォーマンステーブル実装

**ファイル構成**:
```
app/dashboard/analytics/
├── page.tsx
├── actions.ts
└── components/
    ├── kpi-cards.tsx
    ├── time-series-chart.tsx
    ├── period-selector.tsx
    └── segment-performance-table.tsx
```

### 7.3 Phase 6-3: クロス分析実装（3時間）

**タスク**:
1. ✅ `/dashboard/analytics/cross-analysis/page.tsx` 作成
2. ✅ 分析軸選択UI実装
3. ✅ ヒートマップ表示実装
4. ✅ 詳細テーブル実装
5. ✅ Server Actions実装（getCrossAnalysisData）
6. ✅ PostgreSQL関数実装（cross_analyze）

### 7.4 Phase 6-4: URL計測実装（3時間）

**タスク**:
1. ✅ `/dashboard/analytics/url-tracking/page.tsx` 作成
2. ✅ URL一覧表示実装
3. ✅ 短縮URL作成ダイアログ実装
4. ✅ URL詳細統計表示実装
5. ✅ Server Actions実装（createShortUrl, getUrlTrackingStats）
6. ✅ Edge Function実装（process-url-click）
7. ✅ `/l/[shortCode]` リダイレクトページ作成

### 7.5 Phase 6-5: カスタムレポート実装（4時間）

**タスク**:
1. ✅ `/dashboard/analytics/reports/page.tsx` 作成
2. ✅ レポート一覧表示実装
3. ✅ レポート作成/編集ダイアログ実装
4. ✅ スケジュール設定UI実装
5. ✅ Server Actions実装（createCustomReport, executeCustomReport）
6. ✅ Edge Function実装（generate-report）
7. ✅ PDF/CSVエクスポート実装

### 7.6 Phase 6-6: Edge Functions実装（3時間）

**タスク**:
1. ✅ aggregate-analytics 実装
2. ✅ process-url-click 実装
3. ✅ generate-report 実装
4. ✅ Cron設定（supabase.yml）
5. ✅ デプロイ・動作確認

### 7.7 Phase 6-7: テスト・最適化（2時間）

**タスク**:
1. ✅ 各画面の動作確認
2. ✅ パフォーマンステスト（1万イベント）
3. ✅ エラーハンドリング確認
4. ✅ レスポンシブデザイン確認
5. ✅ アクセシビリティチェック

---

## 📋 8. チェックリスト

### 8.1 データベース
- [ ] analytics_events テーブル作成完了
- [ ] analytics_reports テーブル作成完了
- [ ] url_tracking テーブル作成完了
- [ ] url_clicks テーブル作成完了
- [ ] custom_reports テーブル作成完了
- [ ] custom_report_executions テーブル作成完了
- [ ] 全インデックス作成完了
- [ ] RLSポリシー設定完了
- [ ] Materialized Views作成完了

### 8.2 画面実装
- [ ] アナリティクスダッシュボード完成
- [ ] クロス分析画面完成
- [ ] URL計測画面完成
- [ ] カスタムレポート画面完成

### 8.3 機能実装
- [ ] KPI表示機能
- [ ] 時系列グラフ表示
- [ ] 期間選択機能
- [ ] セグメント別分析
- [ ] クロス分析機能
- [ ] URL短縮生成
- [ ] URLクリックトラッキング
- [ ] カスタムレポート作成
- [ ] レポート自動実行
- [ ] PDF/CSVエクスポート
- [ ] メール送信機能

### 8.4 Edge Functions
- [ ] aggregate-analytics 実装完了
- [ ] process-url-click 実装完了
- [ ] generate-report 実装完了
- [ ] Cron設定完了
- [ ] 全関数デプロイ完了

### 8.5 テスト
- [ ] ダッシュボード表示テスト
- [ ] クロス分析実行テスト
- [ ] URL短縮作成テスト
- [ ] URLクリック動作テスト
- [ ] レポート生成テスト
- [ ] パフォーマンステスト
- [ ] レスポンシブデザインテスト

---

## 🎯 9. 成功指標

### 9.1 機能完成度
- ✅ 4画面すべて実装完了
- ✅ 主要KPI表示機能動作
- ✅ チャート表示正常動作
- ✅ URL計測機能動作
- ✅ カスタムレポート生成動作

### 9.2 パフォーマンス
- ダッシュボード初期表示: <2秒
- チャートレンダリング: <1秒
- URL リダイレクト: <100ms
- レポート生成: <2分

### 9.3 データ整合性
- イベントログ記録率: 100%
- 集計データ精度: 100%
- URL クリック追跡率: >95%

---

## 📚 10. 参考資料

### 10.1 公式ドキュメント
- [Recharts Documentation](https://recharts.org/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### 10.2 関連ドキュメント
- `/claudedocs/REQUIREMENTS_V2.md` - 全体要件
- `/claudedocs/implementation_todo_v2.md` - 実装TODO
- `/claudedocs/supabase_architecture.md` - データベース設計

---

**Phase 6要件分析完了**

このドキュメントに基づいて実装を開始してください。
各フェーズの詳細実装コードは、実装時にClaude Codeが生成します。

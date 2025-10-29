# Phase 5: 予約管理システム完全実装計画書

**作成日**: 2025-10-30
**対象フェーズ**: Phase 5 - Reservation Management
**技術スタック**: Next.js 16 + React 19 + TypeScript + Supabase + shadcn/ui
**実装期間**: 2週間（Week 8-9）

---

## 目次

1. [概要](#1-概要)
2. [機能要件](#2-機能要件)
3. [データベース設計](#3-データベース設計)
4. [画面設計](#4-画面設計)
5. [API設計](#5-api設計)
6. [Edge Functions設計](#6-edge-functions設計)
7. [実装優先順位](#7-実装優先順位)
8. [実装手順](#8-実装手順)

---

## 1. 概要

### 1.1 Phase 5の目的

L MessageのReservation Management機能を実装し、以下の3つの予約タイプに対応する：

1. **イベント予約** - セミナー、ワークショップ等の定員制イベント
2. **レッスン予約** - 習い事、レッスン等の時間枠選択型予約
3. **サロン予約** - 美容室、サロン等のスタッフ選択型予約

### 1.2 主要機能

- 予約タイプの作成・管理（CRUD）
- 予約枠の設定（単発・繰り返し対応）
- 公開予約フォーム（認証不要）
- 予約確認メッセージ（LINE通知）
- 自動リマインダー送信（24時間前、1時間前）
- 予約キャンセル・変更処理
- カレンダービュー表示

### 1.3 技術的特徴

- **マルチテナント対応**: organization_id ベースのRLS
- **リアルタイム更新**: Supabase Realtime で予約状況を同期
- **Edge Functions**: 自動リマインダー送信（Cron）
- **公開URL**: 認証不要の予約フォーム（`/r/[typeId]`）
- **Heroicons使用**: 絵文字禁止、アイコンライブラリ使用

---

## 2. 機能要件

### 2.1 予約タイプ管理（Reservation Types）

#### 2.1.1 イベント予約（Event）

**特徴**:
- 日時・場所が固定
- 定員設定あり
- 参加者リスト管理
- キャンセル待ち機能

**設定項目**:
```typescript
{
  type: 'event',
  name: 'マーケティングセミナー',
  description: 'SNSマーケティングの基礎を学ぶ',
  location: '東京都渋谷区〇〇ビル 3F',
  date: '2025-11-15T14:00:00+09:00',
  duration_minutes: 120,
  capacity: 50,
  price: 3000,
  reminder_settings: {
    enabled: true,
    send_at: ['24h', '1h'] // 24時間前、1時間前
  }
}
```

#### 2.1.2 レッスン予約（Lesson）

**特徴**:
- 繰り返しスケジュール対応
- 時間枠選択型
- 講師アサイン可能
- レッスンメニュー管理

**設定項目**:
```typescript
{
  type: 'lesson',
  name: '英会話レッスン',
  description: 'マンツーマン英会話（初級〜上級）',
  duration_minutes: 60,
  price: 5000,
  schedule: {
    type: 'recurring', // 'single' or 'recurring'
    days_of_week: [1, 3, 5], // 月・水・金
    time_slots: [
      { start: '10:00', end: '11:00' },
      { start: '14:00', end: '15:00' },
      { start: '16:00', end: '17:00' }
    ]
  },
  instructor_id: 'uuid',
  capacity_per_slot: 1
}
```

#### 2.1.3 サロン予約（Salon）

**特徴**:
- スタッフ選択型
- メニュー選択
- 時間枠の自動計算
- 顧客カルテ管理

**設定項目**:
```typescript
{
  type: 'salon',
  name: 'カット＆カラー',
  description: 'カット、カラーリング、トリートメント',
  menus: [
    { id: 'cut', name: 'カット', duration_minutes: 60, price: 5000 },
    { id: 'color', name: 'カラー', duration_minutes: 90, price: 8000 },
    { id: 'treatment', name: 'トリートメント', duration_minutes: 30, price: 3000 }
  ],
  staff: [
    { id: 'uuid1', name: '山田太郎', specialties: ['cut', 'color'] },
    { id: 'uuid2', name: '佐藤花子', specialties: ['color', 'treatment'] }
  ],
  schedule: {
    type: 'custom', // スタッフごとに異なる
    business_hours: {
      start: '09:00',
      end: '19:00',
      break_time: { start: '12:00', end: '13:00' }
    }
  }
}
```

### 2.2 予約フォーム（Public Booking Form）

#### 2.2.1 認証不要のアクセス

- URL形式: `https://lme-saas.vercel.app/r/[typeId]`
- 短縮URL対応: `https://lme.link/abc123`
- LINE LIFF統合（オプション）

#### 2.2.2 フォーム項目

**必須項目**:
- 氏名
- 電話番号
- メールアドレス
- 予約日時選択

**オプション項目**:
- 備考・要望
- カスタムフィールド（予約タイプごと）
- LINE友だち追加（チェックボックス）

#### 2.2.3 予約確認フロー

```
1. フォーム入力
   ↓
2. 空き状況確認
   ↓
3. 予約仮登録
   ↓
4. 確認メール/LINE送信
   ↓
5. 確認リンククリック
   ↓
6. 予約確定
```

### 2.3 リマインダー機能

#### 2.3.1 送信タイミング

- **24時間前**: 予約の前日、同時刻に送信
- **1時間前**: 予約の1時間前に送信
- **カスタム**: 予約タイプごとに設定可能

#### 2.3.2 送信チャネル

- LINE（Push Message）
- メール（オプション）
- SMS（オプション、有料プラン）

#### 2.3.3 メッセージテンプレート

```
【予約リマインダー】

{customer_name} 様

ご予約の確認です。

予約内容: {reservation_type_name}
日時: {reservation_date} {reservation_time}
場所: {location}

キャンセルの場合は、以下のリンクからお手続きください。
{cancellation_url}

お待ちしております。
```

### 2.4 予約管理機能

#### 2.4.1 予約一覧

- フィルタ: ステータス、日付範囲、予約タイプ
- ソート: 予約日時、作成日時、顧客名
- 検索: 顧客名、電話番号、メールアドレス
- 一括操作: ステータス変更、削除、CSVエクスポート

#### 2.4.2 予約詳細

- 予約情報の表示・編集
- 顧客情報の表示・編集
- メッセージ送信（個別）
- キャンセル・変更処理
- 履歴表示

#### 2.4.3 カレンダービュー

- 月表示・週表示・日表示
- ドラッグ&ドロップで予約変更
- 予約枠の空き状況表示
- 色分け（予約タイプ、ステータス）

---

## 3. データベース設計

### 3.1 テーブル構成

#### 3.1.1 reservation_types（予約タイプマスター）

```sql
CREATE TABLE reservation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- 基本情報
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('event', 'lesson', 'salon')),

  -- 表示設定
  image_url TEXT,
  color TEXT DEFAULT '#3B82F6',

  -- 予約設定
  settings JSONB NOT NULL DEFAULT '{}', -- type別の設定（JSON）

  -- 料金設定
  price INTEGER DEFAULT 0, -- 円
  currency TEXT DEFAULT 'JPY',

  -- 公開設定
  is_public BOOLEAN DEFAULT true,
  public_url_slug TEXT UNIQUE, -- 短縮URL用（例: "abc123"）

  -- ステータス
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive')),

  -- タイムスタンプ
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservation_types_org ON reservation_types(organization_id);
CREATE INDEX idx_reservation_types_slug ON reservation_types(public_url_slug);
CREATE INDEX idx_reservation_types_status ON reservation_types(status);
```

**settings JSONB構造例（Event）**:
```json
{
  "location": "東京都渋谷区〇〇ビル 3F",
  "date": "2025-11-15T14:00:00+09:00",
  "duration_minutes": 120,
  "capacity": 50,
  "reminder_settings": {
    "enabled": true,
    "send_at": ["24h", "1h"]
  },
  "cancellation_policy": "3日前まで無料、以降50%キャンセル料",
  "custom_fields": [
    {
      "id": "dietary_restrictions",
      "label": "食事制限",
      "type": "select",
      "options": ["なし", "ベジタリアン", "ヴィーガン"],
      "required": false
    }
  ]
}
```

**settings JSONB構造例（Lesson）**:
```json
{
  "duration_minutes": 60,
  "schedule": {
    "type": "recurring",
    "days_of_week": [1, 3, 5],
    "time_slots": [
      { "start": "10:00", "end": "11:00" },
      { "start": "14:00", "end": "15:00" }
    ]
  },
  "instructor_id": "uuid",
  "capacity_per_slot": 1,
  "reminder_settings": {
    "enabled": true,
    "send_at": ["1h"]
  }
}
```

**settings JSONB構造例（Salon）**:
```json
{
  "menus": [
    { "id": "cut", "name": "カット", "duration_minutes": 60, "price": 5000 },
    { "id": "color", "name": "カラー", "duration_minutes": 90, "price": 8000 }
  ],
  "staff": [
    { "id": "uuid1", "name": "山田太郎", "specialties": ["cut", "color"] }
  ],
  "schedule": {
    "type": "custom",
    "business_hours": { "start": "09:00", "end": "19:00" }
  },
  "buffer_minutes": 15
}
```

#### 3.1.2 reservation_slots（予約枠）

```sql
CREATE TABLE reservation_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_type_id UUID NOT NULL REFERENCES reservation_types(id) ON DELETE CASCADE,

  -- 日時設定
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- 定員管理
  capacity INTEGER NOT NULL DEFAULT 1,
  booked_count INTEGER NOT NULL DEFAULT 0,

  -- スタッフ（Salon用）
  staff_id UUID, -- サロン予約の場合のスタッフID（任意）

  -- ステータス
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'blocked')),

  -- メモ
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_booked_count CHECK (booked_count <= capacity)
);

CREATE INDEX idx_reservation_slots_type ON reservation_slots(reservation_type_id);
CREATE INDEX idx_reservation_slots_time ON reservation_slots(start_time, end_time);
CREATE INDEX idx_reservation_slots_status ON reservation_slots(status);
CREATE INDEX idx_reservation_slots_staff ON reservation_slots(staff_id) WHERE staff_id IS NOT NULL;
```

#### 3.1.3 reservations（予約実績）

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reservation_type_id UUID NOT NULL REFERENCES reservation_types(id) ON DELETE CASCADE,
  reservation_slot_id UUID NOT NULL REFERENCES reservation_slots(id) ON DELETE CASCADE,

  -- 顧客情報
  line_friend_id UUID REFERENCES line_friends(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,

  -- 予約内容
  selected_menus JSONB, -- サロン予約の場合の選択メニュー
  notes TEXT,
  custom_data JSONB DEFAULT '{}', -- カスタムフィールドの回答

  -- ステータス
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),

  -- 料金
  total_price INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),

  -- リマインダー
  reminder_sent_at TIMESTAMPTZ,

  -- 確認・キャンセル
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- メタデータ
  source TEXT DEFAULT 'web', -- 'web', 'line', 'admin'
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservations_org ON reservations(organization_id);
CREATE INDEX idx_reservations_type ON reservations(reservation_type_id);
CREATE INDEX idx_reservations_slot ON reservations(reservation_slot_id);
CREATE INDEX idx_reservations_friend ON reservations(line_friend_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_created ON reservations(created_at DESC);
CREATE INDEX idx_reservations_customer ON reservations(customer_name, customer_email, customer_phone);
```

#### 3.1.4 reservation_reminders（リマインダー送信履歴）

```sql
CREATE TABLE reservation_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,

  -- 送信設定
  scheduled_at TIMESTAMPTZ NOT NULL, -- 送信予定日時
  sent_at TIMESTAMPTZ, -- 実際の送信日時

  -- 送信内容
  channel TEXT NOT NULL CHECK (channel IN ('line', 'email', 'sms')),
  message_content JSONB NOT NULL,

  -- ステータス
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservation_reminders_reservation ON reservation_reminders(reservation_id);
CREATE INDEX idx_reservation_reminders_scheduled ON reservation_reminders(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_reservation_reminders_status ON reservation_reminders(status);
```

### 3.2 RLS（Row Level Security）ポリシー

```sql
-- ========================================
-- reservation_types: 組織単位でアクセス制御
-- ========================================
ALTER TABLE reservation_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reservation types in their organization"
ON reservation_types FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can create reservation types in their organization"
ON reservation_types FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can update reservation types in their organization"
ON reservation_types FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete reservation types in their organization"
ON reservation_types FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT uo.organization_id
    FROM user_organizations uo
    WHERE uo.user_id = auth.uid()
    AND uo.role IN ('owner', 'admin')
  )
);

-- ========================================
-- reservation_slots: 予約タイプ経由でアクセス制御
-- ========================================
ALTER TABLE reservation_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reservation slots in their organization"
ON reservation_slots FOR SELECT
TO authenticated
USING (
  reservation_type_id IN (
    SELECT id
    FROM reservation_types
    WHERE organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Members can manage reservation slots in their organization"
ON reservation_slots FOR ALL
TO authenticated
USING (
  reservation_type_id IN (
    SELECT id
    FROM reservation_types
    WHERE organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  )
);

-- ========================================
-- reservations: 組織単位でアクセス制御
-- ========================================
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reservations in their organization"
ON reservations FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can manage reservations in their organization"
ON reservations FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

-- ========================================
-- 公開予約フォーム用ポリシー（認証不要）
-- ========================================
CREATE POLICY "Anyone can view public reservation types"
ON reservation_types FOR SELECT
TO anon
USING (is_public = true AND status = 'active');

CREATE POLICY "Anyone can view available reservation slots"
ON reservation_slots FOR SELECT
TO anon
USING (
  status = 'available' AND
  reservation_type_id IN (
    SELECT id
    FROM reservation_types
    WHERE is_public = true AND status = 'active'
  )
);

CREATE POLICY "Anyone can create reservations"
ON reservations FOR INSERT
TO anon
WITH CHECK (
  reservation_type_id IN (
    SELECT id
    FROM reservation_types
    WHERE is_public = true AND status = 'active'
  )
);
```

### 3.3 トリガー・関数

#### 3.3.1 予約枠の空き状況自動更新

```sql
-- ========================================
-- 予約作成時に booked_count を増やす
-- ========================================
CREATE OR REPLACE FUNCTION increment_slot_booked_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reservation_slots
  SET
    booked_count = booked_count + 1,
    status = CASE
      WHEN booked_count + 1 >= capacity THEN 'full'
      ELSE 'available'
    END
  WHERE id = NEW.reservation_slot_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reservation_created
  AFTER INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.status IN ('pending', 'confirmed'))
  EXECUTE FUNCTION increment_slot_booked_count();

-- ========================================
-- 予約キャンセル時に booked_count を減らす
-- ========================================
CREATE OR REPLACE FUNCTION decrement_slot_booked_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IN ('pending', 'confirmed') AND NEW.status = 'cancelled' THEN
    UPDATE reservation_slots
    SET
      booked_count = booked_count - 1,
      status = CASE
        WHEN booked_count - 1 < capacity THEN 'available'
        ELSE status
      END
    WHERE id = NEW.reservation_slot_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reservation_cancelled
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION decrement_slot_booked_count();
```

#### 3.3.2 リマインダー自動作成

```sql
-- ========================================
-- 予約確定時にリマインダーを自動作成
-- ========================================
CREATE OR REPLACE FUNCTION create_reservation_reminders()
RETURNS TRIGGER AS $$
DECLARE
  slot_start_time TIMESTAMPTZ;
  reminder_settings JSONB;
  reminder_time TEXT;
BEGIN
  -- 予約枠の開始時刻を取得
  SELECT start_time INTO slot_start_time
  FROM reservation_slots
  WHERE id = NEW.reservation_slot_id;

  -- 予約タイプのリマインダー設定を取得
  SELECT settings->'reminder_settings' INTO reminder_settings
  FROM reservation_types
  WHERE id = NEW.reservation_type_id;

  -- リマインダーが有効な場合のみ作成
  IF reminder_settings->>'enabled' = 'true' THEN
    -- 各リマインダー時刻に対してレコード作成
    FOR reminder_time IN SELECT jsonb_array_elements_text(reminder_settings->'send_at')
    LOOP
      INSERT INTO reservation_reminders (
        reservation_id,
        scheduled_at,
        channel,
        message_content,
        status
      ) VALUES (
        NEW.id,
        CASE
          WHEN reminder_time = '24h' THEN slot_start_time - INTERVAL '24 hours'
          WHEN reminder_time = '1h' THEN slot_start_time - INTERVAL '1 hour'
          WHEN reminder_time = '3h' THEN slot_start_time - INTERVAL '3 hours'
          ELSE slot_start_time - INTERVAL '1 hour' -- デフォルト
        END,
        'line',
        jsonb_build_object(
          'type', 'reminder',
          'reservation_id', NEW.id,
          'reminder_type', reminder_time
        ),
        'pending'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reservation_confirmed
  AFTER INSERT OR UPDATE ON reservations
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION create_reservation_reminders();
```

---

## 4. 画面設計

### 4.1 管理画面（Dashboard）

#### 4.1.1 予約一覧（/dashboard/reservations）

**レイアウト**:
```tsx
<PageHeader
  title="予約管理"
  description="すべての予約を管理"
  actions={
    <>
      <Button variant="outline" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        CSVエクスポート
      </Button>
      <Button onClick={() => router.push('/dashboard/reservations/types/new')}>
        <Plus className="h-4 w-4 mr-2" />
        予約タイプを作成
      </Button>
    </>
  }
/>

<Tabs defaultValue="list">
  <TabsList>
    <TabsTrigger value="list">
      <List className="h-4 w-4 mr-2" />
      リスト
    </TabsTrigger>
    <TabsTrigger value="calendar">
      <Calendar className="h-4 w-4 mr-2" />
      カレンダー
    </TabsTrigger>
  </TabsList>

  <TabsContent value="list">
    {/* フィルター */}
    <div className="flex gap-2 mb-4">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="ステータス" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="pending">保留中</SelectItem>
          <SelectItem value="confirmed">確定</SelectItem>
          <SelectItem value="cancelled">キャンセル</SelectItem>
          <SelectItem value="completed">完了</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {dateRange.from ? format(dateRange.from, 'PPP') : '日付範囲'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
          />
        </PopoverContent>
      </Popover>

      <Input
        placeholder="顧客名、メール、電話番号で検索..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />
    </div>

    {/* 予約テーブル */}
    <ReservationsTable
      data={filteredReservations}
      onRowClick={handleRowClick}
      onStatusChange={handleStatusChange}
    />
  </TabsContent>

  <TabsContent value="calendar">
    <ReservationCalendar
      reservations={reservations}
      onDateClick={handleDateClick}
      onReservationClick={handleReservationClick}
    />
  </TabsContent>
</Tabs>
```

**使用コンポーネント**:
- `PageHeader` - ヘッダー
- `Tabs` - リスト/カレンダー切り替え
- `Select` - ステータスフィルター
- `Calendar` - 日付範囲選択
- `Input` - 検索
- `ReservationsTable` - 予約一覧テーブル（TanStack Table）
- `ReservationCalendar` - カレンダービュー

#### 4.1.2 予約タイプ管理（/dashboard/reservations/types）

**レイアウト**:
```tsx
<PageHeader
  title="予約タイプ管理"
  description="イベント、レッスン、サロンの予約タイプを管理"
  actions={
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          予約タイプを作成
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleCreate('event')}>
          <Calendar className="h-4 w-4 mr-2" />
          イベント予約
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCreate('lesson')}>
          <BookOpen className="h-4 w-4 mr-2" />
          レッスン予約
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCreate('salon')}>
          <Scissors className="h-4 w-4 mr-2" />
          サロン予約
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  }
/>

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {reservationTypes.map((type) => (
    <Card key={type.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant={type.type === 'event' ? 'default' : type.type === 'lesson' ? 'secondary' : 'outline'}>
            {type.type === 'event' ? 'イベント' : type.type === 'lesson' ? 'レッスン' : 'サロン'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(type.id)}>
                <Edit className="h-4 w-4 mr-2" />
                編集
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(type.id)}>
                <Copy className="h-4 w-4 mr-2" />
                複製
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopyUrl(type.public_url_slug)}>
                <Link className="h-4 w-4 mr-2" />
                URLをコピー
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(type.id)}
                className="text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle>{type.name}</CardTitle>
        <CardDescription>{type.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">料金</span>
            <span className="font-medium">{type.price.toLocaleString()}円</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">予約数</span>
            <span className="font-medium">{type.reservation_count}件</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ステータス</span>
            <Badge variant={type.status === 'active' ? 'success' : 'secondary'}>
              {type.status === 'active' ? '公開中' : '非公開'}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => router.push(`/r/${type.public_url_slug}`)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          予約フォームを表示
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>
```

#### 4.1.3 予約タイプ作成・編集（/dashboard/reservations/types/new）

**レイアウト（Event例）**:
```tsx
<PageHeader
  title="イベント予約を作成"
  description="セミナー、ワークショップ等の予約を受け付ける"
/>

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
    {/* 基本情報 */}
    <Card>
      <CardHeader>
        <CardTitle>基本情報</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>イベント名</FormLabel>
              <FormControl>
                <Input placeholder="マーケティングセミナー" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="イベントの詳細を入力してください"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>サムネイル画像</FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value}
                  onChange={field.onChange}
                  aspectRatio={16 / 9}
                />
              </FormControl>
              <FormDescription>
                推奨サイズ: 1200×675px（16:9）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>

    {/* 日時・場所 */}
    <Card>
      <CardHeader>
        <CardTitle>日時・場所</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>開催日時</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline">
                      {field.value ? format(field.value, 'PPP HH:mm') : '日時を選択'}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={field.value ? format(field.value, 'HH:mm') : ''}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':')
                        const newDate = new Date(field.value)
                        newDate.setHours(parseInt(hours), parseInt(minutes))
                        field.onChange(newDate)
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>所要時間（分）</FormLabel>
              <FormControl>
                <Input type="number" min={15} step={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>会場</FormLabel>
              <FormControl>
                <Input placeholder="東京都渋谷区〇〇ビル 3F" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>

    {/* 定員・料金 */}
    <Card>
      <CardHeader>
        <CardTitle>定員・料金</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>定員</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormDescription>
                最大参加人数を設定してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>参加費（円）</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={100} {...field} />
              </FormControl>
              <FormDescription>
                無料の場合は0円と入力してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>

    {/* リマインダー設定 */}
    <Card>
      <CardHeader>
        <CardTitle>リマインダー設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="reminder_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  リマインダーを送信
                </FormLabel>
                <FormDescription>
                  予約者に自動でリマインダーを送信します
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch('reminder_enabled') && (
          <FormField
            control={form.control}
            name="reminder_timings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>送信タイミング</FormLabel>
                <div className="space-y-2">
                  {['24h', '3h', '1h'].map((timing) => (
                    <div key={timing} className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value?.includes(timing)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), timing])
                          } else {
                            field.onChange(field.value?.filter((t) => t !== timing))
                          }
                        }}
                      />
                      <label className="text-sm">
                        {timing === '24h' && '24時間前'}
                        {timing === '3h' && '3時間前'}
                        {timing === '1h' && '1時間前'}
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>

    {/* 公開設定 */}
    <Card>
      <CardHeader>
        <CardTitle>公開設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  予約フォームを公開
                </FormLabel>
                <FormDescription>
                  予約フォームのURLを共有できます
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch('is_public') && (
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">予約フォームURL</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyUrl}
              >
                <Copy className="h-4 w-4 mr-2" />
                コピー
              </Button>
            </div>
            <p className="text-sm text-muted-foreground break-all">
              {`${process.env.NEXT_PUBLIC_APP_URL}/r/${publicUrlSlug}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>

    {/* 送信ボタン */}
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={() => router.back()}>
        キャンセル
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '作成中...' : '予約タイプを作成'}
      </Button>
    </div>
  </form>
</Form>
```

#### 4.1.4 カレンダービュー（/dashboard/reservations/calendar）

**レイアウト**:
```tsx
<PageHeader
  title="予約カレンダー"
  description="カレンダー形式で予約状況を確認"
  actions={
    <div className="flex gap-2">
      <Select value={viewMode} onValueChange={setViewMode}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">月表示</SelectItem>
          <SelectItem value="week">週表示</SelectItem>
          <SelectItem value="day">日表示</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleToday}>
        今日
      </Button>

      <div className="flex">
        <Button variant="outline" size="icon" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  }
/>

<div className="flex gap-4">
  {/* 左: カレンダー */}
  <div className="flex-1">
    <ReservationCalendar
      view={viewMode}
      date={currentDate}
      reservations={reservations}
      onEventClick={handleEventClick}
      onDateClick={handleDateClick}
      onEventDrop={handleEventDrop}
    />
  </div>

  {/* 右: 詳細パネル */}
  <Card className="w-80">
    <CardHeader>
      <CardTitle>予約詳細</CardTitle>
    </CardHeader>
    <CardContent>
      {selectedReservation ? (
        <ReservationDetail reservation={selectedReservation} />
      ) : (
        <EmptyState
          title="予約を選択"
          description="カレンダーから予約をクリックしてください"
          icon={<CalendarIcon className="h-12 w-12 text-muted-foreground" />}
        />
      )}
    </CardContent>
  </Card>
</div>
```

**使用ライブラリ**:
- `react-big-calendar` or `@fullcalendar/react`（推奨）

#### 4.1.5 予約設定（/dashboard/reservations/settings）

**レイアウト**:
```tsx
<PageHeader
  title="予約設定"
  description="予約システムの全体設定"
/>

<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">一般設定</TabsTrigger>
    <TabsTrigger value="notifications">通知設定</TabsTrigger>
    <TabsTrigger value="advanced">高度な設定</TabsTrigger>
  </TabsList>

  <TabsContent value="general">
    <Card>
      <CardHeader>
        <CardTitle>一般設定</CardTitle>
        <CardDescription>
          予約システムの基本的な設定
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 設定項目 */}
      </CardContent>
    </Card>
  </TabsContent>

  <TabsContent value="notifications">
    <Card>
      <CardHeader>
        <CardTitle>通知設定</CardTitle>
        <CardDescription>
          予約時・キャンセル時の通知設定
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 通知設定項目 */}
      </CardContent>
    </Card>
  </TabsContent>

  <TabsContent value="advanced">
    <Card>
      <CardHeader>
        <CardTitle>高度な設定</CardTitle>
        <CardDescription>
          キャンセルポリシー、カスタムフィールド等
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 高度な設定項目 */}
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>
```

### 4.2 公開予約フォーム（/r/[typeId]）

**特徴**:
- 認証不要でアクセス可能
- モバイルファースト設計
- シンプルなステップ形式

**レイアウト**:
```tsx
// app/r/[typeId]/page.tsx (認証不要ページ)
export default async function PublicReservationPage({
  params,
}: {
  params: { typeId: string }
}) {
  const reservationType = await getPublicReservationType(params.typeId)

  if (!reservationType) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          {reservationType.image_url && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
              <Image
                src={reservationType.image_url}
                alt={reservationType.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2">{reservationType.name}</h1>
          <p className="text-muted-foreground">{reservationType.description}</p>
        </div>

        {/* 予約フォーム */}
        <Card>
          <CardContent className="pt-6">
            <ReservationForm reservationType={reservationType} />
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Powered by L Message
        </div>
      </div>
    </div>
  )
}
```

**予約フォーム（ステップ形式）**:
```tsx
// components/reservation/reservation-form.tsx
'use client'

export function ReservationForm({ reservationType }: { reservationType: ReservationType }) {
  const [step, setStep] = useState(1)

  return (
    <div className="space-y-6">
      {/* ステップインジケーター */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  'h-1 w-16 mx-2',
                  step > s ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* ステップ1: 日時選択 */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">日時を選択</h2>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => !hasAvailableSlots(date)}
          />

          {selectedDate && (
            <div className="space-y-2">
              <Label>時間を選択</Label>
              <RadioGroup value={selectedSlotId} onValueChange={setSelectedSlotId}>
                {availableSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={slot.id} id={slot.id} />
                    <Label htmlFor={slot.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>{format(slot.start_time, 'HH:mm')} 〜 {format(slot.end_time, 'HH:mm')}</span>
                        <Badge variant={slot.capacity - slot.booked_count <= 3 ? 'warning' : 'default'}>
                          残り{slot.capacity - slot.booked_count}枠
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => setStep(2)}
            disabled={!selectedSlotId}
          >
            次へ
          </Button>
        </div>
      )}

      {/* ステップ2: 情報入力 */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">お客様情報</h2>

          <div className="space-y-2">
            <Label htmlFor="name">お名前 *</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="山田太郎"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス *</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">電話番号 *</Label>
            <Input
              id="phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="090-1234-5678"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ご要望等ございましたらご記入ください"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              戻る
            </Button>
            <Button
              className="flex-1"
              onClick={() => setStep(3)}
              disabled={!customerName || !customerEmail || !customerPhone}
            >
              次へ
            </Button>
          </div>
        </div>
      )}

      {/* ステップ3: 確認 */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">予約内容の確認</h2>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">予約内容</span>
                <span className="font-medium">{reservationType.name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">日時</span>
                <span className="font-medium">
                  {selectedSlot && format(selectedSlot.start_time, 'PPP HH:mm')}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">お名前</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">メールアドレス</span>
                <span className="font-medium">{customerEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">電話番号</span>
                <span className="font-medium">{customerPhone}</span>
              </div>
              {notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">備考</span>
                    <p className="mt-1">{notes}</p>
                  </div>
                </>
              )}
              {reservationType.price > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">料金</span>
                    <span className="text-2xl font-bold">
                      {reservationType.price.toLocaleString()}円
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>キャンセルポリシー</AlertTitle>
            <AlertDescription>
              {reservationType.settings.cancellation_policy ||
                '予約確定後のキャンセルは3日前まで無料です。'}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              戻る
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '予約中...' : '予約を確定'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 5. API設計（Server Actions）

### 5.1 予約タイプ操作

#### 5.1.1 予約タイプ作成

```typescript
// app/dashboard/reservations/types/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createReservationTypeSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  description: z.string().optional(),
  type: z.enum(['event', 'lesson', 'salon']),
  price: z.number().min(0),
  settings: z.record(z.any()),
  is_public: z.boolean().default(true),
})

export async function createReservationType(formData: FormData) {
  const supabase = await createClient()

  // ユーザー・組織情報を取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!userData) throw new Error('User not found')

  // フォームデータを検証
  const validatedFields = createReservationTypeSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    type: formData.get('type'),
    price: Number(formData.get('price')),
    settings: JSON.parse(formData.get('settings') as string),
    is_public: formData.get('is_public') === 'true',
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, description, type, price, settings, is_public } = validatedFields.data

  // 短縮URL用のスラッグを生成
  const public_url_slug = generateRandomSlug()

  // 予約タイプを作成
  const { data, error } = await supabase
    .from('reservation_types')
    .insert({
      organization_id: userData.organization_id,
      name,
      description,
      type,
      price,
      settings,
      is_public,
      public_url_slug,
      created_by: user.id,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  // イベント予約の場合、予約枠を自動作成
  if (type === 'event' && settings.date) {
    await supabase
      .from('reservation_slots')
      .insert({
        reservation_type_id: data.id,
        start_time: settings.date,
        end_time: new Date(new Date(settings.date).getTime() + settings.duration_minutes * 60000).toISOString(),
        capacity: settings.capacity || 1,
        status: 'available',
      })
  }

  revalidatePath('/dashboard/reservations/types')
  return { data }
}

function generateRandomSlug(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < length; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)]
  }
  return slug
}
```

#### 5.1.2 予約タイプ更新

```typescript
// app/dashboard/reservations/types/[id]/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateReservationType(
  id: string,
  updates: Partial<ReservationType>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservation_types')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  revalidatePath('/dashboard/reservations/types')
  revalidatePath(`/dashboard/reservations/types/${id}`)
  return { data }
}
```

#### 5.1.3 予約タイプ削除

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteReservationType(id: string) {
  const supabase = await createClient()

  // 予約が存在する場合は削除不可
  const { count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('reservation_type_id', id)
    .in('status', ['pending', 'confirmed'])

  if (count && count > 0) {
    return {
      errors: {
        _form: ['予約が存在するため削除できません。予約をキャンセルしてから削除してください。'],
      },
    }
  }

  const { error } = await supabase
    .from('reservation_types')
    .delete()
    .eq('id', id)

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  revalidatePath('/dashboard/reservations/types')
  return { success: true }
}
```

### 5.2 予約枠操作

#### 5.2.1 予約枠の一括作成（レッスン・サロン用）

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { addDays, setHours, setMinutes, format } from 'date-fns'

export async function generateReservationSlots(
  reservationTypeId: string,
  startDate: Date,
  endDate: Date
) {
  const supabase = await createClient()

  // 予約タイプを取得
  const { data: reservationType } = await supabase
    .from('reservation_types')
    .select('settings')
    .eq('id', reservationTypeId)
    .single()

  if (!reservationType) {
    return { errors: { _form: ['予約タイプが見つかりません'] } }
  }

  const { schedule, duration_minutes } = reservationType.settings
  const slots: any[] = []

  let currentDate = startDate
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()

    // 指定曜日のみ処理
    if (schedule.days_of_week?.includes(dayOfWeek)) {
      for (const timeSlot of schedule.time_slots || []) {
        const [startHour, startMinute] = timeSlot.start.split(':').map(Number)
        const [endHour, endMinute] = timeSlot.end.split(':').map(Number)

        const slotStart = setMinutes(setHours(currentDate, startHour), startMinute)
        const slotEnd = setMinutes(setHours(currentDate, endHour), endMinute)

        slots.push({
          reservation_type_id: reservationTypeId,
          start_time: slotStart.toISOString(),
          end_time: slotEnd.toISOString(),
          capacity: schedule.capacity_per_slot || 1,
          status: 'available',
        })
      }
    }

    currentDate = addDays(currentDate, 1)
  }

  // 一括挿入
  const { data, error } = await supabase
    .from('reservation_slots')
    .insert(slots)
    .select()

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  return { data }
}
```

### 5.3 予約操作

#### 5.3.1 予約作成（公開フォーム用）

```typescript
// app/r/[typeId]/actions.ts
'use server'

import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'

const createReservationSchema = z.object({
  reservation_slot_id: z.string().uuid(),
  customer_name: z.string().min(1, '名前は必須です'),
  customer_email: z.string().email('有効なメールアドレスを入力してください'),
  customer_phone: z.string().min(10, '有効な電話番号を入力してください'),
  notes: z.string().optional(),
})

export async function createPublicReservation(
  reservationTypeId: string,
  formData: FormData
) {
  const supabase = createClient()

  // フォームデータを検証
  const validatedFields = createReservationSchema.safeParse({
    reservation_slot_id: formData.get('reservation_slot_id'),
    customer_name: formData.get('customer_name'),
    customer_email: formData.get('customer_email'),
    customer_phone: formData.get('customer_phone'),
    notes: formData.get('notes'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const {
    reservation_slot_id,
    customer_name,
    customer_email,
    customer_phone,
    notes,
  } = validatedFields.data

  // 予約枠の空き状況を確認
  const { data: slot } = await supabase
    .from('reservation_slots')
    .select('capacity, booked_count')
    .eq('id', reservation_slot_id)
    .single()

  if (!slot || slot.booked_count >= slot.capacity) {
    return {
      errors: {
        _form: ['申し訳ございません。この時間は既に満席です。他の時間をお選びください。'],
      },
    }
  }

  // 予約タイプから organization_id を取得
  const { data: reservationType } = await supabase
    .from('reservation_types')
    .select('organization_id, price')
    .eq('id', reservationTypeId)
    .single()

  if (!reservationType) {
    return { errors: { _form: ['予約タイプが見つかりません'] } }
  }

  // 予約を作成
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      organization_id: reservationType.organization_id,
      reservation_type_id: reservationTypeId,
      reservation_slot_id,
      customer_name,
      customer_email,
      customer_phone,
      notes,
      total_price: reservationType.price,
      status: 'pending', // 後で確認メール経由で confirmed に変更
      source: 'web',
    })
    .select()
    .single()

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  // 確認メール送信（Edge Function経由）
  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-reservation-confirmation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reservation_id: data.id,
    }),
  })

  return { data }
}
```

#### 5.3.2 予約キャンセル

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function cancelReservation(
  reservationId: string,
  reason?: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservations')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq('id', reservationId)
    .select()
    .single()

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  // キャンセル通知を送信（Edge Function経由）
  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-cancellation-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reservation_id: reservationId,
    }),
  })

  revalidatePath('/dashboard/reservations')
  return { data }
}
```

---

## 6. Edge Functions設計

### 6.1 send-reservation-reminders（リマインダー送信）

**ファイル**: `supabase/functions/send-reservation-reminders/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 送信予定時刻を過ぎたリマインダーを取得
    const now = new Date().toISOString()
    const { data: reminders, error } = await supabase
      .from('reservation_reminders')
      .select(`
        *,
        reservations (
          id,
          customer_name,
          customer_email,
          line_friend_id,
          reservation_types (name, settings),
          reservation_slots (start_time, end_time),
          line_friends (line_user_id)
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', now)

    if (error) throw error

    let sentCount = 0
    let failedCount = 0

    for (const reminder of reminders || []) {
      const reservation = reminder.reservations

      try {
        if (reminder.channel === 'line' && reservation.line_friends?.line_user_id) {
          // LINEメッセージ送信
          const message = {
            type: 'text',
            text: generateReminderMessage(reservation),
          }

          const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')}`,
            },
            body: JSON.stringify({
              to: reservation.line_friends.line_user_id,
              messages: [message],
            }),
          })

          if (!response.ok) {
            throw new Error(`LINE API error: ${response.statusText}`)
          }
        } else if (reminder.channel === 'email') {
          // メール送信（SendGrid等）
          await sendEmail(
            reservation.customer_email,
            'ご予約のリマインダー',
            generateReminderMessage(reservation)
          )
        }

        // リマインダーを送信済みに更新
        await supabase
          .from('reservation_reminders')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', reminder.id)

        sentCount++
      } catch (error) {
        // エラーログ記録
        await supabase
          .from('reservation_reminders')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', reminder.id)

        failedCount++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function generateReminderMessage(reservation: any): string {
  const { customer_name, reservation_types, reservation_slots } = reservation
  const startTime = new Date(reservation_slots.start_time)
  const location = reservation_types.settings.location

  return `【予約リマインダー】

${customer_name} 様

ご予約の確認です。

予約内容: ${reservation_types.name}
日時: ${startTime.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })} ${startTime.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })}
${location ? `場所: ${location}` : ''}

キャンセルの場合は、以下のリンクからお手続きください。
${Deno.env.get('APP_URL')}/cancel/${reservation.id}

お待ちしております。`
}

async function sendEmail(to: string, subject: string, body: string) {
  // SendGrid等のメール送信APIを実装
  // 省略
}
```

**Cron設定**: `supabase/functions/cron.yaml`

```yaml
functions:
  - name: send-reservation-reminders
    schedule: "*/10 * * * *" # 10分ごと実行
```

### 6.2 send-reservation-confirmation（予約確認メール送信）

**ファイル**: `supabase/functions/send-reservation-confirmation/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { reservation_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 予約情報を取得
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select(`
        *,
        reservation_types (name, settings),
        reservation_slots (start_time, end_time)
      `)
      .eq('id', reservation_id)
      .single()

    if (error) throw error

    // 確認メール送信
    await sendConfirmationEmail(
      reservation.customer_email,
      reservation.customer_name,
      reservation
    )

    // LINEメッセージ送信（LINE友だちの場合）
    if (reservation.line_friend_id) {
      const { data: friend } = await supabase
        .from('line_friends')
        .select('line_user_id')
        .eq('id', reservation.line_friend_id)
        .single()

      if (friend) {
        await sendLineConfirmation(friend.line_user_id, reservation)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function sendConfirmationEmail(
  to: string,
  name: string,
  reservation: any
) {
  const startTime = new Date(reservation.reservation_slots.start_time)
  const confirmUrl = `${Deno.env.get('APP_URL')}/confirm/${reservation.id}`

  const subject = `【予約完了】${reservation.reservation_types.name}`
  const body = `${name} 様

ご予約ありがとうございます。

予約内容: ${reservation.reservation_types.name}
日時: ${startTime.toLocaleDateString('ja-JP')} ${startTime.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })}

以下のリンクから予約を確定してください。
${confirmUrl}

※このメールは予約受付完了の通知です。予約確定には上記リンクのクリックが必要です。`

  // メール送信実装（SendGrid等）
  // 省略
}

async function sendLineConfirmation(lineUserId: string, reservation: any) {
  const message = {
    type: 'text',
    text: '予約を受け付けました！メールをご確認ください。',
  }

  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [message],
    }),
  })
}
```

---

## 7. 実装優先順位

### 7.1 Week 8: Phase 5.1 - 基本機能（3日）

**目標**: 予約タイプ管理と予約枠設定

**タスク**:
1. データベーステーブル作成（reservation_types, reservation_slots, reservations, reservation_reminders）
2. RLSポリシー設定
3. トリガー・関数作成（空き状況自動更新）
4. 予約タイプ管理画面実装（/dashboard/reservations/types）
5. イベント予約タイプ作成フォーム実装

**成果物**:
- 予約タイプのCRUD完成
- イベント予約の作成可能

### 7.2 Week 8: Phase 5.2 - 予約受付（2日）

**目標**: 公開予約フォームの実装

**タスク**:
1. 公開予約フォーム画面実装（/r/[typeId]）
2. 予約作成Server Action実装
3. 予約確認メール送信Edge Function実装
4. 予約一覧画面実装（/dashboard/reservations）

**成果物**:
- 公開URLから予約受付可能
- 予約確認メール送信
- 管理画面で予約確認可能

### 7.3 Week 9: Phase 5.3 - リマインダー機能（2日）

**目標**: 自動リマインダー送信

**タスク**:
1. リマインダー自動作成トリガー実装
2. リマインダー送信Edge Function実装
3. Cron設定（10分ごと実行）
4. リマインダー設定UI実装（予約タイプフォーム）

**成果物**:
- 予約確定時にリマインダー自動作成
- 24時間前、1時間前にLINE/メール送信
- 管理画面でリマインダー履歴確認可能

### 7.4 Week 9: Phase 5.4 - カレンダービュー（2日）

**目標**: カレンダー形式での予約管理

**タスク**:
1. カレンダーライブラリ統合（react-big-calendar or @fullcalendar/react）
2. カレンダービュー画面実装（/dashboard/reservations/calendar）
3. 予約詳細パネル実装
4. ドラッグ&ドロップ予約変更（オプション）

**成果物**:
- カレンダービューで予約確認可能
- 月表示・週表示・日表示切り替え
- 予約クリックで詳細表示

### 7.5 Week 9: Phase 5.5 - 応用機能（1日）

**目標**: レッスン・サロン予約対応

**タスク**:
1. レッスン予約タイプフォーム実装
2. サロン予約タイプフォーム実装
3. 繰り返し予約枠の一括作成
4. スタッフ管理（サロン用）

**成果物**:
- レッスン予約対応
- サロン予約対応
- 繰り返しスケジュール設定可能

---

## 8. 実装手順

### 8.1 ステップ1: データベースセットアップ（Day 1）

```bash
# 1. Supabase SQL Editorで実行
# - reservation_types テーブル作成
# - reservation_slots テーブル作成
# - reservations テーブル作成
# - reservation_reminders テーブル作成
# - RLSポリシー設定
# - トリガー・関数作成

# 2. 動作確認
# - テーブルが作成されていることを確認
# - RLSが有効になっていることを確認
```

### 8.2 ステップ2: 予約タイプ管理画面（Day 1-2）

```bash
# 1. 画面作成
mkdir -p app/dashboard/reservations/types
touch app/dashboard/reservations/types/page.tsx
touch app/dashboard/reservations/types/actions.ts

# 2. コンポーネント作成
mkdir -p components/reservation
touch components/reservation/reservation-type-card.tsx
touch components/reservation/reservation-type-form.tsx

# 3. Server Actions実装
# - createReservationType
# - updateReservationType
# - deleteReservationType

# 4. 動作確認
npm run dev
# http://localhost:3000/dashboard/reservations/types にアクセス
```

### 8.3 ステップ3: 公開予約フォーム（Day 3）

```bash
# 1. 公開ページ作成
mkdir -p app/r/[typeId]
touch app/r/[typeId]/page.tsx
touch app/r/[typeId]/actions.ts

# 2. フォームコンポーネント作成
touch components/reservation/reservation-form.tsx
touch components/reservation/time-slot-selector.tsx

# 3. Server Actions実装
# - createPublicReservation

# 4. 動作確認
# http://localhost:3000/r/{typeId} にアクセス
```

### 8.4 ステップ4: 予約一覧画面（Day 4）

```bash
# 1. 画面作成
mkdir -p app/dashboard/reservations
touch app/dashboard/reservations/page.tsx
touch app/dashboard/reservations/actions.ts

# 2. テーブルコンポーネント作成
touch components/reservation/reservations-table.tsx

# 3. フィルター・検索機能実装

# 4. 動作確認
# http://localhost:3000/dashboard/reservations にアクセス
```

### 8.5 ステップ5: Edge Functions実装（Day 5-6）

```bash
# 1. Edge Functions作成
mkdir -p supabase/functions/send-reservation-reminders
touch supabase/functions/send-reservation-reminders/index.ts

mkdir -p supabase/functions/send-reservation-confirmation
touch supabase/functions/send-reservation-confirmation/index.ts

# 2. デプロイ
supabase functions deploy send-reservation-reminders
supabase functions deploy send-reservation-confirmation

# 3. Cron設定
# Supabase Dashboardから設定

# 4. 動作確認
# 予約作成→確認メール受信
# リマインダー送信（Cron実行後）
```

### 8.6 ステップ6: カレンダービュー（Day 7-8）

```bash
# 1. ライブラリインストール
npm install react-big-calendar date-fns

# 2. カレンダー画面作成
mkdir -p app/dashboard/reservations/calendar
touch app/dashboard/reservations/calendar/page.tsx

# 3. カレンダーコンポーネント作成
touch components/reservation/reservation-calendar.tsx

# 4. 動作確認
# http://localhost:3000/dashboard/reservations/calendar にアクセス
```

### 8.7 ステップ7: 応用機能（Day 9-10）

```bash
# 1. レッスン予約フォーム作成
touch components/reservation/lesson-reservation-form.tsx

# 2. サロン予約フォーム作成
touch components/reservation/salon-reservation-form.tsx

# 3. 予約枠一括作成機能
# - generateReservationSlots Server Action実装

# 4. スタッフ管理
touch components/reservation/staff-management.tsx

# 5. 総合テスト
# - イベント予約: 作成→受付→リマインダー
# - レッスン予約: 作成→繰り返し枠→受付
# - サロン予約: 作成→スタッフ選択→受付
```

---

## Phase 5要件分析完了

本実装計画書は、L Message SaaSの予約管理システム（Phase 5）の完全な仕様書です。

### 実装範囲

1. **予約タイプ管理** - イベント/レッスン/サロンの3種類対応
2. **予約枠設定** - 単発・繰り返しスケジュール対応
3. **公開予約フォーム** - 認証不要のシンプルなUI
4. **予約管理** - 一覧・詳細・キャンセル処理
5. **リマインダー機能** - 24時間前、1時間前の自動送信
6. **カレンダービュー** - 月/週/日表示
7. **Edge Functions** - リマインダー送信、確認メール送信

### 技術的特徴

- **Next.js 16 + React 19**: Server Actions、PPR活用
- **Supabase**: RLS、Realtime、Edge Functions
- **shadcn/ui**: アクセシブルなUIコンポーネント
- **Heroicons**: 絵文字禁止、アイコンライブラリ使用
- **マルチテナント対応**: organization_id ベースのRLS

### 実装期間

**Week 8-9（2週間）**で全機能実装完了予定

次の実装フェーズに進む準備が整いました。

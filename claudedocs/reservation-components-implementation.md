# 予約管理共通コンポーネント実装完了

## 実装完了日
2025-10-30

## 実装ファイル一覧

### 1. UIコンポーネント（components/reservations/）

#### ReservationStatusBadge.tsx
- **機能**: 予約ステータスバッジコンポーネント
- **ステータス**: pending（保留中）、confirmed（確定）、cancelled（キャンセル）、completed（完了）
- **デザイン**: 色分け表示（黄色、青、赤、緑）+ Heroiconsアイコン
- **使用例**:
```tsx
<ReservationStatusBadge status="confirmed" />
```

#### ReservationTypeIcon.tsx
- **機能**: 予約タイプアイコンコンポーネント
- **タイプ**: event（イベント）、lesson（レッスン）、salon（サロン）
- **アイコン**: CalendarIcon、AcademicCapIcon、ScissorsIcon
- **色分け**: 紫、青、ピンク
- **使用例**:
```tsx
<ReservationTypeIcon type="lesson" />
<p>{getReservationTypeLabel('lesson')}</p>
```

#### SlotAvailabilityIndicator.tsx
- **機能**: 空き枠インジケーター
- **表示**: ◎満席、◯空きあり、△残りわずか
- **計算**: 空き枠の20%以下で「残りわずか」
- **使用例**:
```tsx
<SlotAvailabilityIndicator
  availability="available"
  currentCapacity={5}
  maxCapacity={10}
  showLabel={true}
/>
```

#### ReservationTimeline.tsx
- **機能**: 予約タイムライン表示
- **表示内容**: 作成→確定→完了（または作成→キャンセル）
- **デザイン**: 縦型タイムライン、アイコン、接続線、相対時間表示
- **使用例**:
```tsx
<ReservationTimeline reservation={reservationData} />
```

#### QuickStatsCard.tsx
- **機能**: 統計カードコンポーネント
- **表示内容**: タイトル、数値、トレンド（前週比）、説明
- **レイアウト**: レスポンシブグリッド対応
- **使用例**:
```tsx
<QuickStatsCard
  title="今日の予約"
  value={15}
  icon={CalendarIcon}
  trend={{ value: 12, isPositive: true }}
/>

<QuickStatsGrid stats={statsArray} />
```

### 2. データ層（lib/）

#### lib/supabase/queries/reservations.ts
- **クラス**: ReservationsQueries
- **メソッド**:
  - `getReservations()`: 予約一覧取得（フィルタ、ソート対応）
  - `getReservation()`: 予約詳細取得
  - `getReservationStats()`: 統計情報取得（今日、今週、今月、ステータス別）
  - `getAvailableSlots()`: 空き枠取得
  - `getReservationTypes()`: 予約タイプ取得
  - `createReservation()`: 予約作成
  - `updateReservationStatus()`: ステータス更新
  - `cancelReservation()`: 予約キャンセル
  - `completeReservation()`: 予約完了

#### lib/utils/reservation-utils.ts
- **ユーティリティ関数**:
  - 日付フォーマット: `formatReservationDate()`, `formatReservationDateTime()`, `formatReservationTime()`
  - 相対時間: `getRelativeTime()`, `getDateLabel()`
  - 空き枠計算: `calculateSlotAvailability()`, `getRemainingCapacity()`, `isSlotBookable()`
  - 予約判定: `isReservationPast()`
  - 期間計算: `getSlotDuration()`, `formatDuration()`, `getTimeRangeText()`
  - データ操作: `groupReservationsByDate()`, `sortReservationsByTime()`
  - 重複チェック: `doTimeSlotsOverlap()`

### 3. 型定義（types/）

#### types/reservations.ts
- **型定義**:
  - `ReservationStatus`: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  - `ReservationType`: 'event' | 'lesson' | 'salon'
  - `SlotAvailability`: 'full' | 'available' | 'limited'
  - `Reservation`: 予約データ型
  - `ReservationSlot`: 予約枠データ型
  - `ReservationStats`: 統計情報型

## 技術仕様

### 使用ライブラリ
- **UIフレームワーク**: shadcn/ui (Badge, Card, Avatar)
- **アイコン**: Heroicons v2
- **日付処理**: date-fns v4 (日本語ロケール対応)
- **データベース**: Supabase (PostgreSQL)
- **型安全性**: TypeScript

### アクセシビリティ対応
- **WCAG 2.1 AA準拠**:
  - 適切なaria-label属性
  - キーボードナビゲーション対応
  - スクリーンリーダー対応
  - 十分なカラーコントラスト

### レスポンシブデザイン
- **モバイルファースト**:
  - グリッドレイアウト: 1列（モバイル）→ 2列（タブレット）→ 4列（デスクトップ）
  - フレキシブルなカード設計
  - タッチフレンドリーな要素サイズ

### パフォーマンス最適化
- **効率的なデータ取得**:
  - 必要なフィールドのみをSELECT
  - JOINを使った効率的なリレーション取得
  - ページネーション対応
  - Promise.allによる並列クエリ実行

## 使用例

### 基本的な使い方

```tsx
import {
  ReservationStatusBadge,
  ReservationTypeIcon,
  SlotAvailabilityIndicator,
  ReservationTimeline,
  QuickStatsGrid
} from '@/components/reservations';
import { ReservationsQueries } from '@/lib/supabase/queries/reservations';
import { formatReservationDateTime, calculateSlotAvailability } from '@/lib/utils/reservation-utils';

// 統計情報の表示
const stats = await new ReservationsQueries().getReservationStats(userId);
<QuickStatsGrid stats={[
  { title: '今日の予約', value: stats.today },
  { title: '今週の予約', value: stats.week },
  { title: '確定', value: stats.confirmed },
  { title: '完了', value: stats.completed }
]} />

// 予約一覧の表示
const reservations = await queries.getReservations(userId);
{reservations.map(reservation => (
  <div key={reservation.id}>
    <ReservationStatusBadge status={reservation.status} />
    <ReservationTypeIcon type={reservation.type} />
    <p>{formatReservationDateTime(reservation.start_time)}</p>
  </div>
))}

// 空き枠の表示
const slots = await queries.getAvailableSlots(typeId);
{slots.map(slot => (
  <SlotAvailabilityIndicator
    availability={calculateSlotAvailability(slot.booked_count, slot.capacity)}
    currentCapacity={slot.booked_count}
    maxCapacity={slot.capacity}
  />
))}

// 予約詳細の表示
const reservation = await queries.getReservation(reservationId);
<ReservationTimeline reservation={reservation} />
```

## データベーススキーマ

### 必要なテーブル（Supabase）
- `reservation_types`: 予約タイプ設定
- `available_slots`: 予約可能枠
- `reservations`: 予約データ
- `reservation_settings`: 予約システム設定

これらのテーブルは既にSupabaseに作成されており、型定義は`types/supabase.ts`に含まれています。

## 次のステップ

### 推奨される実装順序
1. **予約カレンダービュー**: 月・週・日表示（追加ファイルが既に作成済み）
2. **予約フォーム**: 新規予約作成UI
3. **予約管理ダッシュボード**: 一覧・検索・フィルタ
4. **通知設定**: リマインダーと通知管理
5. **営業時間設定**: 営業時間・休業日管理

### 利用可能な追加コンポーネント
以下のコンポーネントも作成済みです:
- `CalendarView.tsx`: カレンダービュー統合コンポーネント
- `MonthView.tsx`, `WeekView.tsx`, `DayView.tsx`: 各種カレンダービュー
- `ReservationTypeForm.tsx`: 予約タイプ作成・編集フォーム
- `ReservationTypeList.tsx`: 予約タイプ一覧
- `ReservationSettings.tsx`: 予約設定管理
- `BusinessHoursEditor.tsx`: 営業時間編集
- `NotificationSettings.tsx`: 通知設定

## 注意事項

### ビルドの問題
- Next.js Turbopackが日本語パス名を正しく処理できない既知の問題があります
- 開発時は`npm run dev`を使用してください
- プロダクションビルドには英語パスのプロジェクト配置を推奨します

### 型安全性
- すべてのコンポーネントはTypeScriptで型定義されています
- Supabaseの型定義と連携しています
- 実行時のバリデーションは各コンポーネント内で実装されています

## まとめ

予約管理システム用の再利用可能な共通コンポーネントを実装しました:

1. **5つのUIコンポーネント**: ステータスバッジ、タイプアイコン、空き枠インジケーター、タイムライン、統計カード
2. **データクエリクラス**: ReservationsQueries（9つのメソッド）
3. **ユーティリティ関数**: 15個の再利用可能な関数
4. **型定義**: TypeScriptによる完全な型安全性

これらのコンポーネントは、アクセシビリティ、パフォーマンス、レスポンシブデザインのベストプラクティスに従って実装されています。

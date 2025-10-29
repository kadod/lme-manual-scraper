# 総合アナリティクスダッシュボード - クイックリファレンス

## アクセスURL
```
/dashboard/analytics
```

## 実装されたコンポーネント一覧

### 📊 KPIカード（6つ）
| コンポーネント | データソース | 表示内容 |
|---------------|-------------|---------|
| 友だち総数 | `getDashboardStats()` | 総友だち数、前月比 |
| 配信メッセージ数 | `getDashboardStats()` | 今月の配信数、前月比 |
| 配信完了率 | `getDashboardStats()` | 配信成功率、前期比 |
| エンゲージメント率 | `getDashboardStats()` | インタラクション率、前期比 |
| 予約数（今月） | - | 今月の予約数（将来実装） |
| フォーム回答数 | - | 今月の回答数（将来実装） |

### 📈 チャート

#### FriendsTrendChart（友だち推移）
- **タイプ**: 折れ線グラフ
- **データ**: `getFriendsTrend()`
- **系列**: 友だち総数、新規友だち、ブロック
- **カラー**: Blue, Green, Red

#### MessageStatsChart（メッセージ配信推移）
- **タイプ**: 棒グラフ
- **データ**: `getEngagementRate()`
- **系列**: 送信、配信完了、失敗
- **カラー**: Blue, Green, Red

#### EngagementChart（エンゲージメント推移）
- **タイプ**: 複合グラフ（Bar + Line）
- **データ**: `getEngagementRate()`
- **左軸**: 配信数（棒グラフ）
- **右軸**: 開封率、クリック率（折れ線）
- **カラー**: Light Blue (Bar), Purple & Orange (Lines)

#### TagDistributionChart（タグ別友だち分布）
- **タイプ**: 円グラフ
- **データ**: `getTagDistribution()`
- **表示**: タグ名と割合（%）
- **カラーパレット**: 8色のカスタムパレット

#### DeviceChart（デバイス別アクセス）
- **タイプ**: ドーナツグラフ
- **データ**: `getDeviceBreakdown()`
- **カテゴリ**: iOS, Android, Web (PC), Web (Mobile), その他
- **カラー**: デバイスごとに固定色

## タブ構成

### 1️⃣ 概要タブ
```
├── FriendsTrendChart
├── MessageStatsChart
├── TagDistributionChart
└── DeviceChart
```

### 2️⃣ 友だちタブ
```
├── FriendsTrendChart
├── TagDistributionChart
├── DeviceChart
└── 友だち統計カード
    ├── 総友だち数
    ├── 期間内の増減
    ├── 成長率
    └── タグ付け済み数
```

### 3️⃣ メッセージタブ
```
├── MessageStatsChart
└── メッセージ統計カード
    ├── 総送信数
    ├── 配信完了数
    ├── 既読数
    ├── クリック数
    └── 配信率・既読率・クリック率
```

### 4️⃣ エンゲージメントタブ
```
├── EngagementChart
└── エンゲージメント分析カード
    ├── 全体エンゲージメント率
    ├── 平均既読率
    ├── 平均クリック率
    └── 総インタラクション数
```

## フィルター機能

### 期間選択
- 今日
- 今週
- 今月
- カスタム期間

### 比較期間
- なし
- 前週比
- 前月比

## データフロー

```
Server Component (page.tsx)
  ↓
  ├─ getDashboardStats()
  ├─ getFriendsTrend()
  ├─ getMessageStats()
  ├─ getEngagementRate()
  ├─ getTagDistribution()
  └─ getDeviceBreakdown()
  ↓
Client Component (AnalyticsPageClient.tsx)
  ↓
  ├─ KPIGrid → KPICard × 6
  ├─ DateRangePicker
  └─ Tabs
      ├─ FriendsTrendChart
      ├─ MessageStatsChart
      ├─ EngagementChart
      ├─ TagDistributionChart
      └─ DeviceChart
```

## カラーパレット

### KPIカード
- **Blue**: 友だち総数
- **Green**: 配信メッセージ数
- **Purple**: 配信完了率
- **Orange**: エンゲージメント率
- **Red**: 予約数
- **Yellow**: フォーム回答数

### チャート
- **友だち推移**: Blue (#3B82F6), Green (#10B981), Red (#EF4444)
- **メッセージ**: Blue (#3B82F6), Green (#10B981), Red (#EF4444)
- **エンゲージメント**: Light Blue (#93C5FD), Purple (#9333EA), Orange (#F59E0B)
- **タグ分布**: 8色のカスタムパレット
- **デバイス**: iOS (Blue), Android (Green), Web PC (Purple), Web Mobile (Orange)

## レスポンシブブレークポイント

```css
モバイル:    < 768px  → 1カラム
タブレット:  ≥ 768px  → 2カラム (grid-cols-2)
デスクトップ: ≥ 1024px → 3-4カラム (grid-cols-3, grid-cols-4)
```

## 使用技術

### UIフレームワーク
- **shadcn/ui**: Card, Tabs, Select, Button
- **Heroicons**: アイコンセット
- **Recharts**: チャートライブラリ

### データ取得
- **Server Actions**: `app/actions/analytics.ts`
- **Supabase**: バックエンドデータベース

### 型定義
- **TypeScript**: `types/analytics.ts`

## パフォーマンス最適化

1. **並列データ取得**: `Promise.all()` で全データを同時取得
2. **Server Components**: 初期データはサーバーサイドで取得
3. **Client Components**: インタラクティブ部分のみクライアント化
4. **ResponsiveContainer**: チャートの自動リサイズ

## アクセシビリティ

- ✅ セマンティックHTML
- ✅ ARIA属性（shadcn/ui自動対応）
- ✅ キーボードナビゲーション
- ✅ カラーコントラスト（WCAG AA準拠）
- ✅ スクリーンリーダー対応

## 今後の拡張ポイント

### 短期
- [ ] カスタム日付範囲選択
- [ ] リアルタイム更新
- [ ] チャートのPNG/SVGエクスポート

### 中期
- [ ] データフィルター（タグ、セグメント）
- [ ] カスタムダッシュボード作成
- [ ] レポートスケジューリング

### 長期
- [ ] AI分析・インサイト
- [ ] 予測分析
- [ ] A/Bテスト結果統合

---

**最終更新**: 2025-10-30

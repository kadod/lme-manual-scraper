# アナリティクスチャートコンポーネントガイド

## 概要

アナリティクス全体で使用する共通チャートコンポーネントのセットです。Rechartsをベースに、shadcn/uiのデザインシステムと統合されています。

## ディレクトリ構造

```
components/analytics/
├── charts/
│   ├── LineChartWrapper.tsx      # 折れ線グラフ
│   ├── BarChartWrapper.tsx       # 棒グラフ（横向き対応）
│   ├── PieChartWrapper.tsx       # 円グラフ（ドーナツ対応）
│   ├── AreaChartWrapper.tsx      # エリアチャート
│   ├── ComposedChartWrapper.tsx  # 複合チャート
│   └── index.ts                  # エクスポート
├── ChartContainer.tsx            # チャートコンテナ
├── ChartLegend.tsx               # カスタムレジェンド
├── ChartTooltip.tsx              # カスタムツールチップ
├── EmptyChart.tsx                # データなし表示
├── ChartExportButton.tsx         # エクスポートボタン
├── ChartExamples.tsx             # 使用例
└── index.ts                      # エクスポート

lib/utils/
├── chart-utils.ts                # チャートユーティリティ
└── analytics-utils.ts            # 統計計算ユーティリティ

types/
└── analytics.ts                  # 型定義（拡張済み）
```

## 基本的な使い方

### 1. 折れ線グラフ

```tsx
import { ChartContainer, LineChartWrapper } from '@/components/analytics'
import type { ChartConfig } from '@/types/analytics'

const data = [
  { date: '2024-01', new_friends: 120, blocked: 5 },
  { date: '2024-02', new_friends: 150, blocked: 8 },
  { date: '2024-03', new_friends: 180, blocked: 6 },
]

const configs: ChartConfig[] = [
  { dataKey: 'new_friends', label: '新規友だち', color: '#3b82f6' },
  { dataKey: 'blocked', label: 'ブロック', color: '#ef4444' },
]

export function FriendsTrendChart() {
  return (
    <ChartContainer title="友だち推移" description="新規友だちとブロック数の推移">
      <LineChartWrapper
        data={data}
        configs={configs}
        xAxisKey="date"
        height={300}
      />
    </ChartContainer>
  )
}
```

### 2. 棒グラフ（横向き）

```tsx
import { ChartContainer, BarChartWrapper } from '@/components/analytics'

const data = [
  { name: 'テキスト', value: 450 },
  { name: '画像', value: 320 },
  { name: '動画', value: 180 },
]

export function MessageTypesChart() {
  return (
    <ChartContainer title="メッセージタイプ別配信数">
      <BarChartWrapper
        data={data}
        configs={[{ dataKey: 'value', label: '配信数', color: '#3b82f6' }]}
        xAxisKey="name"
        layout="vertical"
        height={300}
      />
    </ChartContainer>
  )
}
```

### 3. 円グラフ（ドーナツチャート）

```tsx
import { ChartContainer, PieChartWrapper } from '@/components/analytics'

const data = [
  { name: 'テキスト', value: 450 },
  { name: '画像', value: 320 },
  { name: '動画', value: 180 },
]

export function DistributionChart() {
  return (
    <ChartContainer title="メッセージタイプ分布">
      <PieChartWrapper
        data={data}
        height={300}
        innerRadius={60} // ドーナツチャートにする場合
      />
    </ChartContainer>
  )
}
```

### 4. エリアチャート

```tsx
import { ChartContainer, AreaChartWrapper } from '@/components/analytics'

const data = [
  { date: '2024-01', total: 450 },
  { date: '2024-02', total: 592 },
  { date: '2024-03', total: 766 },
]

export function CumulativeChart() {
  return (
    <ChartContainer title="累計友だち数">
      <AreaChartWrapper
        data={data}
        configs={[{ dataKey: 'total', label: '累計', color: '#10b981' }]}
        xAxisKey="date"
        height={300}
      />
    </ChartContainer>
  )
}
```

### 5. 複合チャート（折れ線+棒グラフ）

```tsx
import { ChartContainer, ComposedChartWrapper } from '@/components/analytics'

const data = [
  { month: '1月', messages: 1200, delivery_rate: 95 },
  { month: '2月', messages: 1450, delivery_rate: 96 },
  { month: '3月', messages: 1680, delivery_rate: 94 },
]

const elements = [
  { type: 'bar' as const, dataKey: 'messages', label: '配信数', color: '#3b82f6' },
  { type: 'line' as const, dataKey: 'delivery_rate', label: '到達率', color: '#10b981' },
]

export function PerformanceChart() {
  return (
    <ChartContainer title="配信パフォーマンス">
      <ComposedChartWrapper
        data={data}
        elements={elements}
        xAxisKey="month"
        height={350}
      />
    </ChartContainer>
  )
}
```

## エクスポート機能

### CSV/PNG エクスポート

```tsx
import { ChartContainer, LineChartWrapper, ChartExportButton } from '@/components/analytics'

export function ExportableChart() {
  const data = [/* ... */]

  return (
    <ChartContainer
      title="友だち推移"
      action={
        <ChartExportButton
          data={data}
          filename="friends-trend"
          chartId="friends-chart" // PNG出力に必要
        />
      }
    >
      <div id="friends-chart">
        <LineChartWrapper data={data} configs={configs} />
      </div>
    </ChartContainer>
  )
}
```

## ローディング・エラー・空状態

### ローディング表示

```tsx
<ChartContainer
  title="友だち推移"
  loading={true}
>
  <LineChartWrapper data={data} configs={configs} />
</ChartContainer>
```

### エラー表示

```tsx
<ChartContainer
  title="友だち推移"
  error="データの取得に失敗しました"
>
  <LineChartWrapper data={data} configs={configs} />
</ChartContainer>
```

### 空状態表示

```tsx
import { EmptyChart } from '@/components/analytics'

<ChartContainer title="友だち推移">
  {data.length === 0 ? (
    <EmptyChart message="表示するデータがありません" />
  ) : (
    <LineChartWrapper data={data} configs={configs} />
  )}
</ChartContainer>
```

## ユーティリティ関数

### チャート関連

```tsx
import {
  formatNumber,
  formatPercentage,
  formatCurrency,
  formatCompactNumber,
  formatChartDate,
  calculatePercentage,
  generateChartColors,
  exportToCSV,
} from '@/lib/utils/chart-utils'

// 数値フォーマット
formatNumber(1234567) // "1,234,567"
formatPercentage(75.5) // "75.5%"
formatCurrency(1000) // "¥1,000"
formatCompactNumber(1500000) // "1.5M"

// 日付フォーマット
formatChartDate('2024-01-15', 'short') // "1/15"
formatChartDate('2024-01-15', 'medium') // "1月15日"
formatChartDate('2024-01-15', 'long') // "2024年1月15日"

// パーセンテージ計算
calculatePercentage(75, 300) // 25

// カラーパレット生成
generateChartColors(5, 'primary') // ['#3b82f6', '#2563eb', ...]

// CSV出力
exportToCSV(data, 'export-filename')
```

### 統計計算

```tsx
import {
  calculateStatistics,
  comparePeriods,
  calculateGrowthRate,
  detectAnomalies,
  calculateRetentionRate,
  calculateChurnRate,
  calculateEngagementScore,
  createMetric,
  forecastLinear,
} from '@/lib/utils/analytics-utils'

// 統計サマリー
const stats = calculateStatistics([100, 120, 150, 180, 200])
// { total: 750, average: 150, median: 150, max: 200, min: 100, standardDeviation: ... }

// 期間比較
const comparison = comparePeriods(currentData, previousData)
// { currentPeriod: {...}, previousPeriod: {...}, change: 50, changePercentage: 10, trend: 'up' }

// 成長率
const growthRate = calculateGrowthRate(timeSeriesData) // 67.5%

// 異常検知
const anomalies = detectAnomalies(timeSeriesData, 2)

// リテンション率
const retention = calculateRetentionRate(1000, 950, 100) // 85%

// チャーン率
const churn = calculateChurnRate(50, 1000) // 5%

// エンゲージメントスコア
const engagement = calculateEngagementScore(500, 1000) // 50

// メトリック作成
const metric = createMetric('友だち数', 1200, 1000, '#3b82f6')
// { label: '友だち数', value: 1200, previousValue: 1000, change: 200, changePercentage: 20, trend: 'up' }

// 線形予測
const forecast = forecastLinear(timeSeriesData, 3) // 3期間先まで予測
```

## カラーパレット

### デフォルトカラー

```tsx
import { CHART_COLORS, DEFAULT_CHART_COLORS } from '@/lib/utils/chart-utils'

// テーマカラー
CHART_COLORS.primary  // ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a']
CHART_COLORS.success  // ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
CHART_COLORS.warning  // ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f']
CHART_COLORS.danger   // ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']
CHART_COLORS.purple   // ['#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87']

// デフォルト配列
DEFAULT_CHART_COLORS  // [blue, green, amber, red, purple, cyan, pink, gray]
```

## 型定義

主要な型定義は `/types/analytics.ts` に定義されています：

- `ChartData` - 基本チャートデータ
- `TimeSeriesData` - 時系列データ
- `CrossAnalysisData` - クロス分析データ
- `AnalyticsMetric` - メトリック情報
- `ChartConfig` - チャート設定
- `ChartProps` - チャートコンポーネントProps
- `TooltipPayload` - ツールチップペイロード
- `LegendPayload` - レジェンドペイロード
- `ExportOptions` - エクスポートオプション

## レスポンシブ対応

すべてのチャートコンポーネントは `ResponsiveContainer` でラップされており、親要素の幅に自動的に適応します。

```tsx
// 高さのカスタマイズ
<LineChartWrapper height={400} />

// コンテナでの制御
<div className="h-[400px]">
  <LineChartWrapper />
</div>
```

## カスタムツールチップ

```tsx
import { ChartTooltip } from '@/components/analytics'

<LineChartWrapper
  data={data}
  configs={configs}
  customTooltip={
    <ChartTooltip formatter="percentage" unit="%" />
  }
/>
```

## 実装例の確認

完全な実装例は `components/analytics/ChartExamples.tsx` を参照してください。

## 注意事項

1. **Recharts** が依存関係として必要です（すでにインストール済み）
2. **カラー設定** はTailwind CSSのカラーパレットと統合されています
3. **アクセシビリティ** のため、適切なラベルとコントラストを使用してください
4. **PNG出力** には追加で `html2canvas` ライブラリが必要です（現在は未実装）

## 今後の拡張

- [ ] html2canvas統合によるPNG出力実装
- [ ] カスタムツールチップテンプレート
- [ ] アニメーション設定のカスタマイズ
- [ ] ダークモード対応の強化
- [ ] 印刷用スタイルの最適化

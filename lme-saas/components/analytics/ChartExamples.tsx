'use client'

import {
  ChartContainer,
  ChartExportButton,
  EmptyChart,
  LineChartWrapper,
  BarChartWrapper,
  PieChartWrapper,
  AreaChartWrapper,
  ComposedChartWrapper,
} from '@/components/analytics'
import type { ChartConfig } from '@/types/analytics'

// Sample data
const timeSeriesData = [
  { date: '2024-01', new_friends: 120, blocked: 5, total: 450 },
  { date: '2024-02', new_friends: 150, blocked: 8, total: 592 },
  { date: '2024-03', new_friends: 180, blocked: 6, total: 766 },
  { date: '2024-04', new_friends: 200, blocked: 10, total: 956 },
  { date: '2024-05', new_friends: 170, blocked: 7, total: 1119 },
  { date: '2024-06', new_friends: 220, blocked: 12, total: 1327 },
]

const categoryData = [
  { name: 'テキスト', value: 450 },
  { name: '画像', value: 320 },
  { name: '動画', value: 180 },
  { name: 'Flexメッセージ', value: 150 },
  { name: 'テンプレート', value: 100 },
]

const multiMetricData = [
  { month: '1月', messages: 1200, delivery_rate: 95, engagement: 68 },
  { month: '2月', messages: 1450, delivery_rate: 96, engagement: 72 },
  { month: '3月', messages: 1680, delivery_rate: 94, engagement: 70 },
  { month: '4月', messages: 1850, delivery_rate: 97, engagement: 75 },
  { month: '5月', messages: 1720, delivery_rate: 95, engagement: 73 },
  { month: '6月', messages: 2100, delivery_rate: 98, engagement: 78 },
]

export function ChartExamples() {
  // Chart configurations
  const lineConfigs: ChartConfig[] = [
    { dataKey: 'new_friends', label: '新規友だち', color: '#3b82f6' },
    { dataKey: 'blocked', label: 'ブロック', color: '#ef4444' },
  ]

  const areaConfigs: ChartConfig[] = [
    { dataKey: 'total', label: '累計友だち数', color: '#10b981' },
  ]

  const barConfigs: ChartConfig[] = [
    { dataKey: 'messages', label: '配信数', color: '#3b82f6' },
  ]

  const composedElements = [
    { type: 'bar' as const, dataKey: 'messages', label: '配信数', color: '#3b82f6' },
    { type: 'line' as const, dataKey: 'delivery_rate', label: '到達率 (%)', color: '#10b981' },
    { type: 'line' as const, dataKey: 'engagement', label: 'エンゲージメント率 (%)', color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6">
      {/* Line Chart */}
      <ChartContainer
        title="友だち推移"
        description="新規友だちとブロック数の推移"
        action={
          <ChartExportButton
            data={timeSeriesData}
            filename="friends-trend"
            chartId="friends-line-chart"
          />
        }
      >
        <div id="friends-line-chart">
          <LineChartWrapper
            data={timeSeriesData}
            configs={lineConfigs}
            xAxisKey="date"
            height={300}
          />
        </div>
      </ChartContainer>

      {/* Area Chart */}
      <ChartContainer
        title="累計友だち数"
        description="累計友だち数の推移"
        action={
          <ChartExportButton
            data={timeSeriesData}
            filename="friends-total"
            chartId="friends-area-chart"
          />
        }
      >
        <div id="friends-area-chart">
          <AreaChartWrapper
            data={timeSeriesData}
            configs={areaConfigs}
            xAxisKey="date"
            height={300}
          />
        </div>
      </ChartContainer>

      {/* Bar Chart */}
      <ChartContainer
        title="月別配信数"
        description="各月のメッセージ配信数"
        action={
          <ChartExportButton
            data={multiMetricData}
            filename="monthly-messages"
            chartId="messages-bar-chart"
          />
        }
      >
        <div id="messages-bar-chart">
          <BarChartWrapper
            data={multiMetricData}
            configs={barConfigs}
            xAxisKey="month"
            height={300}
          />
        </div>
      </ChartContainer>

      {/* Horizontal Bar Chart */}
      <ChartContainer
        title="メッセージタイプ別配信数"
        description="タイプ別の配信数比較"
        action={
          <ChartExportButton
            data={categoryData}
            filename="message-types"
            chartId="types-bar-chart"
          />
        }
      >
        <div id="types-bar-chart">
          <BarChartWrapper
            data={categoryData}
            configs={[{ dataKey: 'value', label: '配信数', color: '#3b82f6' }]}
            xAxisKey="name"
            layout="vertical"
            height={300}
          />
        </div>
      </ChartContainer>

      {/* Pie Chart */}
      <ChartContainer
        title="メッセージタイプ分布"
        description="タイプ別の割合"
        action={
          <ChartExportButton
            data={categoryData}
            filename="message-distribution"
            chartId="distribution-pie-chart"
          />
        }
      >
        <div id="distribution-pie-chart">
          <PieChartWrapper
            data={categoryData}
            height={300}
          />
        </div>
      </ChartContainer>

      {/* Donut Chart */}
      <ChartContainer
        title="メッセージタイプ分布（ドーナツ）"
        description="タイプ別の割合（ドーナツチャート）"
      >
        <PieChartWrapper
          data={categoryData}
          height={300}
          innerRadius={60}
        />
      </ChartContainer>

      {/* Composed Chart */}
      <ChartContainer
        title="配信パフォーマンス"
        description="配信数と到達率・エンゲージメント率の推移"
        action={
          <ChartExportButton
            data={multiMetricData}
            filename="performance-metrics"
            chartId="performance-composed-chart"
          />
        }
      >
        <div id="performance-composed-chart">
          <ComposedChartWrapper
            data={multiMetricData}
            elements={composedElements}
            xAxisKey="month"
            height={350}
          />
        </div>
      </ChartContainer>

      {/* Empty State */}
      <ChartContainer
        title="データなし例"
        description="データがない場合の表示例"
      >
        <EmptyChart message="表示するデータがありません" />
      </ChartContainer>

      {/* Loading State */}
      <ChartContainer
        title="読込中例"
        description="データ読込中の表示例"
        loading={true}
      >
        <div />
      </ChartContainer>

      {/* Error State */}
      <ChartContainer
        title="エラー例"
        description="エラー発生時の表示例"
        error="データの取得に失敗しました。しばらくしてから再度お試しください。"
      >
        <div />
      </ChartContainer>
    </div>
  )
}

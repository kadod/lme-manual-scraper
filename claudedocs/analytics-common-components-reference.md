# Analytics Common Components Reference

## Overview
This document provides a comprehensive reference for the analytics common components and chart library implemented for the LME SAAS analytics system.

## Chart Components

### 1. TimeSeriesChart
Time series line chart with date-based X-axis.

**File**: `components/analytics/charts/TimeSeriesChart.tsx`

**Props**:
- `data`: TimeSeriesData[] - Array of time series data points
- `configs`: ChartConfig[] (optional) - Chart configuration for multiple series
- `height`: number (default: 300) - Chart height in pixels
- `showGrid`: boolean (default: true) - Show grid lines
- `showLegend`: boolean (default: true) - Show legend
- `dateFormat`: 'short' | 'medium' | 'long' (default: 'short') - Date format for labels
- `strokeWidth`: number (default: 2) - Line stroke width
- `dot`: boolean (default: true) - Show data points
- `colors`: string[] - Custom color palette

**Usage**:
```tsx
import { TimeSeriesChart } from '@/components/analytics'

<TimeSeriesChart
  data={dailyStats}
  configs={[
    { dataKey: 'clicks', label: 'クリック数', color: '#3b82f6' },
    { dataKey: 'views', label: '表示数', color: '#10b981' }
  ]}
  height={400}
  dateFormat="medium"
/>
```

### 2. BarChartComponent
Bar chart with horizontal or vertical orientation.

**File**: `components/analytics/charts/BarChartComponent.tsx`

**Props**:
- `data`: ChartData[] - Chart data
- `configs`: ChartConfig[] (optional) - Configuration for multiple data series
- `height`: number (default: 300) - Chart height
- `showGrid`: boolean (default: true) - Show grid lines
- `showLegend`: boolean (default: true) - Show legend
- `layout`: 'horizontal' | 'vertical' (default: 'vertical') - Bar orientation
- `colors`: string[] - Color palette
- `barSize`: number (default: 40) - Bar thickness
- `radius`: number | [number, number, number, number] (default: [4, 4, 0, 0]) - Bar corner radius

**Usage**:
```tsx
import { BarChartComponent } from '@/components/analytics'

<BarChartComponent
  data={categoryData}
  configs={[{ dataKey: 'value', label: '件数', color: '#3b82f6' }]}
  layout="horizontal"
  barSize={30}
/>
```

### 3. PieChartComponent
Pie chart with percentage labels.

**File**: `components/analytics/charts/PieChartComponent.tsx`

**Props**:
- `data`: ChartData[] - Data points
- `height`: number (default: 300) - Chart height
- `showLegend`: boolean (default: true) - Show legend
- `showPercentage`: boolean (default: true) - Show percentage in labels
- `innerRadius`: number (default: 0) - Inner radius for donut chart
- `outerRadius`: number (default: 80) - Outer radius
- `colors`: string[] - Color palette
- `valueKey`: string (default: 'value') - Data value key
- `nameKey`: string (default: 'name') - Data name key

**Usage**:
```tsx
import { PieChartComponent } from '@/components/analytics'

<PieChartComponent
  data={distributionData}
  innerRadius={50}  // Creates donut chart
  showPercentage={true}
/>
```

### 4. AreaChartComponent
Area chart with gradient fill.

**File**: `components/analytics/charts/AreaChartComponent.tsx`

**Props**:
- `data`: TimeSeriesData[] - Time series data
- `configs`: ChartConfig[] (optional) - Multiple series configuration
- `height`: number (default: 300) - Chart height
- `showGrid`: boolean (default: true) - Show grid
- `showLegend`: boolean (default: true) - Show legend
- `stacked`: boolean (default: false) - Stack multiple areas
- `fillOpacity`: number (default: 0.6) - Fill opacity
- `dateFormat`: 'short' | 'medium' | 'long' (default: 'short') - Date label format
- `colors`: string[] - Color palette

**Usage**:
```tsx
import { AreaChartComponent } from '@/components/analytics'

<AreaChartComponent
  data={trendData}
  stacked={true}
  fillOpacity={0.5}
  configs={[
    { dataKey: 'series1', label: 'シリーズ1' },
    { dataKey: 'series2', label: 'シリーズ2' }
  ]}
/>
```

### 5. ComposedChartComponent
Composed chart combining lines, bars, and areas with dual Y-axis support.

**File**: `components/analytics/charts/ComposedChartComponent.tsx`

**Props**:
- `data`: ChartData[] - Chart data
- `elements`: ChartElement[] - Array of chart elements with type and axis
- `height`: number (default: 300) - Chart height
- `showGrid`: boolean (default: true) - Show grid
- `showLegend`: boolean (default: true) - Show legend
- `xAxisKey`: string (default: 'name') - X-axis data key
- `colors`: string[] - Color palette

**ChartElement Type**:
```typescript
{
  dataKey: string
  label: string
  type: 'line' | 'bar' | 'area'
  color?: string
  yAxisId?: 'left' | 'right'
}
```

**Usage**:
```tsx
import { ComposedChartComponent } from '@/components/analytics'

<ComposedChartComponent
  data={multiMetricData}
  elements={[
    { dataKey: 'clicks', label: 'クリック数', type: 'bar', yAxisId: 'left' },
    { dataKey: 'rate', label: 'クリック率', type: 'line', yAxisId: 'right' }
  ]}
/>
```

## UI Components

### 6. MetricCard
Metric display card with trend indicator.

**File**: `components/analytics/MetricCard.tsx`

**Props**:
- `metric`: AnalyticsMetric - Metric data object
- `icon`: React.ComponentType (optional) - Icon component
- `className`: string (optional) - Additional CSS classes

**AnalyticsMetric Type**:
```typescript
{
  label: string
  value: number
  previousValue?: number
  change?: number
  changePercentage?: number
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}
```

**Usage**:
```tsx
import { MetricCard } from '@/components/analytics'
import { UsersIcon } from '@heroicons/react/24/outline'

<MetricCard
  metric={{
    label: 'Total Users',
    value: 1250,
    changePercentage: 12.5,
    trend: 'up'
  }}
  icon={UsersIcon}
/>
```

### 7. TrendIndicator
Trend indicator with percentage display.

**File**: `components/analytics/TrendIndicator.tsx`

**Props**:
- `value`: number - Trend value (positive/negative)
- `showPercentage`: boolean (default: true) - Show as percentage
- `showIcon`: boolean (default: true) - Show trend icon
- `showLabel`: boolean (default: false) - Show label
- `label`: string (default: '前期比') - Label text
- `size`: 'sm' | 'md' | 'lg' (default: 'md') - Component size

**Usage**:
```tsx
import { TrendIndicator } from '@/components/analytics'

<TrendIndicator value={15.5} showLabel={true} />
<TrendIndicator value={-5.2} size="lg" />
```

### 8. ExportButton
Export button with format selection.

**File**: `components/analytics/ExportButton.tsx`

**Props**:
- `onExport`: (format: ExportFormat) => Promise<void> - Export handler
- `formats`: ExportFormat[] (default: ['csv', 'png', 'pdf']) - Available formats
- `defaultFormat`: ExportFormat (default: 'csv') - Default selected format
- `disabled`: boolean (default: false) - Disable button
- `loading`: boolean (default: false) - Loading state

**Usage**:
```tsx
import { ExportButton } from '@/components/analytics'

<ExportButton
  onExport={async (format) => {
    await exportData(format)
  }}
  formats={['csv', 'png', 'pdf']}
/>
```

### 9. LoadingChart
Chart loading skeleton.

**File**: `components/analytics/LoadingChart.tsx`

**Props**:
- `title`: string (optional) - Loading card title
- `description`: string (optional) - Loading card description
- `height`: number (default: 300) - Chart height
- `showHeader`: boolean (default: true) - Show header skeleton

**Usage**:
```tsx
import { LoadingChart } from '@/components/analytics'

{isLoading ? (
  <LoadingChart title="Loading chart..." height={400} />
) : (
  <TimeSeriesChart data={data} />
)}
```

### 10. EmptyState
Empty data state display.

**File**: `components/analytics/EmptyState.tsx`

**Props**:
- `title`: string (default: 'データがありません') - Empty state title
- `message`: string (default: '選択した期間にデータが見つかりませんでした。') - Message
- `actionLabel`: string (optional) - Action button label
- `onAction`: () => void (optional) - Action button handler
- `icon`: React.ComponentType (default: ChartBarIcon) - Icon component
- `height`: number (default: 300) - Container height

**Usage**:
```tsx
import { EmptyState } from '@/components/analytics'

{data.length === 0 ? (
  <EmptyState
    title="No data available"
    message="Try selecting a different date range"
    actionLabel="Reset filters"
    onAction={() => resetFilters()}
  />
) : (
  <Chart data={data} />
)}
```

### 11. ChartContainer
Chart wrapper with title, description, and actions.

**File**: `components/analytics/ChartContainer.tsx`

**Props**:
- `title`: string - Chart title
- `description`: string (optional) - Chart description
- `action`: ReactNode (optional) - Action buttons/controls
- `loading`: boolean (default: false) - Loading state
- `error`: string | null (default: null) - Error message
- `children`: ReactNode - Chart content

**Usage**:
```tsx
import { ChartContainer } from '@/components/analytics'

<ChartContainer
  title="Daily Clicks"
  description="Click trends over time"
  action={<ExportButton onExport={handleExport} />}
  loading={isLoading}
  error={error}
>
  <TimeSeriesChart data={data} />
</ChartContainer>
```

### 12. FilterPanel
Filter panel with multiple filter types.

**File**: `components/analytics/FilterPanel.tsx`

**Props**:
- `filters`: FilterOption[] - Array of filter configurations
- `onFilterChange`: (filterId: string, value: string | string[]) => void - Change handler
- `onReset`: () => void (optional) - Reset handler
- `showResetButton`: boolean (default: true) - Show reset button

**FilterOption Type**:
```typescript
{
  id: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'text'
  options?: { value: string; label: string }[]
  value?: string | string[]
}
```

**Usage**:
```tsx
import { FilterPanel } from '@/components/analytics'

<FilterPanel
  filters={[
    {
      id: 'category',
      label: 'カテゴリ',
      type: 'select',
      options: [
        { value: 'all', label: 'すべて' },
        { value: 'news', label: 'ニュース' }
      ],
      value: 'all'
    }
  ]}
  onFilterChange={(id, value) => setFilters({ ...filters, [id]: value })}
  onReset={() => setFilters({})}
/>
```

## Utilities

### Chart Utilities (chart-utils.ts)

**Functions**:
- `formatNumber(num: number): string` - Format with commas
- `formatCurrency(num: number, currency?: string): string` - Format as currency
- `formatPercentage(num: number, decimals?: number): string` - Format as percentage
- `formatCompactNumber(num: number): string` - Format with K/M suffix (1000 → 1K)
- `formatChartDate(dateString: string, format?: 'short' | 'medium' | 'long'): string` - Format date for charts
- `calculatePercentage(value: number, total: number): number` - Calculate percentage
- `calculateChangePercentage(current: number, previous: number): number` - Calculate change percentage
- `calculateTrend(current: number, previous: number): 'up' | 'down' | 'neutral'` - Determine trend
- `exportToCSV(data: ChartData[], filename: string): void` - Export data to CSV
- `generateChartColors(count: number, palette?: string): string[]` - Generate color array

### Analytics Utilities (analytics-utils.ts)

**Functions**:
- `calculateStatistics(values: number[]): StatisticalSummary` - Calculate statistical summary
- `comparePeriods(current: TimeSeriesData[], previous: TimeSeriesData[]): PeriodComparison` - Compare two periods
- `calculateGrowthRate(data: TimeSeriesData[]): number` - Calculate overall growth rate
- `detectAnomalies(data: TimeSeriesData[], threshold?: number): Anomaly[]` - Detect data anomalies
- `calculateRetentionRate(totalAtStart: number, totalAtEnd: number, newAdditions: number): number` - Calculate retention
- `calculateChurnRate(totalLost: number, totalAtStart: number): number` - Calculate churn
- `createMetric(label: string, currentValue: number, previousValue?: number, color?: string): AnalyticsMetric` - Create metric object
- `forecastLinear(data: TimeSeriesData[], periods: number): ForecastPoint[]` - Linear forecast

### Chart Configuration (chart-config.ts)

**Constants**:
- `RECHARTS_DEFAULT_CONFIG` - Default Recharts configuration
- `CHART_DIMENSIONS` - Standard chart dimensions
- `COLOR_PALETTES` - Color palette definitions
- `FONT_CONFIG` - Font configuration
- `TOOLTIP_CONFIG` - Tooltip styling
- `AXIS_CONFIG` - Axis styling
- `GRID_CONFIG` - Grid styling
- `LINE_CHART_CONFIG` - Line chart specific config
- `BAR_CHART_CONFIG` - Bar chart specific config
- `PIE_CHART_CONFIG` - Pie chart specific config
- `AREA_CHART_CONFIG` - Area chart specific config

**Functions**:
- `getColorByValue(value: number, thresholds: object): string` - Get color based on value thresholds
- `createChartConfig(dataKey: string, label: string, options?: object): ChartConfig` - Create chart config object
- `getGradientId(dataKey: string): string` - Generate gradient ID for area charts

## Import Paths

All components can be imported from the main analytics index:

```tsx
import {
  // Charts
  TimeSeriesChart,
  BarChartComponent,
  PieChartComponent,
  AreaChartComponent,
  ComposedChartComponent,

  // UI Components
  MetricCard,
  TrendIndicator,
  ExportButton,
  LoadingChart,
  EmptyState,
  ChartContainer,
  FilterPanel,

  // Legacy Wrappers
  LineChartWrapper,
  BarChartWrapper,
  PieChartWrapper,
  AreaChartWrapper,
  ComposedChartWrapper,
} from '@/components/analytics'

// Utilities
import {
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  calculateTrend,
  exportToCSV,
} from '@/lib/utils/chart-utils'

import {
  calculateStatistics,
  createMetric,
  detectAnomalies,
} from '@/lib/utils/analytics-utils'

import {
  COLOR_PALETTES,
  CHART_DIMENSIONS,
  getColorByValue,
} from '@/lib/utils/chart-config'
```

## Color Palettes

Pre-defined color palettes available:
- `blue`: Primary blue shades
- `green`: Success/growth colors
- `purple`: Alternative accent colors
- `orange`: Warning colors
- `red`: Error/decline colors
- `cyan`: Info colors
- `amber`: Secondary warning colors
- `pink`: Accent colors

## Responsive Design

All chart components are responsive by default using Recharts' `ResponsiveContainer`.

Recommended breakpoints:
- Mobile: 640px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1280px

## Accessibility

All components include:
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader friendly tooltips
- Color contrast compliance

## Best Practices

1. **Always provide loading states**: Use `LoadingChart` while fetching data
2. **Handle empty states**: Use `EmptyState` when no data is available
3. **Use consistent colors**: Stick to defined color palettes
4. **Format numbers**: Use utility functions for consistent formatting
5. **Provide context**: Use `ChartContainer` for titles and descriptions
6. **Enable export**: Add `ExportButton` for user data export
7. **Show trends**: Use `TrendIndicator` for period comparisons

## Complete Example

```tsx
'use client'

import { useState } from 'react'
import {
  TimeSeriesChart,
  ChartContainer,
  LoadingChart,
  EmptyState,
  ExportButton,
  MetricCard,
  FilterPanel,
} from '@/components/analytics'
import { formatCompactNumber, exportToCSV } from '@/lib/utils/chart-utils'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [filters, setFilters] = useState({})

  const handleExport = async (format) => {
    if (format === 'csv') {
      exportToCSV(data, 'analytics-data')
    }
  }

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          metric={{
            label: 'Total Clicks',
            value: 1250,
            changePercentage: 12.5,
            trend: 'up'
          }}
          icon={ChartBarIcon}
        />
      </div>

      {/* Filters */}
      <FilterPanel
        filters={[
          {
            id: 'period',
            label: '期間',
            type: 'select',
            options: [
              { value: '7d', label: '7日間' },
              { value: '30d', label: '30日間' }
            ]
          }
        ]}
        onFilterChange={(id, value) => setFilters({ ...filters, [id]: value })}
      />

      {/* Chart */}
      <ChartContainer
        title="Click Trends"
        description="Daily click statistics"
        action={<ExportButton onExport={handleExport} />}
      >
        {loading ? (
          <LoadingChart height={400} />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <TimeSeriesChart
            data={data}
            height={400}
            configs={[
              { dataKey: 'clicks', label: 'クリック数', color: '#3b82f6' }
            ]}
          />
        )}
      </ChartContainer>
    </div>
  )
}
```

## Summary

This analytics common component library provides:
- 5 chart component types (Time Series, Bar, Pie, Area, Composed)
- 7 UI components (MetricCard, TrendIndicator, ExportButton, LoadingChart, EmptyState, ChartContainer, FilterPanel)
- 3 utility modules (chart-utils, analytics-utils, chart-config)
- Full TypeScript support
- Responsive design
- Accessibility features
- Consistent styling with shadcn/ui
- Easy import paths

All components follow the existing project patterns and are ready for production use.

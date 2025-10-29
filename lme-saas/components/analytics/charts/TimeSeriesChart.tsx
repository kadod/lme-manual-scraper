'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { TimeSeriesData, ChartConfig } from '@/types/analytics'
import { DEFAULT_CHART_COLORS, formatChartDate, formatCompactNumber } from '@/lib/utils/chart-utils'

interface TimeSeriesChartProps {
  data: TimeSeriesData[]
  configs?: ChartConfig[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  dateFormat?: 'short' | 'medium' | 'long'
  strokeWidth?: number
  dot?: boolean
  colors?: string[]
  className?: string
}

export function TimeSeriesChart({
  data,
  configs,
  height = 300,
  showGrid = true,
  showLegend = true,
  dateFormat = 'short',
  strokeWidth = 2,
  dot = true,
  colors = DEFAULT_CHART_COLORS,
  className,
}: TimeSeriesChartProps) {
  const defaultConfigs: ChartConfig[] = configs || [
    { dataKey: 'value', label: '値', color: colors[0] }
  ]

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickFormatter={(value) => formatChartDate(value, dateFormat)}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickFormatter={(value) => formatCompactNumber(value)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
          labelFormatter={(value) => formatChartDate(value, 'long')}
          formatter={(value: number) => formatCompactNumber(value)}
        />
        {showLegend && <Legend />}
        {defaultConfigs.map((config, index) => (
          <Line
            key={config.dataKey}
            type="monotone"
            dataKey={config.dataKey}
            name={config.label}
            stroke={config.color || colors[index % colors.length]}
            strokeWidth={strokeWidth}
            dot={dot}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

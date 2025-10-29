'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ChartData, ChartConfig } from '@/types/analytics'
import { DEFAULT_CHART_COLORS, formatCompactNumber } from '@/lib/utils/chart-utils'

interface BarChartComponentProps {
  data: ChartData[]
  configs?: ChartConfig[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  layout?: 'horizontal' | 'vertical'
  colors?: string[]
  barSize?: number
  radius?: number | [number, number, number, number]
  className?: string
}

export function BarChartComponent({
  data,
  configs,
  height = 300,
  showGrid = true,
  showLegend = true,
  layout = 'vertical',
  colors = DEFAULT_CHART_COLORS,
  barSize = 40,
  radius = [4, 4, 0, 0],
  className,
}: BarChartComponentProps) {
  const defaultConfigs: ChartConfig[] = configs || [
    { dataKey: 'value', label: '値', color: colors[0] }
  ]

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        {layout === 'vertical' ? (
          <>
            <XAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              type="number"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => formatCompactNumber(value)}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
          formatter={(value: number) => formatCompactNumber(value)}
        />
        {showLegend && <Legend />}
        {defaultConfigs.map((config, index) => (
          <Bar
            key={config.dataKey}
            dataKey={config.dataKey}
            name={config.label}
            fill={config.color || colors[index % colors.length]}
            barSize={barSize}
            radius={radius}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ChartConfig } from '@/types/analytics'
import { DEFAULT_CHART_COLORS } from '@/lib/utils/chart-utils'

interface BarChartWrapperProps {
  data: Record<string, string | number>[]
  configs: ChartConfig[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  xAxisKey?: string
  layout?: 'horizontal' | 'vertical'
  barSize?: number
  colors?: string[]
}

export function BarChartWrapper({
  data,
  configs,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
  layout = 'horizontal',
  barSize,
  colors = DEFAULT_CHART_COLORS,
}: BarChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        {layout === 'horizontal' ? (
          <>
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
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
        />
        {showLegend && <Legend />}
        {configs.map((config, index) => (
          <Bar
            key={config.dataKey}
            dataKey={config.dataKey}
            name={config.label}
            fill={config.color || colors[index % colors.length]}
            barSize={barSize}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

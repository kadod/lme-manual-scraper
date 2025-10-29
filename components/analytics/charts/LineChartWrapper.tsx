'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ChartConfig } from '@/types/analytics'
import { DEFAULT_CHART_COLORS } from '@/lib/utils/chart-utils'

interface LineChartWrapperProps {
  data: Record<string, string | number>[]
  configs: ChartConfig[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  xAxisKey?: string
  strokeWidth?: number
  dot?: boolean
  colors?: string[]
}

export function LineChartWrapper({
  data,
  configs,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
  strokeWidth = 2,
  dot = true,
  colors = DEFAULT_CHART_COLORS,
}: LineChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
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

'use client'

import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ChartConfig } from '@/types/analytics'
import { DEFAULT_CHART_COLORS } from '@/lib/utils/chart-utils'

interface ChartElement extends ChartConfig {
  type: 'line' | 'bar' | 'area'
}

interface ComposedChartWrapperProps {
  data: Record<string, string | number>[]
  elements: ChartElement[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  xAxisKey?: string
  colors?: string[]
}

export function ComposedChartWrapper({
  data,
  elements,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
  colors = DEFAULT_CHART_COLORS,
}: ComposedChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
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
        {elements.map((element, index) => {
          const color = element.color || colors[index % colors.length]

          switch (element.type) {
            case 'bar':
              return (
                <Bar
                  key={element.dataKey}
                  dataKey={element.dataKey}
                  name={element.label}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                />
              )
            case 'area':
              return (
                <Area
                  key={element.dataKey}
                  type="monotone"
                  dataKey={element.dataKey}
                  name={element.label}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                />
              )
            case 'line':
            default:
              return (
                <Line
                  key={element.dataKey}
                  type="monotone"
                  dataKey={element.dataKey}
                  name={element.label}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              )
          }
        })}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

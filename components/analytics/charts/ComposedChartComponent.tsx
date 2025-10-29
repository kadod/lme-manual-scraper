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
import type { ChartData } from '@/types/analytics'
import { DEFAULT_CHART_COLORS, formatCompactNumber } from '@/lib/utils/chart-utils'

interface ChartElement {
  dataKey: string
  label: string
  type: 'line' | 'bar' | 'area'
  color?: string
  yAxisId?: 'left' | 'right'
}

interface ComposedChartComponentProps {
  data: ChartData[]
  elements: ChartElement[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  xAxisKey?: string
  colors?: string[]
  className?: string
}

export function ComposedChartComponent({
  data,
  elements,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
  colors = DEFAULT_CHART_COLORS,
  className,
}: ComposedChartComponentProps) {
  const hasRightAxis = elements.some(el => el.yAxisId === 'right')

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <ComposedChart
        data={data}
        margin={{ top: 5, right: hasRightAxis ? 50 : 30, left: 20, bottom: 5 }}
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
          yAxisId="left"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickFormatter={(value) => formatCompactNumber(value)}
        />
        {hasRightAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            tickFormatter={(value) => formatCompactNumber(value)}
          />
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
        {elements.map((element, index) => {
          const color = element.color || colors[index % colors.length]
          const yAxisId = element.yAxisId || 'left'

          switch (element.type) {
            case 'bar':
              return (
                <Bar
                  key={element.dataKey}
                  dataKey={element.dataKey}
                  name={element.label}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  yAxisId={yAxisId}
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
                  yAxisId={yAxisId}
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
                  yAxisId={yAxisId}
                />
              )
          }
        })}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

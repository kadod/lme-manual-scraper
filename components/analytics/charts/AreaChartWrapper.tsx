'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ChartConfig } from '@/types/analytics'
import { DEFAULT_CHART_COLORS } from '@/lib/utils/chart-utils'

interface AreaChartWrapperProps {
  data: Record<string, string | number>[]
  configs: ChartConfig[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  xAxisKey?: string
  stacked?: boolean
  fillOpacity?: number
  colors?: string[]
}

export function AreaChartWrapper({
  data,
  configs,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
  stacked = false,
  fillOpacity = 0.6,
  colors = DEFAULT_CHART_COLORS,
}: AreaChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          {configs.map((config, index) => (
            <linearGradient
              key={config.dataKey}
              id={`color-${config.dataKey}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={config.color || colors[index % colors.length]}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={config.color || colors[index % colors.length]}
                stopOpacity={0.1}
              />
            </linearGradient>
          ))}
        </defs>
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
          <Area
            key={config.dataKey}
            type="monotone"
            dataKey={config.dataKey}
            name={config.label}
            stroke={config.color || colors[index % colors.length]}
            fill={`url(#color-${config.dataKey})`}
            fillOpacity={fillOpacity}
            stackId={stacked ? '1' : undefined}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

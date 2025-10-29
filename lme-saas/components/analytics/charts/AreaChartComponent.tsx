'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { TimeSeriesData, ChartConfig } from '@/types/analytics'
import { DEFAULT_CHART_COLORS, formatChartDate, formatCompactNumber } from '@/lib/utils/chart-utils'

interface AreaChartComponentProps {
  data: TimeSeriesData[]
  configs?: ChartConfig[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  stacked?: boolean
  fillOpacity?: number
  dateFormat?: 'short' | 'medium' | 'long'
  colors?: string[]
  className?: string
}

export function AreaChartComponent({
  data,
  configs,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  fillOpacity = 0.6,
  dateFormat = 'short',
  colors = DEFAULT_CHART_COLORS,
  className,
}: AreaChartComponentProps) {
  const defaultConfigs: ChartConfig[] = configs || [
    { dataKey: 'value', label: '値', color: colors[0] }
  ]

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          {defaultConfigs.map((config, index) => (
            <linearGradient
              key={config.dataKey}
              id={`gradient-${config.dataKey}`}
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
          <Area
            key={config.dataKey}
            type="monotone"
            dataKey={config.dataKey}
            name={config.label}
            stroke={config.color || colors[index % colors.length]}
            fill={`url(#gradient-${config.dataKey})`}
            fillOpacity={fillOpacity}
            stackId={stacked ? '1' : undefined}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

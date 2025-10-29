'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { ChartData } from '@/types/analytics'
import { DEFAULT_CHART_COLORS, formatPercentage, formatCompactNumber } from '@/lib/utils/chart-utils'

interface PieChartComponentProps {
  data: ChartData[]
  height?: number
  showLegend?: boolean
  showPercentage?: boolean
  innerRadius?: number
  outerRadius?: number
  colors?: string[]
  valueKey?: string
  nameKey?: string
  className?: string
}

export function PieChartComponent({
  data,
  height = 300,
  showLegend = true,
  showPercentage = true,
  innerRadius = 0,
  outerRadius = 80,
  colors = DEFAULT_CHART_COLORS,
  valueKey = 'value',
  nameKey = 'name',
  className,
}: PieChartComponentProps) {
  const renderLabel = ({ name, percent }: { name: string; percent: number }) => {
    if (!showPercentage) return name
    return `${name}: ${formatPercentage(percent * 100, 0)}`
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
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
      </PieChart>
    </ResponsiveContainer>
  )
}

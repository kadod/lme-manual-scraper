'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { ChartData } from '@/types/analytics'
import { DEFAULT_CHART_COLORS } from '@/lib/utils/chart-utils'

interface PieChartWrapperProps {
  data: ChartData[]
  height?: number
  showLegend?: boolean
  innerRadius?: number
  outerRadius?: number
  colors?: string[]
  valueKey?: string
  nameKey?: string
}

export function PieChartWrapper({
  data,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  colors = DEFAULT_CHART_COLORS,
  valueKey = 'value',
  nameKey = 'name',
}: PieChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
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
        />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  )
}

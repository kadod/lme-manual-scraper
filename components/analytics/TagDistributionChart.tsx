'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
} from 'recharts'

interface TagDistributionData {
  name: string
  value: number
}

interface TagDistributionChartProps {
  data: TagDistributionData[]
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#9333EA', // purple
  '#F59E0B', // orange
  '#EF4444', // red
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#14B8A6', // teal
]

export function TagDistributionChart({ data }: TagDistributionChartProps) {
  // Transform data to match expected chart format
  const chartData = data.map(item => ({
    ...item,
    name: item.name,
    value: item.value
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>タグ別友だち分布</CardTitle>
        <CardDescription>各タグに属する友だちの割合</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: PieLabelRenderProps) => {
                const { name, percent } = props
                const percentValue = typeof percent === 'number' ? percent : 0
                return `${name} (${(percentValue * 100).toFixed(0)}%)`
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

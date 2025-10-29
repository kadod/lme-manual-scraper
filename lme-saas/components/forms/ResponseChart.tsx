'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

interface ResponseTrend {
  date: string
  total_responses: number
  completed_responses: number
  avg_completion_time: number | null
}

interface ResponseChartProps {
  data: ResponseTrend[]
  type?: 'line' | 'bar'
  title: string
  dataKey: 'total_responses' | 'completed_responses' | 'avg_completion_time'
  label: string
}

export function ResponseChart({
  data,
  type = 'line',
  title,
  dataKey,
  label
}: ResponseChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: format(new Date(item.date), 'MM/dd'),
      [dataKey]: item[dataKey] || 0
    }))
  }, [data, dataKey])

  const ChartComponent = type === 'line' ? LineChart : BarChart

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ChartComponent data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis className="text-xs" tick={{ fill: '#6B7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <Legend />
            {type === 'line' ? (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#3B82F6"
                strokeWidth={2}
                name={label}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            ) : (
              <Bar
                dataKey={dataKey}
                fill="#3B82F6"
                name={label}
                radius={[4, 4, 0, 0]}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface MultiLineChartProps {
  data: ResponseTrend[]
  title: string
}

export function ResponseTrendChart({ data, title }: MultiLineChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: format(new Date(item.date), 'MM/dd'),
      total: item.total_responses || 0,
      completed: item.completed_responses || 0
    }))
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis className="text-xs" tick={{ fill: '#6B7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3B82F6"
              strokeWidth={2}
              name="総回答数"
              dot={{ fill: '#3B82F6', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10B981"
              strokeWidth={2}
              name="完了回答数"
              dot={{ fill: '#10B981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

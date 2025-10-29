'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface MessagePerformanceData {
  date: string
  sent: number
  delivered: number
  openRate: number
}

interface MessagePerformanceChartProps {
  data: MessagePerformanceData[]
}

export function MessagePerformanceChart({ data }: MessagePerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>メッセージパフォーマンス</CardTitle>
        <CardDescription>配信数と開封率の推移</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: '#6B7280' }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: '#6B7280' }}
              label={{ value: '配信数', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: '#6B7280' }}
              label={{ value: '開封率 (%)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="sent"
              fill="#3B82F6"
              name="配信数"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="openRate"
              stroke="#9333EA"
              strokeWidth={2}
              name="開封率 (%)"
              dot={{ fill: '#9333EA' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

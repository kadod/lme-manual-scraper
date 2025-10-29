'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface MessageStatsData {
  date: string
  sent: number
  delivered: number
  failed: number
}

interface MessageStatsChartProps {
  data: MessageStatsData[]
}

export function MessageStatsChart({ data }: MessageStatsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>メッセージ配信推移</CardTitle>
        <CardDescription>日別の配信ステータス</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
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
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="sent" fill="#3B82F6" name="送信" />
            <Bar dataKey="delivered" fill="#10B981" name="配信完了" />
            <Bar dataKey="failed" fill="#EF4444" name="失敗" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

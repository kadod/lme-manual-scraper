'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface EngagementData {
  date: string
  messages: number
  openRate: number
  clickRate: number
}

interface EngagementChartProps {
  data: EngagementData[]
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>エンゲージメント推移</CardTitle>
        <CardDescription>開封率とクリック率の変化</CardDescription>
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
              label={{ value: 'メッセージ数', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: '#6B7280' }}
              label={{ value: '率 (%)', angle: 90, position: 'insideRight' }}
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
              dataKey="messages"
              fill="#93C5FD"
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
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="clickRate"
              stroke="#F59E0B"
              strokeWidth={2}
              name="クリック率 (%)"
              dot={{ fill: '#F59E0B' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

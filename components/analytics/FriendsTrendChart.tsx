'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface FriendsTrendData {
  date: string
  friends: number
  newFriends: number
  blocked: number
}

interface FriendsTrendChartProps {
  data: FriendsTrendData[]
}

export function FriendsTrendChart({ data }: FriendsTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>友だち推移</CardTitle>
        <CardDescription>日別の友だち数の変化</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
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
            <Line
              type="monotone"
              dataKey="friends"
              stroke="#3B82F6"
              strokeWidth={2}
              name="友だち総数"
              dot={{ fill: '#3B82F6' }}
            />
            <Line
              type="monotone"
              dataKey="newFriends"
              stroke="#10B981"
              strokeWidth={2}
              name="新規友だち"
              dot={{ fill: '#10B981' }}
            />
            <Line
              type="monotone"
              dataKey="blocked"
              stroke="#EF4444"
              strokeWidth={2}
              name="ブロック"
              dot={{ fill: '#EF4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

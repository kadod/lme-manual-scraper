'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DeviceData {
  name: string
  value: number
}

interface DeviceChartProps {
  data: DeviceData[]
}

const COLORS = {
  iOS: '#3B82F6',
  Android: '#10B981',
  'Web (PC)': '#9333EA',
  'Web (Mobile)': '#F59E0B',
  その他: '#6B7280',
}

export function DeviceChart({ data }: DeviceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>デバイス別アクセス</CardTitle>
        <CardDescription>友だちのデバイス分布</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name as keyof typeof COLORS] || COLORS['その他']}
                />
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

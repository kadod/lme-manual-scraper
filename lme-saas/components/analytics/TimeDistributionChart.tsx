'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TimeDistributionChartProps {
  data: Array<{ hour: number; clicks: number }>
}

export function TimeDistributionChart({ data }: TimeDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>時間帯分析</CardTitle>
          <CardDescription>時間帯別のクリック数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            データがありません
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map(item => ({
    hour: `${item.hour}:00`,
    clicks: item.clicks,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>時間帯分析</CardTitle>
        <CardDescription>時間帯別のクリック数（24時間）</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="hour"
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelFormatter={(value) => `${value}`}
            />
            <Bar
              dataKey="clicks"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

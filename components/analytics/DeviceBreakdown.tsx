'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { DevicePhoneMobileIcon, ComputerDesktopIcon, DeviceTabletIcon } from '@heroicons/react/24/outline'

interface DeviceBreakdownProps {
  data: Array<{ device: string; clicks: number }>
}

const COLORS = {
  mobile: 'hsl(var(--chart-1))',
  desktop: 'hsl(var(--chart-2))',
  tablet: 'hsl(var(--chart-3))',
  Unknown: 'hsl(var(--muted))',
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: 'モバイル',
  desktop: 'デスクトップ',
  tablet: 'タブレット',
  Unknown: '不明',
}

const DEVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  mobile: DevicePhoneMobileIcon,
  desktop: ComputerDesktopIcon,
  tablet: DeviceTabletIcon,
}

export function DeviceBreakdown({ data }: DeviceBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>デバイス分析</CardTitle>
          <CardDescription>デバイス別のクリック数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            データがありません
          </div>
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.clicks, 0)

  const chartData = data.map(item => ({
    name: DEVICE_LABELS[item.device] || item.device,
    value: item.clicks,
    device: item.device,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>デバイス分析</CardTitle>
        <CardDescription>デバイス別のクリック数</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.device as keyof typeof COLORS] || COLORS.Unknown}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            {data.map((item) => {
              const Icon = DEVICE_ICONS[item.device]
              const percentage = ((item.clicks / total) * 100).toFixed(1)

              return (
                <div key={item.device} className="flex items-center gap-3">
                  {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                  <div className="flex-1 min-w-[120px]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {DEVICE_LABELS[item.device] || item.device}
                      </span>
                      <span className="text-sm text-muted-foreground ml-4">
                        {percentage}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.clicks.toLocaleString()} クリック
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

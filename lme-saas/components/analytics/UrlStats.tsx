'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface ClicksByDate {
  date: string
  clicks: number
}

interface ClicksByDevice {
  device: string
  clicks: number
}

interface ClicksByReferrer {
  referrer: string
  clicks: number
}

interface UrlStatsProps {
  clicksByDate: ClicksByDate[]
  clicksByDevice: ClicksByDevice[]
  clicksByReferrer: ClicksByReferrer[]
  clicksByHour?: { hour: number; clicks: number }[]
}

const DEVICE_COLORS = {
  mobile: '#10b981',
  tablet: '#f59e0b',
  desktop: '#3b82f6',
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function UrlStats({
  clicksByDate,
  clicksByDevice,
  clicksByReferrer,
  clicksByHour = []
}: UrlStatsProps) {
  // Process browser data from user agents (simplified)
  const clicksByBrowser = clicksByReferrer.reduce((acc, item) => {
    // This is a simplified browser detection
    // In production, you'd parse user agents properly
    let browser = 'その他'

    const ref = item.referrer.toLowerCase()
    if (ref.includes('chrome')) browser = 'Chrome'
    else if (ref.includes('safari')) browser = 'Safari'
    else if (ref.includes('firefox')) browser = 'Firefox'
    else if (ref.includes('edge')) browser = 'Edge'

    const existing = acc.find(b => b.browser === browser)
    if (existing) {
      existing.clicks += item.clicks
    } else {
      acc.push({ browser, clicks: item.clicks })
    }
    return acc
  }, [] as { browser: string; clicks: number }[])

  // Calculate totals
  const totalClicks = clicksByDate.reduce((sum, item) => sum + item.clicks, 0)
  const deviceData = clicksByDevice.map(item => ({
    ...item,
    percentage: totalClicks > 0 ? ((item.clicks / totalClicks) * 100).toFixed(1) : '0',
  }))

  return (
    <Tabs defaultValue="timeline" className="space-y-4">
      <TabsList>
        <TabsTrigger value="timeline">時系列</TabsTrigger>
        <TabsTrigger value="device">デバイス</TabsTrigger>
        <TabsTrigger value="browser">ブラウザ</TabsTrigger>
        <TabsTrigger value="referrer">リファラー</TabsTrigger>
      </TabsList>

      <TabsContent value="timeline" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>日別クリック数</CardTitle>
            <CardDescription>
              過去のクリック数の推移
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clicksByDate.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clicksByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleDateString('ja-JP')
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="クリック数"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                データがありません
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="device" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>デバイス別分布</CardTitle>
              <CardDescription>
                デバイスタイプごとのクリック数
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      dataKey="clicks"
                      nameKey="device"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.device}: ${entry.percentage}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DEVICE_COLORS[entry.device as keyof typeof DEVICE_COLORS] || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  データがありません
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>デバイス別詳細</CardTitle>
              <CardDescription>
                各デバイスのクリック数
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deviceData.map((item) => (
                  <div key={item.device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: DEVICE_COLORS[item.device as keyof typeof DEVICE_COLORS] || '#6b7280'
                        }}
                      />
                      <span className="font-medium capitalize">{item.device}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.clicks.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
                {deviceData.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    データがありません
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="browser" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>ブラウザ別クリック数</CardTitle>
            <CardDescription>
              使用ブラウザごとの分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clicksByBrowser.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clicksByBrowser}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="browser" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" fill="#3b82f6" name="クリック数" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                データがありません
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="referrer" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>リファラー一覧</CardTitle>
            <CardDescription>
              トラフィックの参照元
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clicksByReferrer.length > 0 ? (
              <div className="space-y-2">
                {clicksByReferrer.slice(0, 10).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {item.referrer === 'Direct' ? 'ダイレクト' : item.referrer}
                      </p>
                    </div>
                    <div className="font-bold ml-4">
                      {item.clicks.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                データがありません
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ReferrerChartProps {
  data: Array<{ referrer: string; clicks: number }>
}

export function ReferrerChart({ data }: ReferrerChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>リファラー分析</CardTitle>
          <CardDescription>流入元別のクリック数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            データがありません
          </div>
        </CardContent>
      </Card>
    )
  }

  // Shorten long referrer URLs
  const processedData = data.map(item => ({
    ...item,
    displayReferrer: shortenUrl(item.referrer),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>リファラー分析</CardTitle>
        <CardDescription>流入元別のクリック数（上位10件）</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={processedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis
              type="category"
              dataKey="displayReferrer"
              width={120}
              className="text-xs"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value, name, props) => [
                value,
                'クリック数',
                <div key="referrer" className="text-xs text-muted-foreground mt-1">
                  {props.payload.referrer}
                </div>,
              ]}
            />
            <Bar
              dataKey="clicks"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function shortenUrl(url: string): string {
  if (url === 'Direct') return 'ダイレクト'

  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')
    return domain
  } catch {
    return url.length > 20 ? url.substring(0, 20) + '...' : url
  }
}

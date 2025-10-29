'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ResponseTrendData, RulePerformanceData, SuccessRateTrendData } from '@/types/auto-response'

interface ResponseStatsProps {
  trendData: ResponseTrendData[]
  rulePerformance: RulePerformanceData[]
  successRateTrend: SuccessRateTrendData[]
}

export function ResponseStats({ trendData, rulePerformance, successRateTrend }: ResponseStatsProps) {
  // Transform data for charts
  const responseTrendChartData = trendData.map(item => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
    total: item.total_responses,
    keyword: item.keyword_responses,
    regex: item.regex_responses,
    ai: item.ai_responses,
    scenario: item.scenario_responses,
  }))

  const rulePerformanceChartData = rulePerformance.slice(0, 10).map(item => ({
    name: item.rule_name,
    count: item.response_count,
    successRate: Math.round(item.success_rate * 100) / 100,
    avgTime: Math.round(item.avg_response_time),
  }))

  const successRateChartData = successRateTrend.map(item => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
    rate: Math.round(item.success_rate * 100) / 100,
    total: item.total_responses,
  }))

  return (
    <div className="space-y-6">
      {/* Response Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>応答数推移</CardTitle>
          <CardDescription>日別の応答数とルールタイプ別内訳</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={responseTrendChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="total" name="総応答数" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="keyword" name="キーワード" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="regex" name="正規表現" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="ai" name="AI" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="scenario" name="シナリオ" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rule Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>ルール別応答数</CardTitle>
            <CardDescription>TOP10ルールのパフォーマンス</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rulePerformanceChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#888888" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={11} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" name="応答数" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Rate Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>成功率推移</CardTitle>
            <CardDescription>日別の応答成功率</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={successRateChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value}%`}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="成功率"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

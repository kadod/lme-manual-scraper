'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

interface FieldAnalyticsProps {
  fieldLabel: string
  fieldType: string
  statistics: any
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
]

export function FieldAnalytics({ fieldLabel, fieldType, statistics }: FieldAnalyticsProps) {
  // Handle different field types
  if (fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox') {
    return <ChoiceFieldAnalytics fieldLabel={fieldLabel} statistics={statistics} />
  }

  if (fieldType === 'number') {
    return <NumberFieldAnalytics fieldLabel={fieldLabel} statistics={statistics} />
  }

  if (fieldType === 'text' || fieldType === 'textarea') {
    return <TextFieldAnalytics fieldLabel={fieldLabel} statistics={statistics} />
  }

  return null
}

function ChoiceFieldAnalytics({ fieldLabel, statistics }: { fieldLabel: string; statistics: any }) {
  const chartData = useMemo(() => {
    if (!statistics || typeof statistics !== 'object') return []

    return Object.entries(statistics)
      .map(([name, value]) => ({
        name: String(name).replace(/^"|"$/g, ''), // Remove quotes if present
        value: Number(value) || 0
      }))
      .sort((a, b) => b.value - a.value)
  }, [statistics])

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fieldLabel}</CardTitle>
        <CardDescription>総回答数: {total}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-6">
        {/* Pie Chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis type="number" className="text-xs" tick={{ fill: '#6B7280' }} />
              <YAxis
                type="category"
                dataKey="name"
                className="text-xs"
                tick={{ fill: '#6B7280' }}
                width={100}
              />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function NumberFieldAnalytics({ fieldLabel, statistics }: { fieldLabel: string; statistics: any }) {
  const stats = useMemo(() => {
    if (!statistics || typeof statistics !== 'object') {
      return {
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
        median: 0
      }
    }

    return {
      count: statistics.count || 0,
      avg: Number(statistics.avg) || 0,
      min: Number(statistics.min) || 0,
      max: Number(statistics.max) || 0,
      median: Number(statistics.median) || 0
    }
  }, [statistics])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fieldLabel}</CardTitle>
        <CardDescription>数値フィールドの統計</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">回答数</div>
            <div className="text-2xl font-bold text-blue-600">{stats.count}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">平均</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.avg.toFixed(2)}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">中央値</div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.median.toFixed(2)}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">最小値</div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.min.toFixed(2)}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">最大値</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.max.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TextFieldAnalytics({ fieldLabel, statistics }: { fieldLabel: string; statistics: any }) {
  const count = statistics?.count || 0
  const sampleResponses = statistics?.sample_responses || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fieldLabel}</CardTitle>
        <CardDescription>テキストフィールドの回答</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-sm text-gray-600">総回答数</div>
          <div className="text-3xl font-bold text-blue-600">{count}</div>
        </div>

        {sampleResponses.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              サンプル回答（最新10件）
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sampleResponses.slice(0, 10).map((response: string, index: number) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-200"
                >
                  {response}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

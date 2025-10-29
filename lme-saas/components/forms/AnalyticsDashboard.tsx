'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ResponseChart, ResponseTrendChart } from './ResponseChart'
import { FieldAnalytics } from './FieldAnalytics'
import { WordCloud } from './WordCloud'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartBarIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface AnalyticsDashboardProps {
  formId: string
  analytics: {
    trends: Array<{
      date: string
      total_responses: number
      completed_responses: number
      avg_completion_time: number | null
    }>
    overallStats: {
      totalResponses: number
      completedResponses: number
      abandonedResponses: number
      avgCompletionTime: number | null
      completionRate: number
    }
    deviceBreakdown: Record<string, number>
    fieldStats: Record<string, any>
    form: {
      title: string
      fields: Array<{
        id: string
        label: string
        type: string
      }>
    }
  }
  wordCloudData?: Record<string, Array<{ text: string; value: number }>>
}

export function AnalyticsDashboard({ formId, analytics, wordCloudData }: AnalyticsDashboardProps) {
  const { trends, overallStats, deviceBreakdown, fieldStats, form } = analytics

  // Calculate device percentages
  const totalDeviceResponses = Object.values(deviceBreakdown).reduce((a, b) => a + b, 0)
  const deviceData = Object.entries(deviceBreakdown).map(([device, count]) => ({
    device,
    count,
    percentage: totalDeviceResponses > 0 ? ((count / totalDeviceResponses) * 100).toFixed(1) : '0'
  }))

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">総回答数</p>
                <p className="text-3xl font-bold text-blue-600">
                  {overallStats.totalResponses}
                </p>
              </div>
              <ChartBarIcon className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">完了回答</p>
                <p className="text-3xl font-bold text-green-600">
                  {overallStats.completedResponses}
                </p>
              </div>
              <CheckCircleIcon className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">離脱数</p>
                <p className="text-3xl font-bold text-red-600">
                  {overallStats.abandonedResponses}
                </p>
              </div>
              <XCircleIcon className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">完了率</p>
                <p className="text-3xl font-bold text-purple-600">
                  {overallStats.completionRate.toFixed(1)}%
                </p>
              </div>
              <ChartBarIcon className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">平均回答時間</p>
                <p className="text-3xl font-bold text-orange-600">
                  {overallStats.avgCompletionTime
                    ? `${Math.round(overallStats.avgCompletionTime)}秒`
                    : '-'}
                </p>
              </div>
              <ClockIcon className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">回答推移</TabsTrigger>
          <TabsTrigger value="fields">フィールド分析</TabsTrigger>
          <TabsTrigger value="device">デバイス分析</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6 mt-6">
          <ResponseTrendChart
            data={trends}
            title="回答数推移"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponseChart
              data={trends}
              type="bar"
              title="日別回答数"
              dataKey="total_responses"
              label="回答数"
            />

            <ResponseChart
              data={trends}
              type="line"
              title="平均回答時間推移"
              dataKey="avg_completion_time"
              label="回答時間（秒）"
            />
          </div>
        </TabsContent>

        <TabsContent value="fields" className="space-y-6 mt-6">
          {form.fields.map(field => {
            const stats = fieldStats[field.id]
            if (!stats) return null

            return (
              <div key={field.id}>
                <FieldAnalytics
                  fieldLabel={field.label}
                  fieldType={field.type}
                  statistics={stats}
                />

                {/* Show word cloud for text fields if data is available */}
                {(field.type === 'text' || field.type === 'textarea') &&
                  wordCloudData?.[field.id] && (
                    <div className="mt-4">
                      <WordCloud
                        words={wordCloudData[field.id]}
                        fieldLabel={field.label}
                      />
                    </div>
                  )}
              </div>
            )
          })}

          {form.fields.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  フィールドが設定されていません
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="device" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>デバイス別回答数</CardTitle>
              <CardDescription>
                回答者が使用したデバイスの分布
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceData.map(({ device, count, percentage }) => (
                  <div key={device}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DevicePhoneMobileIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium capitalize">{device}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-600">{count}</span>
                        <span className="text-gray-500 ml-2">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                {deviceData.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    デバイス情報がありません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Browser statistics could go here if available */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

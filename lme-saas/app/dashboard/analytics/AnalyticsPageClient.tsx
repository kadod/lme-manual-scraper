'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { KPICard } from '@/components/analytics/KPICard'
import { FriendsTrendChart } from '@/components/analytics/FriendsTrendChart'
import { MessageStatsChart } from '@/components/analytics/MessageStatsChart'
import { EngagementChart } from '@/components/analytics/EngagementChart'
import { TagDistributionChart } from '@/components/analytics/TagDistributionChart'
import { DeviceChart } from '@/components/analytics/DeviceChart'
import { TopMessages } from '@/components/analytics/TopMessages'
import { TopURLs } from '@/components/analytics/TopURLs'
import { DateRangePicker, type DateRangePreset, type ComparisonPeriod } from '@/components/analytics/DateRangePicker'
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeOpenIcon,
  CursorArrowRaysIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import type {
  DashboardStats,
  FriendsTrendData,
  MessageStatsData,
  EngagementRateData,
  TagDistributionData,
  DeviceBreakdownData,
} from '@/types/analytics'

interface TopMessage {
  id: string
  title: string
  content: any
  type: string
  sent_at: string
  total_sent: number
  delivered: number
  read: number
  clicked: number
  engagement_score: number
}

interface TopURL {
  id: string
  original_url: string
  short_code: string
  custom_slug: string | null
  campaign_name: string | null
  total_clicks: number
  unique_clicks: number
  created_at: string
}

interface AnalyticsPageClientProps {
  initialStats: DashboardStats
  initialFriendsTrend: FriendsTrendData[]
  initialMessageStats: MessageStatsData
  initialEngagementRate: EngagementRateData
  initialTagDistribution: TagDistributionData[]
  initialDeviceBreakdown: DeviceBreakdownData[]
  initialTopMessages: TopMessage[]
  initialTopUrls: TopURL[]
}

export function AnalyticsPageClient({
  initialStats,
  initialFriendsTrend,
  initialMessageStats,
  initialEngagementRate,
  initialTagDistribution,
  initialDeviceBreakdown,
  initialTopMessages,
  initialTopUrls,
}: AnalyticsPageClientProps) {
  const [selectedRange, setSelectedRange] = useState<DateRangePreset>('30d')
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('previous-month')
  const [isExporting, setIsExporting] = useState(false)

  // Transform data for charts
  const friendsTrendChartData = initialFriendsTrend.map(item => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
    friends: item.total,
    newFriends: item.new_friends,
    blocked: item.blocked,
  }))

  const messageStatsChartData = initialEngagementRate.by_day.map(item => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
    sent: item.messages_sent,
    delivered: item.messages_sent,
    failed: 0,
  }))

  const engagementChartData = initialEngagementRate.by_day.map(item => ({
    date: new Date(item.date).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }),
    messages: item.messages_sent,
    openRate: item.rate,
    clickRate: item.rate * 0.6, // Approximate click rate
  }))

  const tagDistributionChartData = initialTagDistribution.map(item => ({
    name: item.tag_name,
    value: item.friend_count,
  }))

  const deviceChartData = initialDeviceBreakdown.map(item => ({
    name: item.device_type,
    value: item.count,
  }))

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Export logic would go here
      console.log('Exporting analytics data...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">総合アナリティクス</h1>
          <p className="text-gray-600 mt-2">パフォーマンス指標とトレンド分析</p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          {isExporting ? 'エクスポート中...' : 'データをエクスポート'}
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <DateRangePicker
            selectedRange={selectedRange}
            comparisonPeriod={comparisonPeriod}
            onRangeChange={setSelectedRange}
            onComparisonChange={setComparisonPeriod}
          />
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="友だち総数"
          value={initialStats.friendsTotal.toLocaleString()}
          change={initialStats.friendsChangePercent}
          icon={UsersIcon}
          colorScheme="blue"
        />
        <KPICard
          title="配信メッセージ数"
          value={initialStats.messagesTotal.toLocaleString()}
          change={initialStats.messagesChangePercent}
          icon={ChatBubbleLeftRightIcon}
          colorScheme="green"
        />
        <KPICard
          title="配信完了率"
          value={`${initialStats.deliveryRate}%`}
          change={initialStats.deliveryRateChange}
          changeLabel="前期比"
          icon={EnvelopeOpenIcon}
          colorScheme="purple"
        />
        <KPICard
          title="エンゲージメント率"
          value={`${initialStats.engagementRate}%`}
          change={initialStats.engagementRateChange}
          changeLabel="前期比"
          icon={CursorArrowRaysIcon}
          colorScheme="orange"
        />
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="friends">友だち</TabsTrigger>
          <TabsTrigger value="messages">メッセージ</TabsTrigger>
          <TabsTrigger value="engagement">エンゲージメント</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <FriendsTrendChart data={friendsTrendChartData} />
            <MessageStatsChart data={messageStatsChartData} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <EngagementChart data={engagementChartData} />
            <DeviceChart data={deviceChartData} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <TopMessages messages={initialTopMessages.map(msg => ({
              id: msg.id,
              type: msg.type,
              content: msg.content,
              created_at: msg.sent_at,
              sent_count: msg.total_sent,
              delivered_count: msg.delivered,
              read_count: msg.read,
              click_count: msg.clicked,
              open_rate: msg.delivered > 0 ? Math.round((msg.read / msg.delivered) * 100) : 0,
              click_rate: msg.read > 0 ? Math.round((msg.clicked / msg.read) * 100) : 0,
            }))} />
            <TopURLs urls={initialTopUrls.map(url => ({
              id: url.id,
              original_url: url.original_url,
              short_code: url.short_code,
              click_count: url.total_clicks,
              unique_click_count: url.unique_clicks,
              created_at: url.created_at,
            }))} />
          </div>
        </TabsContent>

        <TabsContent value="friends" className="space-y-6">
          <FriendsTrendChart data={friendsTrendChartData} />
          <div className="grid gap-6 lg:grid-cols-2">
            <TagDistributionChart data={tagDistributionChartData} />
            <DeviceChart data={deviceChartData} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>友だち統計</CardTitle>
              <CardDescription>友だち管理の詳細情報</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">総友だち数</span>
                  <span className="text-lg font-semibold">{initialStats.friendsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">期間内の増減</span>
                  <span className={`text-lg font-semibold ${initialStats.friendsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {initialStats.friendsChange >= 0 ? '+' : ''}{initialStats.friendsChange.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">成長率</span>
                  <span className={`text-lg font-semibold ${initialStats.friendsChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {initialStats.friendsChangePercent >= 0 ? '+' : ''}{initialStats.friendsChangePercent}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">タグ付け済み</span>
                  <span className="text-lg font-semibold">
                    {tagDistributionChartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <MessageStatsChart data={messageStatsChartData} />
          <Card>
            <CardHeader>
              <CardTitle>メッセージ統計</CardTitle>
              <CardDescription>配信パフォーマンスの詳細</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">総送信数</span>
                  <span className="text-lg font-semibold">{initialMessageStats.total_sent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">配信完了数</span>
                  <span className="text-lg font-semibold">{initialMessageStats.total_delivered.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">既読数</span>
                  <span className="text-lg font-semibold">{initialMessageStats.total_read.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">クリック数</span>
                  <span className="text-lg font-semibold">{initialMessageStats.total_clicked.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{initialMessageStats.delivery_rate}%</div>
                    <div className="text-xs text-gray-600 mt-1">配信率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{initialMessageStats.read_rate}%</div>
                    <div className="text-xs text-gray-600 mt-1">既読率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{initialMessageStats.click_rate}%</div>
                    <div className="text-xs text-gray-600 mt-1">クリック率</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <EngagementChart data={engagementChartData} />
          <Card>
            <CardHeader>
              <CardTitle>エンゲージメント分析</CardTitle>
              <CardDescription>ユーザーインタラクションの詳細</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">全体エンゲージメント率</span>
                  <span className="text-lg font-semibold text-purple-600">
                    {initialEngagementRate.overall_rate}%
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">平均既読率</span>
                  <span className="text-lg font-semibold">{initialMessageStats.read_rate}%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-600">平均クリック率</span>
                  <span className="text-lg font-semibold">{initialMessageStats.click_rate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">総インタラクション数</span>
                  <span className="text-lg font-semibold">
                    {initialEngagementRate.by_day.reduce((sum, item) => sum + item.interactions, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { KPICard } from '@/components/analytics/KPICard'
import { ResponseStats } from '@/components/auto-response/ResponseStats'
import { ResponseLogsTable } from '@/components/auto-response/ResponseLogsTable'
import { ActiveConversationsList } from '@/components/auto-response/ActiveConversationsList'
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import {
  AutoResponseStats,
  ResponseTrendData,
  RulePerformanceData,
  SuccessRateTrendData,
  ResponseLog,
  ActiveConversation,
} from '@/types/auto-response'

interface AutoResponseAnalyticsClientProps {
  initialStats: AutoResponseStats
  initialTrendData: ResponseTrendData[]
  initialRulePerformance: RulePerformanceData[]
  initialSuccessRateTrend: SuccessRateTrendData[]
  initialLogs: ResponseLog[]
  initialConversations: ActiveConversation[]
}

export function AutoResponseAnalyticsClient({
  initialStats,
  initialTrendData,
  initialRulePerformance,
  initialSuccessRateTrend,
  initialLogs,
  initialConversations,
}: AutoResponseAnalyticsClientProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      // TODO: Implement CSV export
      console.log('Exporting to CSV...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock CSV generation
      const csvContent = [
        ['日時', '友だち名', 'ルール', 'ステータス', '応答時間(ms)'],
        ...initialLogs.slice(0, 10).map(log => [
          log.created_at,
          log.friend_name,
          log.rule_name || '-',
          log.status,
          log.response_time_ms.toString(),
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `auto-response-logs-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // TODO: Implement PDF export
      console.log('Exporting to PDF...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('PDF出力機能は開発中です')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">自動応答分析・ログ</h1>
          <p className="text-gray-600 mt-2">自動応答のパフォーマンスと実行履歴</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            CSVエクスポート
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            PDFレポート
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="総応答数"
          value={initialStats.totalResponses.toLocaleString()}
          change={initialStats.totalResponsesChange}
          changeLabel="前日比"
          icon={ChatBubbleLeftRightIcon}
          colorScheme="blue"
        />
        <KPICard
          title="応答成功率"
          value={`${initialStats.successRate}%`}
          change={initialStats.successRateChange}
          changeLabel="前週比"
          icon={CheckCircleIcon}
          colorScheme="green"
        />
        <KPICard
          title="アクティブルール数"
          value={initialStats.activeRules.toString()}
          icon={CogIcon}
          colorScheme="purple"
        />
        <KPICard
          title="平均応答時間"
          value={`${initialStats.avgResponseTime}ms`}
          change={initialStats.avgResponseTimeChange}
          changeLabel="前週比"
          icon={ClockIcon}
          colorScheme="orange"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            概要ダッシュボード
          </TabsTrigger>
          <TabsTrigger value="logs">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            応答ログ
          </TabsTrigger>
          <TabsTrigger value="conversations">
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
            会話履歴
          </TabsTrigger>
        </TabsList>

        {/* Overview Dashboard */}
        <TabsContent value="overview" className="space-y-6">
          <ResponseStats
            trendData={initialTrendData}
            rulePerformance={initialRulePerformance}
            successRateTrend={initialSuccessRateTrend}
          />

          {/* Quick Stats */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">ルールタイプ別内訳</h3>
                <div className="space-y-3">
                  {[
                    { type: 'キーワード', count: initialRulePerformance.filter(r => r.rule_type === 'keyword').length, color: 'bg-blue-500' },
                    { type: '正規表現', count: initialRulePerformance.filter(r => r.rule_type === 'regex').length, color: 'bg-green-500' },
                    { type: 'AI', count: initialRulePerformance.filter(r => r.rule_type === 'ai').length, color: 'bg-purple-500' },
                    { type: 'シナリオ', count: initialRulePerformance.filter(r => r.rule_type === 'scenario').length, color: 'bg-pink-500' },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm text-gray-600 flex-1">{item.type}</span>
                      <span className="text-sm font-semibold">{item.count}件</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">パフォーマンス指標</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm text-gray-600">平均応答時間</span>
                    <span className="text-lg font-semibold">{initialStats.avgResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm text-gray-600">最速応答ルール</span>
                    <span className="text-sm font-medium">
                      {initialRulePerformance.reduce((prev, curr) =>
                        prev.avg_response_time < curr.avg_response_time ? prev : curr
                      ).rule_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm text-gray-600">最高成功率ルール</span>
                    <span className="text-sm font-medium">
                      {initialRulePerformance.reduce((prev, curr) =>
                        prev.success_rate > curr.success_rate ? prev : curr
                      ).rule_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">総実行回数</span>
                    <span className="text-lg font-semibold">
                      {initialRulePerformance.reduce((sum, rule) => sum + rule.response_count, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Response Logs */}
        <TabsContent value="logs" className="space-y-6">
          <ResponseLogsTable logs={initialLogs} />
        </TabsContent>

        {/* Conversation History */}
        <TabsContent value="conversations" className="space-y-6">
          <ActiveConversationsList
            conversations={initialConversations}
            onViewDetails={(id) => console.log('View conversation:', id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

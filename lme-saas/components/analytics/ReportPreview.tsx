'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  LinkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import type { CustomReport } from '@/types/custom-reports'

interface ReportPreviewProps {
  report: CustomReport
}

export function ReportPreview({ report }: ReportPreviewProps) {
  // Mock data for preview
  const mockData = {
    friends: {
      total: 12847,
      added: 234,
      blocked: 12,
      trend: 18.5,
    },
    messages: {
      sent: 1543,
      opened: 1234,
      clicked: 456,
      openRate: 80.0,
      clickRate: 29.6,
      trend: -5.3,
    },
    reservations: {
      total: 187,
      completed: 156,
      cancelled: 31,
      completionRate: 83.4,
      trend: 12.8,
    },
    forms: {
      responses: 423,
      completed: 389,
      avgTime: '2:34',
      completionRate: 92.0,
      trend: 8.2,
    },
    urlTracking: {
      clicks: 2847,
      uniqueClicks: 1923,
      conversionRate: 15.3,
      trend: 23.4,
    },
  }

  const MetricCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    badge,
    trend,
  }: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    value: string | number
    subtitle?: string
    badge?: string
    trend?: number
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="size-6 text-primary" />
          </div>
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend >= 0 ? (
                <ArrowTrendingUpIcon className="size-4" />
              ) : (
                <ArrowTrendingDownIcon className="size-4" />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>プレビュー</CardTitle>
          <CardDescription>
            以下は現在の設定に基づいたレポートのプレビューです
          </CardDescription>
        </CardHeader>
      </Card>

      {report.metrics.friends && (
        <div>
          <h3 className="text-lg font-semibold mb-4">友だち統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={UserGroupIcon}
              title="総友だち数"
              value={mockData.friends.total.toLocaleString()}
              trend={mockData.friends.trend}
            />
            <MetricCard
              icon={UserGroupIcon}
              title="新規友だち"
              value={mockData.friends.added}
              subtitle="期間内の追加"
            />
            <MetricCard
              icon={UserGroupIcon}
              title="ブロック数"
              value={mockData.friends.blocked}
              subtitle="期間内のブロック"
            />
          </div>
        </div>
      )}

      {report.metrics.messages && (
        <div>
          <h3 className="text-lg font-semibold mb-4">メッセージ統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={ChatBubbleLeftRightIcon}
              title="送信数"
              value={mockData.messages.sent.toLocaleString()}
              trend={mockData.messages.trend}
            />
            <MetricCard
              icon={ChatBubbleLeftRightIcon}
              title="開封率"
              value={`${mockData.messages.openRate}%`}
              subtitle={`${mockData.messages.opened}件開封`}
            />
            <MetricCard
              icon={ChatBubbleLeftRightIcon}
              title="クリック率"
              value={`${mockData.messages.clickRate}%`}
              subtitle={`${mockData.messages.clicked}件クリック`}
            />
          </div>
        </div>
      )}

      {report.metrics.reservations && (
        <div>
          <h3 className="text-lg font-semibold mb-4">予約統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={CalendarDaysIcon}
              title="総予約数"
              value={mockData.reservations.total}
              trend={mockData.reservations.trend}
            />
            <MetricCard
              icon={CalendarDaysIcon}
              title="完了予約"
              value={mockData.reservations.completed}
              subtitle={`完了率 ${mockData.reservations.completionRate}%`}
            />
            <MetricCard
              icon={CalendarDaysIcon}
              title="キャンセル"
              value={mockData.reservations.cancelled}
              subtitle="期間内のキャンセル"
            />
          </div>
        </div>
      )}

      {report.metrics.forms && (
        <div>
          <h3 className="text-lg font-semibold mb-4">フォーム統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={DocumentTextIcon}
              title="回答数"
              value={mockData.forms.responses}
              trend={mockData.forms.trend}
            />
            <MetricCard
              icon={DocumentTextIcon}
              title="完了率"
              value={`${mockData.forms.completionRate}%`}
              subtitle={`${mockData.forms.completed}件完了`}
            />
            <MetricCard
              icon={DocumentTextIcon}
              title="平均回答時間"
              value={mockData.forms.avgTime}
              subtitle="分:秒"
            />
          </div>
        </div>
      )}

      {report.metrics.urlTracking && (
        <div>
          <h3 className="text-lg font-semibold mb-4">URL計測</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={LinkIcon}
              title="クリック数"
              value={mockData.urlTracking.clicks.toLocaleString()}
              trend={mockData.urlTracking.trend}
            />
            <MetricCard
              icon={LinkIcon}
              title="ユニーククリック"
              value={mockData.urlTracking.uniqueClicks.toLocaleString()}
              subtitle="重複除外"
            />
            <MetricCard
              icon={LinkIcon}
              title="コンバージョン率"
              value={`${mockData.urlTracking.conversionRate}%`}
              subtitle="CV達成率"
            />
          </div>
        </div>
      )}
    </div>
  )
}

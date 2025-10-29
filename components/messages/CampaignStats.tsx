'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserGroupIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { Progress } from '@/components/ui/progress'

interface CampaignStatsProps {
  totalSubscribers: number
  activeSubscribers: number
  completedSubscribers: number
  cancelledSubscribers?: number
  stepStats?: Array<{
    step_number: number
    name: string
    sent_count: number
    delivered_count: number
    read_count: number
    click_count: number
  }>
}

export function CampaignStats({
  totalSubscribers,
  activeSubscribers,
  completedSubscribers,
  cancelledSubscribers = 0,
  stepStats = [],
}: CampaignStatsProps) {
  const completionRate = totalSubscribers > 0
    ? Math.round((completedSubscribers / totalSubscribers) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総登録者数</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              配信に登録されているユーザー
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中</CardTitle>
            <ClockIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              現在配信中のユーザー
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              すべてのステップを完了
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">キャンセル</CardTitle>
            <XCircleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              配信をキャンセル
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle>完了率</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{completionRate}%</span>
            <span className="text-sm text-muted-foreground">
              {completedSubscribers} / {totalSubscribers} 人
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Statistics */}
      {stepStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ステップ別統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stepStats.map((stat) => {
                const deliveryRate = stat.sent_count > 0
                  ? Math.round((stat.delivered_count / stat.sent_count) * 100)
                  : 0
                const readRate = stat.delivered_count > 0
                  ? Math.round((stat.read_count / stat.delivered_count) * 100)
                  : 0

                return (
                  <div key={stat.step_number} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">
                          ステップ {stat.step_number}: {stat.name}
                        </h4>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        送信: {stat.sent_count}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">{deliveryRate}%</div>
                        <div className="text-xs text-muted-foreground">配信率</div>
                        <div className="text-xs">({stat.delivered_count})</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{readRate}%</div>
                        <div className="text-xs text-muted-foreground">開封率</div>
                        <div className="text-xs">({stat.read_count})</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{stat.click_count}</div>
                        <div className="text-xs text-muted-foreground">クリック</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

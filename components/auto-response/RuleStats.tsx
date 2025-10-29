'use client'

import { Card } from '@/components/ui/card'
import { ChatBubbleLeftRightIcon, CheckCircleIcon, BoltIcon, ClockIcon } from '@heroicons/react/24/outline'
import type { AutoResponseStats } from '@/types/auto-response'

interface RuleStatsProps {
  stats: AutoResponseStats
}

export function RuleStats({ stats }: RuleStatsProps) {
  const statCards = [
    {
      title: '総ルール数',
      value: stats.totalResponses,
      icon: ChatBubbleLeftRightIcon,
      change: stats.totalResponsesChange,
      changeLabel: '前日比',
    },
    {
      title: 'アクティブルール',
      value: stats.activeRules,
      icon: BoltIcon,
      iconColor: 'text-green-600',
    },
    {
      title: '今日の応答回数',
      value: stats.totalResponses,
      icon: ChatBubbleLeftRightIcon,
      iconColor: 'text-blue-600',
    },
    {
      title: '応答成功率',
      value: `${stats.successRate}%`,
      icon: CheckCircleIcon,
      change: stats.successRateChange,
      changeLabel: '前日比',
      iconColor: 'text-green-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-accent rounded-lg">
              <stat.icon className={`h-6 w-6 ${stat.iconColor || 'text-muted-foreground'}`} />
            </div>
            {stat.change !== undefined && stat.change !== 0 && (
              <div className={`text-sm font-medium ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
            {stat.changeLabel && (
              <p className="text-xs text-muted-foreground mt-1">{stat.changeLabel}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  LinkIcon,
} from '@heroicons/react/24/outline'
import type { ReportMetrics } from '@/types/custom-reports'

interface MetricSelectorProps {
  metrics: ReportMetrics
  onChange: (metrics: ReportMetrics) => void
  disabled?: boolean
}

export function MetricSelector({ metrics, onChange, disabled }: MetricSelectorProps) {
  const metricOptions = [
    {
      key: 'friends' as const,
      icon: UserGroupIcon,
      label: '友だち統計',
      description: '友だち追加数、ブロック数、アクティブユーザー数など',
    },
    {
      key: 'messages' as const,
      icon: ChatBubbleLeftRightIcon,
      label: 'メッセージ統計',
      description: '送信数、開封率、クリック率など',
    },
    {
      key: 'reservations' as const,
      icon: CalendarDaysIcon,
      label: '予約統計',
      description: '予約数、キャンセル数、稼働率など',
    },
    {
      key: 'forms' as const,
      icon: DocumentTextIcon,
      label: 'フォーム統計',
      description: '回答数、完了率、平均回答時間など',
    },
    {
      key: 'urlTracking' as const,
      icon: LinkIcon,
      label: 'URL計測',
      description: 'クリック数、コンバージョン率、流入元など',
    },
  ]

  const handleToggle = (key: keyof ReportMetrics) => {
    onChange({
      ...metrics,
      [key]: !metrics[key],
    })
  }

  return (
    <div className="space-y-4">
      {metricOptions.map((option) => {
        const Icon = option.icon
        return (
          <Card
            key={option.key}
            className={`cursor-pointer transition-colors ${
              metrics[option.key] ? 'border-primary' : ''
            }`}
            onClick={() => !disabled && handleToggle(option.key)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  id={option.key}
                  checked={metrics[option.key]}
                  onCheckedChange={() => handleToggle(option.key)}
                  disabled={disabled}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="size-5 text-muted-foreground" />
                    <Label
                      htmlFor={option.key}
                      className="text-base font-semibold cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

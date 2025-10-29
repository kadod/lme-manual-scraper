'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface UsageMeter {
  label: string
  current: number
  limit: number
  unit?: string
  warning?: boolean
}

interface UsageMetersProps {
  usage: {
    friends: number
    messages_this_month: number
    staff_accounts: number
    forms: number
    rich_menus: number
    api_calls_today: number
  }
  limits: {
    friends: number
    messages_per_month: number
    staff_accounts: number
    forms: number
    rich_menus: number
    api_calls_per_day: number
  }
}

export function UsageMeters({ usage, limits }: UsageMetersProps) {
  const meters: UsageMeter[] = [
    {
      label: '友だち数',
      current: usage.friends,
      limit: limits.friends,
      unit: '人',
      warning: usage.friends / limits.friends > 0.8,
    },
    {
      label: '月間配信数',
      current: usage.messages_this_month,
      limit: limits.messages_per_month,
      unit: '通',
      warning: usage.messages_this_month / limits.messages_per_month > 0.8,
    },
    {
      label: 'スタッフアカウント',
      current: usage.staff_accounts,
      limit: limits.staff_accounts,
      unit: '人',
      warning: usage.staff_accounts >= limits.staff_accounts,
    },
    {
      label: 'フォーム数',
      current: usage.forms,
      limit: limits.forms === -1 ? Infinity : limits.forms,
      unit: '個',
      warning: limits.forms !== -1 && usage.forms / limits.forms > 0.8,
    },
    {
      label: 'リッチメニュー',
      current: usage.rich_menus,
      limit: limits.rich_menus === -1 ? Infinity : limits.rich_menus,
      unit: '個',
      warning: limits.rich_menus !== -1 && usage.rich_menus / limits.rich_menus > 0.8,
    },
    {
      label: 'API呼び出し（本日）',
      current: usage.api_calls_today,
      limit: limits.api_calls_per_day,
      unit: '回',
      warning: usage.api_calls_today / limits.api_calls_per_day > 0.8,
    },
  ]

  const getProgressValue = (current: number, limit: number) => {
    if (limit === Infinity) return 0
    return (current / limit) * 100
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    return 'bg-blue-500'
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('ja-JP')
  }

  const formatLimit = (limit: number) => {
    if (limit === Infinity) return '無制限'
    return formatNumber(limit)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>使用状況</CardTitle>
        <CardDescription>現在の使用量と制限</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {meters.map((meter, index) => {
          const percentage = getProgressValue(meter.current, meter.limit)
          const isUnlimited = meter.limit === Infinity

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{meter.label}</span>
                  {meter.warning && (
                    <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {formatNumber(meter.current)} / {formatLimit(meter.limit)}
                  {meter.unit && ` ${meter.unit}`}
                  {!isUnlimited && ` (${percentage.toFixed(1)}%)`}
                </span>
              </div>
              {!isUnlimited && (
                <div className="relative">
                  <Progress
                    value={percentage}
                    className="h-2"
                  />
                  <div
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              )}
              {meter.warning && !isUnlimited && (
                <p className="text-xs text-orange-600">
                  制限に近づいています。プランのアップグレードをご検討ください。
                </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

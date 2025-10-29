'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline'
import { formatCompactNumber, formatPercentage } from '@/lib/utils/chart-utils'
import type { AnalyticsMetric } from '@/types/analytics'

interface MetricCardProps {
  metric: AnalyticsMetric
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function MetricCard({ metric, icon: Icon, className }: MetricCardProps) {
  const { label, value, previousValue, change, changePercentage, trend, color } = metric

  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-gray-500'
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') {
      return <MinusIcon className="h-4 w-4 text-gray-500" />
    }
    return trend === 'up'
      ? <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
      : <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
  }

  const getIconBgColor = () => {
    if (color) return color
    if (!trend || trend === 'neutral') return 'bg-gray-50'
    return trend === 'up' ? 'bg-green-50' : 'bg-red-50'
  }

  const getIconColor = () => {
    if (color) return color
    if (!trend || trend === 'neutral') return 'text-gray-600'
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {label}
        </CardTitle>
        {Icon && (
          <div className={`p-2 rounded-lg ${getIconBgColor()}`}>
            <Icon className={`h-5 w-5 ${getIconColor()}`} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatCompactNumber(value)}</div>
        {changePercentage !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon()}
            <p className={`text-xs ${getTrendColor()}`}>
              {changePercentage > 0 ? '+' : ''}{formatPercentage(changePercentage)}
              {previousValue !== undefined && (
                <span className="text-gray-500 ml-1">前期比</span>
              )}
            </p>
          </div>
        )}
        {change !== undefined && changePercentage === undefined && (
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon()}
            <p className={`text-xs ${getTrendColor()}`}>
              {change > 0 ? '+' : ''}{formatCompactNumber(change)}
              <span className="text-gray-500 ml-1">前期比</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ComponentType<{ className?: string }>
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
}

const colorConfig = {
  blue: {
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    trend: 'text-blue-600',
  },
  green: {
    icon: 'text-green-600',
    bg: 'bg-green-50',
    trend: 'text-green-600',
  },
  purple: {
    icon: 'text-purple-600',
    bg: 'bg-purple-50',
    trend: 'text-purple-600',
  },
  orange: {
    icon: 'text-orange-600',
    bg: 'bg-orange-50',
    trend: 'text-orange-600',
  },
  red: {
    icon: 'text-red-600',
    bg: 'bg-red-50',
    trend: 'text-red-600',
  },
  yellow: {
    icon: 'text-yellow-600',
    bg: 'bg-yellow-50',
    trend: 'text-yellow-600',
  },
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = '前月比',
  icon: Icon,
  colorScheme = 'blue',
}: KPICardProps) {
  const colors = colorConfig[colorScheme]
  const isPositive = change !== undefined && change >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {Icon && (
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
            )}
            <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}% {changeLabel}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

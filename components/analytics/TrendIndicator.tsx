'use client'

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline'
import { formatPercentage } from '@/lib/utils/chart-utils'

interface TrendIndicatorProps {
  value: number
  showPercentage?: boolean
  showIcon?: boolean
  showLabel?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TrendIndicator({
  value,
  showPercentage = true,
  showIcon = true,
  showLabel = false,
  label = '前期比',
  size = 'md',
  className = '',
}: TrendIndicatorProps) {
  const trend = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'

  const getColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-500'
  }

  const getBgColor = () => {
    if (trend === 'up') return 'bg-green-50'
    if (trend === 'down') return 'bg-red-50'
    return 'bg-gray-50'
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3'
      case 'lg': return 'h-5 w-5'
      default: return 'h-4 w-4'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs'
      case 'lg': return 'text-base'
      default: return 'text-sm'
    }
  }

  const getIcon = () => {
    const iconClass = `${getIconSize()} ${getColor()}`
    if (trend === 'up') return <ArrowTrendingUpIcon className={iconClass} />
    if (trend === 'down') return <ArrowTrendingDownIcon className={iconClass} />
    return <MinusIcon className={iconClass} />
  }

  const displayValue = showPercentage ? formatPercentage(Math.abs(value)) : Math.abs(value).toFixed(2)

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${getBgColor()} ${className}`}>
      {showIcon && getIcon()}
      <span className={`${getTextSize()} font-medium ${getColor()}`}>
        {value > 0 ? '+' : value < 0 ? '-' : ''}{displayValue}
      </span>
      {showLabel && (
        <span className={`${getTextSize()} text-gray-500`}>{label}</span>
      )}
    </div>
  )
}

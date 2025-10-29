'use client'

import { ChartBarIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ComponentType<{ className?: string }>
  height?: number
  className?: string
}

export function EmptyState({
  title = 'データがありません',
  message = '選択した期間にデータが見つかりませんでした。',
  actionLabel,
  onAction,
  icon: Icon = ChartBarIcon,
  height = 300,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="outline">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

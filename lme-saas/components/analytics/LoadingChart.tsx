'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LoadingChartProps {
  title?: string
  description?: string
  height?: number
  showHeader?: boolean
  className?: string
}

export function LoadingChart({
  title,
  description,
  height = 300,
  showHeader = true,
  className,
}: LoadingChartProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          {title && <Skeleton className="h-5 w-48" />}
          {description && <Skeleton className="h-4 w-64 mt-2" />}
        </CardHeader>
      )}
      <CardContent>
        <Skeleton className="w-full" style={{ height: `${height}px` }} />
        {showHeader && (
          <div className="flex justify-center gap-4 mt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

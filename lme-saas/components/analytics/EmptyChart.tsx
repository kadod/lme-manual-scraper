'use client'

interface EmptyChartProps {
  message?: string
  height?: number
}

export function EmptyChart({
  message = 'データがありません',
  height = 300
}: EmptyChartProps) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-dashed"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

'use client'

import type { LegendPayload } from '@/types/analytics'

interface ChartLegendProps {
  payload?: LegendPayload[]
  layout?: 'horizontal' | 'vertical'
}

export function ChartLegend({ payload = [], layout = 'horizontal' }: ChartLegendProps) {
  if (!payload || payload.length === 0) {
    return null
  }

  return (
    <div
      className={`flex gap-4 ${
        layout === 'vertical' ? 'flex-col' : 'flex-wrap justify-center'
      }`}
    >
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

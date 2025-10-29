'use client'

import type { TooltipProps } from 'recharts'
import { formatNumber, formatPercentage, formatCurrency } from '@/lib/utils/chart-utils'

interface CustomTooltipProps extends TooltipProps<number, string> {
  formatter?: 'number' | 'percentage' | 'currency'
  unit?: string
}

export function ChartTooltip({ active, payload, label, formatter = 'number', unit }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const formatValue = (value: number): string => {
    switch (formatter) {
      case 'percentage':
        return formatPercentage(value)
      case 'currency':
        return formatCurrency(value)
      default:
        return formatNumber(value)
    }
  }

  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md">
      <p className="mb-2 text-sm font-medium text-popover-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {formatValue(entry.value || 0)}
              {unit && ` ${unit}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

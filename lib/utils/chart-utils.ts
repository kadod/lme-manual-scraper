import type { ChartData, TimeSeriesData } from '@/types/analytics'

// Default color palette for charts
export const CHART_COLORS = {
  primary: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  success: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  neutral: ['#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'],
  purple: ['#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87'],
  pink: ['#ec4899', '#db2777', '#be185d', '#9f1239', '#831843'],
  cyan: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
} as const

export const DEFAULT_CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#6b7280', // gray
]

// Generate color array for charts
export function generateChartColors(count: number, palette: keyof typeof CHART_COLORS = 'primary'): string[] {
  const colors = CHART_COLORS[palette]
  if (count <= colors.length) {
    return colors.slice(0, count)
  }

  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }
  return result
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ja-JP').format(num)
}

// Format currency
export function formatCurrency(num: number, currency = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(num)
}

// Format percentage
export function formatPercentage(num: number, decimals = 1): string {
  return `${num.toFixed(decimals)}%`
}

// Format large numbers with K, M suffixes
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Format date for chart labels
export function formatChartDate(dateString: string, format: 'short' | 'medium' | 'long' = 'short'): string {
  const date = new Date(dateString)

  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric' }).format(date)
    case 'medium':
      return new Intl.DateTimeFormat('ja-JP', { month: 'short', day: 'numeric' }).format(date)
    case 'long':
      return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
    default:
      return dateString
  }
}

// Calculate percentage from total
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

// Calculate change percentage
export function calculateChangePercentage(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// Calculate trend
export function calculateTrend(current: number, previous: number): 'up' | 'down' | 'neutral' {
  const diff = current - previous
  if (diff > 0) return 'up'
  if (diff < 0) return 'down'
  return 'neutral'
}

// Export chart data to CSV
export function exportToCSV(data: ChartData[] | TimeSeriesData[] | Record<string, any>[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = (row as Record<string, any>)[header]
      // Escape values containing commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// Export chart to PNG
export function exportToPNG(elementId: string, filename: string): void {
  const element = document.getElementById(elementId)
  if (!element) return

  // Use html2canvas or similar library in production
  console.log('Export to PNG:', elementId, filename)
  // Implementation would require html2canvas library
}

// Sort time series data by date
export function sortByDate(data: TimeSeriesData[]): TimeSeriesData[] {
  return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Fill missing dates in time series
export function fillMissingDates(
  data: TimeSeriesData[],
  startDate: Date,
  endDate: Date,
  defaultValue = 0
): TimeSeriesData[] {
  const result: TimeSeriesData[] = []
  const dataMap = new Map(data.map(d => [d.date, d]))

  const current = new Date(startDate)
  while (current <= endDate) {
    const dateString = current.toISOString().split('T')[0]
    const existingData = dataMap.get(dateString)

    if (existingData) {
      result.push(existingData)
    } else {
      result.push({
        date: dateString,
        value: defaultValue,
      })
    }

    current.setDate(current.getDate() + 1)
  }

  return result
}

// Aggregate data by period
export function aggregateByPeriod(
  data: TimeSeriesData[],
  period: 'day' | 'week' | 'month'
): TimeSeriesData[] {
  const grouped = new Map<string, number[]>()

  data.forEach(item => {
    const date = new Date(item.date)
    let key: string

    switch (period) {
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = item.date
    }

    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(item.value)
  })

  return Array.from(grouped.entries()).map(([date, values]) => ({
    date,
    value: values.reduce((sum, v) => sum + v, 0) / values.length,
  }))
}

// Calculate moving average
export function calculateMovingAverage(data: TimeSeriesData[], window: number): TimeSeriesData[] {
  if (data.length < window) return data

  return data.map((item, index) => {
    if (index < window - 1) return item

    const windowData = data.slice(index - window + 1, index + 1)
    const average = windowData.reduce((sum, d) => sum + d.value, 0) / window

    return {
      ...item,
      value: average,
    }
  })
}

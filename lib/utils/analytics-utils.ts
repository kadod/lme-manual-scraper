import type { TimeSeriesData, AnalyticsMetric, DateRange } from '@/types/analytics'
import { calculateChangePercentage, calculateTrend } from './chart-utils'

// Calculate statistical summary
export interface StatisticalSummary {
  total: number
  average: number
  median: number
  max: number
  min: number
  standardDeviation: number
}

export function calculateStatistics(values: number[]): StatisticalSummary {
  if (values.length === 0) {
    return {
      total: 0,
      average: 0,
      median: 0,
      max: 0,
      min: 0,
      standardDeviation: 0,
    }
  }

  const total = values.reduce((sum, v) => sum + v, 0)
  const average = total / values.length

  const sorted = [...values].sort((a, b) => a - b)
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]

  const max = Math.max(...values)
  const min = Math.min(...values)

  const variance = values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / values.length
  const standardDeviation = Math.sqrt(variance)

  return {
    total,
    average,
    median,
    max,
    min,
    standardDeviation,
  }
}

// Compare periods
export interface PeriodComparison {
  currentPeriod: {
    start: Date
    end: Date
    total: number
    average: number
  }
  previousPeriod: {
    start: Date
    end: Date
    total: number
    average: number
  }
  change: number
  changePercentage: number
  trend: 'up' | 'down' | 'neutral'
}

export function comparePeriods(
  currentData: TimeSeriesData[],
  previousData: TimeSeriesData[]
): PeriodComparison {
  const currentTotal = currentData.reduce((sum, d) => sum + d.value, 0)
  const previousTotal = previousData.reduce((sum, d) => sum + d.value, 0)

  const currentAverage = currentData.length > 0 ? currentTotal / currentData.length : 0
  const previousAverage = previousData.length > 0 ? previousTotal / previousData.length : 0

  const change = currentTotal - previousTotal
  const changePercentage = calculateChangePercentage(currentTotal, previousTotal)
  const trend = calculateTrend(currentTotal, previousTotal)

  return {
    currentPeriod: {
      start: new Date(currentData[0]?.date || new Date()),
      end: new Date(currentData[currentData.length - 1]?.date || new Date()),
      total: currentTotal,
      average: currentAverage,
    },
    previousPeriod: {
      start: new Date(previousData[0]?.date || new Date()),
      end: new Date(previousData[previousData.length - 1]?.date || new Date()),
      total: previousTotal,
      average: previousAverage,
    },
    change,
    changePercentage,
    trend,
  }
}

// Calculate growth rate
export function calculateGrowthRate(data: TimeSeriesData[]): number {
  if (data.length < 2) return 0

  const firstValue = data[0].value
  const lastValue = data[data.length - 1].value

  if (firstValue === 0) return 0

  return calculateChangePercentage(lastValue, firstValue)
}

// Calculate compound annual growth rate (CAGR)
export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  if (initialValue === 0 || years === 0) return 0
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100
}

// Detect anomalies using standard deviation
export interface Anomaly {
  date: string
  value: number
  expectedValue: number
  deviation: number
  severity: 'low' | 'medium' | 'high'
}

export function detectAnomalies(
  data: TimeSeriesData[],
  threshold = 2
): Anomaly[] {
  const values = data.map(d => d.value)
  const stats = calculateStatistics(values)

  const anomalies: Anomaly[] = []

  data.forEach(item => {
    const deviation = Math.abs(item.value - stats.average) / stats.standardDeviation

    if (deviation > threshold) {
      let severity: 'low' | 'medium' | 'high' = 'low'
      if (deviation > threshold * 2) severity = 'high'
      else if (deviation > threshold * 1.5) severity = 'medium'

      anomalies.push({
        date: item.date,
        value: item.value,
        expectedValue: stats.average,
        deviation,
        severity,
      })
    }
  })

  return anomalies
}

// Calculate retention rate
export function calculateRetentionRate(
  totalAtStart: number,
  totalAtEnd: number,
  newAdditions: number
): number {
  if (totalAtStart === 0) return 0
  return ((totalAtEnd - newAdditions) / totalAtStart) * 100
}

// Calculate churn rate
export function calculateChurnRate(totalLost: number, totalAtStart: number): number {
  if (totalAtStart === 0) return 0
  return (totalLost / totalAtStart) * 100
}

// Calculate engagement score
export function calculateEngagementScore(
  interactions: number,
  totalUsers: number,
  weight = 1
): number {
  if (totalUsers === 0) return 0
  return (interactions / totalUsers) * weight * 100
}

// Create analytics metric
export function createMetric(
  label: string,
  currentValue: number,
  previousValue?: number,
  color?: string
): AnalyticsMetric {
  if (previousValue === undefined) {
    return {
      label,
      value: currentValue,
      color,
    }
  }

  const change = currentValue - previousValue
  const changePercentage = calculateChangePercentage(currentValue, previousValue)
  const trend = calculateTrend(currentValue, previousValue)

  return {
    label,
    value: currentValue,
    previousValue,
    change,
    changePercentage,
    trend,
    color,
  }
}

// Get date range for time range
export function getDateRangeForTimeRange(timeRange: string): DateRange {
  const end = new Date()
  const start = new Date()

  switch (timeRange) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '90d':
      start.setDate(end.getDate() - 90)
      break
    case '1y':
      start.setFullYear(end.getFullYear() - 1)
      break
    case 'all':
      start.setFullYear(2000)
      break
    default:
      start.setDate(end.getDate() - 30)
  }

  return { start, end }
}

// Filter data by date range
export function filterByDateRange(
  data: TimeSeriesData[],
  dateRange: DateRange
): TimeSeriesData[] {
  return data.filter(item => {
    const date = new Date(item.date)
    return date >= dateRange.start && date <= dateRange.end
  })
}

// Calculate conversion rate
export function calculateConversionRate(conversions: number, total: number): number {
  if (total === 0) return 0
  return (conversions / total) * 100
}

// Calculate average order value
export function calculateAverageValue(total: number, count: number): number {
  if (count === 0) return 0
  return total / count
}

// Forecast using simple linear regression
export interface ForecastPoint {
  date: string
  value: number
  isForecasted: boolean
}

export function forecastLinear(data: TimeSeriesData[], periods: number): ForecastPoint[] {
  if (data.length < 2) return []

  // Calculate slope and intercept
  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = data.map(d => d.value)

  const sumX = x.reduce((sum, v) => sum + v, 0)
  const sumY = y.reduce((sum, v) => sum + v, 0)
  const sumXY = x.reduce((sum, v, i) => sum + v * y[i], 0)
  const sumX2 = x.reduce((sum, v) => sum + v * v, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Generate forecast
  const result: ForecastPoint[] = data.map((item, index) => ({
    date: item.date,
    value: item.value,
    isForecasted: false,
  }))

  const lastDate = new Date(data[data.length - 1].date)
  for (let i = 1; i <= periods; i++) {
    const forecastDate = new Date(lastDate)
    forecastDate.setDate(lastDate.getDate() + i)

    const forecastValue = slope * (n + i - 1) + intercept

    result.push({
      date: forecastDate.toISOString().split('T')[0],
      value: Math.max(0, forecastValue),
      isForecasted: true,
    })
  }

  return result
}

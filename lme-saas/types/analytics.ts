// Analytics Type Definitions

export type DashboardStats = {
  friendsTotal: number
  friendsChange: number
  friendsChangePercent: number
  messagesTotal: number
  messagesChange: number
  messagesChangePercent: number
  deliveryRate: number
  deliveryRateChange: number
  engagementRate: number
  engagementRateChange: number
}

export type FriendsTrendData = {
  date: string
  total: number
  new_friends: number
  blocked: number
}

export type MessageStatsData = {
  total_sent: number
  total_delivered: number
  total_read: number
  total_clicked: number
  delivery_rate: number
  read_rate: number
  click_rate: number
  by_type: {
    type: 'text' | 'image' | 'video' | 'audio' | 'flex' | 'template'
    count: number
    delivered: number
    read: number
    clicked: number
  }[]
}

export type EngagementRateData = {
  overall_rate: number
  by_day: {
    date: string
    rate: number
    messages_sent: number
    interactions: number
  }[]
}

export type TagDistributionData = {
  tag_id: string
  tag_name: string
  tag_color: string | null
  friend_count: number
  percentage: number
}

export type DeviceBreakdownData = {
  device_type: string
  count: number
  percentage: number
}

export type CrossAnalysisConfig = {
  xAxis: 'date' | 'tag' | 'message_type' | 'device' | 'segment'
  yAxis: 'friends' | 'messages' | 'delivery_rate' | 'engagement' | 'clicks'
  filters?: {
    dateFrom?: string
    dateTo?: string
    tags?: string[]
    segments?: string[]
    messageTypes?: string[]
  }
}

export type CrossAnalysisResult = {
  config: CrossAnalysisConfig
  data: {
    x_value: string
    y_value: number
    metadata?: Record<string, unknown>
  }[]
  summary: {
    total: number
    average: number
    max: number
    min: number
  }
}

export type CrossAnalysisPreset = {
  id: string
  user_id: string
  name: string
  description: string | null
  config: CrossAnalysisConfig
  created_at: string
  updated_at: string
}

export type URLTrackingStats = {
  id: string
  user_id: string
  original_url: string
  short_code: string
  short_url: string
  custom_slug: string | null
  campaign_name: string | null
  total_clicks: number
  unique_clicks: number
  created_at: string
  last_clicked_at: string | null
  click_data?: {
    date: string
    clicks: number
    unique_clicks: number
  }[]
  referrer_data?: {
    referrer: string
    clicks: number
  }[]
  device_data?: {
    device_type: string
    clicks: number
  }[]
}

export type URLClickTrendData = {
  date: string
  clicks: number
  unique_clicks: number
}

export type URLReferrerStats = {
  referrer: string
  clicks: number
  percentage: number
}

export type URLDeviceStats = {
  device_type: string
  clicks: number
  percentage: number
}

export type CustomReportConfig = {
  name: string
  description?: string
  report_type: 'dashboard' | 'messages' | 'friends' | 'custom'
  metrics: string[]
  dimensions: string[]
  filters?: {
    dateFrom?: string
    dateTo?: string
    tags?: string[]
    segments?: string[]
    messageTypes?: string[]
  }
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    recipients: string[]
  }
}

export type CustomReport = {
  id: string
  user_id: string
  config: CustomReportConfig
  created_at: string
  updated_at: string
}

export type ReportHistory = {
  id: string
  report_id: string
  generated_at: string
  file_url: string
  file_format: 'csv' | 'pdf' | 'xlsx'
  status: 'completed' | 'failed' | 'processing'
  error_message?: string | null
}

export type ExportFormat = 'csv' | 'pdf' | 'xlsx' | 'png'

// Chart Component Types
export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
  [key: string]: string | number | undefined
}

export interface CrossAnalysisData {
  category: string
  metric1: number
  metric2: number
  [key: string]: string | number
}

export interface AnalyticsMetric {
  label: string
  value: number
  previousValue?: number
  change?: number
  changePercentage?: number
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}

export interface ChartConfig {
  dataKey: string
  label: string
  color?: string
  unit?: string
  formatter?: (value: number) => string
}

export interface ChartProps {
  data: ChartData[] | TimeSeriesData[] | CrossAnalysisData[]
  height?: number
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  colors?: string[]
}

export interface TooltipPayload {
  name?: string
  value?: number
  dataKey?: string
  color?: string
  payload?: Record<string, unknown>
}

export interface LegendPayload {
  value: string
  type?: string
  id?: string
  color?: string
  dataKey?: string
}

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'composed'

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

export interface DateRange {
  start: Date
  end: Date
}

export interface ExportOptions {
  format: 'png' | 'csv' | 'json'
  filename?: string
  includeHeader?: boolean
}

export type ReportStatus = 'active' | 'inactive' | 'draft'
export type ReportFrequency = 'manual' | 'daily' | 'weekly' | 'monthly' | 'custom'
export type ReportFormat = 'pdf' | 'csv' | 'excel'

export type MetricType =
  | 'friends'
  | 'messages'
  | 'reservations'
  | 'forms'
  | 'url_tracking'

export interface ReportSchedule {
  frequency: ReportFrequency
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  time: string // HH:mm format
  cronExpression?: string // For custom frequency
  timezone?: string // Timezone for scheduling
  emailRecipients: string[]
}

export interface ReportMetrics {
  friends: boolean
  messages: boolean
  reservations: boolean
  forms: boolean
  urlTracking: boolean
}

export interface CustomReport {
  id: string
  name: string
  description?: string
  status: ReportStatus
  format: ReportFormat
  dateRange: {
    start: Date | null
    end: Date | null
    preset?: 'last7days' | 'last30days' | 'lastMonth' | 'custom'
  }
  metrics: ReportMetrics
  schedule: ReportSchedule | null
  lastGenerated: Date | null
  nextScheduled: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ReportHistory {
  id: string
  reportId: string
  reportName: string
  generatedAt: Date
  format: ReportFormat
  fileUrl: string
  fileSize: number
  status: 'generating' | 'completed' | 'failed'
  error?: string
}

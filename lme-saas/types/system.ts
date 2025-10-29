export type ExportFormat = 'csv' | 'json'

export type ExportDataType =
  | 'friends'
  | 'tags'
  | 'segments'
  | 'messages'
  | 'forms'
  | 'reservations'
  | 'analytics'

export interface ExportOptions {
  dataTypes: ExportDataType[]
  format: ExportFormat
  startDate?: string
  endDate?: string
  includeArchived?: boolean
}

export interface ExportResult {
  success: boolean
  fileUrl?: string
  fileName?: string
  recordCount?: number
  error?: string
}

export interface ImportOptions {
  dataType: 'friends' | 'tags'
  file: File
  onDuplicate: 'skip' | 'update' | 'error'
}

export interface ImportPreviewRow {
  rowNumber: number
  data: Record<string, string | number | boolean>
  status: 'valid' | 'warning' | 'error'
  messages: string[]
}

export interface ImportPreview {
  totalRows: number
  validRows: number
  errorRows: number
  warningRows: number
  columns: string[]
  sampleRows: ImportPreviewRow[]
}

export interface ImportResult {
  success: boolean
  importedCount: number
  skippedCount: number
  errorCount: number
  errors?: Array<{
    row: number
    message: string
  }>
}

export interface APIKey {
  id: string
  organization_id: string
  name: string
  key_prefix: string
  key_hash: string
  permissions: string[]
  rate_limit: number
  allowed_ips: string[]
  is_active: boolean
  last_used_at: string | null
  expires_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface APIKeyCreateData {
  name: string
  permissions: string[]
  rate_limit?: number
  allowed_ips?: string[]
  expires_at?: string
}

export interface APIKeyUpdateData {
  name?: string
  permissions?: string[]
  rate_limit?: number
  allowed_ips?: string[]
  is_active?: boolean
  expires_at?: string
}

export interface APIKeyWithSecret extends APIKey {
  key: string
}

export interface AuditLog {
  id: string
  organization_id: string
  user_id: string | null
  user_email?: string
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AuditLogFilters {
  userId?: string
  action?: string
  resourceType?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface SystemInfo {
  version: string
  buildDate: string
  environment: 'development' | 'staging' | 'production'
  database: {
    provider: string
    version: string
    status: 'connected' | 'disconnected'
  }
  storage: {
    total: number
    used: number
    breakdown: {
      userAssets: number
      media: number
      exports: number
      backups: number
    }
  }
  stats: {
    totalUsers: number
    totalOrganizations: number
    totalMessages: number
    totalAPIRequests: number
  }
  uptime?: number
}

export interface StorageUsage {
  total: number
  used: number
  available: number
  percent: number
  breakdown: {
    avatars: number
    logos: number
    richMenus: number
    messageMedia: number
    exportFiles: number
    other: number
  }
}

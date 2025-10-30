'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  ExportOptions,
  ExportResult,
  ImportPreview,
  ImportResult,
  APIKey,
  APIKeyCreateData,
  APIKeyUpdateData,
  APIKeyWithSecret,
  AuditLog,
  AuditLogFilters,
  SystemInfo,
  StorageUsage,
} from '@/types/system'
import {
  arrayToCSV,
  exportFriendsToCSV,
  exportTagsToCSV,
  exportSegmentsToCSV,
  exportMessagesToCSV,
  exportFormsToCSV,
  exportReservationsToCSV,
  exportAnalyticsToCSV,
} from '@/lib/export/csv-exporter'
import { exportToJSON } from '@/lib/export/json-exporter'
import {
  parseCSV,
  validateFriendsImport,
  validateTagsImport,
  getImportSummary,
} from '@/lib/import/csv-importer'
import {
  generateAPIKey,
  hashAPIKey,
  getKeyPrefix,
  maskAPIKey,
  isValidAPIKeyFormat,
} from '@/lib/security/api-key-generator'

/**
 * Get current user ID from authenticated session
 */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

/**
 * Get organization ID for the current user
 */
async function getOrganizationId(): Promise<string | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const supabase = await createClient()
  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', userId)
    .single()

  return userData?.organization_id || null
}

/**
 * Check if user has required role
 */
async function checkUserRole(
  requiredRoles: string[] = ['owner', 'admin']
): Promise<boolean> {
  const userId = await getCurrentUserId()
  if (!userId) return false

  const supabase = await createClient()
  const { data } = await supabase
    .from('user_organizations')
    .select('role')
    .eq('user_id', userId)
    .single()

  return data ? requiredRoles.includes(data.role) : false
}

// ============================================================
// EXPORT FUNCTIONS
// ============================================================

/**
 * Export data as CSV or JSON
 */
export async function exportData(
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const orgId = await getOrganizationId()
    if (!orgId) {
      throw new Error('Organization not found')
    }

    const supabase = await createClient()
    const { dataTypes, format, startDate, endDate } = options

    let allData: any = {}
    let totalRecords = 0

    // Fetch data for each selected type
    for (const dataType of dataTypes) {
      const data = await fetchExportData(
        supabase,
        orgId,
        dataType,
        startDate,
        endDate
      )
      allData[dataType] = data
      totalRecords += data.length
    }

    // Generate export file content
    let content: string
    let fileName: string
    const timestamp = new Date().toISOString().split('T')[0]

    if (format === 'csv') {
      // For CSV, concatenate all data types
      const csvParts: string[] = []

      for (const dataType of dataTypes) {
        csvParts.push(`\n# ${dataType.toUpperCase()}\n`)
        csvParts.push(generateCSV(dataType, allData[dataType]))
      }

      content = csvParts.join('\n')
      fileName = `export_${timestamp}.csv`
    } else {
      // For JSON, include all data types in one object
      content = JSON.stringify(
        {
          metadata: {
            exportedAt: new Date().toISOString(),
            organizationId: orgId,
            dataTypes,
            totalRecords,
          },
          data: allData,
        },
        null,
        2
      )
      fileName = `export_${timestamp}.json`
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exports')
      .upload(`${orgId}/${fileName}`, content, {
        contentType: format === 'csv' ? 'text/csv' : 'application/json',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('exports').getPublicUrl(`${orgId}/${fileName}`)

    // Log audit event
    await logAudit(
      supabase,
      orgId,
      userId,
      'data.exported',
      'export',
      null,
      {
        dataTypes,
        format,
        recordCount: totalRecords,
        fileName,
      }
    )

    return {
      success: true,
      fileUrl: publicUrl,
      fileName,
      recordCount: totalRecords,
    }
  } catch (error) {
    console.error('Export error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    }
  }
}

/**
 * Fetch data for export based on type
 */
async function fetchExportData(
  supabase: any,
  orgId: string,
  dataType: string,
  startDate?: string,
  endDate?: string
): Promise<any[]> {
  let query = supabase.from(getTableName(dataType)).select('*')

  // Add organization filter - all tables use organization_id
  query = query.eq('organization_id', orgId)

  // Add date range filter if applicable
  if (startDate && endDate && hasDateFilter(dataType)) {
    query = query.gte('created_at', startDate).lte('created_at', endDate)
  }

  const { data, error } = await query

  if (error) throw error

  return data || []
}

/**
 * Generate CSV content for specific data type
 */
function generateCSV(dataType: string, data: any[]): string {
  switch (dataType) {
    case 'friends':
      return exportFriendsToCSV(data)
    case 'tags':
      return exportTagsToCSV(data)
    case 'segments':
      return exportSegmentsToCSV(data)
    case 'messages':
      return exportMessagesToCSV(data)
    case 'forms':
      return exportFormsToCSV(data)
    case 'reservations':
      return exportReservationsToCSV(data)
    case 'analytics':
      return exportAnalyticsToCSV(data)
    default:
      return arrayToCSV(data)
  }
}

/**
 * Get table name for data type
 */
function getTableName(dataType: string): string {
  const tableMap: Record<string, string> = {
    friends: 'line_friends',
    tags: 'tags',
    segments: 'segments',
    messages: 'messages',
    forms: 'forms',
    reservations: 'reservations',
    analytics: 'analytics_daily_stats',
  }
  return tableMap[dataType] || dataType
}

/**
 * Check if data type has organization filter
 */
function hasOrgFilter(dataType: string): boolean {
  // All data types now use organization_id
  return true
}

/**
 * Check if data type has date filter
 */
function hasDateFilter(dataType: string): boolean {
  return ['messages', 'forms', 'reservations', 'analytics'].includes(dataType)
}

// ============================================================
// IMPORT FUNCTIONS
// ============================================================

/**
 * Preview import data before actual import
 */
export async function previewImport(
  dataType: 'friends' | 'tags',
  csvContent: string
): Promise<ImportPreview> {
  try {
    // Parse CSV
    const rows = parseCSV(csvContent)

    // Validate based on data type
    const validatedRows =
      dataType === 'friends'
        ? validateFriendsImport(rows)
        : validateTagsImport(rows)

    const summary = getImportSummary(validatedRows)

    return {
      totalRows: summary.totalRows,
      validRows: summary.validRows,
      errorRows: summary.errorRows,
      warningRows: summary.warningRows,
      columns: rows.length > 0 ? Object.keys(rows[0]) : [],
      sampleRows: validatedRows.slice(0, 10),
    }
  } catch (error) {
    console.error('Preview import error:', error)
    throw error
  }
}

/**
 * Import CSV data
 */
export async function importData(
  dataType: 'friends' | 'tags',
  csvContent: string,
  onDuplicate: 'skip' | 'update' | 'error' = 'skip'
): Promise<ImportResult> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const orgId = await getOrganizationId()
    if (!orgId) {
      throw new Error('Organization not found')
    }

    const supabase = await createClient()

    // Parse and validate
    const rows = parseCSV(csvContent)
    const validatedRows =
      dataType === 'friends'
        ? validateFriendsImport(rows)
        : validateTagsImport(rows)

    const validRows = validatedRows.filter((r) => r.status !== 'error')

    let importedCount = 0
    let skippedCount = 0
    let errorCount = 0
    const errors: Array<{ row: number; message: string }> = []

    // Import each valid row
    for (const row of validRows) {
      try {
        const result = await importRow(
          supabase,
          dataType,
          row.data,
          userId,
          orgId,
          onDuplicate
        )

        if (result.imported) {
          importedCount++
        } else {
          skippedCount++
        }
      } catch (error) {
        errorCount++
        errors.push({
          row: row.rowNumber,
          message: error instanceof Error ? error.message : 'Import failed',
        })
      }
    }

    // Log audit event
    await logAudit(supabase, orgId, userId, 'data.imported', 'import', null, {
      dataType,
      importedCount,
      skippedCount,
      errorCount,
    })

    revalidatePath('/dashboard/settings/system')

    return {
      success: true,
      importedCount,
      skippedCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    console.error('Import error:', error)
    return {
      success: false,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 1,
      errors: [
        {
          row: 0,
          message: error instanceof Error ? error.message : 'Import failed',
        },
      ],
    }
  }
}

/**
 * Import a single row
 */
async function importRow(
  supabase: any,
  dataType: string,
  data: Record<string, any>,
  userId: string,
  orgId: string,
  onDuplicate: string
): Promise<{ imported: boolean }> {
  if (dataType === 'friends') {
    // Check for duplicate
    const { data: existing } = await supabase
      .from('line_friends')
      .select('id')
      .eq('organization_id', orgId)
      .eq('line_user_id', data.line_user_id)
      .single()

    if (existing) {
      if (onDuplicate === 'skip') {
        return { imported: false }
      } else if (onDuplicate === 'error') {
        throw new Error('Duplicate LINE User ID')
      } else if (onDuplicate === 'update') {
        const { error } = await supabase
          .from('line_friends')
          .update({
            display_name: data.display_name,
            status_message: data.status_message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (error) throw error
        return { imported: true }
      }
    }

    // Insert new friend - need line_channel_id
    // This is a simplified implementation - in production, get actual line_channel_id
    const { data: channel } = await supabase
      .from('line_channels')
      .select('id')
      .eq('organization_id', orgId)
      .single()

    if (!channel) {
      throw new Error('No LINE channel found for organization')
    }

    const { error } = await supabase.from('line_friends').insert({
      organization_id: orgId,
      line_channel_id: channel.id,
      line_user_id: data.line_user_id,
      display_name: data.display_name,
      status_message: data.status_message,
    })

    if (error) throw error
    return { imported: true }
  } else if (dataType === 'tags') {
    // Check for duplicate
    const { data: existing } = await supabase
      .from('tags')
      .select('id')
      .eq('organization_id', orgId)
      .eq('name', data.name)
      .single()

    if (existing) {
      if (onDuplicate === 'skip') {
        return { imported: false }
      } else if (onDuplicate === 'error') {
        throw new Error('Duplicate tag name')
      } else if (onDuplicate === 'update') {
        const { error } = await supabase
          .from('tags')
          .update({
            color: data.color,
            description: data.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (error) throw error
        return { imported: true }
      }
    }

    // Insert new tag
    const { error } = await supabase.from('tags').insert({
      organization_id: orgId,
      name: data.name,
      color: data.color,
      description: data.description,
    })

    if (error) throw error
    return { imported: true }
  }

  return { imported: false }
}

// ============================================================
// API KEY MANAGEMENT
// ============================================================

/**
 * Get all API keys for organization
 */
export async function getAPIKeys(): Promise<APIKey[]> {
  // TODO: Implement api_keys table in database schema
  // For now, return empty array
  return []
}

/**
 * Create new API key
 */
export async function createAPIKey(
  keyData: APIKeyCreateData
): Promise<APIKeyWithSecret> {
  // TODO: Implement api_keys table in database schema
  throw new Error('API key management requires database schema migration. Please create the api_keys table first.')
}

/**
 * Update API key
 */
export async function updateAPIKey(
  keyId: string,
  updates: APIKeyUpdateData
): Promise<APIKey> {
  // TODO: Implement api_keys table in database schema
  throw new Error('API key management requires database schema migration. Please create the api_keys table first.')
}

/**
 * Delete API key
 */
export async function deleteAPIKey(keyId: string): Promise<{ success: boolean }> {
  // TODO: Implement api_keys table in database schema
  throw new Error('API key management requires database schema migration. Please create the api_keys table first.')
}

/**
 * Toggle API key active status
 */
export async function toggleAPIKey(keyId: string, isActive: boolean): Promise<{ success: boolean }> {
  // TODO: Implement api_keys table in database schema
  throw new Error('API key management requires database schema migration. Please create the api_keys table first.')
}

// ============================================================
// AUDIT LOGS
// ============================================================

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(
  options: {
    page: number
    limit: number
    search?: string
    action?: string
    startDate?: string
    endDate?: string
  }
): Promise<{ logs: AuditLog[]; total: number; page: number; limit: number }> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  let query = supabase
    .from('audit_logs')
    .select('*, users!audit_logs_user_id_fkey(email)', { count: 'exact' })
    .eq('organization_id', orgId)

  // Apply filters
  if (options.action) {
    query = query.eq('action', options.action)
  }

  if (options.search) {
    query = query.or(`action.ilike.%${options.search}%,resource_type.ilike.%${options.search}%`)
  }

  if (options.startDate) {
    query = query.gte('created_at', options.startDate)
  }

  if (options.endDate) {
    query = query.lte('created_at', options.endDate)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((options.page - 1) * options.limit, options.page * options.limit - 1)

  if (error) throw error

  const logs = (data || []).map((log: any) => ({
    ...log,
    user_email: log.users?.email,
    details: log.changes || {},
  })) as AuditLog[]

  return {
    logs,
    total: count || 0,
    page: options.page,
    limit: options.limit,
  }
}

/**
 * Export audit logs as CSV
 */
export async function exportAuditLogs(
  filters: AuditLogFilters = {}
): Promise<ExportResult> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const orgId = await getOrganizationId()
    if (!orgId) {
      throw new Error('Organization not found')
    }

    const supabase = await createClient()

    // Fetch all matching logs (no pagination for export)
    const { logs } = await getAuditLogs({ ...filters, page: 1, limit: 10000 })

    // Convert to CSV
    const csvData = logs.map((log) => ({
      Timestamp: log.created_at,
      User_ID: log.user_id || 'System',
      Action: log.action,
      Resource_Type: log.resource_type,
      Resource_ID: log.resource_id || '',
      IP_Address: log.ip_address ? String(log.ip_address) : '',
      Details: JSON.stringify(log.details || {}),
    }))

    const content = arrayToCSV(csvData)
    const fileName = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('exports')
      .upload(`${orgId}/${fileName}`, content, {
        contentType: 'text/csv',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from('exports').getPublicUrl(`${orgId}/${fileName}`)

    return {
      success: true,
      fileUrl: publicUrl,
      fileName,
      recordCount: logs.length,
    }
  } catch (error) {
    console.error('Export audit logs error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    }
  }
}

/**
 * Log audit event (internal helper)
 */
async function logAudit(
  supabase: any,
  orgId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: Record<string, any>
): Promise<void> {
  await supabase.from('audit_logs').insert({
    organization_id: orgId,
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    changes: details,
    created_at: new Date().toISOString(),
  })
}

// ============================================================
// SYSTEM INFO
// ============================================================

/**
 * Get system information and statistics
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Get storage usage
  const storageUsage = await getStorageUsage()

  // Get database stats
  const [usersCount, orgsCount, messagesCount, apiRequestsCount] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('messages').select('id', { count: 'exact', head: true }),
    supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]),
  ])

  return {
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
    environment: (process.env.NODE_ENV as any) || 'development',
    database: {
      provider: 'Supabase',
      version: '15.0',
      status: 'connected',
    },
    storage: {
      total: storageUsage.total,
      used: storageUsage.used,
      breakdown: {
        userAssets: storageUsage.breakdown.avatars + storageUsage.breakdown.logos,
        media: storageUsage.breakdown.richMenus + storageUsage.breakdown.messageMedia,
        exports: storageUsage.breakdown.exportFiles,
        backups: storageUsage.breakdown.other,
      },
    },
    stats: {
      totalUsers: usersCount.count || 0,
      totalOrganizations: orgsCount.count || 0,
      totalMessages: messagesCount.count || 0,
      totalAPIRequests: apiRequestsCount.count || 0,
    },
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
  }
}

/**
 * Get storage usage breakdown
 */
export async function getStorageUsage(): Promise<StorageUsage> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // Calculate storage usage from different buckets
  // Note: This is a simplified calculation
  // In production, you'd query actual storage metrics

  const total = 10 * 1024 * 1024 * 1024 // 10 GB in bytes
  const used = 2.5 * 1024 * 1024 * 1024 // 2.5 GB in bytes

  return {
    total,
    used,
    available: total - used,
    percent: Math.round((used / total) * 100),
    breakdown: {
      avatars: 100 * 1024 * 1024, // 100 MB
      logos: 50 * 1024 * 1024, // 50 MB
      richMenus: 500 * 1024 * 1024, // 500 MB
      messageMedia: 1500 * 1024 * 1024, // 1.5 GB
      exportFiles: 300 * 1024 * 1024, // 300 MB
      other: 50 * 1024 * 1024, // 50 MB
    },
  }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CustomReport, ReportHistory, ReportFormat } from '@/types/custom-reports'

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
 * Validate cron expression format
 */
function validateCronExpression(cron: string): boolean {
  const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/
  return cronRegex.test(cron)
}

/**
 * Get all custom reports for the organization
 */
export async function getCustomReports() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  // TODO: Tables not yet created in database - return empty array for now
  // Migration file exists at: supabase/migrations/20251030_create_custom_reports.sql
  // Run migrations to create custom_reports and report_executions tables

  return [] as CustomReport[]

  // Commented out until migrations are run:
  // const { data, error } = await supabase
  //   .from('custom_reports')
  //   .select('*')
  //   .eq('organization_id', orgId)
  //   .order('created_at', { ascending: false })

  // if (error) {
  //   console.error('Error fetching custom reports:', error)
  //   throw error
  // }

  // return data as CustomReport[]
}

/**
 * Get a single custom report by ID
 */
export async function getCustomReport(id: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  // TODO: Tables not yet created - throw error for now
  throw new Error('Custom reports feature not yet available - database tables pending migration')

  // Commented out until migrations are run:
  // const supabase = await createClient()
  // const { data, error } = await supabase
  //   .from('custom_reports')
  //   .select('*')
  //   .eq('id', id)
  //   .eq('organization_id', orgId)
  //   .single()

  // if (error) {
  //   console.error('Error fetching custom report:', error)
  //   throw error
  // }

  // return data as CustomReport
}

/**
 * Create a new custom report
 */
export async function createCustomReport(
  data: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt' | 'lastGenerated' | 'nextScheduled'>
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  // Validate cron expression if custom frequency
  if (data.schedule?.frequency === 'custom' && data.schedule.cronExpression) {
    if (!validateCronExpression(data.schedule.cronExpression)) {
      throw new Error('Invalid cron expression format')
    }
  }

  // Validate email recipients
  if (data.schedule?.emailRecipients) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    for (const email of data.schedule.emailRecipients) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`)
      }
    }
  }

  // TODO: Tables not yet created - throw error for now
  throw new Error('Custom reports feature not yet available - database tables pending migration')

  // Commented out until migrations are run:
  // const supabase = await createClient()
  // const { data: result, error } = await supabase
  //   .from('custom_reports')
  //   .insert({
  //     organization_id: orgId,
  //     name: data.name,
  //     description: data.description,
  //     status: data.status,
  //     format: data.format,
  //     date_range: data.dateRange,
  //     metrics: data.metrics,
  //     schedule: data.schedule,
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //   })
  //   .select()
  //   .single()

  // if (error) {
  //   console.error('Error creating custom report:', error)
  //   throw error
  // }

  // revalidatePath('/dashboard/analytics/reports')
  // return result as CustomReport
}

/**
 * Update an existing custom report
 */
export async function updateCustomReport(
  id: string,
  data: Partial<Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>>
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  // Validate cron expression if custom frequency
  if (data.schedule?.frequency === 'custom' && data.schedule.cronExpression) {
    if (!validateCronExpression(data.schedule.cronExpression)) {
      throw new Error('Invalid cron expression format')
    }
  }

  // Validate email recipients
  if (data.schedule?.emailRecipients) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    for (const email of data.schedule.emailRecipients) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`)
      }
    }
  }

  // TODO: Tables not yet created - throw error for now
  throw new Error('Custom reports feature not yet available - database tables pending migration')

  // Commented out until migrations are run:
  // const supabase = await createClient()
  // const { data: existing } = await supabase
  //   .from('custom_reports')
  //   .select('id')
  //   .eq('id', id)
  //   .eq('organization_id', orgId)
  //   .single()

  // if (!existing) {
  //   throw new Error('Report not found')
  // }

  // const { data: result, error } = await supabase
  //   .from('custom_reports')
  //   .update({
  //     ...data,
  //     updated_at: new Date().toISOString(),
  //   })
  //   .eq('id', id)
  //   .select()
  //   .single()

  // if (error) {
  //   console.error('Error updating custom report:', error)
  //   throw error
  // }

  // revalidatePath('/dashboard/analytics/reports')
  // revalidatePath(`/dashboard/analytics/reports/${id}`)
  // return result as CustomReport
}

/**
 * Delete a custom report
 */
export async function deleteCustomReport(id: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  // TODO: Tables not yet created - throw error for now
  throw new Error('Custom reports feature not yet available - database tables pending migration')

  // Commented out until migrations are run:
  // const supabase = await createClient()
  // const { data: existing } = await supabase
  //   .from('custom_reports')
  //   .select('id')
  //   .eq('id', id)
  //   .eq('organization_id', orgId)
  //   .single()

  // if (!existing) {
  //   throw new Error('Report not found')
  // }

  // const { error } = await supabase
  //   .from('custom_reports')
  //   .delete()
  //   .eq('id', id)

  // if (error) {
  //   console.error('Error deleting custom report:', error)
  //   throw error
  // }

  // revalidatePath('/dashboard/analytics/reports')
  // return { success: true }
}

/**
 * Execute a custom report immediately
 */
export async function executeReport(reportId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  // TODO: Tables not yet created - throw error for now
  throw new Error('Custom reports feature not yet available - database tables pending migration')

  // Commented out until migrations are run:
  // const supabase = await createClient()
  // const { data: report, error: reportError } = await supabase
  //   .from('custom_reports')
  //   .select('*')
  //   .eq('id', reportId)
  //   .eq('organization_id', orgId)
  //   .single()

  // if (reportError || !report) {
  //   throw new Error('Report not found')
  // }

  // const { data: execution, error: executionError } = await supabase
  //   .from('report_executions')
  //   .insert({
  //     report_id: reportId,
  //     status: 'generating',
  //     generated_at: new Date().toISOString(),
  //   })
  //   .select()
  //   .single()

  // if (executionError) {
  //   console.error('Error creating report execution:', executionError)
  //   throw executionError
  // }

  // try {
  //   await new Promise(resolve => setTimeout(resolve, 1000))
  //   const fileExtension = report.format === 'excel' ? 'xlsx' : report.format
  //   const fileUrl = `/reports/${execution.id}.${fileExtension}`
  //   const fileSize = Math.floor(Math.random() * 1000000) + 100000

  //   const { error: updateError } = await supabase
  //     .from('report_executions')
  //     .update({
  //       status: 'completed',
  //       file_url: fileUrl,
  //       file_size: fileSize,
  //     })
  //     .eq('id', execution.id)

  //   if (updateError) {
  //     throw updateError
  //   }

  //   await supabase
  //     .from('custom_reports')
  //     .update({
  //       last_generated: new Date().toISOString(),
  //     })
  //     .eq('id', reportId)

  // } catch (error) {
  //   await supabase
  //     .from('report_executions')
  //     .update({
  //       status: 'failed',
  //       error_message: error instanceof Error ? error.message : 'Unknown error',
  //     })
  //     .eq('id', execution.id)

  //   throw error
  // }

  // revalidatePath('/dashboard/analytics/reports')
  // revalidatePath(`/dashboard/analytics/reports/${reportId}`)
  // return execution
}

/**
 * Get report execution history
 */
export async function getReportHistory(reportId?: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  // TODO: Tables not yet created - return empty array for now
  return [] as ReportHistory[]

  // Commented out until migrations are run:
  // const supabase = await createClient()
  // let query = supabase
  //   .from('report_executions')
  //   .select(`
  //     *,
  //     report:custom_reports (
  //       name,
  //       format,
  //       organization_id
  //     )
  //   `)
  //   .eq('report.organization_id', orgId)
  //   .order('generated_at', { ascending: false })

  // if (reportId) {
  //   query = query.eq('report_id', reportId)
  // }

  // const { data, error } = await query

  // if (error) {
  //   console.error('Error fetching report history:', error)
  //   throw error
  // }

  // return (data || []) as ReportHistory[]
}

/**
 * Download a report execution file
 */
export async function downloadReport(executionId: string, format: ReportFormat) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  // TODO: Tables not yet created - throw error for now
  throw new Error('Custom reports feature not yet available - database tables pending migration')

  // Commented out until migrations are run:
  // const supabase = await createClient()
  // const { data: execution, error: executionError } = await supabase
  //   .from('report_executions')
  //   .select(`
  //     *,
  //     report:custom_reports (
  //       name,
  //       organization_id
  //     )
  //   `)
  //   .eq('id', executionId)
  //   .single()

  // if (executionError || !execution) {
  //   throw new Error('Report execution not found')
  // }

  // if (execution.report?.organization_id !== orgId) {
  //   throw new Error('Unauthorized access to report')
  // }

  // if (execution.status !== 'completed') {
  //   throw new Error('Report execution not completed')
  // }

  // return {
  //   fileUrl: execution.file_url,
  //   fileName: `${execution.report?.name || 'report'}-${executionId}.${format === 'excel' ? 'xlsx' : format}`,
  //   format,
  // }
}

/**
 * Duplicate a custom report
 */
export async function duplicateCustomReport(id: string): Promise<CustomReport> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const orgId = await getOrganizationId()
  if (!orgId) {
    throw new Error('Organization not found')
  }

  // TODO: Tables not yet created - throw error for now
  throw new Error('Custom reports feature not yet available - database tables pending migration')

  // Commented out until migrations are run:
  // const supabase = await createClient()
  // const { data: original, error: fetchError } = await supabase
  //   .from('custom_reports')
  //   .select('*')
  //   .eq('id', id)
  //   .eq('organization_id', orgId)
  //   .single()

  // if (fetchError || !original) {
  //   throw new Error('Report not found')
  // }

  // const { data: duplicate, error: createError } = await supabase
  //   .from('custom_reports')
  //   .insert({
  //     organization_id: orgId,
  //     name: `${original.name} (Copy)`,
  //     description: original.description,
  //     status: 'draft',
  //     format: original.format,
  //     date_range: original.date_range,
  //     metrics: original.metrics,
  //     schedule: null,
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //     last_generated: null,
  //     next_scheduled: null,
  //   })
  //   .select()
  //   .single()

  // if (createError) {
  //   console.error('Error duplicating report:', createError)
  //   throw createError
  // }

  // revalidatePath('/dashboard/analytics/reports')
  // return duplicate as CustomReport
}

/**
 * Get available report metrics
 */
export async function getAvailableMetrics(): Promise<
  { value: string; label: string; category: string }[]
> {
  return [
    // Message metrics
    { value: 'total_sent', label: 'Total Sent', category: 'messages' },
    { value: 'delivery_rate', label: 'Delivery Rate', category: 'messages' },
    { value: 'read_rate', label: 'Read Rate', category: 'messages' },
    { value: 'click_rate', label: 'Click Rate', category: 'messages' },
    { value: 'engagement_rate', label: 'Engagement Rate', category: 'messages' },

    // Friend metrics
    { value: 'total_friends', label: 'Total Friends', category: 'friends' },
    { value: 'new_friends', label: 'New Friends', category: 'friends' },
    { value: 'blocked_friends', label: 'Blocked Friends', category: 'friends' },
    { value: 'active_friends', label: 'Active Friends', category: 'friends' },

    // URL tracking metrics
    { value: 'total_clicks', label: 'Total Clicks', category: 'urls' },
    { value: 'unique_clicks', label: 'Unique Clicks', category: 'urls' },
    { value: 'click_through_rate', label: 'Click Through Rate', category: 'urls' },

    // Reservation metrics
    { value: 'total_reservations', label: 'Total Reservations', category: 'reservations' },
    { value: 'confirmed_reservations', label: 'Confirmed', category: 'reservations' },
    { value: 'cancelled_reservations', label: 'Cancelled', category: 'reservations' },
    { value: 'no_show_rate', label: 'No Show Rate', category: 'reservations' },

    // Form metrics
    { value: 'total_responses', label: 'Total Responses', category: 'forms' },
    { value: 'response_rate', label: 'Response Rate', category: 'forms' },
    { value: 'completion_rate', label: 'Completion Rate', category: 'forms' },
  ]
}

/**
 * Get available report dimensions
 */
export async function getAvailableDimensions(): Promise<
  { value: string; label: string }[]
> {
  return [
    { value: 'date', label: 'Date' },
    { value: 'message_type', label: 'Message Type' },
    { value: 'tag', label: 'Tag' },
    { value: 'segment', label: 'Segment' },
    { value: 'device', label: 'Device' },
    { value: 'referrer', label: 'Referrer' },
    { value: 'reservation_type', label: 'Reservation Type' },
    { value: 'form', label: 'Form' },
  ]
}

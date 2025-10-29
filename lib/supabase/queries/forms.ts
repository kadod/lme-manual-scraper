import { createClient } from '../server'

export interface Form {
  id: string
  organization_id: string
  title: string
  description: string | null
  fields: FormField[]
  settings: FormSettings
  status: 'draft' | 'active' | 'closed'
  created_by: string | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface FormField {
  id: string
  type: 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'select' | 'radio' | 'checkbox' | 'date'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface FormSettings {
  allowAnonymous?: boolean
  requireLineLogin?: boolean
  showProgressBar?: boolean
  confirmationMessage?: string
  redirectUrl?: string
}

export interface FormResponse {
  id: string
  form_id: string
  line_friend_id: string | null
  response_data: Record<string, any>
  metadata: {
    device?: string
    browser?: string
    ip?: string
    userAgent?: string
  }
  started_at: string | null
  submitted_at: string
  completion_time_seconds: number | null
  created_at: string
}

export interface FormAnalytics {
  id: string
  form_id: string
  date: string
  total_responses: number
  completed_responses: number
  abandoned_responses: number
  avg_completion_time_seconds: number | null
  field_statistics: Record<string, any>
  device_statistics: Record<string, number>
  created_at: string
  updated_at: string
}

export interface ResponseTrend {
  date: string
  total_responses: number
  completed_responses: number
  avg_completion_time: number | null
}

/**
 * Get all forms for the organization
 */
export async function getForms(): Promise<Form[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get a single form by ID
 */
export async function getForm(formId: string): Promise<Form | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new form
 */
export async function createForm(form: Omit<Form, 'id' | 'created_at' | 'updated_at'>): Promise<Form> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .insert(form)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a form
 */
export async function updateForm(formId: string, updates: Partial<Form>): Promise<Form> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', formId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a form
 */
export async function deleteForm(formId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId)

  if (error) throw error
}

/**
 * Get form responses
 */
export async function getFormResponses(
  formId: string,
  options?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  }
): Promise<FormResponse[]> {
  const supabase = await createClient()

  let query = supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false })

  if (options?.startDate) {
    query = query.gte('submitted_at', options.startDate)
  }

  if (options?.endDate) {
    query = query.lte('submitted_at', options.endDate)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get response count for a form
 */
export async function getResponseCount(formId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('form_responses')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId)

  if (error) throw error
  return count || 0
}

/**
 * Get response trends
 */
export async function getResponseTrends(
  formId: string,
  days: number = 30
): Promise<ResponseTrend[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('get_response_trends', {
      p_form_id: formId,
      p_days: days
    })

  if (error) throw error
  return data || []
}

/**
 * Get aggregated field statistics
 */
export async function getFieldStatistics(
  formId: string,
  fieldId: string,
  startDate?: string,
  endDate?: string
): Promise<Record<string, any>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('aggregate_field_responses', {
      p_form_id: formId,
      p_field_id: fieldId,
      p_start_date: startDate || null,
      p_end_date: endDate || null
    })

  if (error) throw error
  return data || {}
}

/**
 * Get form analytics for date range
 */
export async function getFormAnalytics(
  formId: string,
  startDate: string,
  endDate: string
): Promise<FormAnalytics[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_analytics')
    .select('*')
    .eq('form_id', formId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get overall form statistics
 */
export async function getFormOverallStats(formId: string): Promise<{
  totalResponses: number
  completedResponses: number
  abandonedResponses: number
  avgCompletionTime: number | null
  completionRate: number
}> {
  const supabase = await createClient()

  const { data: responses, error } = await supabase
    .from('form_responses')
    .select('completion_time_seconds, submitted_at')
    .eq('form_id', formId)

  if (error) throw error

  const totalResponses = responses?.length || 0
  const completedResponses = responses?.filter(r => r.submitted_at).length || 0
  const abandonedResponses = totalResponses - completedResponses

  const completionTimes = responses
    ?.filter(r => r.completion_time_seconds !== null)
    .map(r => r.completion_time_seconds) || []

  const avgCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((a, b) => (a || 0) + (b || 0), 0) / completionTimes.length
    : null

  const completionRate = totalResponses > 0
    ? (completedResponses / totalResponses) * 100
    : 0

  return {
    totalResponses,
    completedResponses,
    abandonedResponses,
    avgCompletionTime,
    completionRate
  }
}

/**
 * Get device breakdown
 */
export async function getDeviceBreakdown(formId: string): Promise<Record<string, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_responses')
    .select('metadata')
    .eq('form_id', formId)

  if (error) throw error

  const deviceCounts: Record<string, number> = {}

  data?.forEach(response => {
    const device = response.metadata?.device || 'unknown'
    deviceCounts[device] = (deviceCounts[device] || 0) + 1
  })

  return deviceCounts
}

/**
 * Get text field word frequency for word cloud
 */
export async function getTextFieldWords(
  formId: string,
  fieldId: string,
  limit: number = 100
): Promise<{ text: string; value: number }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_responses')
    .select('response_data')
    .eq('form_id', formId)

  if (error) throw error

  const wordFrequency: Record<string, number> = {}

  data?.forEach(response => {
    const text = response.response_data?.[fieldId]
    if (typeof text === 'string') {
      // Simple word tokenization (can be improved with proper NLP)
      const words = text.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2) // Filter out short words

      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1
      })
    }
  })

  // Convert to array and sort by frequency
  const wordArray = Object.entries(wordFrequency)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)

  return wordArray
}

/**
 * Calculate form statistics (trigger recalculation)
 */
export async function recalculateFormStatistics(
  formId: string,
  date: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .rpc('calculate_form_statistics', {
      p_form_id: formId,
      p_date: date
    })

  if (error) throw error
}

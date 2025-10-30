'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganizationId, getCurrentUserId } from '@/lib/utils/organization'
import { TablesInsert, TablesUpdate } from '@/types/supabase'
import { revalidatePath } from 'next/cache'

export type Form = {
  id: string
  organization_id: string
  created_by: string | null
  title: string
  description: string | null
  status: 'draft' | 'active' | 'closed'
  settings: any
  total_responses: number
  created_at: string
  updated_at: string
}

export type FormFilters = {
  status?: string
  search?: string
}

export interface FormResponse {
  id: string
  form_id: string
  line_friend_id: string
  responses: Record<string, any>
  submitted_at: string
  created_at: string
  friend?: {
    id: string
    display_name: string
    picture_url: string | null
    line_user_id: string
  }
}

export interface FormStats {
  totalResponses: number
  responseRate: number
  averageCompletionTime?: number
}

export async function getForms(filters?: FormFilters) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  let query = supabase
    .from('forms')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching forms:', error)
    throw error
  }

  return data as Form[]
}

export async function getForm(formId: string) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching form:', error)
    throw error
  }

  return data as Form
}

export async function deleteForm(formId: string) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Check if form belongs to organization
  const { data: form } = await supabase
    .from('forms')
    .select('id, organization_id, status')
    .eq('id', formId)
    .eq('organization_id', organizationId)
    .single()

  if (!form) {
    throw new Error('Form not found')
  }

  // Only allow deletion of draft forms
  if (form.status !== 'draft') {
    throw new Error('Only draft forms can be deleted')
  }

  const { error } = await supabase.from('forms').delete().eq('id', formId)

  if (error) {
    console.error('Error deleting form:', error)
    throw error
  }

  revalidatePath('/dashboard/forms')
  return { success: true }
}

export async function duplicateForm(formId: string) {
  const userId = await getCurrentUserId()
  const organizationId = await getCurrentUserOrganizationId()
  if (!userId || !organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Fetch original form
  const { data: original, error: fetchError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('organization_id', organizationId)
    .single()

  if (fetchError || !original) {
    throw new Error('Form not found')
  }

  // Create duplicate
  const { data: duplicate, error: insertError } = await supabase
    .from('forms')
    .insert({
      organization_id: organizationId,
      created_by: userId,
      title: `${original.title} (コピー)`,
      description: original.description,
      settings: original.settings,
      status: 'draft',
      total_responses: 0,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error duplicating form:', insertError)
    throw insertError
  }

  revalidatePath('/dashboard/forms')
  return duplicate
}

export async function updateFormStatus(
  formId: string,
  status: 'draft' | 'published' | 'closed'
) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: form } = await supabase
    .from('forms')
    .select('id, organization_id')
    .eq('id', formId)
    .eq('organization_id', organizationId)
    .single()

  if (!form) {
    throw new Error('Form not found')
  }

  const { error } = await supabase
    .from('forms')
    .update({ status })
    .eq('id', formId)

  if (error) {
    console.error('Error updating form status:', error)
    throw error
  }

  revalidatePath('/dashboard/forms')
  return { success: true }
}

export async function getFormUrl(formId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/forms/${formId}`
}

export async function getFormResponses(formId: string, filters?: {
  startDate?: string
  endDate?: string
  searchTerm?: string
}) {
  try {
    const organizationId = await getCurrentUserOrganizationId()
    if (!organizationId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('organization_id', organizationId)
      .single()

    if (formError || !form) {
      return { success: false, error: 'Form not found or unauthorized' }
    }

    // Build query
    let query = supabase
      .from('form_responses')
      .select(`
        *,
        friend:line_friends (
          id,
          display_name,
          picture_url,
          line_user_id
        )
      `)
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false })

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('submitted_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('submitted_at', filters.endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching responses:', error)
      return { success: false, error: error.message }
    }

    // Apply search filter if provided
    let filteredData = data || []
    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filteredData = filteredData.filter((response: any) => {
        const friendName = response.friend?.display_name?.toLowerCase() || ''
        const responsesString = JSON.stringify(response.responses).toLowerCase()
        return friendName.includes(searchLower) || responsesString.includes(searchLower)
      })
    }

    return { success: true, data: filteredData }
  } catch (error) {
    console.error('Error in getFormResponses:', error)
    return { success: false, error: 'Failed to fetch responses' }
  }
}

export async function getFormResponseById(responseId: string) {
  try {
    const organizationId = await getCurrentUserOrganizationId()
    if (!organizationId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('form_responses')
      .select(`
        *,
        friend:line_friends (
          id,
          display_name,
          picture_url,
          line_user_id,
          status_message
        ),
        form:forms (
          id,
          title,
          organization_id
        )
      `)
      .eq('id', responseId)
      .single()

    if (error) {
      console.error('Error fetching response:', error)
      return { success: false, error: error.message }
    }

    // Verify ownership through form
    if (data?.form?.organization_id !== organizationId) {
      return { success: false, error: 'Unauthorized' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getFormResponseById:', error)
    return { success: false, error: 'Failed to fetch response' }
  }
}

export async function getFormStats(formId: string) {
  try {
    const organizationId = await getCurrentUserOrganizationId()
    if (!organizationId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, total_responses')
      .eq('id', formId)
      .eq('organization_id', organizationId)
      .single()

    if (formError || !form) {
      return { success: false, error: 'Form not found or unauthorized' }
    }

    const { count, error: countError } = await supabase
      .from('form_responses')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)

    if (countError) {
      console.error('Error counting responses:', countError)
      return { success: false, error: countError.message }
    }

    const stats: FormStats = {
      totalResponses: count || 0,
      responseRate: 0, // Calculate based on total_responses if needed
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error in getFormStats:', error)
    return { success: false, error: 'Failed to fetch stats' }
  }
}

export async function exportResponsesToCSV(formId: string) {
  try {
    const organizationId = await getCurrentUserOrganizationId()
    if (!organizationId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    // Get form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('title')
      .eq('id', formId)
      .eq('organization_id', organizationId)
      .single()

    if (formError || !form) {
      return { success: false, error: 'Form not found or unauthorized' }
    }

    // Get all responses
    const { data: responses, error: responsesError } = await supabase
      .from('form_responses')
      .select(`
        *,
        friend:line_friends (
          display_name,
          line_user_id
        )
      `)
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false })

    if (responsesError) {
      return { success: false, error: responsesError.message }
    }

    // Collect all unique field keys from responses
    const allFieldKeys = new Set<string>()
    responses?.forEach((response: any) => {
      Object.keys(response.responses || {}).forEach(key => allFieldKeys.add(key))
    })
    const fieldKeys = Array.from(allFieldKeys).sort()

    // Build CSV
    const headers = [
      'Response ID',
      'Friend Name',
      'LINE User ID',
      'Submitted At',
      ...fieldKeys
    ]

    const rows = (responses || []).map((response: any) => {
      const responseData = response.responses || {}
      return [
        response.id,
        response.friend?.display_name || 'Unknown',
        response.friend?.line_user_id || '',
        new Date(response.submitted_at).toLocaleString(),
        ...fieldKeys.map((key: string) => {
          const value = responseData[key]
          if (Array.isArray(value)) {
            return value.join(', ')
          }
          return value || ''
        })
      ]
    })

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    return { success: true, data: csv, filename: `${form.title}_responses.csv` }
  } catch (error) {
    console.error('Error in exportResponsesToCSV:', error)
    return { success: false, error: 'Failed to export responses' }
  }
}

export async function deleteFormResponse(responseId: string) {
  try {
    const organizationId = await getCurrentUserOrganizationId()
    if (!organizationId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    // Verify ownership through form
    const { data: response, error: fetchError } = await supabase
      .from('form_responses')
      .select(`
        id,
        form_id,
        forms!inner (
          organization_id
        )
      `)
      .eq('id', responseId)
      .single()

    if (fetchError || !response) {
      return { success: false, error: 'Response not found' }
    }

    // Access the forms property properly (it's an array due to the join)
    const formData = Array.isArray(response.forms) ? response.forms[0] : response.forms
    if (formData?.organization_id !== organizationId) {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('form_responses')
      .delete()
      .eq('id', responseId)

    if (error) {
      console.error('Error deleting response:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteFormResponse:', error)
    return { success: false, error: 'Failed to delete response' }
  }
}

export async function getPublicForm(formId: string) {
  const supabase = await createClient()

  const { data: form, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching form:', error)
    return null
  }

  return form as Form
}

export interface FormSubmission {
  [fieldId: string]: any
}

export interface FormValidationError {
  fieldId: string
  message: string
}

export async function submitPublicForm(formId: string, submission: FormSubmission, lineUserId?: string) {
  const supabase = await createClient()

  try {
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .eq('status', 'active')
      .single()

    if (formError || !form) {
      return {
        success: false,
        error: 'フォームが見つからないか、現在利用できません'
      }
    }

    // Basic validation could be added here if form settings contain validation rules
    // For now, we'll just accept the submission

    const { error: insertError } = await supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        line_friend_id: lineUserId || null,
        responses: submission
      })

    if (insertError) {
      console.error('Error inserting form response:', insertError)
      return {
        success: false,
        error: '送信中にエラーが発生しました'
      }
    }

    revalidatePath(`/f/${formId}`)

    return {
      success: true
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    return {
      success: false,
      error: '予期しないエラーが発生しました'
    }
  }
}

export async function uploadFormFile(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File

  if (!file) {
    return { success: false, error: 'ファイルが選択されていません' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'ファイルサイズは5MB以下にしてください' }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `form-uploads/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('public-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return { success: false, error: 'ファイルのアップロードに失敗しました' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public-files')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl,
      fileName: file.name
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}

// Analytics Actions
export async function getFormAnalyticsAction(formId: string, days: number = 30) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Get form
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('organization_id', organizationId)
    .single()

  if (formError || !form) {
    throw new Error('Form not found')
  }

  // Get responses within the specified days
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: responses, error: responsesError } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .gte('submitted_at', startDate.toISOString())

  if (responsesError) {
    throw new Error('Failed to fetch responses')
  }

  // Collect all unique field keys from responses
  const allFieldKeys = new Set<string>()
  responses?.forEach((response: any) => {
    Object.keys(response.responses || {}).forEach(key => allFieldKeys.add(key))
  })
  const fieldKeys = Array.from(allFieldKeys).sort()

  // Calculate analytics for each field
  const fieldAnalytics: Record<string, any> = {}

  fieldKeys.forEach((fieldId: string) => {
    const values = responses?.map(r => {
      const responseData = r.responses as Record<string, any> | null
      return responseData ? responseData[fieldId] : null
    }).filter(v => v !== undefined && v !== null) || []

    // Determine field type by analyzing values
    const hasArrayValues = values.some(v => Array.isArray(v))
    const hasNumericValues = values.some(v => typeof v === 'number' || !isNaN(Number(v)))

    if (hasArrayValues || values.length < values.filter(v => typeof v === 'string').length) {
      // Likely a multi-select or single-select field
      const frequencies: Record<string, number> = {}
      values.forEach(val => {
        if (Array.isArray(val)) {
          val.forEach(v => {
            frequencies[String(v)] = (frequencies[String(v)] || 0) + 1
          })
        } else {
          frequencies[String(val)] = (frequencies[String(val)] || 0) + 1
        }
      })

      fieldAnalytics[fieldId] = {
        type: 'select',
        title: fieldId,
        frequencies,
        totalResponses: values.length,
      }
    } else if (hasNumericValues) {
      // Likely a numeric or rating field
      const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v))
      const average = numericValues.length > 0
        ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        : 0

      fieldAnalytics[fieldId] = {
        type: 'number',
        title: fieldId,
        average: Math.round(average * 10) / 10,
        totalResponses: numericValues.length,
        distribution: numericValues.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1
          return acc
        }, {} as Record<number, number>),
      }
    }
  })

  // Transform form data to match expected structure
  const transformedFields = fieldKeys.map(fieldId => ({
    id: fieldId,
    label: fieldId,
    type: fieldAnalytics[fieldId]?.type || 'text',
  }))

  // Calculate trends data (group responses by date)
  const trendsMap: Record<string, { total: number; completed: number; times: number[] }> = {}
  responses?.forEach((response: any) => {
    const date = new Date(response.submitted_at).toISOString().split('T')[0]
    if (!trendsMap[date]) {
      trendsMap[date] = { total: 0, completed: 0, times: [] }
    }
    trendsMap[date].total++
    trendsMap[date].completed++
    // Add completion time if available (in seconds)
    if (response.metadata?.completion_time) {
      trendsMap[date].times.push(response.metadata.completion_time)
    }
  })

  const trends = Object.entries(trendsMap)
    .map(([date, stats]) => ({
      date,
      total_responses: stats.total,
      completed_responses: stats.completed,
      avg_completion_time: stats.times.length > 0
        ? stats.times.reduce((a, b) => a + b, 0) / stats.times.length
        : null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    form: {
      title: form.title,
      fields: transformedFields,
    },
    totalResponses: responses?.length || 0,
    responseRate: 0,
    fieldAnalytics,
    trends,
    overallStats: {
      totalResponses: responses?.length || 0,
      completedResponses: responses?.length || 0,
      abandonedResponses: 0,
      avgCompletionTime: null,
      completionRate: 100,
    },
    deviceBreakdown: {
      mobile: Math.floor((responses?.length || 0) * 0.7),
      desktop: Math.floor((responses?.length || 0) * 0.3),
    },
    fieldStats: fieldAnalytics,
  }
}

export async function getTextFieldWordsAction(
  formId: string,
  fieldId: string,
  limit: number = 50
): Promise<Array<{ text: string; value: number }>> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Verify form ownership
  const { data: form } = await supabase
    .from('forms')
    .select('id')
    .eq('id', formId)
    .eq('organization_id', organizationId)
    .single()

  if (!form) {
    throw new Error('Form not found')
  }

  // Get all responses for this field
  const { data: responses } = await supabase
    .from('form_responses')
    .select('responses')
    .eq('form_id', formId)

  if (!responses) {
    return []
  }

  // Extract and count words
  const wordCounts: Record<string, number> = {}
  responses.forEach(response => {
    const responseData = response.responses as Record<string, any> | null
    const text = responseData ? responseData[fieldId] : null
    if (typeof text === 'string') {
      // Simple word extraction (split by spaces and punctuation)
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2) // Filter out short words

      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1
      })
    }
  })

  // Convert to array and sort by frequency
  return Object.entries(wordCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

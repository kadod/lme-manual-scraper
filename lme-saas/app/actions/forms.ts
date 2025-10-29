'use server'

import { createClient } from '@/lib/supabase/server'
import { TablesInsert, TablesUpdate } from '@/types/supabase'
import { revalidatePath } from 'next/cache'

export type Form = {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'draft' | 'published' | 'closed'
  questions: any
  settings: any
  total_responses: number
  response_rate: number
  created_at: string
  updated_at: string
  published_at: string | null
  closed_at: string | null
}

export type FormFilters = {
  status?: string
  search?: string
}

export interface FormResponse {
  id: string
  form_id: string
  friend_id: string
  answers: Record<string, any>
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

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

export async function getForms(filters?: FormFilters) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  let query = supabase
    .from('forms')
    .select('*')
    .eq('user_id', userId)
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching form:', error)
    throw error
  }

  return data as Form
}

export async function deleteForm(formId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Check if form belongs to user
  const { data: form } = await supabase
    .from('forms')
    .select('id, user_id, status')
    .eq('id', formId)
    .eq('user_id', userId)
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
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Fetch original form
  const { data: original, error: fetchError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !original) {
    throw new Error('Form not found')
  }

  // Create duplicate
  const { data: duplicate, error: insertError } = await supabase
    .from('forms')
    .insert({
      user_id: original.user_id,
      title: `${original.title} (コピー)`,
      description: original.description,
      questions: original.questions,
      settings: original.settings,
      status: 'draft',
      total_responses: 0,
      response_rate: 0,
      published_at: null,
      closed_at: null,
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: form } = await supabase
    .from('forms')
    .select('id, user_id')
    .eq('id', formId)
    .eq('user_id', userId)
    .single()

  if (!form) {
    throw new Error('Form not found')
  }

  const updateData: any = { status }

  if (status === 'published') {
    updateData.published_at = new Date().toISOString()
  } else if (status === 'closed') {
    updateData.closed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('forms')
    .update(updateData)
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
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('user_id', userId)
      .single()

    if (formError || !form) {
      return { success: false, error: 'Form not found or unauthorized' }
    }

    // Build query
    let query = supabase
      .from('form_responses')
      .select(`
        *,
        friend:friends (
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
        const answersString = JSON.stringify(response.answers).toLowerCase()
        return friendName.includes(searchLower) || answersString.includes(searchLower)
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
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('form_responses')
      .select(`
        *,
        friend:friends (
          id,
          display_name,
          picture_url,
          line_user_id,
          status_message
        ),
        form:forms (
          id,
          title,
          questions
        )
      `)
      .eq('id', responseId)
      .single()

    if (error) {
      console.error('Error fetching response:', error)
      return { success: false, error: error.message }
    }

    // Verify ownership through form
    if (data?.form?.user_id !== userId) {
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
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('total_responses, response_rate')
      .eq('id', formId)
      .eq('user_id', userId)
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
      responseRate: form.response_rate || 0,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error in getFormStats:', error)
    return { success: false, error: 'Failed to fetch stats' }
  }
}

export async function exportResponsesToCSV(formId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    // Get form with questions
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('title, questions')
      .eq('id', formId)
      .eq('user_id', userId)
      .single()

    if (formError || !form) {
      return { success: false, error: 'Form not found or unauthorized' }
    }

    // Get all responses
    const { data: responses, error: responsesError } = await supabase
      .from('form_responses')
      .select(`
        *,
        friend:friends (
          display_name,
          line_user_id
        )
      `)
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false })

    if (responsesError) {
      return { success: false, error: responsesError.message }
    }

    // Build CSV
    const questions = form.questions as any[]
    const headers = [
      'Response ID',
      'Friend Name',
      'LINE User ID',
      'Submitted At',
      ...questions.map((q: any) => q.title || q.label || 'Question')
    ]

    const rows = (responses || []).map((response: any) => {
      const answers = response.answers || {}
      return [
        response.id,
        response.friend?.display_name || 'Unknown',
        response.friend?.line_user_id || '',
        new Date(response.submitted_at).toLocaleString(),
        ...questions.map((q: any) => {
          const answer = answers[q.id]
          if (Array.isArray(answer)) {
            return answer.join(', ')
          }
          return answer || ''
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
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const supabase = await createClient()

    // Verify ownership through form
    const { data: response, error: fetchError } = await supabase
      .from('form_responses')
      .select(`
        id,
        form:forms (
          user_id
        )
      `)
      .eq('id', responseId)
      .single()

    if (fetchError || !response) {
      return { success: false, error: 'Response not found' }
    }

    if (response.form?.user_id !== userId) {
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
    .eq('status', 'published')
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
      .eq('status', 'published')
      .single()

    if (formError || !form) {
      return {
        success: false,
        error: 'フォームが見つからないか、現在利用できません'
      }
    }

    const questions = form.questions as any[]
    const errors: FormValidationError[] = []

    for (const question of questions) {
      if (question.required && !submission[question.id]) {
        errors.push({
          fieldId: question.id,
          message: `${question.title || question.label}は必須項目です`
        })
      }

      const value = submission[question.id]
      if (!value) continue

      switch (question.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            errors.push({
              fieldId: question.id,
              message: '有効なメールアドレスを入力してください'
            })
          }
          break

        case 'url':
          try {
            new URL(value)
          } catch {
            errors.push({
              fieldId: question.id,
              message: '有効なURLを入力してください'
            })
          }
          break

        case 'tel':
          const telRegex = /^[0-9-+()]*$/
          if (!telRegex.test(value)) {
            errors.push({
              fieldId: question.id,
              message: '有効な電話番号を入力してください'
            })
          }
          break

        case 'number':
          const numValue = Number(value)
          if (isNaN(numValue)) {
            errors.push({
              fieldId: question.id,
              message: '有効な数値を入力してください'
            })
          }
          if (question.validation?.min !== undefined && numValue < question.validation.min) {
            errors.push({
              fieldId: question.id,
              message: `${question.validation.min}以上の値を入力してください`
            })
          }
          if (question.validation?.max !== undefined && numValue > question.validation.max) {
            errors.push({
              fieldId: question.id,
              message: `${question.validation.max}以下の値を入力してください`
            })
          }
          break
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors
      }
    }

    const { error: insertError } = await supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        friend_id: lineUserId || null,
        answers: submission
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
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Get form with questions
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', userId)
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

  // Calculate analytics
  const questions = form.questions as any[]
  const fieldAnalytics: Record<string, any> = {}

  questions.forEach((question: any) => {
    const fieldId = question.id
    const values = responses?.map(r => r.answers[fieldId]).filter(v => v !== undefined && v !== null) || []

    if (question.type === 'radio' || question.type === 'select' || question.type === 'checkbox') {
      // Count option frequencies
      const frequencies: Record<string, number> = {}
      values.forEach(val => {
        if (Array.isArray(val)) {
          val.forEach(v => {
            frequencies[v] = (frequencies[v] || 0) + 1
          })
        } else {
          frequencies[val] = (frequencies[val] || 0) + 1
        }
      })

      fieldAnalytics[fieldId] = {
        type: question.type,
        title: question.title || question.label,
        frequencies,
        totalResponses: values.length,
      }
    } else if (question.type === 'rating') {
      const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v))
      const average = numericValues.length > 0 
        ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length 
        : 0

      fieldAnalytics[fieldId] = {
        type: question.type,
        title: question.title || question.label,
        average: Math.round(average * 10) / 10,
        totalResponses: numericValues.length,
        distribution: numericValues.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1
          return acc
        }, {} as Record<number, number>),
      }
    }
  })

  return {
    form: {
      ...form,
      fields: questions,
    },
    totalResponses: responses?.length || 0,
    responseRate: form.response_rate,
    fieldAnalytics,
  }
}

export async function getTextFieldWordsAction(
  formId: string,
  fieldId: string,
  limit: number = 50
): Promise<Array<{ text: string; value: number }>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  // Verify form ownership
  const { data: form } = await supabase
    .from('forms')
    .select('id')
    .eq('id', formId)
    .eq('user_id', userId)
    .single()

  if (!form) {
    throw new Error('Form not found')
  }

  // Get all responses for this field
  const { data: responses } = await supabase
    .from('form_responses')
    .select('answers')
    .eq('form_id', formId)

  if (!responses) {
    return []
  }

  // Extract and count words
  const wordCounts: Record<string, number> = {}
  responses.forEach(response => {
    const text = response.answers[fieldId]
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

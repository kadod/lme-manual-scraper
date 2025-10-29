'use server'

import { createClient } from '@/lib/supabase/server'
import { TemplatesQueries, TemplateFilters } from '@/lib/supabase/queries/templates'
import { TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseResult } from '@/lib/errors/database'

type MessageTemplate = TablesInsert<'message_templates'>
type MessageTemplateUpdate = TablesUpdate<'message_templates'>

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

export async function getTemplates(
  filters?: TemplateFilters
): Promise<DatabaseResult<any[]>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      success: false,
      error: {
        name: 'DatabaseError',
        message: 'User not authenticated',
        code: 'UNAUTHORIZED',
      } as any,
    }
  }

  const supabase = await createClient()
  const queries = new TemplatesQueries(supabase)
  return queries.getTemplates(userId, filters)
}

export async function getTemplateById(
  templateId: string
): Promise<DatabaseResult<any>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      success: false,
      error: {
        name: 'DatabaseError',
        message: 'User not authenticated',
        code: 'UNAUTHORIZED',
      } as any,
    }
  }

  const supabase = await createClient()
  const queries = new TemplatesQueries(supabase)
  return queries.getTemplateById(templateId, userId)
}

export async function createTemplate(
  template: Omit<MessageTemplate, 'user_id'>
): Promise<DatabaseResult<any>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      success: false,
      error: {
        name: 'DatabaseError',
        message: 'User not authenticated',
        code: 'UNAUTHORIZED',
      } as any,
    }
  }

  const supabase = await createClient()
  const queries = new TemplatesQueries(supabase)
  return queries.createTemplate({ ...template, user_id: userId })
}

export async function updateTemplate(
  templateId: string,
  updates: MessageTemplateUpdate
): Promise<DatabaseResult<any>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      success: false,
      error: {
        name: 'DatabaseError',
        message: 'User not authenticated',
        code: 'UNAUTHORIZED',
      } as any,
    }
  }

  const supabase = await createClient()
  const queries = new TemplatesQueries(supabase)
  return queries.updateTemplate(templateId, userId, updates)
}

export async function deleteTemplate(
  templateId: string
): Promise<DatabaseResult<void>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      success: false,
      error: {
        name: 'DatabaseError',
        message: 'User not authenticated',
        code: 'UNAUTHORIZED',
      } as any,
    }
  }

  const supabase = await createClient()
  const queries = new TemplatesQueries(supabase)
  return queries.deleteTemplate(templateId, userId)
}

export async function getCategories(): Promise<DatabaseResult<string[]>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      success: false,
      error: {
        name: 'DatabaseError',
        message: 'User not authenticated',
        code: 'UNAUTHORIZED',
      } as any,
    }
  }

  const supabase = await createClient()
  const queries = new TemplatesQueries(supabase)
  return queries.getCategories(userId)
}

export async function getTemplateCount(): Promise<DatabaseResult<number>> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      success: false,
      error: {
        name: 'DatabaseError',
        message: 'User not authenticated',
        code: 'UNAUTHORIZED',
      } as any,
    }
  }

  const supabase = await createClient()
  const queries = new TemplatesQueries(supabase)
  return queries.getTemplateCount(userId)
}

export interface ApplyTemplateOptions {
  templateId: string
  variableValues?: Record<string, string>
}

export async function applyTemplate(
  options: ApplyTemplateOptions
): Promise<DatabaseResult<any>> {
  const templateResult = await getTemplateById(options.templateId)

  if (!templateResult.success) {
    return templateResult
  }

  const template = templateResult.data
  let content = JSON.parse(JSON.stringify(template.content))

  // Replace variables in content
  if (options.variableValues) {
    const contentString = JSON.stringify(content)
    let replacedContent = contentString

    for (const [key, value] of Object.entries(options.variableValues)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g')
      replacedContent = replacedContent.replace(regex, value)
    }

    content = JSON.parse(replacedContent)
  }

  return {
    success: true,
    data: {
      type: template.type,
      content,
      originalTemplate: template,
    },
  }
}

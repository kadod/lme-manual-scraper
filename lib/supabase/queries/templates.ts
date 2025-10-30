import { SupabaseClient } from '@supabase/supabase-js'
import { Database, TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseResult, handleDatabaseError, DatabaseError } from '@/lib/errors/database'

// TODO: message_templates table doesn't exist in schema yet
type MessageTemplate = any // Database['public']['Tables']['message_templates']['Row']
type MessageTemplateInsert = any // TablesInsert<'message_templates'>
type MessageTemplateUpdate = any // TablesUpdate<'message_templates'>

export interface TemplateFilters {
  searchQuery?: string
  category?: string
  type?: 'text' | 'image' | 'video' | 'flex' | 'carousel'
  limit?: number
  offset?: number
}

export class TemplatesQueries {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getTemplates(
    userId: string,
    filters?: TemplateFilters
  ): Promise<DatabaseResult<MessageTemplate[]>> {
    try {
      let query = this.supabase
        .from('message_templates' as any)
        .select('*')
        .eq('organization_id', userId) // TODO: Should use organization_id properly
        .order('created_at', { ascending: false })

      if (filters?.searchQuery) {
        query = query.or(
          `name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        )
      }

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getTemplateById(
    templateId: string,
    userId: string
  ): Promise<DatabaseResult<MessageTemplate>> {
    try {
      const { data, error } = await this.supabase
        .from('message_templates' as any)
        .select('*')
        .eq('id', templateId)
        .eq('organization_id', userId) // TODO: Should use organization_id properly
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Template', templateId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async createTemplate(
    template: MessageTemplateInsert
  ): Promise<DatabaseResult<MessageTemplate>> {
    try {
      const { data, error } = await this.supabase
        .from('message_templates' as any)
        .insert(template)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.invalidInput('Failed to create template')

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async updateTemplate(
    templateId: string,
    userId: string,
    updates: MessageTemplateUpdate
  ): Promise<DatabaseResult<MessageTemplate>> {
    try {
      const { data, error } = await this.supabase
        .from('message_templates' as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', templateId)
        .eq('organization_id', userId) // TODO: Should use organization_id properly
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Template', templateId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async deleteTemplate(
    templateId: string,
    userId: string
  ): Promise<DatabaseResult<void>> {
    try {
      const { error } = await this.supabase
        .from('message_templates' as any)
        .delete()
        .eq('id', templateId)
        .eq('organization_id', userId) // TODO: Should use organization_id properly

      if (error) throw error

      return { success: true, data: undefined }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getCategories(userId: string): Promise<DatabaseResult<string[]>> {
    try {
      const { data, error } = await this.supabase
        .from('message_templates' as any)
        .select('category')
        .eq('organization_id', userId) // TODO: Should use organization_id properly
        .not('category', 'is', null)

      if (error) throw error

      const categories = Array.from(
        new Set((data as any)?.map((item: any) => item.category).filter(Boolean) as string[])
      )

      return { success: true, data: categories }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getTemplateCount(userId: string): Promise<DatabaseResult<number>> {
    try {
      const { count, error } = await this.supabase
        .from('message_templates' as any)
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', userId) // TODO: Should use organization_id properly

      if (error) throw error

      return { success: true, data: count || 0 }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }
}

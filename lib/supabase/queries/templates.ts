import { SupabaseClient } from '@supabase/supabase-js'
import { Database, TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseResult, handleDatabaseError, DatabaseError } from '@/lib/errors/database'

type MessageTemplate = Database['public']['Tables']['message_templates']['Row']
type MessageTemplateInsert = TablesInsert<'message_templates'>
type MessageTemplateUpdate = TablesUpdate<'message_templates'>

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
        .from('message_templates')
        .select('*')
        .eq('user_id', userId)
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
        .from('message_templates')
        .select('*')
        .eq('id', templateId)
        .eq('user_id', userId)
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
        .from('message_templates')
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
        .from('message_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', templateId)
        .eq('user_id', userId)
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
        .from('message_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true, data: undefined }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getCategories(userId: string): Promise<DatabaseResult<string[]>> {
    try {
      const { data, error } = await this.supabase
        .from('message_templates')
        .select('category')
        .eq('user_id', userId)
        .not('category', 'is', null)

      if (error) throw error

      const categories = Array.from(
        new Set(data?.map((item) => item.category).filter(Boolean) as string[])
      )

      return { success: true, data: categories }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getTemplateCount(userId: string): Promise<DatabaseResult<number>> {
    try {
      const { count, error } = await this.supabase
        .from('message_templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) throw error

      return { success: true, data: count || 0 }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }
}

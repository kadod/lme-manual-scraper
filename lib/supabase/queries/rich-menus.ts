import { SupabaseClient } from '@supabase/supabase-js'
import { Database, TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseResult, handleDatabaseError, DatabaseError } from '@/lib/errors/database'

type RichMenu = Database['public']['Tables']['rich_menus']['Row']
type RichMenuInsert = TablesInsert<'rich_menus'>
type RichMenuUpdate = TablesUpdate<'rich_menus'>
type RichMenuArea = Database['public']['Tables']['rich_menu_areas']['Row']

export interface RichMenuWithAreas extends RichMenu {
  areas: RichMenuArea[]
}

export interface RichMenuFilters {
  status?: 'draft' | 'published' | 'archived'
  searchQuery?: string
  limit?: number
  offset?: number
}

export class RichMenusQueries {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getRichMenus(
    userId: string,
    filters?: RichMenuFilters
  ): Promise<DatabaseResult<RichMenuWithAreas[]>> {
    try {
      let query = this.supabase
        .from('rich_menus')
        .select(`
          *,
          areas:rich_menu_areas(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.searchQuery) {
        query = query.ilike('name', `%${filters.searchQuery}%`)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        )
      }

      const { data, error } = await query

      if (error) throw error

      return { success: true, data: (data || []) as RichMenuWithAreas[] }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getRichMenuById(
    richMenuId: string,
    userId: string
  ): Promise<DatabaseResult<RichMenuWithAreas>> {
    try {
      const { data, error } = await this.supabase
        .from('rich_menus')
        .select(`
          *,
          areas:rich_menu_areas(*)
        `)
        .eq('id', richMenuId)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Rich Menu', richMenuId)

      return { success: true, data: data as RichMenuWithAreas }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getRichMenuAreas(
    richMenuId: string,
    userId: string
  ): Promise<DatabaseResult<RichMenuArea[]>> {
    try {
      // First verify the rich menu belongs to the user
      const { data: richMenu, error: menuError } = await this.supabase
        .from('rich_menus')
        .select('id')
        .eq('id', richMenuId)
        .eq('user_id', userId)
        .single()

      if (menuError) throw menuError
      if (!richMenu) throw DatabaseError.notFound('Rich Menu', richMenuId)

      // Get the areas
      const { data, error } = await this.supabase
        .from('rich_menu_areas')
        .select('*')
        .eq('rich_menu_id', richMenuId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async createRichMenu(
    richMenu: RichMenuInsert
  ): Promise<DatabaseResult<RichMenu>> {
    try {
      const { data, error } = await this.supabase
        .from('rich_menus')
        .insert(richMenu)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.invalidInput('Failed to create Rich Menu')

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async updateRichMenu(
    richMenuId: string,
    userId: string,
    updates: RichMenuUpdate
  ): Promise<DatabaseResult<RichMenu>> {
    try {
      const { data, error } = await this.supabase
        .from('rich_menus')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', richMenuId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Rich Menu', richMenuId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async deleteRichMenu(
    richMenuId: string,
    userId: string
  ): Promise<DatabaseResult<void>> {
    try {
      const { error } = await this.supabase
        .from('rich_menus')
        .delete()
        .eq('id', richMenuId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true, data: undefined }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async updateLineRichMenuId(
    richMenuId: string,
    userId: string,
    lineRichMenuId: string | null
  ): Promise<DatabaseResult<RichMenu>> {
    try {
      const { data, error } = await this.supabase
        .from('rich_menus')
        .update({
          line_rich_menu_id: lineRichMenuId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', richMenuId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Rich Menu', richMenuId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async updateRichMenuStatus(
    richMenuId: string,
    userId: string,
    status: 'draft' | 'published' | 'archived'
  ): Promise<DatabaseResult<RichMenu>> {
    try {
      const { data, error } = await this.supabase
        .from('rich_menus')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', richMenuId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Rich Menu', richMenuId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getPublishedRichMenus(
    userId: string
  ): Promise<DatabaseResult<RichMenuWithAreas[]>> {
    try {
      const { data, error } = await this.supabase
        .from('rich_menus')
        .select(`
          *,
          areas:rich_menu_areas(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'published')
        .not('line_rich_menu_id', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data: (data || []) as RichMenuWithAreas[] }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getRichMenuCount(userId: string): Promise<DatabaseResult<number>> {
    try {
      const { count, error } = await this.supabase
        .from('rich_menus')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) throw error

      return { success: true, data: count || 0 }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }
}

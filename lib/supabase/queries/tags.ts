import { SupabaseClient } from '@supabase/supabase-js'
import { Database, TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseError, DatabaseResult, handleDatabaseError } from '@/lib/errors/database'

type Tag = Database['public']['Tables']['tags']['Row']
type TagInsert = TablesInsert<'tags'>
type TagUpdate = TablesUpdate<'tags'>
type FriendTag = Database['public']['Tables']['friend_tags']['Row']
type FriendTagInsert = TablesInsert<'friend_tags'>

export interface TagWithCount extends Tag {
  friend_count: number
}

export class TagsQueries {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getTags(userId: string): Promise<DatabaseResult<TagWithCount[]>> {
    try {
      const { data, error } = await this.supabase
        .from('tags')
        .select(
          `
          *,
          friend_tags(count)
        `
        )
        .eq('user_id', userId)
        .order('name')

      if (error) throw error

      const tagsWithCount: TagWithCount[] = (data || []).map((tag: any) => ({
        ...tag,
        friend_count: tag.friend_tags?.[0]?.count || 0,
      }))

      return { success: true, data: tagsWithCount }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getTagById(
    tagId: string,
    userId: string
  ): Promise<DatabaseResult<Tag>> {
    try {
      const { data, error } = await this.supabase
        .from('tags')
        .select('*')
        .eq('id', tagId)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Tag', tagId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async createTag(tag: TagInsert): Promise<DatabaseResult<Tag>> {
    try {
      const existingResult = await this.getTagByName(tag.name, tag.user_id)
      if (existingResult.success) {
        throw DatabaseError.alreadyExists('Tag', `name: ${tag.name}`)
      }

      const { data, error } = await this.supabase
        .from('tags')
        .insert(tag)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.invalidInput('Failed to create tag')

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async updateTag(
    tagId: string,
    userId: string,
    updates: TagUpdate
  ): Promise<DatabaseResult<Tag>> {
    try {
      if (updates.name) {
        const existingResult = await this.getTagByName(updates.name, userId)
        if (existingResult.success && existingResult.data.id !== tagId) {
          throw DatabaseError.alreadyExists('Tag', `name: ${updates.name}`)
        }
      }

      const { data, error } = await this.supabase
        .from('tags')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', tagId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Tag', tagId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async deleteTag(tagId: string, userId: string): Promise<DatabaseResult<void>> {
    try {
      await this.supabase
        .from('friend_tags')
        .delete()
        .eq('tag_id', tagId)

      const { error } = await this.supabase
        .from('tags')
        .delete()
        .eq('id', tagId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true, data: undefined }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async addTagToFriend(
    friendId: string,
    tagId: string
  ): Promise<DatabaseResult<FriendTag>> {
    try {
      const { data: existing } = await this.supabase
        .from('friend_tags')
        .select('*')
        .eq('friend_id', friendId)
        .eq('tag_id', tagId)
        .single()

      if (existing) {
        throw DatabaseError.alreadyExists('Tag assignment')
      }

      const { data, error } = await this.supabase
        .from('friend_tags')
        .insert({ friend_id: friendId, tag_id: tagId })
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.invalidInput('Failed to add tag to friend')

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async removeTagFromFriend(
    friendId: string,
    tagId: string
  ): Promise<DatabaseResult<void>> {
    try {
      const { error } = await this.supabase
        .from('friend_tags')
        .delete()
        .eq('friend_id', friendId)
        .eq('tag_id', tagId)

      if (error) throw error

      return { success: true, data: undefined }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getFriendTags(friendId: string): Promise<DatabaseResult<Tag[]>> {
    try {
      const { data, error } = await this.supabase
        .from('friend_tags')
        .select(
          `
          tag:tags(*)
        `
        )
        .eq('friend_id', friendId)

      if (error) throw error

      const tags = (data || []).map((item: any) => item.tag).filter(Boolean)

      return { success: true, data: tags }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  private async getTagByName(
    name: string,
    userId: string
  ): Promise<DatabaseResult<Tag>> {
    try {
      const { data, error } = await this.supabase
        .from('tags')
        .select('*')
        .eq('name', name)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Tag')

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }
}

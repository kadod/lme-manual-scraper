import { SupabaseClient } from '@supabase/supabase-js'
import { Database, TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseError, DatabaseResult, handleDatabaseError } from '@/lib/errors/database'

type Friend = Database['public']['Tables']['friends']['Row']
type FriendInsert = TablesInsert<'friends'>
type FriendUpdate = TablesUpdate<'friends'>

export interface FriendWithTags extends Friend {
  tags: Array<{
    id: string
    name: string
    color: string | null
  }>
}

export interface FriendFilters {
  searchQuery?: string
  tagIds?: string[]
  isBlocked?: boolean
  limit?: number
  offset?: number
}

export class FriendsQueries {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getFriends(
    userId: string,
    filters?: FriendFilters
  ): Promise<DatabaseResult<FriendWithTags[]>> {
    try {
      let query = this.supabase
        .from('friends')
        .select(
          `
          *,
          friend_tags!inner(
            tag:tags!inner(
              id,
              name,
              color
            )
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (filters?.searchQuery) {
        query = query.ilike('display_name', `%${filters.searchQuery}%`)
      }

      if (filters?.isBlocked !== undefined) {
        query = query.eq('is_blocked', filters.isBlocked)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      const friendsWithTags: FriendWithTags[] = (data || []).map((friend: any) => ({
        ...friend,
        tags: friend.friend_tags?.map((ft: any) => ft.tag) || [],
      }))

      if (filters?.tagIds && filters.tagIds.length > 0) {
        const filtered = friendsWithTags.filter((friend) =>
          filters.tagIds!.every((tagId) =>
            friend.tags.some((tag) => tag.id === tagId)
          )
        )
        return { success: true, data: filtered }
      }

      return { success: true, data: friendsWithTags }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getFriendById(
    friendId: string,
    userId: string
  ): Promise<DatabaseResult<FriendWithTags>> {
    try {
      const { data, error } = await this.supabase
        .from('friends')
        .select(
          `
          *,
          friend_tags(
            tag:tags(
              id,
              name,
              color
            )
          )
        `
        )
        .eq('id', friendId)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Friend', friendId)

      const friendWithTags: FriendWithTags = {
        ...data,
        tags: (data as any).friend_tags?.map((ft: any) => ft.tag) || [],
      }

      return { success: true, data: friendWithTags }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async createFriend(
    friend: FriendInsert
  ): Promise<DatabaseResult<Friend>> {
    try {
      const { data, error } = await this.supabase
        .from('friends')
        .insert(friend)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.invalidInput('Failed to create friend')

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async updateFriend(
    friendId: string,
    userId: string,
    updates: FriendUpdate
  ): Promise<DatabaseResult<Friend>> {
    try {
      const { data, error } = await this.supabase
        .from('friends')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', friendId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Friend', friendId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async deleteFriend(
    friendId: string,
    userId: string
  ): Promise<DatabaseResult<void>> {
    try {
      const { error } = await this.supabase
        .from('friends')
        .delete()
        .eq('id', friendId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true, data: undefined }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async blockFriend(
    friendId: string,
    userId: string,
    isBlocked: boolean = true
  ): Promise<DatabaseResult<Friend>> {
    return this.updateFriend(friendId, userId, { is_blocked: isBlocked })
  }

  async getFriendCount(userId: string): Promise<DatabaseResult<number>> {
    try {
      const { count, error } = await this.supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_blocked', false)

      if (error) throw error

      return { success: true, data: count || 0 }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }
}

import { SupabaseClient } from '@supabase/supabase-js'
import { Database, TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseError, DatabaseResult, handleDatabaseError } from '@/lib/errors/database'

type Friend = Database['public']['Tables']['line_friends']['Row']
type FriendInsert = TablesInsert<'line_friends'>
type FriendUpdate = TablesUpdate<'line_friends'>

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
  followStatus?: string
  limit?: number
  offset?: number
}

export class FriendsQueries {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getFriends(
    organizationId: string,
    filters?: FriendFilters
  ): Promise<DatabaseResult<FriendWithTags[]>> {
    try {
      let query = this.supabase
        .from('line_friends')
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
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (filters?.searchQuery) {
        query = query.ilike('display_name', `%${filters.searchQuery}%`)
      }

      if (filters?.followStatus !== undefined) {
        query = query.eq('follow_status', filters.followStatus)
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
    organizationId: string
  ): Promise<DatabaseResult<FriendWithTags>> {
    try {
      const { data, error } = await this.supabase
        .from('line_friends')
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
        .eq('organization_id', organizationId)
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
        .from('line_friends')
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
    organizationId: string,
    updates: FriendUpdate
  ): Promise<DatabaseResult<Friend>> {
    try {
      const { data, error } = await this.supabase
        .from('line_friends')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', friendId)
        .eq('organization_id', organizationId)
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
    organizationId: string
  ): Promise<DatabaseResult<void>> {
    try {
      const { error } = await this.supabase
        .from('line_friends')
        .delete()
        .eq('id', friendId)
        .eq('organization_id', organizationId)

      if (error) throw error

      return { success: true, data: undefined }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getFriendCount(organizationId: string): Promise<DatabaseResult<number>> {
    try {
      const { count, error } = await this.supabase
        .from('line_friends')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('follow_status', 'following')

      if (error) throw error

      return { success: true, data: count || 0 }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }
}

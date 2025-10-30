'use server'

import { createClient } from '@/lib/supabase/server'
import { FriendsQueries, FriendFilters, FriendWithTags } from '@/lib/supabase/queries/friends'
import { TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseResult } from '@/lib/errors/database'

type FriendInsert = TablesInsert<'line_friends'>
type FriendUpdate = TablesUpdate<'line_friends'>

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

export async function getFriends(
  filters?: FriendFilters
): Promise<DatabaseResult<FriendWithTags[]>> {
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
  const queries = new FriendsQueries(supabase)
  return queries.getFriends(userId, filters)
}

export async function getFriendById(
  friendId: string
): Promise<DatabaseResult<FriendWithTags>> {
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
  const queries = new FriendsQueries(supabase)
  return queries.getFriendById(friendId, userId)
}

export async function createFriend(
  friend: Omit<FriendInsert, 'organization_id'>
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
  const queries = new FriendsQueries(supabase)
  return queries.createFriend({ ...friend, organization_id: userId })
}

export async function updateFriend(
  friendId: string,
  updates: FriendUpdate
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
  const queries = new FriendsQueries(supabase)
  return queries.updateFriend(friendId, userId, updates)
}

export async function deleteFriend(
  friendId: string
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
  const queries = new FriendsQueries(supabase)
  return queries.deleteFriend(friendId, userId)
}

export async function blockFriend(
  friendId: string,
  followStatus: 'following' | 'blocked' = 'blocked'
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
  const queries = new FriendsQueries(supabase)
  return queries.updateFriend(friendId, userId, { follow_status: followStatus })
}

export async function getFriendCount(): Promise<DatabaseResult<number>> {
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
  const queries = new FriendsQueries(supabase)
  return queries.getFriendCount(userId)
}

// Additional actions for friend detail page
export async function updateFriendStatus(
  friendId: string,
  followStatus: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('line_friends')
    .update({ follow_status: followStatus })
    .eq('id', friendId)

  if (error) throw error
}

export async function updateCustomFields(
  friendId: string,
  customFields: Record<string, any>
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('line_friends')
    .update({ custom_fields: customFields as any })
    .eq('id', friendId)

  if (error) throw error
}

export async function addTagToFriend(
  friendId: string,
  tagId: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('friend_tags')
    .insert({ line_friend_id: friendId, tag_id: tagId })

  if (error) throw error
}

export async function removeTagFromFriend(
  friendId: string,
  tagId: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('friend_tags')
    .delete()
    .eq('line_friend_id', friendId)
    .eq('tag_id', tagId)

  if (error) throw error
}

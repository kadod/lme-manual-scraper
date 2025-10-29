'use server'

import { createClient } from '@/lib/supabase/server'
import { TagsQueries, TagWithCount } from '@/lib/supabase/queries/tags'
import { Database, TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseResult } from '@/lib/errors/database'

type Tag = Database['public']['Tables']['tags']['Row']
type TagInsert = TablesInsert<'tags'>
type TagUpdate = TablesUpdate<'tags'>

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

export async function getTags(): Promise<DatabaseResult<TagWithCount[]>> {
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
  const queries = new TagsQueries(supabase)
  return queries.getTags(userId)
}

export async function getTagById(tagId: string): Promise<DatabaseResult<Tag>> {
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
  const queries = new TagsQueries(supabase)
  return queries.getTagById(tagId, userId)
}

export async function createTag(
  tag: Omit<TagInsert, 'user_id'>
): Promise<DatabaseResult<Tag>> {
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
  const queries = new TagsQueries(supabase)
  return queries.createTag({ ...tag, user_id: userId })
}

export async function updateTag(
  tagId: string,
  updates: TagUpdate
): Promise<DatabaseResult<Tag>> {
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
  const queries = new TagsQueries(supabase)
  return queries.updateTag(tagId, userId, updates)
}

export async function deleteTag(tagId: string): Promise<DatabaseResult<void>> {
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
  const queries = new TagsQueries(supabase)
  return queries.deleteTag(tagId, userId)
}

export async function addTagToFriend(
  friendId: string,
  tagId: string
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
  const queries = new TagsQueries(supabase)
  return queries.addTagToFriend(friendId, tagId)
}

export async function removeTagFromFriend(
  friendId: string,
  tagId: string
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
  const queries = new TagsQueries(supabase)
  return queries.removeTagFromFriend(friendId, tagId)
}

export async function getFriendTags(
  friendId: string
): Promise<DatabaseResult<Tag[]>> {
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
  const queries = new TagsQueries(supabase)
  return queries.getFriendTags(friendId)
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { TagsQueries, TagWithCount } from '@/lib/supabase/queries/tags'
import { Database, TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseResult } from '@/lib/errors/database'

type Tag = Database['public']['Tables']['tags']['Row']
type TagInsert = TablesInsert<'tags'>
type TagUpdate = TablesUpdate<'tags'>

async function getCurrentUserOrganizationId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  return userData?.organization_id || null
}

export async function getTags(): Promise<DatabaseResult<TagWithCount[]>> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
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
  return queries.getTags(organizationId)
}

export async function getTagById(tagId: string): Promise<DatabaseResult<Tag>> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
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
  return queries.getTagById(tagId, organizationId)
}

export async function createTag(
  tag: Omit<TagInsert, 'organization_id'>
): Promise<DatabaseResult<Tag>> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
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
  return queries.createTag({ ...tag, organization_id: organizationId })
}

export async function updateTag(
  tagId: string,
  updates: TagUpdate
): Promise<DatabaseResult<Tag>> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
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
  return queries.updateTag(tagId, organizationId, updates)
}

export async function deleteTag(tagId: string): Promise<DatabaseResult<void>> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
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
  return queries.deleteTag(tagId, organizationId)
}

export async function addTagToFriend(
  friendId: string,
  tagId: string
): Promise<DatabaseResult<any>> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
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
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
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
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
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

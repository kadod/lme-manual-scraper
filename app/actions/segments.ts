'use server'

import { createClient } from '@/lib/supabase/server'
import { SegmentsQueries, SegmentCondition, SegmentWithCount } from '@/lib/supabase/queries/segments'
import { TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseResult } from '@/lib/errors/database'
import { revalidatePath } from 'next/cache'

type SegmentInsert = TablesInsert<'segments'>
type SegmentUpdate = TablesUpdate<'segments'>

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

export async function getSegments(): Promise<DatabaseResult<SegmentWithCount[]>> {
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
  const queries = new SegmentsQueries(supabase)
  return queries.getSegments(userId)
}

export async function getSegmentById(
  segmentId: string
): Promise<DatabaseResult<SegmentWithCount>> {
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
  const queries = new SegmentsQueries(supabase)
  return queries.getSegmentById(segmentId, userId)
}

export async function createSegment(
  segment: Omit<SegmentInsert, 'user_id'>
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
  const queries = new SegmentsQueries(supabase)
  const result = await queries.createSegment({ ...segment, user_id: userId })

  if (result.success) {
    revalidatePath('/dashboard/friends/segments')
  }

  return result
}

export async function updateSegment(
  segmentId: string,
  updates: SegmentUpdate
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
  const queries = new SegmentsQueries(supabase)
  const result = await queries.updateSegment(segmentId, userId, updates)

  if (result.success) {
    revalidatePath('/dashboard/friends/segments')
  }

  return result
}

export async function deleteSegment(segmentId: string): Promise<DatabaseResult<void>> {
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
  const queries = new SegmentsQueries(supabase)
  const result = await queries.deleteSegment(segmentId, userId)

  if (result.success) {
    revalidatePath('/dashboard/friends/segments')
  }

  return result
}

export async function previewSegment(
  conditions: SegmentCondition[]
): Promise<DatabaseResult<number>> {
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
  const queries = new SegmentsQueries(supabase)
  return queries.previewSegment(conditions, userId)
}

export async function getFriendsBySegment(
  segmentId: string,
  page: number = 1,
  limit: number = 50
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
  const queries = new SegmentsQueries(supabase)
  return queries.getFriendsBySegment(segmentId, userId, page, limit)
}

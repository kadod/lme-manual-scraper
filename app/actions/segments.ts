'use server'

import { createClient } from '@/lib/supabase/server'
import { SegmentsQueries, SegmentCondition, SegmentWithCount } from '@/lib/supabase/queries/segments'
import { TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseResult } from '@/lib/errors/database'
import { revalidatePath } from 'next/cache'

type SegmentInsert = TablesInsert<'segments'>
type SegmentUpdate = TablesUpdate<'segments'>

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

export async function getSegments(): Promise<DatabaseResult<SegmentWithCount[]>> {
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
  const queries = new SegmentsQueries(supabase)
  return queries.getSegments(organizationId)
}

export async function getSegmentById(
  segmentId: string
): Promise<DatabaseResult<SegmentWithCount>> {
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
  const queries = new SegmentsQueries(supabase)
  return queries.getSegmentById(segmentId, organizationId)
}

export async function createSegment(
  segment: Omit<SegmentInsert, 'organization_id'>
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
  const queries = new SegmentsQueries(supabase)
  const result = await queries.createSegment({ ...segment, organization_id: organizationId })

  if (result.success) {
    revalidatePath('/dashboard/friends/segments')
  }

  return result
}

export async function updateSegment(
  segmentId: string,
  updates: SegmentUpdate
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
  const queries = new SegmentsQueries(supabase)
  const result = await queries.updateSegment(segmentId, organizationId, updates)

  if (result.success) {
    revalidatePath('/dashboard/friends/segments')
  }

  return result
}

export async function deleteSegment(segmentId: string): Promise<DatabaseResult<void>> {
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
  const queries = new SegmentsQueries(supabase)
  const result = await queries.deleteSegment(segmentId, organizationId)

  if (result.success) {
    revalidatePath('/dashboard/friends/segments')
  }

  return result
}

export async function previewSegment(
  conditions: SegmentCondition[]
): Promise<DatabaseResult<number>> {
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
  const queries = new SegmentsQueries(supabase)
  return queries.previewSegment(conditions, organizationId)
}

export async function getFriendsBySegment(
  segmentId: string,
  page: number = 1,
  limit: number = 50
): Promise<DatabaseResult<any[]>> {
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
  const queries = new SegmentsQueries(supabase)
  return queries.getFriendsBySegment(segmentId, organizationId, page, limit)
}

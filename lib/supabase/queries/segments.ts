import { SupabaseClient } from '@supabase/supabase-js'
import { Database, TablesInsert, TablesUpdate } from '@/types/supabase'
import { DatabaseError, DatabaseResult, handleDatabaseError } from '@/lib/errors/database'

type Segment = Database['public']['Tables']['segments']['Row']
type SegmentInsert = TablesInsert<'segments'>
type SegmentUpdate = TablesUpdate<'segments'>

// Segment condition types
export type ConditionOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'in'
  | 'contains'
  | 'exists'

export type ConditionField =
  | 'follow_status'
  | 'last_interaction_at'
  | 'is_blocked'
  | 'created_at'
  | 'tags'
  | 'metadata'

export type LogicOperator = 'AND' | 'OR'

export interface SegmentCondition {
  field: ConditionField
  operator: ConditionOperator
  value: any
  logicOperator?: LogicOperator
}

export interface SegmentWithCount extends Segment {
  friend_count?: number
  friendCount?: number
  conditions?: SegmentCondition[] | any
}

export class SegmentsQueries {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getSegments(userId: string): Promise<DatabaseResult<SegmentWithCount[]>> {
    try {
      const { data, error } = await this.supabase
        .from('segments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // TODO: segments table doesn't have conditions column
      // Need to fetch from segment_conditions table
      const segmentsWithCount = (data || []).map((segment) => {
        return {
          ...segment,
          friend_count: segment.estimated_count || 0,
          friendCount: segment.estimated_count || 0,
          conditions: [], // TODO: Fetch from segment_conditions table
        }
      })

      return { success: true, data: segmentsWithCount }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async getSegmentById(
    segmentId: string,
    userId: string
  ): Promise<DatabaseResult<Segment>> {
    try {
      const { data, error } = await this.supabase
        .from('segments')
        .select('*')
        .eq('id', segmentId)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Segment', segmentId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async createSegment(segment: SegmentInsert): Promise<DatabaseResult<Segment>> {
    try {
      const { data, error } = await this.supabase
        .from('segments')
        .insert(segment)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.invalidInput('Failed to create segment')

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async updateSegment(
    segmentId: string,
    userId: string,
    updates: SegmentUpdate
  ): Promise<DatabaseResult<Segment>> {
    try {
      const { data, error } = await this.supabase
        .from('segments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', segmentId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw DatabaseError.notFound('Segment', segmentId)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async deleteSegment(
    segmentId: string,
    userId: string
  ): Promise<DatabaseResult<void>> {
    try {
      const { error } = await this.supabase
        .from('segments')
        .delete()
        .eq('id', segmentId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true, data: undefined }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  async previewSegment(
    conditions: SegmentCondition[],
    userId: string
  ): Promise<DatabaseResult<number>> {
    try {
      let query = this.supabase
        .from('line_friends')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', userId) // TODO: Should use organization_id properly

      // Apply conditions
      for (const condition of conditions) {
        query = this.applyCondition(query, condition)
      }

      const { count, error } = await query

      if (error) throw error

      return { success: true, data: count || 0 }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }

  private applyCondition(query: any, condition: SegmentCondition): any {
    const { field, operator, value } = condition

    switch (operator) {
      case 'eq':
        return query.eq(field, value)
      case 'ne':
        return query.neq(field, value)
      case 'gt':
        return query.gt(field, value)
      case 'lt':
        return query.lt(field, value)
      case 'gte':
        return query.gte(field, value)
      case 'lte':
        return query.lte(field, value)
      case 'in':
        return query.in(field, value)
      case 'contains':
        if (field === 'metadata') {
          return query.contains(field, value)
        }
        return query.ilike(field, `%${value}%`)
      case 'exists':
        return query.not(field, 'is', null)
      default:
        return query
    }
  }

  async getFriendsBySegment(
    segmentId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<DatabaseResult<any[]>> {
    try {
      // TODO: Implement segment_conditions table fetch
      // For now, just return all friends
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error } = await this.supabase
        .from('line_friends')
        .select(`
          *,
          friend_tags (
            tag_id,
            tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('organization_id', userId) // TODO: Should use organization_id properly
        .range(from, to)

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: handleDatabaseError(error) }
    }
  }
}

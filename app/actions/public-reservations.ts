'use server'

import { createClient } from '@/lib/supabase/server'
import { Tables, TablesInsert } from '@/types/supabase'
import { revalidatePath } from 'next/cache'
import { startOfDay, endOfDay, format } from 'date-fns'

export type ReservationType = Tables<'reservation_types'>
export type ScheduleSlot = Tables<'schedule_slots'>
export type Reservation = Tables<'reservations'>

export interface SlotWithAvailability extends ScheduleSlot {
  is_available: boolean
  remaining_capacity: number
}

/**
 * Get public reservation type details (no auth required)
 */
export async function getPublicReservationType(typeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservation_types')
    .select('*')
    .eq('id', typeId)
    .eq('status', 'active')
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching reservation type:', error)
    return null
  }

  return data
}

/**
 * Get available slots for a specific date (no auth required)
 */
export async function getAvailableSlotsByDate(
  scheduleId: string,
  date: Date
): Promise<SlotWithAvailability[]> {
  const supabase = await createClient()

  const dateStr = format(date, 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('schedule_slots')
    .select('*')
    .eq('schedule_id', scheduleId)
    .eq('status', 'available')
    .gte('start_time', startOfDay(date).toISOString())
    .lte('start_time', endOfDay(date).toISOString())
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching available slots:', error)
    return []
  }

  // Add availability information
  return data.map(slot => ({
    ...slot,
    is_available: (slot.booked_count || 0) < (slot.capacity || 1),
    remaining_capacity: (slot.capacity || 1) - (slot.booked_count || 0)
  }))
}

/**
 * Create a new reservation (no auth required)
 */
export async function createReservation(data: {
  reservation_type_id: string
  schedule_id: string
  schedule_slot_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  notes?: string
  line_user_id?: string
  organization_id: string
}): Promise<{ success: boolean; data?: Reservation; error?: string }> {
  const supabase = await createClient()

  // First check if slot is still available
  const { data: slot, error: slotError } = await supabase
    .from('schedule_slots')
    .select('*')
    .eq('id', data.schedule_slot_id)
    .single()

  if (slotError || !slot) {
    return {
      success: false,
      error: '指定された時間枠が見つかりません'
    }
  }

  const bookedCount = slot.booked_count || 0
  const capacity = slot.capacity || 1

  if (bookedCount >= capacity) {
    return {
      success: false,
      error: 'この時間枠は既に満席です'
    }
  }

  if (slot.status !== 'available') {
    return {
      success: false,
      error: 'この時間枠は現在予約できません'
    }
  }

  // Try to find existing friend if LINE user ID is provided
  let lineFriendId: string | null = null
  if (data.line_user_id) {
    const { data: friend } = await supabase
      .from('line_friends')
      .select('id')
      .eq('line_user_id', data.line_user_id)
      .single()

    lineFriendId = friend?.id || null
  }

  // Create reservation
  const reservationData: TablesInsert<'reservations'> = {
    reservation_type_id: data.reservation_type_id,
    schedule_id: data.schedule_id,
    schedule_slot_id: data.schedule_slot_id,
    customer_name: data.customer_name,
    customer_email: data.customer_email || null,
    customer_phone: data.customer_phone || null,
    notes: data.notes || null,
    line_friend_id: lineFriendId,
    organization_id: data.organization_id,
    status: 'confirmed',
    confirmed_at: new Date().toISOString()
  }

  const { data: reservation, error: reservationError } = await supabase
    .from('reservations')
    .insert(reservationData)
    .select()
    .single()

  if (reservationError) {
    console.error('Error creating reservation:', reservationError)
    return {
      success: false,
      error: '予約の作成中にエラーが発生しました'
    }
  }

  revalidatePath(`/r/${data.reservation_type_id}`)

  return {
    success: true,
    data: reservation
  }
}

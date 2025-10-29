'use server'

import { createClient } from '@/lib/supabase/server'
import { TablesUpdate } from '@/types/supabase'
import { revalidatePath } from 'next/cache'

export type Reservation = {
  id: string
  reservation_type_id: string
  slot_id: string
  friend_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  customer_memo: string | null
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  line_user_id: string | null
  created_at: string
  updated_at: string
  cancelled_at: string | null
  completed_at: string | null
  reservation_type?: {
    id: string
    name: string
    description: string | null
    duration_minutes: number
    buffer_minutes: number
  }
  slot?: {
    id: string
    start_time: string
    end_time: string
    capacity: number
    booked_count: number
  }
  friend?: {
    id: string
    display_name: string
    picture_url: string | null
    line_user_id: string
  }
}

export type ReservationFilters = {
  status?: string
  reservationTypeId?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: 'start_time' | 'created_at' | 'customer_name'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
}

export async function getReservations(filters?: ReservationFilters) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('reservations')
    .select(`
      *,
      reservation_type:reservation_types!inner (
        id,
        name,
        description,
        duration_minutes,
        buffer_minutes,
        user_id
      ),
      slot:available_slots (
        id,
        start_time,
        end_time,
        capacity,
        booked_count
      ),
      friend:friends (
        id,
        display_name,
        picture_url,
        line_user_id
      )
    `, { count: 'exact' })
    .eq('reservation_type.user_id', userId)

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.reservationTypeId) {
    query = query.eq('reservation_type_id', filters.reservationTypeId)
  }

  if (filters?.startDate) {
    query = query.gte('slot.start_time', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('slot.start_time', filters.endDate)
  }

  if (filters?.search) {
    query = query.or(
      `customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`
    )
  }

  const sortBy = filters?.sortBy || 'created_at'
  const sortOrder = filters?.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching reservations:', error)
    throw error
  }

  return {
    data: data as Reservation[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function getReservation(id: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      reservation_type:reservation_types!inner (
        id,
        name,
        description,
        duration_minutes,
        buffer_minutes,
        settings,
        user_id
      ),
      slot:available_slots (
        id,
        start_time,
        end_time,
        capacity,
        booked_count
      ),
      friend:friends (
        id,
        display_name,
        picture_url,
        line_user_id,
        status_message
      )
    `)
    .eq('id', id)
    .eq('reservation_type.user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching reservation:', error)
    throw error
  }

  return data as Reservation
}

export async function updateReservationStatus(
  id: string,
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('reservations')
    .select(`
      id,
      status,
      reservation_type:reservation_types!inner (
        user_id
      )
    `)
    .eq('id', id)
    .eq('reservation_type.user_id', userId)
    .single()

  if (!existing) {
    throw new Error('Reservation not found')
  }

  const updateData: TablesUpdate<'reservations'> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString()
  }

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('reservations')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      reservation_type:reservation_types (
        id,
        name,
        description,
        duration_minutes,
        buffer_minutes
      ),
      slot:available_slots (
        id,
        start_time,
        end_time,
        capacity,
        booked_count
      ),
      friend:friends (
        id,
        display_name,
        picture_url,
        line_user_id
      )
    `)
    .single()

  if (error) {
    console.error('Error updating reservation status:', error)
    throw error
  }

  revalidatePath('/dashboard/reservations')
  return data as Reservation
}

export async function cancelReservation(id: string) {
  return updateReservationStatus(id, 'cancelled')
}

export async function exportReservationsToCSV(filters?: ReservationFilters) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, error: 'User not authenticated' }
    }

    const result = await getReservations({ ...filters, limit: 10000 })
    const reservations = result.data

    const headers = [
      'Reservation ID',
      'Type',
      'Customer Name',
      'Email',
      'Phone',
      'Start Time',
      'End Time',
      'Status',
      'Notes',
      'Created At',
    ]

    const rows = reservations.map((reservation) => {
      return [
        reservation.id,
        reservation.reservation_type?.name || 'N/A',
        reservation.customer_name,
        reservation.customer_email || '',
        reservation.customer_phone || '',
        reservation.slot?.start_time ? new Date(reservation.slot.start_time).toLocaleString() : '',
        reservation.slot?.end_time ? new Date(reservation.slot.end_time).toLocaleString() : '',
        reservation.status,
        reservation.customer_memo || '',
        new Date(reservation.created_at).toLocaleString(),
      ]
    })

    const csv = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    return {
      success: true,
      data: csv,
      filename: `reservations_${new Date().toISOString().split('T')[0]}.csv`,
    }
  } catch (error) {
    console.error('Error exporting reservations:', error)
    return {
      success: false,
      error: 'Failed to export reservations',
    }
  }
}

export async function getReservationStats(
  startDate?: string,
  endDate?: string
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  let query = supabase
    .from('reservations')
    .select(`
      status,
      created_at,
      reservation_type:reservation_types!inner (
        user_id
      ),
      slot:available_slots (
        start_time
      )
    `, { count: 'exact' })
    .eq('reservation_type.user_id', userId)

  if (startDate) {
    query = query.gte('slot.start_time', startDate)
  }

  if (endDate) {
    query = query.lte('slot.start_time', endDate)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching reservation stats:', error)
    throw error
  }

  const statusCounts = {
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    no_show: 0,
  }

  data?.forEach((reservation: any) => {
    if (reservation.status in statusCounts) {
      statusCounts[reservation.status as keyof typeof statusCounts]++
    }
  })

  return {
    total: count || 0,
    statusCounts,
  }
}

export async function getReservationTypes() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservation_types')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('name')

  if (error) {
    console.error('Error fetching reservation types:', error)
    throw error
  }

  return data
}

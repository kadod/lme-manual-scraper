'use server'

import { createClient } from '@/lib/supabase/server'
import { TablesUpdate } from '@/types/supabase'
import { revalidatePath } from 'next/cache'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'

export type Reservation = {
  id: string
  reservation_type_id: string | null
  schedule_id: string
  schedule_slot_id: string
  line_friend_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  notes: string | null
  status: 'confirmed' | 'cancelled'
  organization_id: string
  created_at: string | null
  updated_at: string | null
  cancelled_at: string | null
  confirmed_at: string | null
  cancellation_reason: string | null
  custom_data: any
  reminder_sent_at: string | null
  reservation_type?: {
    id: string
    name: string
    description: string | null
    duration_minutes: number
  }
  slot?: {
    id: string
    start_time: string
    end_time: string
    capacity: number | null
    booked_count: number | null
  }
  friend?: {
    id: string
    display_name: string | null
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

export async function getReservations(filters?: ReservationFilters) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
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
        organization_id
      ),
      slot:schedule_slots (
        id,
        start_time,
        end_time,
        capacity,
        booked_count
      ),
      friend:line_friends (
        id,
        display_name,
        picture_url,
        line_user_id
      )
    `, { count: 'exact' })
    .eq('reservation_type.organization_id', organizationId)

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
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
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
        organization_id
      ),
      slot:schedule_slots (
        id,
        start_time,
        end_time,
        capacity,
        booked_count
      ),
      friend:line_friends (
        id,
        display_name,
        picture_url,
        line_user_id,
        status_message
      )
    `)
    .eq('id', id)
    .eq('reservation_type.organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching reservation:', error)
    throw error
  }

  return data as Reservation
}

export async function updateReservationStatus(
  id: string,
  status: 'confirmed' | 'cancelled',
  cancellationReason?: string
) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('reservations')
    .select('id, organization_id, status')
    .eq('id', id)
    .eq('organization_id', organizationId)
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
    if (cancellationReason) {
      updateData.cancellation_reason = cancellationReason
    }
  }

  if (status === 'confirmed') {
    updateData.confirmed_at = new Date().toISOString()
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
        duration_minutes
      ),
      slot:schedule_slots (
        id,
        start_time,
        end_time,
        capacity,
        booked_count
      ),
      friend:line_friends (
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

export async function cancelReservation(id: string, cancellationReason?: string) {
  return updateReservationStatus(id, 'cancelled', cancellationReason)
}

export async function exportReservationsToCSV(filters?: ReservationFilters) {
  try {
    const organizationId = await getCurrentUserOrganizationId()
    if (!organizationId) {
      return { success: false, error: 'Organization not found' }
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
        reservation.notes || '',
        reservation.created_at ? new Date(reservation.created_at).toLocaleString() : '',
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
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  let query = supabase
    .from('reservations')
    .select(`
      status,
      created_at,
      reservation_type:reservation_types!inner (
        organization_id
      ),
      slot:schedule_slots (
        start_time
      )
    `, { count: 'exact' })
    .eq('reservation_type.organization_id', organizationId)

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
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservation_types')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching reservation types:', error)
    throw error
  }

  return data
}

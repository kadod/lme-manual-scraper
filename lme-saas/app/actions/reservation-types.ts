'use server'

import { createClient } from '@/lib/supabase/server'
import { TablesInsert, TablesUpdate } from '@/types/supabase'
import { revalidatePath } from 'next/cache'

export type ReservationType = {
  id: string
  user_id: string
  name: string
  description: string | null
  duration_minutes: number
  buffer_minutes: number
  status: 'active' | 'inactive'
  settings: any
  created_at: string
  updated_at: string
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id || null
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reservation types:', error)
    throw error
  }

  return data as ReservationType[]
}

export async function getReservationType(id: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservation_types')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching reservation type:', error)
    throw error
  }

  return data as ReservationType
}

export async function createReservationType(
  data: TablesInsert<'reservation_types'>
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  const { data: newType, error } = await supabase
    .from('reservation_types')
    .insert({
      ...data,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating reservation type:', error)
    throw error
  }

  revalidatePath('/dashboard/reservations/types')
  return newType as ReservationType
}

export async function updateReservationType(
  id: string,
  data: TablesUpdate<'reservation_types'>
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('reservation_types')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    throw new Error('Reservation type not found')
  }

  const { data: updated, error } = await supabase
    .from('reservation_types')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating reservation type:', error)
    throw error
  }

  revalidatePath('/dashboard/reservations/types')
  return updated as ReservationType
}

export async function deleteReservationType(id: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('reservation_types')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!existing) {
    throw new Error('Reservation type not found')
  }

  const { count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('reservation_type_id', id)
    .in('status', ['pending', 'confirmed'])

  if (count && count > 0) {
    throw new Error('Cannot delete reservation type with active reservations')
  }

  const { error } = await supabase
    .from('reservation_types')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting reservation type:', error)
    throw error
  }

  revalidatePath('/dashboard/reservations/types')
  return { success: true }
}

export async function duplicateReservationType(id: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: original, error: fetchError } = await supabase
    .from('reservation_types')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !original) {
    throw new Error('Reservation type not found')
  }

  const { data: duplicate, error: insertError } = await supabase
    .from('reservation_types')
    .insert({
      user_id: original.user_id,
      name: `${original.name} (コピー)`,
      description: original.description,
      duration_minutes: original.duration_minutes,
      buffer_minutes: original.buffer_minutes,
      settings: original.settings,
      status: 'inactive',
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error duplicating reservation type:', insertError)
    throw insertError
  }

  revalidatePath('/dashboard/reservations/types')
  return duplicate as ReservationType
}

export async function toggleReservationTypeStatus(id: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: type } = await supabase
    .from('reservation_types')
    .select('id, user_id, status')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!type) {
    throw new Error('Reservation type not found')
  }

  const { error } = await supabase
    .from('reservation_types')
    .update({
      status: type.status === 'active' ? 'inactive' : 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error toggling reservation type status:', error)
    throw error
  }

  revalidatePath('/dashboard/reservations/types')
  return { success: true }
}

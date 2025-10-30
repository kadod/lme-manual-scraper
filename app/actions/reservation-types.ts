'use server'

import { createClient } from '@/lib/supabase/server'
import { TablesInsert, TablesUpdate, Tables } from '@/types/supabase'
import { revalidatePath } from 'next/cache'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'

export type ReservationType = Tables<'reservation_types'>

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
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reservation types:', error)
    throw error
  }

  return data as ReservationType[]
}

export async function getReservationType(id: string) {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservation_types')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
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
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()
  const { data: newType, error } = await supabase
    .from('reservation_types')
    .insert({
      ...data,
      organization_id: organizationId,
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
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('reservation_types')
    .select('id')
    .eq('id', id)
    .eq('organization_id', organizationId)
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
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('reservation_types')
    .select('id')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (!existing) {
    throw new Error('Reservation type not found')
  }

  const { count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('reservation_type_id', id)
    .in('status', ['confirmed'])

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
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: original, error: fetchError } = await supabase
    .from('reservation_types')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (fetchError || !original) {
    throw new Error('Reservation type not found')
  }

  const { data: duplicate, error: insertError } = await supabase
    .from('reservation_types')
    .insert({
      organization_id: original.organization_id,
      name: `${original.name} (コピー)`,
      description: original.description,
      duration_minutes: original.duration_minutes,
      color: original.color,
      status: 'inactive',
      is_active: false,
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
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  const supabase = await createClient()

  const { data: type } = await supabase
    .from('reservation_types')
    .select('id, organization_id, status, is_active')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (!type) {
    throw new Error('Reservation type not found')
  }

  const newStatus = type.status === 'active' ? 'inactive' : 'active'
  const newIsActive = !type.is_active

  const { error } = await supabase
    .from('reservation_types')
    .update({
      status: newStatus,
      is_active: newIsActive,
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

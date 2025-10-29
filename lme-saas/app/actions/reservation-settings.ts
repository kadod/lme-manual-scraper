'use server'

import { createClient } from '@/lib/supabase/server'
import { TablesUpdate } from '@/types/supabase'
import { revalidatePath } from 'next/cache'

export type ReservationSettings = {
  id: string
  user_id: string
  business_hours: any
  blocked_dates: string[]
  advance_booking_days: number
  cancellation_hours: number
  auto_confirm: boolean
  notification_settings: any
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

export async function getReservationSettings() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reservation_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      const defaultSettings = {
        user_id: userId,
        business_hours: {
          0: { open: false, start: '09:00', end: '17:00' },
          1: { open: true, start: '09:00', end: '17:00' },
          2: { open: true, start: '09:00', end: '17:00' },
          3: { open: true, start: '09:00', end: '17:00' },
          4: { open: true, start: '09:00', end: '17:00' },
          5: { open: true, start: '09:00', end: '17:00' },
          6: { open: false, start: '09:00', end: '17:00' },
        },
        blocked_dates: [],
        advance_booking_days: 30,
        cancellation_hours: 24,
        auto_confirm: false,
        notification_settings: {
          email_notifications: true,
          sms_notifications: false,
          reminder_hours: 24,
        },
      }

      const { data: newSettings, error: insertError } = await supabase
        .from('reservation_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating default settings:', insertError)
        throw insertError
      }

      return newSettings as ReservationSettings
    }

    console.error('Error fetching reservation settings:', error)
    throw error
  }

  return data as ReservationSettings
}

export async function updateReservationSettings(
  data: TablesUpdate<'reservation_settings'>
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('reservation_settings')
    .select('id')
    .eq('user_id', userId)
    .single()

  let result

  if (existing) {
    const { data: updated, error } = await supabase
      .from('reservation_settings')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating reservation settings:', error)
      throw error
    }

    result = updated
  } else {
    const { data: created, error } = await supabase
      .from('reservation_settings')
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reservation settings:', error)
      throw error
    }

    result = created
  }

  revalidatePath('/dashboard/reservations/settings')
  return result as ReservationSettings
}

export async function updateBusinessHours(businessHours: any) {
  return updateReservationSettings({ business_hours: businessHours })
}

export async function addBlockedDate(date: string) {
  const settings = await getReservationSettings()
  const blockedDates = [...(settings.blocked_dates || []), date]

  return updateReservationSettings({ blocked_dates: blockedDates })
}

export async function removeBlockedDate(date: string) {
  const settings = await getReservationSettings()
  const blockedDates = (settings.blocked_dates || []).filter((d) => d !== date)

  return updateReservationSettings({ blocked_dates: blockedDates })
}

export async function updateNotificationSettings(notificationSettings: any) {
  return updateReservationSettings({
    notification_settings: notificationSettings,
  })
}

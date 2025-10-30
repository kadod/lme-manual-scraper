'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'

/**
 * NOTE: reservation_settings table does not exist in the database.
 * Settings are now stored in the schedules table or organization settings.
 * This file is kept for backward compatibility but should be refactored.
 */

export type ReservationSettings = {
  id: string
  organization_id: string
  business_hours: any
  blocked_dates: string[]
  advance_booking_days: number
  cancellation_hours: number
  auto_confirm: boolean
  notification_settings: any
  created_at: string
  updated_at: string
}

export async function getReservationSettings(): Promise<ReservationSettings> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  // Return default settings since table doesn't exist
  // Settings should be migrated to schedules table
  return {
    id: organizationId,
    organization_id: organizationId,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export async function updateReservationSettings(
  data: Partial<Omit<ReservationSettings, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>
): Promise<ReservationSettings> {
  const organizationId = await getCurrentUserOrganizationId()
  if (!organizationId) {
    throw new Error('Organization not found')
  }

  // TODO: Store settings in organization settings or schedules table
  console.warn('updateReservationSettings: reservation_settings table does not exist. Settings not persisted.')

  revalidatePath('/dashboard/reservations/settings')

  return getReservationSettings()
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

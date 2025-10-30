import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/supabase';

type Reservation = Tables<'reservations'>;
type ReservationType = Tables<'reservation_types'>;
type ScheduleSlot = Tables<'schedule_slots'>;

export class ReservationsQueries {
  private supabase = createClient();

  /**
   * Get all reservations for a user
   */
  async getReservations(userId: string, options?: {
    status?: Reservation['status'];
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    let query = this.supabase
      .from('reservations')
      .select(`
        *,
        reservation_types (
          id,
          name,
          description,
          duration_minutes
        ),
        schedule_slots (
          id,
          start_time,
          end_time,
          capacity,
          booked_count
        ),
        line_friends (
          id,
          display_name,
          picture_url
        )
      `)
      .eq('reservation_types.user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.startDate) {
      query = query.gte('schedule_slots.start_time', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('schedule_slots.end_time', options.endDate);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return query;
  }

  /**
   * Get a single reservation by ID
   */
  async getReservation(reservationId: string) {
    return this.supabase
      .from('reservations')
      .select(`
        *,
        reservation_types (
          id,
          name,
          description,
          duration_minutes
        ),
        schedule_slots (
          id,
          start_time,
          end_time,
          capacity,
          booked_count
        ),
        line_friends (
          id,
          display_name,
          picture_url,
          line_user_id
        )
      `)
      .eq('id', reservationId)
      .single();
  }

  /**
   * Get reservation statistics
   */
  async getReservationStats(userId: string) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayResult, weekResult, monthResult, statusResult] = await Promise.all([
      // Today's reservations
      this.supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('reservation_types.user_id', userId)
        .gte('schedule_slots.start_time', today)
        .lt('schedule_slots.start_time', `${today}T23:59:59`),

      // This week's reservations
      this.supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('reservation_types.user_id', userId)
        .gte('schedule_slots.start_time', weekStart.toISOString()),

      // This month's reservations
      this.supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('reservation_types.user_id', userId)
        .gte('schedule_slots.start_time', monthStart.toISOString()),

      // Status breakdown
      this.supabase
        .from('reservations')
        .select('status')
        .eq('reservation_types.user_id', userId)
    ]);

    const statusCounts = statusResult.data?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      today: todayResult.count || 0,
      week: weekResult.count || 0,
      month: monthResult.count || 0,
      pending: statusCounts['confirmed'] || 0,
      confirmed: statusCounts['confirmed'] || 0,
      completed: statusCounts['completed'] || 0,
    };
  }

  /**
   * Get available slots for a schedule
   */
  async getAvailableSlots(
    scheduleId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      status?: 'available' | 'unavailable';
    }
  ) {
    let query = this.supabase
      .from('schedule_slots')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('start_time', { ascending: true });

    if (options?.startDate) {
      query = query.gte('start_time', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('end_time', options.endDate);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    return query;
  }

  /**
   * Get reservation types for a user
   */
  async getReservationTypes(userId: string, status?: 'active' | 'inactive') {
    let query = this.supabase
      .from('reservation_types')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    return query;
  }

  /**
   * Create a new reservation
   */
  async createReservation(data: {
    reservationTypeId: string;
    scheduleId: string;
    scheduleSlotId: string;
    lineFriendId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    notes?: string;
    organizationId: string;
  }) {
    return this.supabase
      .from('reservations')
      .insert({
        reservation_type_id: data.reservationTypeId,
        schedule_id: data.scheduleId,
        schedule_slot_id: data.scheduleSlotId,
        line_friend_id: data.lineFriendId || null,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone || null,
        notes: data.notes || null,
        organization_id: data.organizationId,
        status: 'confirmed'
      })
      .select()
      .single();
  }

  /**
   * Update reservation status
   */
  async updateReservationStatus(
    reservationId: string,
    status: Reservation['status']
  ) {
    const updates: Partial<Reservation> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    } else if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString();
    }

    return this.supabase
      .from('reservations')
      .update(updates)
      .eq('id', reservationId)
      .select()
      .single();
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId: string) {
    return this.updateReservationStatus(reservationId, 'cancelled');
  }
}

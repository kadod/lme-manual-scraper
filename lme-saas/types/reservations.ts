export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export type ReservationType = 'event' | 'lesson' | 'salon';

export type SlotAvailability = 'full' | 'available' | 'limited';

export interface Reservation {
  id: string;
  user_id: string;
  friend_id: string;
  type: ReservationType;
  status: ReservationStatus;
  slot_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  max_capacity?: number;
  current_capacity?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
}

export interface ReservationSlot {
  id: string;
  user_id: string;
  type: ReservationType;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReservationStats {
  today: number;
  week: number;
  month: number;
  pending: number;
  confirmed: number;
  completed: number;
}

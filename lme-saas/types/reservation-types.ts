export type ReservationTypeCategory = 'event' | 'lesson' | 'salon';

export interface ReservationTypeSettings {
  // Event specific
  maxCapacity?: number;
  enableWaitlist?: boolean;

  // Lesson specific
  repeatPattern?: 'daily' | 'weekly' | 'monthly';
  repeatDays?: number[];
  timeSlots?: Array<{ start: string; end: string }>;

  // Salon specific
  staffRequired?: boolean;
  staffIds?: string[];
  duration?: number;
  bufferTime?: number;
}

export interface ReservationType {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: ReservationTypeCategory;
  color?: string;
  icon?: string;
  settings: ReservationTypeSettings;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReservationTypeFilters {
  category?: ReservationTypeCategory | 'all';
  search?: string;
  isActive?: boolean;
}

import { format, formatDistanceToNow, isToday, isTomorrow, isPast, isFuture, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { SlotAvailability } from '@/types/reservations';

/**
 * Format a date/time string for display
 */
export function formatReservationDate(dateString: string, formatStr: string = 'yyyy/MM/dd'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: ja });
  } catch (error) {
    return dateString;
  }
}

/**
 * Format a date/time string with time
 */
export function formatReservationDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy/MM/dd HH:mm', { locale: ja });
  } catch (error) {
    return dateString;
  }
}

/**
 * Format time only
 */
export function formatReservationTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'HH:mm', { locale: ja });
  } catch (error) {
    return dateString;
  }
}

/**
 * Get relative time description (e.g., "2時間後", "3日前")
 */
export function getRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ja });
  } catch (error) {
    return dateString;
  }
}

/**
 * Get human-readable date label (e.g., "今日", "明日", "9/15")
 */
export function getDateLabel(dateString: string): string {
  try {
    const date = parseISO(dateString);

    if (isToday(date)) {
      return '今日';
    }

    if (isTomorrow(date)) {
      return '明日';
    }

    return format(date, 'M/d', { locale: ja });
  } catch (error) {
    return dateString;
  }
}

/**
 * Calculate slot availability based on capacity
 */
export function calculateSlotAvailability(
  bookedCount: number,
  capacity: number
): SlotAvailability {
  if (bookedCount >= capacity) {
    return 'full';
  }

  const remaining = capacity - bookedCount;
  const threshold = Math.max(Math.floor(capacity * 0.2), 1);

  if (remaining <= threshold) {
    return 'limited';
  }

  return 'available';
}

/**
 * Calculate remaining capacity
 */
export function getRemainingCapacity(bookedCount: number, capacity: number): number {
  return Math.max(0, capacity - bookedCount);
}

/**
 * Check if a slot is bookable
 */
export function isSlotBookable(
  slotStartTime: string,
  bookedCount: number,
  capacity: number,
  status: 'available' | 'unavailable'
): boolean {
  if (status === 'unavailable') {
    return false;
  }

  if (bookedCount >= capacity) {
    return false;
  }

  try {
    const startTime = parseISO(slotStartTime);
    return isFuture(startTime);
  } catch (error) {
    return false;
  }
}

/**
 * Check if a reservation is in the past
 */
export function isReservationPast(endTime: string): boolean {
  try {
    const end = parseISO(endTime);
    return isPast(end);
  } catch (error) {
    return false;
  }
}

/**
 * Get time slot duration in minutes
 */
export function getSlotDuration(startTime: string, endTime: string): number {
  try {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  } catch (error) {
    return 0;
  }
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}時間`;
  }

  return `${hours}時間${remainingMinutes}分`;
}

/**
 * Group reservations by date
 */
export function groupReservationsByDate<T extends { start_time: string }>(
  reservations: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const reservation of reservations) {
    try {
      const date = parseISO(reservation.start_time);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }

      grouped.get(dateKey)!.push(reservation);
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  }

  return grouped;
}

/**
 * Sort reservations by start time
 */
export function sortReservationsByTime<T extends { start_time: string }>(
  reservations: T[],
  ascending: boolean = true
): T[] {
  return [...reservations].sort((a, b) => {
    try {
      const dateA = parseISO(a.start_time);
      const dateB = parseISO(b.start_time);
      return ascending
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    } catch (error) {
      return 0;
    }
  });
}

/**
 * Get time range display text
 */
export function getTimeRangeText(startTime: string, endTime: string): string {
  try {
    const start = parseISO(startTime);
    const end = parseISO(endTime);

    const startFormatted = format(start, 'HH:mm', { locale: ja });
    const endFormatted = format(end, 'HH:mm', { locale: ja });

    return `${startFormatted} - ${endFormatted}`;
  } catch (error) {
    return `${startTime} - ${endTime}`;
  }
}

/**
 * Check if two time slots overlap
 */
export function doTimeSlotsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  try {
    const s1 = parseISO(start1);
    const e1 = parseISO(end1);
    const s2 = parseISO(start2);
    const e2 = parseISO(end2);

    return s1 < e2 && s2 < e1;
  } catch (error) {
    return false;
  }
}

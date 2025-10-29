import React from 'react';
import type { SlotAvailability } from '@/types/reservations';

interface SlotAvailabilityIndicatorProps {
  availability: SlotAvailability;
  currentCapacity: number;
  maxCapacity: number;
  className?: string;
  showLabel?: boolean;
}

const availabilityConfig = {
  full: {
    symbol: '◎',
    label: '満席',
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-100 dark:bg-red-900/20'
  },
  available: {
    symbol: '◯',
    label: '空きあり',
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-100 dark:bg-green-900/20'
  },
  limited: {
    symbol: '△',
    label: '残りわずか',
    colorClass: 'text-yellow-600 dark:text-yellow-400',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/20'
  }
};

export function SlotAvailabilityIndicator({
  availability,
  currentCapacity,
  maxCapacity,
  className,
  showLabel = true
}: SlotAvailabilityIndicatorProps) {
  const config = availabilityConfig[availability];
  const remaining = maxCapacity - currentCapacity;

  return (
    <div className={`inline-flex items-center gap-2 ${className || ''}`}>
      <div
        className={`flex items-center justify-center rounded-full ${config.bgClass} ${config.colorClass} h-6 w-6 text-sm font-bold`}
        aria-label={`${config.label}: ${remaining}/${maxCapacity}席`}
      >
        {config.symbol}
      </div>
      {showLabel && (
        <span className={`text-sm font-medium ${config.colorClass}`}>
          {config.label}
          <span className="ml-1 text-xs opacity-70">
            ({remaining}/{maxCapacity})
          </span>
        </span>
      )}
    </div>
  );
}

export function calculateAvailability(
  currentCapacity: number,
  maxCapacity: number
): SlotAvailability {
  if (currentCapacity >= maxCapacity) {
    return 'full';
  }

  const remaining = maxCapacity - currentCapacity;
  const threshold = Math.max(Math.floor(maxCapacity * 0.2), 1);

  if (remaining <= threshold) {
    return 'limited';
  }

  return 'available';
}

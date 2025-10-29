import React from 'react';
import { CalendarIcon, AcademicCapIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import type { ReservationType } from '@/types/reservations';

interface ReservationTypeIconProps {
  type: ReservationType;
  className?: string;
  solid?: boolean;
}

const typeConfig = {
  event: {
    label: 'イベント',
    icon: CalendarIcon,
    colorClass: 'text-purple-600 dark:text-purple-400'
  },
  lesson: {
    label: 'レッスン',
    icon: AcademicCapIcon,
    colorClass: 'text-blue-600 dark:text-blue-400'
  },
  salon: {
    label: 'サロン',
    icon: ScissorsIcon,
    colorClass: 'text-pink-600 dark:text-pink-400'
  }
};

export function ReservationTypeIcon({ type, className, solid = false }: ReservationTypeIconProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Icon
      className={`${config.colorClass} ${className || 'h-5 w-5'}`}
      aria-label={config.label}
    />
  );
}

export function getReservationTypeLabel(type: ReservationType): string {
  return typeConfig[type].label;
}

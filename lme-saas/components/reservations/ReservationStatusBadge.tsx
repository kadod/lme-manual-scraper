import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import type { ReservationStatus } from '@/types/reservations';

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  className?: string;
}

const statusConfig = {
  confirmed: {
    label: '確定',
    variant: 'default' as const,
    icon: CheckCircleIcon,
    className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
  },
  cancelled: {
    label: 'キャンセル',
    variant: 'destructive' as const,
    icon: XCircleIcon,
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  },
  completed: {
    label: '完了',
    variant: 'outline' as const,
    icon: CheckCircleSolidIcon,
    className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
  },
  no_show: {
    label: '無断キャンセル',
    variant: 'secondary' as const,
    icon: XCircleIcon,
    className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
  }
};

export function ReservationStatusBadge({ status, className }: ReservationStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ''}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

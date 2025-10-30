import React from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';
import type { Reservation } from '@/app/actions/reservations';

interface ReservationTimelineProps {
  reservation: Reservation;
  className?: string;
}

interface TimelineStep {
  status: 'completed' | 'current' | 'upcoming' | 'cancelled';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  timestamp?: string;
}

export function ReservationTimeline({ reservation, className }: ReservationTimelineProps) {
  const steps = getTimelineSteps(reservation);

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {steps.map((step, index) => (
        <div key={index} className="relative flex items-start gap-3">
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`absolute left-[11px] top-6 h-full w-0.5 ${
                step.status === 'completed'
                  ? 'bg-green-500'
                  : step.status === 'cancelled'
                  ? 'bg-red-500'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          )}

          {/* Icon */}
          <div
            className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${
              step.status === 'completed'
                ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                : step.status === 'cancelled'
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : step.status === 'current'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
            }`}
          >
            <step.icon className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <p
                className={`text-sm font-medium ${
                  step.status === 'completed' || step.status === 'current'
                    ? 'text-foreground'
                    : step.status === 'cancelled'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </p>
              {step.timestamp && (
                <time className="text-xs text-muted-foreground">
                  {formatTimestamp(step.timestamp)}
                </time>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getTimelineSteps(reservation: Reservation): TimelineStep[] {
  const steps: TimelineStep[] = [];

  // Created
  steps.push({
    status: 'completed',
    label: '予約作成',
    icon: CheckCircleIcon,
    timestamp: reservation.created_at || undefined
  });

  // Confirmed
  if (reservation.status === 'cancelled') {
    steps.push({
      status: 'cancelled',
      label: 'キャンセル',
      icon: XCircleIcon,
      timestamp: reservation.cancelled_at || undefined
    });
  } else {
    steps.push({
      status: reservation.confirmed_at ? 'completed' : 'current',
      label: '予約確定',
      icon: CheckCircleIcon,
      timestamp: reservation.confirmed_at || undefined
    });
  }

  return steps;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return '昨日';
  } else if (days < 7) {
    return `${days}日前`;
  } else {
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  }
}

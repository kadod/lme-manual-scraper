import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface QuickStatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function QuickStatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className
}: QuickStatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>

          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend.isPositive ? (
                <ArrowUpIcon className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  trend.isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }
              >
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground ml-1">
                前週比
              </span>
            </div>
          )}

          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickStatsGridProps {
  stats: Array<{
    title: string;
    value: number | string;
    icon?: React.ComponentType<{ className?: string }>;
    trend?: {
      value: number;
      isPositive: boolean;
    };
    description?: string;
  }>;
  className?: string;
}

export function QuickStatsGrid({ stats, className }: QuickStatsGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {stats.map((stat, index) => (
        <QuickStatsCard key={index} {...stat} />
      ))}
    </div>
  );
}

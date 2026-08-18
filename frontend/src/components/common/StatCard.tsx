import * as React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-7 w-7 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="h-7 w-28 bg-muted animate-pulse rounded" />
          <div className="h-3 w-36 bg-muted/60 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 hover:border-border/90 hover:shadow-sm',
        className
      )}
    >
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {Icon && (
            <div className="rounded-md bg-secondary/80 p-2 text-primary">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </span>
        </div>

        {(change || description) && (
          <div className="flex items-center gap-1.5 text-xs">
            {change && (
              <span
                className={cn(
                  'inline-flex items-center font-medium gap-0.5',
                  change.direction === 'up' && 'text-emerald-400',
                  change.direction === 'down' && 'text-rose-400',
                  change.direction === 'neutral' && 'text-muted-foreground'
                )}
              >
                {change.direction === 'up' && (
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {change.direction === 'down' && (
                  <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {change.direction === 'neutral' && (
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{change.value}</span>
              </span>
            )}
            {change?.label && (
              <span className="text-muted-foreground">{change.label}</span>
            )}
            {!change && description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

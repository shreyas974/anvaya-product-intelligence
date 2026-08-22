import * as React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TrendingUp,
} from 'lucide-react';
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
      <Card className={cn('overflow-hidden border-border/60', className)}>
        <CardContent className="p-5">
          <div className="space-y-5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 rounded-full bg-muted" />
              <div className="h-10 w-10 rounded-2xl bg-muted" />
            </div>

            <div className="h-9 w-32 rounded-lg bg-muted" />

            <div className="h-3 w-40 rounded-full bg-muted/60" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = change?.direction === 'up';
  const isNegative = change?.direction === 'down';
  const isNeutral = change?.direction === 'neutral';

  return (
    <Card
      className={cn(
        'group relative overflow-hidden',
        'border-border/60 bg-card',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1',
        'hover:border-primary/30',
        'hover:shadow-xl hover:shadow-primary/5',
        className
      )}
    >
      {/* Premium ambient glow */}
      <div
        className={cn(
          'pointer-events-none absolute -right-10 -top-10',
          'h-28 w-28 rounded-full blur-3xl',
          'opacity-0 transition-opacity duration-500',
          'group-hover:opacity-100',
          isPositive && 'bg-emerald-500/20',
          isNegative && 'bg-rose-500/20',
          isNeutral && 'bg-primary/20',
          !change && 'bg-primary/20'
        )}
      />

      {/* Top accent */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-[2px]',
          'origin-left scale-x-0',
          'transition-transform duration-500',
          'group-hover:scale-x-100',
          isPositive && 'bg-emerald-400',
          isNegative && 'bg-rose-400',
          isNeutral && 'bg-primary',
          !change && 'bg-primary'
        )}
      />

      <CardContent className="relative p-5">
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {title}
              </p>

              <div className="mt-1.5 h-0.5 w-6 rounded-full bg-primary/40 transition-all duration-300 group-hover:w-10 group-hover:bg-primary" />
            </div>

            {Icon && (
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center',
                  'rounded-2xl',
                  'border border-border/60',
                  'bg-secondary/60',
                  'text-primary',
                  'transition-all duration-300',
                  'group-hover:scale-110',
                  'group-hover:border-primary/30',
                  'group-hover:bg-primary/10',
                  'group-hover:shadow-lg group-hover:shadow-primary/10'
                )}
              >
                <Icon
                  className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-3"
                />
              </div>
            )}
          </div>

          {/* Main metric */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p
                className={cn(
                  'truncate text-3xl font-extrabold tracking-[-0.03em]',
                  'text-foreground',
                  'transition-transform duration-300',
                  'group-hover:translate-x-0.5'
                )}
              >
                {value}
              </p>
            </div>

            {change && (
              <div
                className={cn(
                  'mb-1 flex shrink-0 items-center gap-1',
                  'rounded-full border px-2 py-1',
                  'text-[10px] font-bold',
                  'transition-transform duration-300',
                  'group-hover:scale-105',
                  isPositive &&
                  'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
                  isNegative &&
                  'border-rose-500/20 bg-rose-500/10 text-rose-400',
                  isNeutral &&
                  'border-border/60 bg-secondary/60 text-muted-foreground'
                )}
              >
                {isPositive && (
                  <ArrowUpRight
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                )}

                {isNegative && (
                  <ArrowDownRight
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                )}

                {isNeutral && (
                  <Minus
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                )}

                <span>{change.value}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          {(change?.label || description) && (
            <div className="flex items-center gap-2 border-t border-border/40 pt-3">
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-md',
                  isPositive && 'bg-emerald-500/10',
                  isNegative && 'bg-rose-500/10',
                  isNeutral && 'bg-secondary',
                  !change && 'bg-primary/10'
                )}
              >
                <TrendingUp
                  className={cn(
                    'h-3 w-3',
                    isPositive && 'text-emerald-400',
                    isNegative && 'text-rose-400',
                    isNeutral && 'text-muted-foreground',
                    !change && 'text-primary'
                  )}
                />
              </div>

              <span className="truncate text-[11px] font-medium text-muted-foreground">
                {change?.label || description}
              </span>
            </div>
          )}

          {/* Bottom progress accent */}
          <div className="absolute bottom-0 left-5 right-5 h-px overflow-hidden bg-border/30">
            <div
              className={cn(
                'h-full w-1/3 transition-all duration-700',
                'group-hover:w-full',
                isPositive && 'bg-emerald-400/60',
                isNegative && 'bg-rose-400/60',
                isNeutral && 'bg-primary/50',
                !change && 'bg-primary/50'
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
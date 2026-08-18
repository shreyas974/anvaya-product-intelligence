import * as React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonLoaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'stat' | 'circle' | 'table-row';
  count?: number;
}

export function SkeletonLoader({
  className,
  variant = 'text',
  count = 1,
  ...props
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'stat') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border/50 bg-card p-5 space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-7 w-7 bg-muted rounded-md" />
            </div>
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-3 w-40 bg-muted/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {items.map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border/50 bg-card p-6 space-y-4 animate-pulse"
          >
            <div className="h-5 w-1/3 bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted/60 rounded" />
            <div className="h-24 w-full bg-muted/40 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className="space-y-2">
        {items.map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3.5 border border-border/40 rounded-md bg-card/40 animate-pulse space-x-4"
          >
            <div className="h-4 w-1/4 bg-muted rounded" />
            <div className="h-4 w-1/6 bg-muted rounded" />
            <div className="h-4 w-1/6 bg-muted rounded" />
            <div className="h-4 w-1/12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={cn(
          'h-10 w-10 rounded-full bg-muted animate-pulse',
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div
          key={i}
          className={cn(
            'h-4 w-full rounded bg-muted animate-pulse',
            className
          )}
          {...props}
        />
      ))}
    </div>
  );
}

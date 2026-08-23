import * as React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden',
        'rounded-2xl border border-border/60',
        'bg-card/80 backdrop-blur-xl',
        'shadow-sm',
        className
      )}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">

        {/* Title section */}
        <div className="min-w-0 space-y-3">

          {/* Product identity */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="h-3.5 w-3.5" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              ANVAYA Intelligence
            </span>

            {badge && (
              <div className="ml-1">
                {badge}
              </div>
            )}
          </div>

          {/* Main title */}
          <h1
            className={cn(
              'text-3xl font-extrabold tracking-[-0.035em]',
              'text-foreground sm:text-4xl lg:text-[42px]',
              'leading-[1.05]'
            )}
          >
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="relative flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Bottom accent */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  );
}
import React from 'react';
import { cn } from '@/utils/cn';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'solid' | 'floating' | 'inset';
  hoverEffect?: boolean;
  className?: string;
}

export function GlassCard({
  children,
  variant = 'default',
  hoverEffect = false,
  className,
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default: 'glass-panel',
    solid: 'bg-[#FAF5EF] border border-[rgba(120,90,70,0.12)] shadow-sm rounded-2xl',
    floating: 'glass-surface-floating rounded-2xl',
    inset: 'glass-inset p-4',
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        hoverEffect && 'transition-all duration-200 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

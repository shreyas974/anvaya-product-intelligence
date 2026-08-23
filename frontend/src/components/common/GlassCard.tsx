import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-[#EAE4DC] bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(234,88,12,0.04),0_2px_6px_-1px_rgba(0,0,0,0.03)] transition-all duration-200 ${
        hoverEffect ? 'hover:border-[#E2DBD1] hover:shadow-[0_8px_30px_-4px_rgba(234,88,12,0.08)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

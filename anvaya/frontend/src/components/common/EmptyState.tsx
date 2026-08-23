import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`glass-panel p-10 text-center rounded-2xl flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#FBEEDD] text-[#E8703A] flex items-center justify-center border border-[rgba(199,127,46,0.25)] shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#2B2320]">{title}</h3>
      <p className="text-xs text-[#6B5E56] max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="btn-sunrise-primary text-xs font-bold rounded-xl px-4 py-2 mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

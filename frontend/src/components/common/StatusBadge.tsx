import { FileText, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

export type ProductStatus =
  | 'raw'
  | 'cleaned'
  | 'enriched'
  | 'flagged'
  | 'approved';

export interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  ProductStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info';
    className: string;
  }
> = {
  raw: {
    label: 'Raw',
    icon: FileText,
    variant: 'outline',
    className: 'border-slate-700 bg-slate-800/40 text-slate-300',
  },
  cleaned: {
    label: 'Cleaned',
    icon: ShieldCheck,
    variant: 'info',
    className: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  enriched: {
    label: 'Enriched',
    icon: Sparkles,
    variant: 'success',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  flagged: {
    label: 'Flagged',
    icon: AlertTriangle,
    variant: 'destructive',
    className: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    variant: 'success',
    className: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
  },
};

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.raw;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn('gap-1.5 font-medium text-xs capitalize', config.className, className)}
    >
      {showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      <span>{config.label}</span>
    </Badge>
  );
}

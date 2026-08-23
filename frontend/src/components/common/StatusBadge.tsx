import { FileText, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

export type ProductStatus =
  | 'raw'
  | 'cleaned'
  | 'enriched'
  | 'flagged'
  | 'approved'
  | 'verified'
  | 'matched'
  | 'supported'
  | 'inferred'
  | 'needs_review'
  | 'unavailable'
  | 'failed';

export interface StatusBadgeProps {
  status: ProductStatus | string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  raw: {
    label: 'Raw',
    icon: FileText,
    className: 'border-[rgba(120,90,70,0.2)] bg-[#F1ECE7] text-[#6B5E56]',
  },
  cleaned: {
    label: 'Cleaned',
    icon: ShieldCheck,
    className: 'border-[rgba(184,134,59,0.3)] bg-[#FBEEDD] text-[#B8863B]',
  },
  enriched: {
    label: 'Enriched',
    icon: Sparkles,
    className: 'border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] text-[#C77F2E]',
  },
  flagged: {
    label: 'Flagged',
    icon: AlertTriangle,
    className: 'border-[rgba(194,87,31,0.3)] bg-[#FDEADE] text-[#C2571F]',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] text-[#C77F2E]',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    className: 'border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] text-[#C77F2E]',
  },
  passed: {
    label: 'Passed',
    icon: CheckCircle2,
    className: 'border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] text-[#C77F2E]',
  },
  matched: {
    label: 'Matched',
    icon: ShieldCheck,
    className: 'border-[rgba(184,134,59,0.3)] bg-[#FBEEDD] text-[#B8863B]',
  },
  supported: {
    label: 'Supported',
    icon: CheckCircle2,
    className: 'border-[rgba(184,134,59,0.3)] bg-[#FBEEDD] text-[#B8863B]',
  },
  inferred: {
    label: 'Inferred',
    icon: Sparkles,
    className: 'border-[rgba(201,138,82,0.3)] bg-[#FBF2E6] text-[#C98A52]',
  },
  needs_review: {
    label: 'Needs Review',
    icon: AlertTriangle,
    className: 'border-[rgba(194,87,31,0.3)] bg-[#FDEADE] text-[#C2571F]',
  },
  unavailable: {
    label: 'Unavailable',
    icon: HelpCircle,
    className: 'border-[rgba(138,126,118,0.25)] bg-[#F1ECE7] text-[#8A7E76]',
  },
  failed: {
    label: 'Failed',
    icon: AlertTriangle,
    className: 'border-[rgba(178,59,46,0.3)] bg-[#FBE3DE] text-[#B23B2E]',
  },
};

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const key = (status || 'raw').toLowerCase().replace(/\s+/g, '_');
  const config = statusConfig[key] || statusConfig.raw;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-medium text-xs', config.className, className)}
    >
      {showIcon && <Icon className="h-3 w-3" aria-hidden="true" />}
      <span>{config.label}</span>
    </Badge>
  );
}

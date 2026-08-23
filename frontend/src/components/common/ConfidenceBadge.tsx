import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

export type ConfidenceTier = 'high' | 'medium' | 'low';

export interface ConfidenceBadgeProps {
  /** Confidence score as percentage (0-100) or decimal (0.0-1.0) */
  score: number;
  showTierText?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

export function getConfidenceTier(normalizedScore: number): ConfidenceTier {
  if (normalizedScore >= 85) return 'high';
  if (normalizedScore >= 60) return 'medium';
  return 'low';
}

const tierConfig: Record<
  ConfidenceTier,
  {
    label: 'High' | 'Medium' | 'Low';
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  high: {
    label: 'High',
    icon: CheckCircle2,
    className:
      'border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] text-[#C77F2E] font-medium',
  },
  medium: {
    label: 'Medium',
    icon: AlertTriangle,
    className:
      'border-[rgba(201,138,82,0.3)] bg-[#FBF2E6] text-[#C98A52] font-medium',
  },
  low: {
    label: 'Low',
    icon: AlertCircle,
    className:
      'border-[rgba(194,87,31,0.3)] bg-[#FDEADE] text-[#C2571F] font-medium',
  },
};

export function ConfidenceBadge({
  score,
  showTierText = true,
  showPercentage = true,
  size = 'default',
  className,
}: ConfidenceBadgeProps) {
  // Normalize score to 0 - 100 range if provided as 0.0 - 1.0
  const normalizedScore = score <= 1 && score > 0 ? Math.round(score * 100) : Math.round(score);
  const tier = getConfidenceTier(normalizedScore);
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors',
        size === 'sm' ? 'px-2 py-0 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        config.className,
        className
      )}
      aria-label={`Confidence: ${normalizedScore}%, Tier: ${config.label}`}
    >
      <Icon
        className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        aria-hidden="true"
      />
      <span>
        {showPercentage && `${normalizedScore}%`}
        {showPercentage && showTierText && ' '}
        {showTierText && config.label}
      </span>
    </Badge>
  );
}

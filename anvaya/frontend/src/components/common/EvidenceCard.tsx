import { StatusBadge } from './StatusBadge';
import { ConfidenceBadge } from './ConfidenceBadge';

export interface EvidenceCardProps {
  fieldName: string;
  value: string;
  evidence?: string;
  source?: string;
  rule?: string;
  confidence?: number;
  status?: 'verified' | 'matched' | 'supported' | 'inferred' | 'needs_review' | 'unavailable' | 'error';
  validationStatus?: string;
  onInspectTrace?: () => void;
  className?: string;
}

export function EvidenceCard({
  fieldName,
  value,
  evidence,
  source = 'Sourced Raw Feed',
  rule,
  confidence = 95,
  status = 'supported',
  validationStatus: _validationStatus,
  onInspectTrace,
  className = '',
}: EvidenceCardProps) {
  return (
    <div className={`glass-inset p-4 rounded-xl border border-[rgba(120,90,70,0.12)] space-y-2.5 transition-all hover:border-[rgba(232,112,58,0.3)] ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7E76]">{fieldName}</span>
        <div className="flex items-center gap-1.5">
          <ConfidenceBadge score={confidence} />
          <StatusBadge status={status} showIcon={false} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-black text-[#2B2320]">{value || 'N/A'}</p>
        {evidence && (
          <div className="rounded-lg bg-white/70 p-2 text-xs font-mono text-[#6B5E56] border border-[rgba(120,90,70,0.08)]">
            <span className="text-[9px] font-bold uppercase text-[#8A7E76] block mb-0.5">Raw Text Match</span>
            "{evidence}"
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[rgba(120,90,70,0.08)] flex items-center justify-between text-[10px] text-[#8A7E76]">
        <span>Source: <strong className="text-[#6B5E56]">{source}</strong></span>
        {rule && (
          <span className="font-mono text-[#E8703A] font-semibold">{rule}</span>
        )}
      </div>

      {onInspectTrace && (
        <button
          onClick={onInspectTrace}
          className="text-[10px] font-bold text-[#E8703A] hover:underline block pt-1"
        >
          View Full Decision Trace →
        </button>
      )}
    </div>
  );
}

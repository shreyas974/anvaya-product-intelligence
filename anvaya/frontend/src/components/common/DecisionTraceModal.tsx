import {
  X,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DecisionTraceData {
  field_name: string;
  raw_evidence: string;
  detected_term: string;
  candidate_value: string;
  vocabulary_match: string;
  applicable_category: string;
  validation_result: string;
  confidence: number;
  decision: string;
}

export interface DecisionTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DecisionTraceData | null;
}

export function DecisionTraceModal({
  isOpen,
  onClose,
  data,
}: DecisionTraceModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-[#EAE4DC] bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1EBE4] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FFF7F2] text-[#EA580C] border border-[#FED7AA]">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Decision Trace &amp; Evidence Audit</h3>
              <p className="text-[11px] font-semibold text-[#EA580C]">{data.field_name}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-[#64748B] hover:text-[#0F172A]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 8-Point Decision Trace Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* 1. Raw Evidence */}
          <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#ECE6DD] col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">1. Raw Sourced Text Snippet</span>
            <p className="mt-1 font-mono text-xs text-[#0F172A] bg-white p-2 rounded-lg border border-[#E2DBD1]">
              "{data.raw_evidence}"
            </p>
          </div>

          {/* 2. Detected Term */}
          <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#ECE6DD]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">2. Detected Keyword Term</span>
            <p className="mt-1 font-black text-[#EA580C] text-sm">{data.detected_term}</p>
          </div>

          {/* 3. Candidate Value */}
          <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#ECE6DD]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">3. Candidate Normalized Value</span>
            <p className="mt-1 font-black text-[#0F172A] text-sm">{data.candidate_value}</p>
          </div>

          {/* 4. Controlled Vocabulary Match */}
          <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#ECE6DD]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">4. Controlled Vocabulary Rule</span>
            <p className="mt-1 font-semibold text-[#334155]">{data.vocabulary_match}</p>
          </div>

          {/* 5. Applicable Category */}
          <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#ECE6DD]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">5. Applicable Category Domain</span>
            <p className="mt-1 font-semibold text-[#334155]">{data.applicable_category}</p>
          </div>

          {/* 6. Validation Result */}
          <div className="rounded-xl bg-teal-50/70 p-3 border border-teal-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">6. Validation Audit Result</span>
            <div className="mt-1 flex items-center gap-1.5 font-bold text-teal-900">
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
              <span>{data.validation_result}</span>
            </div>
          </div>

          {/* 7. Confidence */}
          <div className="rounded-xl bg-purple-50/70 p-3 border border-purple-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">7. Deterministic Confidence</span>
            <p className="mt-1 text-sm font-black text-purple-900">{data.confidence}%</p>
          </div>

          {/* 8. Final Decision */}
          <div className="rounded-xl bg-[#FFF7ED] p-3.5 border border-[#FED7AA] col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C]">8. System Decision &amp; Rationale</span>
            <p className="mt-1 font-semibold text-xs text-[#0F172A]">{data.decision}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#F1EBE4] pt-3 text-[11px] text-[#64748B]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            Zero-Fabrication Guarantee: Reference Datasets Are The Source of Truth.
          </span>
          <Button onClick={onClose} size="sm" className="sunrise-btn-primary px-4 text-xs font-bold">
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
}

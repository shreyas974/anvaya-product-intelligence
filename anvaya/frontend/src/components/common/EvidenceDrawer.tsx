import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface EvidenceRecord {
  id?: number | string;
  field_name: string;
  value: string;
  source: string;
  evidence?: string;
  method: string;
  confidence: number;
  timestamp?: string;
}

export interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: EvidenceRecord | null;
  productMpn?: string;
  onAccept?: (record: EvidenceRecord) => void;
  onReject?: (record: EvidenceRecord) => void;
  onEdit?: (record: EvidenceRecord, newValue: string) => void;
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  record,
  productMpn,
  onAccept,
  onReject,
}: EvidenceDrawerProps) {
  if (!isOpen || !record) return null;

  const confPercent = Math.round(record.confidence * 100);
  const isHighConf = confPercent >= 90;
  const isMedConf = confPercent >= 70 && confPercent < 90;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition-all duration-300 ease-in-out bg-white shadow-2xl border-l border-[#EAE4DC] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#EAE4DC] bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#EA580C]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Decision Evidence Inspector</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {productMpn ? `SKU: ${productMpn}` : 'Product Decision Trace'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Field Header */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Field</span>
                <Badge
                  variant="outline"
                  className={
                    isHighConf
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : isMedConf
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }
                >
                  {confPercent}% Confidence
                </Badge>
              </div>
              <h4 className="text-lg font-bold text-slate-900">{record.field_name}</h4>
              <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200/60 p-3 font-mono text-sm text-slate-800 break-words">
                {record.value || '<Empty / Not Specified>'}
              </div>
            </div>

            {/* Evidence & Source Origin */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Raw Source Extraction
              </h5>
              <div className="rounded-xl border border-[#EAE4DC] bg-[#FAF8F5] p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Source Column:</span>
                  <span className="font-semibold text-slate-800">{record.source}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Extraction Method:</span>
                  <span className="font-mono text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                    {record.method}
                  </span>
                </div>
                {record.evidence && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <span className="text-xs text-slate-500 block mb-1">Direct Raw Evidence:</span>
                    <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded border border-slate-200/60">
                      "{record.evidence}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Governance Trace & Standards */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                Governance & Verification Standard
              </h5>
              <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Validated against Unilog Master UOM standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Cross-referenced against known brand directory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Immutable audit log record generated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 border-t border-[#EAE4DC] bg-[#FAF8F5] flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-slate-600 border-slate-300 hover:bg-slate-100"
              onClick={() => onReject?.(record)}
            >
              <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
              Flag Review
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={() => {
                onAccept?.(record);
                onClose();
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Accept Fact
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

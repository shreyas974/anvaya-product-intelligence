import { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Info,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DecisionTraceModal, DecisionTraceData } from './DecisionTraceModal';

export interface ProductTruthField {
  field: string;
  raw_value: string;
  normalized_value: string;
  evidence: string;
  source: string;
  rule_or_lov: string;
  confidence: number;
  status: 'VERIFIED' | 'NORMALIZED' | 'INFERRED' | 'MISSING' | 'CONFLICT' | 'REQUIRES REVIEW';
  decision_trace?: any;
}

export interface ProductTruthTableProps {
  truthFields: ProductTruthField[];
  truthScore?: number;
}

export function ProductTruthTable({
  truthFields = [],
  truthScore = 95.0,
}: ProductTruthTableProps) {
  const [selectedTrace, setSelectedTrace] = useState<DecisionTraceData | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            VERIFIED
          </span>
        );
      case 'NORMALIZED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
            <ShieldCheck className="h-3 w-3 text-teal-600" />
            NORMALIZED
          </span>
        );
      case 'INFERRED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
            <Sparkles className="h-3 w-3 text-purple-600" />
            INFERRED
          </span>
        );
      case 'MISSING':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-300">
            <Info className="h-3 w-3 text-slate-500" />
            MISSING
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-800 border border-red-200">
            <XCircle className="h-3 w-3 text-red-600" />
            CONFLICT
          </span>
        );
      case 'REQUIRES REVIEW':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            REQUIRES REVIEW
          </span>
        );
    }
  };

  const handleWhyClick = (item: ProductTruthField) => {
    const trace = item.decision_trace || {
      raw_evidence: item.evidence,
      detected_term: item.normalized_value,
      candidate_value: item.normalized_value,
      vocabulary_match: item.rule_or_lov,
      applicable_category: "Industrial & MRO Catalog",
      validation_result: item.status,
      confidence: item.confidence,
      decision: `Field value derived with ${item.confidence}% confidence via ${item.source}.`,
    };

    setSelectedTrace({
      field_name: item.field,
      ...trace,
    });
  };

  return (
    <div className="space-y-4">
      {/* Truth Score Banner */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/90 to-emerald-50/90 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-700" />
            <h4 className="text-sm font-bold text-teal-950">Product Truth Engine Layer</h4>
          </div>
          <p className="text-xs text-teal-800">
            Every attribute is validated against authoritative LOVs and traceable to source evidence with zero synthetic generation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-xl bg-white px-3 py-1.5 border border-teal-200 text-center shadow-sm">
            <span className="text-[10px] font-bold text-teal-700 uppercase">Product Truth Score</span>
            <p className="text-base font-black text-teal-950">{truthScore}%</p>
          </div>
        </div>
      </div>

      {/* Product Truth Table */}
      <div className="overflow-hidden rounded-2xl border border-[#EAE4DC] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#EAE4DC] bg-[#FAF8F5] text-[#64748B] font-bold">
              <tr>
                <th className="px-4 py-3.5">Field</th>
                <th className="px-4 py-3.5">Raw Sourced Value</th>
                <th className="px-4 py-3.5">Normalized Value</th>
                <th className="px-4 py-3.5">Rule / LOV Standard</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Evidence / Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EBE4]">
              {truthFields.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="px-4 py-3 font-bold text-[#0F172A] whitespace-nowrap">
                    {row.field}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#64748B] max-w-[180px] truncate" title={row.raw_value}>
                    {row.raw_value}
                  </td>
                  <td className="px-4 py-3 font-bold text-[#EA580C] max-w-[200px] truncate" title={row.normalized_value}>
                    {row.normalized_value}
                  </td>
                  <td className="px-4 py-3 text-[#475569] text-[11px] max-w-[200px] truncate" title={row.rule_or_lov}>
                    {row.rule_or_lov}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(row.status)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhyClick(row)}
                      className="h-7 gap-1 px-2.5 text-xs font-bold text-[#EA580C] border-[#FED7AA] bg-[#FFF7ED] hover:bg-[#FFEDD5] shadow-xs"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>WHY?</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Trace Inspector Modal */}
      <DecisionTraceModal
        isOpen={!!selectedTrace}
        onClose={() => setSelectedTrace(null)}
        data={selectedTrace}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  ArrowRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { request } from '@/services/api/apiClient';

import { useDataset } from '@/context/DatasetContext';

export interface ConflictsPageProps {
  onSelectProduct?: (productId: string) => void;
}

export function ConflictsPage({ onSelectProduct }: ConflictsPageProps) {
  const { activeDatasetId, activeDataset } = useDataset();
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<any[]>([]);

  async function loadConflicts() {
    if (!activeDatasetId) {
      setConflicts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await request<any>(`/conflicts?dataset_id=${activeDatasetId}`);
      if (res?.data) {
        setConflicts(res.data.conflicts || []);
      }
    } catch (e) {
      console.error('Failed to load conflicts:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConflicts();
  }, [activeDatasetId]);

  if (!activeDatasetId) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl space-y-4 max-w-xl mx-auto my-12 border border-[rgba(120,90,70,0.15)]">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#9C8F86] opacity-60" />
        <h3 className="text-lg font-bold text-[#2B2320]">No Active Dataset Selected</h3>
        <p className="text-xs text-[#6B5E56] leading-relaxed">
          Conflict detection evaluates vendor discrepancies against canonical LOVs per dataset. Upload or select a dataset to audit conflicts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2571F] bg-[#FDEADE] px-2.5 py-0.5 rounded-full border border-[rgba(194,87,31,0.25)]">
              Discrepancy Resolver
            </span>
            <span className="text-xs text-[#8A7E76] font-mono">
              {activeDataset?.name} • {conflicts.length} Anomalies Flagged
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Cross-Feed Vendor Conflict Resolution</h1>
          <p className="text-xs text-[#6B5E56]">
            Automated detection of manufacturer vs brand discrepancies, duplicate supplier SKUs, and controlled dictionary mismatches for <strong>{activeDataset?.name}</strong>.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadConflicts}
          disabled={loading}
          className="border-[rgba(120,90,70,0.2)] bg-white/80 text-xs font-semibold text-[#2B2320] rounded-xl hover:bg-white"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-[#8A7E76]" />
          <span>Re-Audit Conflicts</span>
        </Button>
      </div>

      {/* 2. Conflict Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-panel p-12 text-center text-[#6B5E56] text-xs">
            <span className="h-5 w-5 rounded-full border-2 border-[#E8703A] border-t-transparent animate-spin inline-block mr-2 align-middle" />
            Auditing cross-feed discrepancies...
          </div>
        ) : conflicts.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl">
            <CheckCircle2 className="mx-auto h-10 w-10 text-[#C77F2E]" />
            <h3 className="mt-3 text-base font-bold text-[#2B2320]">No Cross-Source Conflicts Detected</h3>
            <p className="mt-1 text-xs text-[#6B5E56]">All supplier feeds and brand entities are aligned with canonical master standards.</p>
          </div>
        ) : (
          conflicts.map((c) => (
            <div key={c.id} className="glass-panel p-5 rounded-2xl space-y-3.5 border border-[rgba(120,90,70,0.12)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#E8703A]">{c.sku}</span>
                    <span className="rounded-full bg-[#FDEADE] border border-[rgba(194,87,31,0.25)] px-2 py-0.5 text-[10px] font-bold text-[#C2571F]">
                      {c.conflict_type}
                    </span>
                    <span className="text-[10px] text-[#8A7E76]">Conflict ID #{c.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#2B2320]">{c.product_name}</h4>
                  <p className="text-xs text-[#6B5E56]">{c.description}</p>
                </div>

                {onSelectProduct && c.product_id && (
                  <Button
                    size="sm"
                    onClick={() => onSelectProduct(String(c.product_id))}
                    className="btn-sunrise-primary h-8 gap-1 text-xs font-bold rounded-xl px-3 shrink-0"
                  >
                    <span>Inspect SKU</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[rgba(120,90,70,0.08)] text-xs">
                <div className="glass-inset p-3 rounded-xl border border-[rgba(120,90,70,0.1)]">
                  <span className="text-[10px] font-bold uppercase text-[#8A7E76] block mb-1">
                    Source Field 1 ({c.source_1?.field || 'E1 / Vendor'})
                  </span>
                  <p className="font-mono font-semibold text-[#2B2320]">{c.source_1?.value || 'N/A'}</p>
                </div>
                <div className="glass-inset p-3 rounded-xl border border-[rgba(120,90,70,0.1)]">
                  <span className="text-[10px] font-bold uppercase text-[#8A7E76] block mb-1">
                    Source Field 2 ({c.source_2?.field || 'Unilog / DIB'})
                  </span>
                  <p className="font-mono font-semibold text-[#2B2320]">{c.source_2?.value || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

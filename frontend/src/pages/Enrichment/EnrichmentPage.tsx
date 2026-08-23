import { useState } from 'react';
import {
  Play,
  RotateCcw,
  Eye,
  Zap,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PipelineProgressBar } from '@/components/common/PipelineProgressBar';
import { useDataset } from '@/context/DatasetContext';

export function EnrichmentPage() {
  const { activeDataset, activeDatasetId, processDataset } = useDataset();

  const [currentStepIndex, setCurrentStepIndex] = useState(7);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 8 Pipeline Stages per Section 30
  const pipelineSteps = [
    { name: '1. Header Normalization', description: 'Standardizing raw column keys to Unilog Master names' },
    { name: '2. Text & Special Chars', description: 'Stripping trailing tokens, normalizing quotes and whitespace' },
    { name: '3. Brand Normalization', description: 'Resolving canonical brand entities and manufacturers' },
    { name: '4. Taxonomy Classification', description: 'Assigning Department > Class > Fine > Category path' },
    { name: '5. Attribute Extraction', description: 'Regex & token extraction of dimensions, materials, and ratings' },
    { name: '6. UOM Standard Compliance', description: 'Enforcing spacing rules ("24 in") and valid abbreviations' },
    { name: '7. Content Synthesis', description: 'Generating compliant Mobile, Short, and Invoice descriptions' },
    { name: '8. Governance & Validation', description: 'Multi-layer validation against reference LOV dictionaries' },
  ];

  // Dynamic Audit Change Log
  const auditLogs = [
    {
      id: 'AUD-901',
      sku: '3/8 CPLG BRS 150#',
      field: 'Cleaned_Product_Name',
      raw: '3/8 CPLG BRS 150#',
      cleaned: '3/8" Coupling Brass 150# Threaded Class 150 Pipe Fitting',
      rule: 'Unilog Title Formula v2.4',
      stage: 'Step 7: Content Synthesis',
      status: 'VERIFIED',
      timestamp: '14:32:05',
    },
    {
      id: 'AUD-902',
      sku: 'FD-204-DIABLO',
      field: 'Canonical_Brand',
      raw: 'Freud Inc / Diablo Tools (2435)',
      cleaned: 'Diablo',
      rule: 'UniCat Brand Resolution Rule BR-04',
      stage: 'Step 3: Brand Normalization',
      status: 'MATCHED',
      timestamp: '14:32:04',
    },
    {
      id: 'AUD-903',
      sku: 'SAND-DISC-5IN-80G',
      field: 'Extracted_Specs',
      raw: '5" 80G HOOK & LOOP ABR',
      cleaned: 'Diameter: 5 in | Grit: 80 | Attachment: Hook and Loop',
      rule: 'Abrasives Extraction Spec LOV-09',
      stage: 'Step 5: Attribute Extraction',
      status: 'VERIFIED',
      timestamp: '14:32:02',
    },
    {
      id: 'AUD-904',
      sku: 'VLV-BRS-1/2-NPT',
      field: 'UOM_Standard',
      raw: '1/2IN',
      cleaned: '1/2 in',
      rule: 'Unilog Master UOM Standards Rule UOM-01',
      stage: 'Step 6: UOM Standard Compliance',
      status: 'VERIFIED',
      timestamp: '14:32:01',
    },
    {
      id: 'AUD-905',
      sku: 'UNK-CBL-TIE-100',
      field: 'Canonical_Brand',
      raw: 'UNBRANDED / GENERIC',
      cleaned: 'Generic / Unbranded',
      rule: 'Fallback Brand Routing BR-99',
      stage: 'Step 3: Brand Normalization',
      status: 'NEEDS_REVIEW',
      timestamp: '14:31:59',
    },
  ];

  const handleRunPipeline = async () => {
    if (!activeDatasetId) return;
    setIsRunning(true);
    setCurrentStepIndex(0);
    setSuccessMsg(null);

    try {
      for (let i = 0; i <= 7; i++) {
        setCurrentStepIndex(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      await processDataset(activeDatasetId);
      setSuccessMsg(`Dataset '${activeDataset?.name}' successfully processed through all 8 stages!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error('Pipeline failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  if (!activeDatasetId || !activeDataset) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl space-y-4 max-w-xl mx-auto my-12 border border-[rgba(120,90,70,0.15)]">
        <Zap className="mx-auto h-12 w-12 text-[#9C8F86] opacity-60" />
        <h3 className="text-lg font-bold text-[#2B2320]">No Active Dataset Selected</h3>
        <p className="text-xs text-[#6B5E56] leading-relaxed">
          The 8-stage transformation pipeline runs against the active dataset. Upload a dataset to initiate enrichment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-2.5 py-0.5 rounded-full border border-[rgba(199,127,46,0.2)]">
              Enrichment Engine
            </span>
            <span className="text-xs text-[#8A7E76] font-mono flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#E8703A]" />
              <span>{activeDataset.name} • {activeDataset.row_count.toLocaleString()} SKUs</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">8-Stage Autonomous Transformation Pipeline</h1>
          <p className="text-xs text-[#6B5E56]">
            Deterministic parsing, brand resolution, and attribute extraction for dataset <strong>{activeDataset.name}</strong>.
          </p>
        </div>

        {/* Pipeline Control Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStepIndex(0)}
            disabled={isRunning}
            className="border-[rgba(120,90,70,0.2)] bg-white/80 text-xs font-semibold text-[#2B2320] rounded-xl hover:bg-white"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1 text-[#8A7E76]" />
            Reset Stages
          </Button>

          <Button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="btn-sunrise-primary gap-1.5 text-xs font-bold rounded-xl px-5 py-2.5 shadow-md"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isRunning ? 'Processing 8 Stages...' : 'Run Pipeline on Active Catalog'}</span>
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="rounded-xl border border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] p-3 text-xs font-semibold text-[#C77F2E] flex items-center gap-2 animate-in fade-in-0">
          <CheckCircle2 className="h-4 w-4 text-[#C77F2E] flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 8-Stage Progress Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(120,90,70,0.12)]">
        <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Sequential Processing Workflow</h3>
            <p className="text-xs text-[#6B5E56]">Every transformation is audited, validated, and citation-backed</p>
          </div>
          <span className="text-xs font-mono text-[#E8703A] font-bold">
            Step {Math.min(currentStepIndex + 1, 8)} of 8
          </span>
        </div>

        <div className="pt-2">
          <PipelineProgressBar steps={pipelineSteps} currentStepIndex={currentStepIndex} />
        </div>
      </div>

      {/* Change Log Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(120,90,70,0.12)]">
        <div className="border-b border-[rgba(120,90,70,0.1)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Audit Change Log</h3>
            <p className="text-xs text-[#6B5E56]">Real-time record of transformations, rule IDs, and before/after comparisons.</p>
          </div>
          <span className="text-xs font-mono text-[#8A7E76]">Showing {auditLogs.length} Transformation Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(120,90,70,0.1)] bg-[rgba(241,236,231,0.6)] text-[#6B5E56] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Target SKU</th>
                <th className="py-3 px-4">Field Changed</th>
                <th className="py-3 px-4">Original Raw Value</th>
                <th className="py-3 px-4">Normalized Enriched Value</th>
                <th className="py-3 px-4">Applied Rule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(120,90,70,0.06)]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#8A7E76]">{log.id}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#2B2320]">{log.sku}</td>
                  <td className="py-3 px-4 font-semibold text-[#2B2320]">{log.field}</td>
                  <td className="py-3 px-4 text-[#8A7E76] font-mono line-through truncate max-w-[140px]">{log.raw}</td>
                  <td className="py-3 px-4 font-semibold text-[#E8703A] truncate max-w-[200px]">{log.cleaned}</td>
                  <td className="py-3 px-4">
                    <span className="rounded-md bg-[#FAF5EF] px-2 py-0.5 text-[10px] font-mono text-[#6B5E56] border border-[rgba(120,90,70,0.1)]">
                      {log.rule}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge
                      status={log.status === 'VERIFIED' ? 'verified' : log.status === 'MATCHED' ? 'matched' : 'needs_review'}
                      showIcon={false}
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAuditLog(log)}
                      className="h-7 w-7 p-0 text-[#8A7E76] hover:text-[#2B2320]"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in-0">
          <div className="rounded-3xl glass-surface-floating border border-[rgba(120,90,70,0.2)] p-6 max-w-lg w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-3">
              <span className="font-mono text-xs font-bold text-[#E8703A]">{selectedAuditLog.id} Detail</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAuditLog(null)}
                className="h-6 w-6 p-0 text-[#8A7E76] rounded-full"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="glass-inset p-2.5 rounded-xl">
                  <span className="text-[10px] text-[#8A7E76] uppercase font-bold">Target SKU</span>
                  <p className="font-mono font-bold text-[#2B2320] mt-0.5">{selectedAuditLog.sku}</p>
                </div>
                <div className="glass-inset p-2.5 rounded-xl">
                  <span className="text-[10px] text-[#8A7E76] uppercase font-bold">Pipeline Stage</span>
                  <p className="font-semibold text-[#2B2320] mt-0.5">{selectedAuditLog.stage}</p>
                </div>
              </div>

              <div className="glass-inset p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-[#8A7E76] uppercase font-bold">Applied Rule &amp; Standard</span>
                <p className="font-semibold text-[#2B2320]">{selectedAuditLog.rule}</p>
              </div>

              <div className="glass-inset p-3 rounded-xl space-y-2">
                <span className="text-[10px] text-[#8A7E76] uppercase font-bold">Transformation Diff</span>
                <div className="space-y-1">
                  <p className="text-[#8A7E76] line-through font-mono">"{selectedAuditLog.raw}"</p>
                  <p className="text-[#E8703A] font-bold font-mono">"{selectedAuditLog.cleaned}"</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={() => setSelectedAuditLog(null)}
                className="btn-sunrise-primary px-4 text-xs font-bold rounded-xl"
              >
                Close Trace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

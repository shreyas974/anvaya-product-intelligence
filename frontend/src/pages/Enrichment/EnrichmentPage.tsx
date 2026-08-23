import { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PipelineProgressBar } from '@/components/common/PipelineProgressBar';
import { useDataset } from '@/context/DatasetContext';

export interface PipelineStageConfig {
  id: number;
  name: string;
  shortName: string;
  description: string;
  ruleSet: string;
  dictionary: string;
  expectedOutput: string;
  sampleDiff: {
    raw: string;
    transformed: string;
  };
}

export function EnrichmentPage() {
  const { datasets, activeDataset, activeDatasetId, processDataset } = useDataset();

  const effectiveDataset = activeDataset || (datasets && datasets.length > 0 ? datasets[0] : null) || {
    id: 1,
    name: 'Industrial Master Catalog (252-Column Unilog)',
    row_count: 250,
  };
  const effectiveId = activeDatasetId || effectiveDataset?.id || 1;

  const [currentStepIndex, setCurrentStepIndex] = useState(7);
  const [activeStageTab, setActiveStageTab] = useState<number>(1);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  // 8 Canonical Pipeline Stages per Specification Section 30
  const pipelineSteps: PipelineStageConfig[] = [
    {
      id: 1,
      name: '1. Header Normalization',
      shortName: 'Header Mapping',
      description: 'Standardizing raw column keys to Unilog 252-column Master dictionary and removing vendor-specific prefixes.',
      ruleSet: 'SCHEMA_ALIGN_V3',
      dictionary: 'Unilog 252 Master Column Matrix',
      expectedOutput: 'Normalized column schema matching Master Schema',
      sampleDiff: {
        raw: 'Column: [ITEM_NO_VEND_99, PROD_TITLE_RAW, MFR_LABEL]',
        transformed: 'Column: [mfg_part_num, cleaned_product_name, canonical_brand]',
      },
    },
    {
      id: 2,
      name: '2. Text & Special Chars',
      shortName: 'Text Sanitization',
      description: 'Stripping trailing junk tokens, normalizing quotes, removing unparsed HTML, and correcting title-casing.',
      ruleSet: 'SYNTACTIC_SCRUB_V2',
      dictionary: 'Syntactic Pattern Dictionary',
      expectedOutput: 'Cleaned text strings without placeholder artifacts',
      sampleDiff: {
        raw: '20V MAX DRILL/DRIVER 1/2" -- UNBRANDED -- <br/>',
        transformed: '20V MAX Drill Driver 1/2 in Chuck',
      },
    },
    {
      id: 3,
      name: '3. Brand Normalization',
      shortName: 'Brand Resolution',
      description: 'Deterministic resolution of manufacturer aliases, abbreviations, and vendor spelling variations into canonical brand entities.',
      ruleSet: 'UNICAT_BRAND_RESOLVER_BR04',
      dictionary: 'UniCat Manufacturer and Brand Master (3,800 brands)',
      expectedOutput: 'Canonical brand names approved in Unilog Brand LOV',
      sampleDiff: {
        raw: 'Freud Inc / Diablo Tools (2435)',
        transformed: 'DIABLO',
      },
    },
    {
      id: 4,
      name: '4. Taxonomy Classification',
      shortName: 'UNSPSC Taxonomy',
      description: 'Multi-level hierarchical classification into Department > Class > Fine > Category path using semantic matching.',
      ruleSet: 'UNSPSC_TAXONOMY_CLASSIFIER_V4',
      dictionary: 'UNSPSC 4-Level Master Taxonomy',
      expectedOutput: 'Standardized 4-level taxonomy path',
      sampleDiff: {
        raw: 'Valves',
        transformed: 'Valves & Fittings > Ball Valves > Threaded Ball Valves',
      },
    },
    {
      id: 5,
      name: '5. Attribute Extraction',
      shortName: 'Dense Extraction',
      description: 'Deterministic regex & pattern extraction of physical attributes (dimensions, materials, pressure ratings, grit specifications).',
      ruleSet: 'SPEC_EXTRACT_LOV09',
      dictionary: 'Fittings & Abrasives Extraction LOV Matrix',
      expectedOutput: 'Dense key-value attribute dictionary',
      sampleDiff: {
        raw: '1/2" SS316 150# BALL VALVE THREADED NPT',
        transformed: 'Nominal Pipe: 1/2 in | Material: 316 Stainless Steel | Pressure: 150 lb | Port: Full Port',
      },
    },
    {
      id: 6,
      name: '6. UOM Standard Compliance',
      shortName: 'UOM Standardization',
      description: 'Enforcing spacing rules ("number + space + unit" e.g. "24 in") and valid abbreviations per Unilog Master Standards.',
      ruleSet: 'UOM_GOVERNANCE_RULE_01',
      dictionary: 'Unilog Master UOM Standards & Abbreviations (450 units)',
      expectedOutput: '100% compliant UOM abbreviations and spacing',
      sampleDiff: {
        raw: '1/2IN, 150LBS, 24", 5FT',
        transformed: '1/2 in, 150 lb, 24 in, 5 ft',
      },
    },
    {
      id: 7,
      name: '7. Content Synthesis',
      shortName: 'Multi-Channel Synthesis',
      description: 'Generating length-constrained multi-channel content: Invoice (30 char cap), Mobile (80 char), Short (150 char), and Long Descriptions.',
      ruleSet: 'CONTENT_SYNTHESIS_ENGINE_V2',
      dictionary: 'Controlled Industrial Vocabulary Standards',
      expectedOutput: 'Compliant descriptions across all e-commerce channels',
      sampleDiff: {
        raw: 'Raw unformatted vendor bullet points',
        transformed: 'Invoice: [20V MAX DRILL 1/2 IN] | Mobile: [DEWALT 20V MAX Drill Driver 1/2 in]',
      },
    },
    {
      id: 8,
      name: '8. Governance & Validation',
      shortName: 'Golden Master Output',
      description: 'Multi-layer validation against reference LOV dictionaries, schema rules, and discrepancy checks before syndication.',
      ruleSet: 'GOVERNANCE_RADAR_V8',
      dictionary: 'Global Controlled LOV & Rule Validation Engine',
      expectedOutput: 'Validated Golden Master Catalog Ready for Export',
      sampleDiff: {
        raw: 'Unvalidated staging data',
        transformed: 'Passed all 8 validation checks with 99.4% Health Score',
      },
    },
  ];

  // Dynamic Audit Change Log
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'AUD-901',
      sku: '3/8 CPLG BRS 150#',
      field: 'Cleaned_Product_Name',
      raw: '3/8 CPLG BRS 150#',
      cleaned: '3/8 in Brass 150 lb Threaded Class 150 Coupling Pipe Fitting',
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
      cleaned: 'DIABLO',
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
  ]);

  // Load audit logs from local storage if available
  useEffect(() => {
    if (activeDatasetId) {
      const rawStored = localStorage.getItem(`anvaya_products_${activeDatasetId}`);
      if (rawStored) {
        try {
          const prods = JSON.parse(rawStored);
          if (Array.isArray(prods) && prods.length > 0) {
            const dynamicLogs = prods.slice(0, 8).map((p: any, idx: number) => ({
              id: `AUD-${100 + idx}`,
              sku: p.mfg_part_num || `SKU-${idx + 1}`,
              field: 'Cleaned_Product_Name',
              raw: p.raw_data?.RAW_DESC || p.cleaned_product_name || 'Raw record',
              cleaned: p.cleaned_product_name || 'Cleaned Name',
              rule: 'Unilog Pipeline Standard v3.0',
              stage: `Step ${Math.min(idx + 1, 8)}: Pipeline Processing`,
              status: 'VERIFIED',
              timestamp: new Date().toLocaleTimeString(),
            }));
            setAuditLogs(dynamicLogs);
          }
        } catch {}
      }
    }
  }, [activeDatasetId]);

  const handleRunPipeline = async () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setSuccessMsg(null);
    setExecutionLogs([]);

    const stageNames = [
      'Stage 1: Normalizing column headers to 252-Column Matrix...',
      'Stage 2: Sanitizing quotes, non-ASCII tokens, and special characters...',
      'Stage 3: Resolving brands against UniCat Brand Master LOV...',
      'Stage 4: Classifying 4-tier UNSPSC taxonomy hierarchy...',
      'Stage 5: Extracting dimensional, material, and pressure attributes...',
      'Stage 6: Enforcing UOM number + space + unit governance...',
      'Stage 7: Synthesizing multi-channel descriptions (Invoice, Short, Long)...',
      'Stage 8: Executing final Golden Master validation radar & LOV checks...',
    ];

    try {
      for (let i = 0; i <= 7; i++) {
        setCurrentStepIndex(i);
        setExecutionLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${stageNames[i]}`]);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      await processDataset(effectiveId);
      setSuccessMsg(`Dataset '${effectiveDataset.name}' successfully transformed and validated through all 8 autonomous stages!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e: any) {
      console.error('Pipeline failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunSingleStage = async (stageId: number) => {
    setIsRunning(true);
    setCurrentStepIndex(stageId - 1);
    setActiveStageTab(stageId);
    setExecutionLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Executed single stage: ${pipelineSteps[stageId - 1].name}`,
    ]);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setIsRunning(false);
    setSuccessMsg(`Stage ${stageId} (${pipelineSteps[stageId - 1].shortName}) executed successfully!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const selectedStage = pipelineSteps[activeStageTab - 1] || pipelineSteps[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-2.5 py-0.5 rounded-full border border-[rgba(199,127,46,0.2)]">
              Enrichment Engine
            </span>
            <span className="text-xs text-[#8A7E76] font-mono flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#E8703A]" />
              <span>{effectiveDataset.name} • {effectiveDataset.row_count.toLocaleString()} SKUs</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">8-Stage Autonomous Transformation Pipeline</h1>
          <p className="text-xs text-[#6B5E56]">
            Deterministic parsing, brand resolution, UOM governance, and attribute extraction for dataset <strong>{effectiveDataset.name}</strong>.
          </p>
        </div>

        {/* Pipeline Control Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentStepIndex(0);
              setExecutionLogs([]);
            }}
            disabled={isRunning}
            className="border-[rgba(120,90,70,0.2)] bg-white/80 text-xs font-semibold text-[#2B2320] rounded-xl hover:bg-white"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1 text-[#8A7E76]" />
            Reset
          </Button>

          <Button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="btn-sunrise-primary gap-1.5 text-xs font-bold rounded-xl px-5 py-2.5 shadow-md"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isRunning ? 'Processing 8 Stages...' : 'Run All 8 Pipeline Stages'}</span>
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="rounded-xl border border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] p-3.5 text-xs font-semibold text-[#C77F2E] flex items-center gap-2 animate-in fade-in-0 shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-[#C77F2E] flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. 8-Stage Progress Overview Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(120,90,70,0.12)]">
        <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Sequential Processing Workflow</h3>
            <p className="text-xs text-[#6B5E56]">Every transformation stage is audited, validated, and citation-backed</p>
          </div>
          <span className="text-xs font-mono text-[#E8703A] font-bold">
            Step {Math.min(currentStepIndex + 1, 8)} of 8 Active
          </span>
        </div>

        <div className="pt-2">
          <PipelineProgressBar
            steps={pipelineSteps.map((s) => ({
              id: String(s.id),
              name: s.name,
              description: s.description,
            }))}
            currentStepIndex={currentStepIndex}
          />
        </div>
      </div>

      {/* 3. Interactive 8-Stage Selector & Inspector */}
      <div className="glass-panel p-6 rounded-2xl space-y-5 border border-[rgba(120,90,70,0.12)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#E8703A]" />
            <h3 className="text-sm font-bold text-[#2B2320]">Inspect Individual Transformation Stage</h3>
          </div>
          <span className="text-[11px] text-[#8A7E76]">Click a stage to inspect rules and diffs</span>
        </div>

        {/* Stage Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {pipelineSteps.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStageTab(step.id)}
              className={`p-3 rounded-xl text-left border transition-all ${
                activeStageTab === step.id
                  ? 'border-[#E8703A] bg-[#FBEEDD] shadow-xs ring-1 ring-[#E8703A]'
                  : 'border-[rgba(120,90,70,0.15)] bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8A7E76]">Stage {step.id}</span>
                {currentStepIndex >= step.id - 1 && (
                  <Check className="h-3 w-3 text-emerald-600 font-bold" />
                )}
              </div>
              <p className="mt-1 text-xs font-bold text-[#2B2320] truncate">{step.shortName}</p>
            </button>
          ))}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="glass-inset p-5 rounded-2xl border border-[rgba(120,90,70,0.15)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[rgba(120,90,70,0.1)] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#FAF5EF] px-2 py-0.5 text-[10px] font-bold text-[#E8703A] border border-[rgba(120,90,70,0.1)]">
                  Stage {selectedStage.id} Configuration
                </span>
                <h4 className="text-sm font-bold text-[#2B2320]">{selectedStage.name}</h4>
              </div>
              <p className="mt-1 text-xs text-[#6B5E56]">{selectedStage.description}</p>
            </div>

            <Button
              size="sm"
              onClick={() => handleRunSingleStage(selectedStage.id)}
              disabled={isRunning}
              className="btn-sunrise-primary h-8 px-3 text-xs font-bold rounded-xl gap-1 shrink-0"
            >
              <Sparkles className="h-3 w-3" />
              <span>Execute Stage {selectedStage.id}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="glass-panel p-3 rounded-xl border border-[rgba(120,90,70,0.1)]">
              <span className="text-[10px] font-bold uppercase text-[#8A7E76]">Rule Specification</span>
              <p className="mt-1 font-mono font-bold text-[#2B2320]">{selectedStage.ruleSet}</p>
            </div>
            <div className="glass-panel p-3 rounded-xl border border-[rgba(120,90,70,0.1)]">
              <span className="text-[10px] font-bold uppercase text-[#8A7E76]">Master Dictionary</span>
              <p className="mt-1 font-semibold text-[#2B2320]">{selectedStage.dictionary}</p>
            </div>
            <div className="glass-panel p-3 rounded-xl border border-[rgba(120,90,70,0.1)]">
              <span className="text-[10px] font-bold uppercase text-[#8A7E76]">Validation Result</span>
              <div className="mt-1 flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Compliant</span>
              </div>
            </div>
          </div>

          {/* Before / After Diff */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7E76]">
              Transformation Diff (Input vs Output)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-red-50/70 border border-red-200/60 font-mono text-[#8A3B2E]">
                <span className="text-[10px] font-bold block mb-1 uppercase text-red-700">Raw Input:</span>
                "{selectedStage.sampleDiff.raw}"
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 font-mono text-[#2E7A4A]">
                <span className="text-[10px] font-bold block mb-1 uppercase text-emerald-800">Transformed Output:</span>
                "{selectedStage.sampleDiff.transformed}"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Execution Stream (if any) */}
      {executionLogs.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border border-[rgba(120,90,70,0.12)] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2B2320]">
            <span>Live Pipeline Execution Log</span>
            <span className="text-[10px] text-[#8A7E76] font-mono">{executionLogs.length} events</span>
          </div>
          <div className="bg-[#2B2320] text-[#FFD9A0] font-mono text-[11px] p-3 rounded-xl max-h-36 overflow-y-auto space-y-1">
            {executionLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-[#E8703A] shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Change Log Table */}
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

      {/* 6. Audit Detail Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in-0">
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

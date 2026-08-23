import { useState } from 'react';
import { Sparkles, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ProductTourProps {
  isOpen?: boolean;
  isActive?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
  onNavigate?: (sectionId: string) => void;
  onNavigateSection?: (sectionId: string) => void;
}

const TOUR_STEPS = [
  {
    target: 'Dashboard Overview',
    sectionId: 'overview',
    what: 'Mission Control Command Center',
    why: 'Gives data leaders an instant, real-time snapshot of catalogue health, validation pass rates, and items awaiting review.',
    how: 'Check top KPI cards, review the 5-dimension Data DNA quality radar, and monitor active audit event streams.',
  },
  {
    target: 'Dataset Management & Profiling',
    sectionId: 'datasets',
    what: 'Catalogue Ingestion & Analysis Engine',
    why: 'Profiles raw spreadsheets (CSV/XLSX/JSON) to find null rates, duplicate part numbers, and semantic column roles before transforming anything.',
    how: 'Drag and drop any supplier file or click "Use Provided Demo Dataset" to inspect and run pre-flight profiling.',
  },
  {
    target: 'Enrichment & Cleaning Pipeline',
    sectionId: 'enrichment',
    what: 'Autonomous 8-Step Processing Engine',
    why: 'Transforms messy abbreviations, strips supplier placeholders, standardizes UOMs, and resolves canonical brands.',
    how: 'Trigger the pipeline to watch live step status and inspect every row-level modification in the Audit Change Log.',
  },
  {
    target: 'Product Explorer & Detail',
    sectionId: 'products',
    what: 'Enterprise Master Catalogue View',
    why: 'Provides multi-facet filtering, full-text search, and side-by-side progression (Raw → Normalized → Enriched → Validated).',
    how: 'Search by MPN or keyword, filter by brand/category, and click any row to open the complete deep-dive view.',
  },
  {
    target: 'Validation Engine',
    sectionId: 'validation',
    what: 'Multi-Layer Governance & Rule Checker',
    why: 'Ensures zero hallucinated values by testing records against schema, LOV dictionaries, and character limits.',
    how: 'Review pass rates, pinpoint rule failures, and examine rule-by-rule breakdowns across all catalog items.',
  },
  {
    target: 'Human-in-the-Loop Review Queue',
    sectionId: 'review',
    what: 'Escalation & Resolution Center',
    why: 'Enables catalog specialists to inspect ambiguous records with 1-click Approve, Reject, or Edit actions.',
    how: 'Filter pending items, inspect suggested vs original values with evidence citations, and resolve them instantly.',
  },
  {
    target: 'ANVAYA AI Assistant',
    sectionId: 'copilot',
    what: 'Dataset-Grounded Conversational Intelligence',
    why: 'Answers complex catalog questions using ONLY the loaded dataset and reference tables with zero hallucination.',
    how: 'Ask questions like "Which products need review?" or "Why was this classified as a coupling?" to get cited answers.',
  },
  {
    target: 'Analytics & 252-Column Delivery Export',
    sectionId: 'analytics',
    what: 'Executive Intelligence & Syndication Hub',
    why: 'Visualizes category distributions, brand coverage, and syndicates clean data to the 252-column Unilog delivery standard.',
    how: 'Review charts rendered with the Sunrise palette, or navigate to Export to download clean CSV/XLSX catalogues.',
  },
];

export function ProductTour({
  isOpen,
  isActive,
  onClose,
  onComplete,
  onNavigate,
  onNavigateSection,
}: ProductTourProps) {
  const [stepIdx, setStepIdx] = useState(0);

  const open = isOpen ?? isActive ?? false;
  const close = onComplete ?? onClose ?? (() => {});
  const nav = onNavigate ?? onNavigateSection ?? (() => {});

  if (!open) return null;

  const current = TOUR_STEPS[stepIdx];

  const handleNext = () => {
    if (stepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = stepIdx + 1;
      setStepIdx(nextIdx);
      nav(TOUR_STEPS[nextIdx].sectionId);
    } else {
      close();
    }
  };

  const handleBack = () => {
    if (stepIdx > 0) {
      const prevIdx = stepIdx - 1;
      setStepIdx(prevIdx);
      nav(TOUR_STEPS[prevIdx].sectionId);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl glass-surface-floating border border-[rgba(232,112,58,0.3)] p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FBEEDD] border border-[rgba(199,127,46,0.3)] flex items-center justify-center text-[#E8703A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2B2320]">Interactive Platform Tour</span>
              <p className="text-[10px] text-[#8A7E76]">Step {stepIdx + 1} of {TOUR_STEPS.length}</p>
            </div>
          </div>
          <button
            onClick={close}
            className="text-[#8A7E76] hover:text-[#2B2320] p-1 rounded"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Focus */}
        <div className="space-y-2.5 text-left mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#E8703A] uppercase tracking-wider">
              {current.target}
            </span>
          </div>

          <div className="glass-inset p-3 rounded-xl space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#8A7E76] uppercase tracking-wider block">WHAT IT IS</span>
              <p className="font-semibold text-[#2B2320]">{current.what}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8A7E76] uppercase tracking-wider block">WHY IT MATTERS</span>
              <p className="text-[#6B5E56]">{current.why}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#8A7E76] uppercase tracking-wider block">HOW TO USE IT</span>
              <p className="text-[#2B2320] font-medium">{current.how}</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={close}
            className="text-xs text-[#8A7E76] hover:text-[#2B2320] font-semibold"
          >
            End Tour
          </button>

          <div className="flex items-center gap-2">
            {stepIdx > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="text-xs border-[rgba(120,90,70,0.2)] text-[#2B2320] rounded-xl h-8 px-2.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="btn-sunrise-primary text-xs font-bold rounded-xl h-8 px-4"
            >
              {stepIdx === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

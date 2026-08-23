import { useState } from 'react';
import {
  UploadCloud,
  BarChart3,
  Sliders,
  Cpu,
  Layers,
  ShieldCheck,
  Download,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface OnboardingWizardProps {
  isOpen: boolean;
  onClose?: () => void;
  onComplete: () => void;
  onStartTour?: () => void;
}

const ONBOARDING_STEPS = [
  {
    step: 1,
    title: '1. Ingest Any Raw Catalogue',
    icon: UploadCloud,
    description: 'Upload complex supplier spreadsheets in CSV, XLSX, JSON, or TSV formats. ANVAYA processes files with arbitrary schemas without requiring pre-mapping.',
    highlight: 'Supports 1,000+ SKU batches with multi-field supplier variance.',
  },
  {
    step: 2,
    title: '2. Automatic Dataset Profiling',
    icon: BarChart3,
    description: 'Instantly identifies row counts, null rates, duplicate part numbers, data types, and potential semantic column roles (Brand, Part Number, Description).',
    highlight: 'Zero data changes are made during profiling.',
  },
  {
    step: 3,
    title: '3. Deterministic Data Cleaning',
    icon: Sliders,
    description: 'Removes supplier placeholders (e.g. "-- Unbranded --" → NULL), standardizes whitespace, and logs every audit transformation in real time.',
    highlight: 'Full audit change log with before-and-after traceability.',
  },
  {
    step: 4,
    title: '4. Entity Resolution & Classification',
    icon: Cpu,
    description: 'Maps messy raw manufacturers and brands to canonical master dictionaries and assigns exact category classification hierarchies.',
    highlight: 'Transparent confidence scores with match type citations.',
  },
  {
    step: 5,
    title: '5. Dense Attribute Extraction & Enrichment',
    icon: Layers,
    description: 'Extracts technical attributes (Size, Material, Pressure, Mounting) and synthesizes compliant title, short, and long descriptions.',
    highlight: 'Normalizes units (inches → in) and fractional measurements.',
  },
  {
    step: 6,
    title: '6. Validation & Human Review Queue',
    icon: ShieldCheck,
    description: 'Evaluates each record against schema, UOM, and LOV dictionaries. Low confidence or conflicting records are queued for 1-click human review.',
    highlight: 'Never fabricates data; flags uncertain items honestly.',
  },
  {
    step: 7,
    title: '7. Grounded Assistant & Delivery Export',
    icon: Download,
    description: 'Ask ANVAYA AI questions directly against your loaded dataset, and export the enriched output into standard CSV/JSON or the 252-column delivery format.',
    highlight: 'Dataset-grounded conversational AI with citation lineage.',
  },
];

export function OnboardingWizard({ isOpen, onClose = () => {}, onComplete, onStartTour }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      if (onStartTour) onStartTour();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-xl rounded-3xl glass-surface-floating border border-[rgba(120,90,70,0.2)] p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8A7E76] hover:text-[#2B2320] p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Dots */}
        <div className="flex items-center justify-between mb-6 pr-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD9A0] to-[#E8703A] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#E8703A] uppercase tracking-wider">
                Welcome to ANVAYA
              </span>
              <p className="text-[11px] text-[#6B5E56]">Let's get your first dataset ready.</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#C77F2E]">
            Step {step.step} of {ONBOARDING_STEPS.length}
          </span>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-7 gap-1.5 mb-6">
          {ONBOARDING_STEPS.map((s, idx) => (
            <div
              key={s.step}
              className={`h-1.5 rounded-full transition-all ${
                idx <= currentStep
                  ? 'bg-gradient-to-r from-[#FFD9A0] to-[#E8703A]'
                  : 'bg-[rgba(120,90,70,0.12)]'
              }`}
            />
          ))}
        </div>

        {/* Main Content Box */}
        <div className="glass-inset p-6 rounded-2xl mb-6 text-left">
          <div className="w-12 h-12 rounded-xl bg-[#FBEEDD] border border-[rgba(199,127,46,0.3)] text-[#E8703A] flex items-center justify-center mb-4">
            <Icon className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-[#2B2320] mb-2">{step.title}</h3>
          <p className="text-xs text-[#6B5E56] leading-relaxed mb-4">{step.description}</p>

          <div className="p-2.5 rounded-xl bg-[rgba(255,251,247,0.8)] border border-[rgba(120,90,70,0.1)] text-[11px] font-semibold text-[#C77F2E]">
            💡 {step.highlight}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold text-[#8A7E76] hover:text-[#2B2320]"
          >
            Skip Intro
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="gap-1 text-xs border-[rgba(120,90,70,0.2)] text-[#2B2320] rounded-xl"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="btn-sunrise-primary gap-1 px-5 text-xs font-bold rounded-xl"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                'Finish & Open Workspace'
              ) : (
                <>
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

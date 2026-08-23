import { useState } from 'react';
import {
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface HelpPageProps {
  onStartTour?: () => void;
}

export function HelpPage({ onStartTour }: HelpPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is ANVAYA and how does it transform messy catalog data?',
      a: 'ANVAYA is an enterprise AI product data intelligence platform that ingests raw, inconsistent, or truncated distributor records and converts them into standardized, enriched, and validated product records following strict industrial taxonomy and UOM standards.',
    },
    {
      q: 'What is the "Zero-Fabrication" rule and how is it enforced?',
      a: 'ANVAYA strictly forbids hallucinating or inventing missing attributes. If a specification (e.g. Voltage rating) cannot be verified from the raw input or reference data, ANVAYA displays "Not available from provided data" and routes the SKU to the Human Review Queue instead of guessing.',
    },
    {
      q: 'How does the 8-Step Cleaning & Enrichment Pipeline work?',
      a: 'The pipeline executes: 1) Column Header Normalization, 2) Text Cleaning & Special Characters, 3) Brand & Manufacturer Normalization, 4) Taxonomy Classification, 5) Density & Attribute Extraction, 6) Unit of Measure Standard Compliance, 7) Multi-Channel Content Generation, and 8) Governance & Validation Checks.',
    },
    {
      q: 'What format does the Export Center deliver?',
      a: 'The Export Center produces a fully standardized 252-column dataset matching the Unilog delivery specification, containing identification, taxonomy hierarchy, 4 description formats, and 50 standardized attribute triplets (Label, Value, UOM).',
    },
    {
      q: 'Can I replay the guided product tour?',
      a: 'Yes! You can click the "Replay Guided Tour" button at the top of this page or in the sidebar at any time to walk through key platform features step-by-step.',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-2.5 py-0.5 rounded-full border border-[rgba(199,127,46,0.2)]">
              Knowledge Base &amp; Support
            </span>
            <span className="text-xs text-[#8A7E76] font-mono">ANVAYA Documentation</span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Help Center &amp; Platform Guidelines</h1>
          <p className="text-xs text-[#6B5E56]">
            Understand catalog governance, review our zero-fabrication policies, and explore technical pipeline details.
          </p>
        </div>

        {onStartTour && (
          <Button
            onClick={onStartTour}
            className="btn-sunrise-primary gap-1.5 text-xs font-bold rounded-xl px-4 py-2.5 shadow-md"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Replay Guided Tour</span>
          </Button>
        )}
      </div>

      {/* Quick Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-[rgba(120,90,70,0.12)]">
          <div className="w-9 h-9 rounded-xl bg-[#FBEEDD] text-[#C77F2E] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#2B2320]">Zero Fabrication Policy</h3>
          <p className="text-xs text-[#6B5E56] leading-relaxed">
            Strict refusal to hallucinate specs. All extracted facts are cited with exact raw string provenance.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-[rgba(120,90,70,0.12)]">
          <div className="w-9 h-9 rounded-xl bg-[#FBEEDD] text-[#E8703A] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#2B2320]">8-Step Pipeline</h3>
          <p className="text-xs text-[#6B5E56] leading-relaxed">
            End-to-end transformation from raw ingestion, taxonomy assignment, LOV compliance, to 252-column export.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-[rgba(120,90,70,0.12)]">
          <div className="w-9 h-9 rounded-xl bg-[#FBEEDD] text-[#8E7FC7] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#2B2320]">Dataset-Grounded AI</h3>
          <p className="text-xs text-[#6B5E56] leading-relaxed">
            Interactive Copilot queries your loaded catalog and explains decisions using deterministic rule traces.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(120,90,70,0.12)]">
        <div>
          <h3 className="text-base font-bold text-[#2B2320]">Frequently Asked Questions</h3>
          <p className="text-xs text-[#6B5E56]">Common questions regarding catalog processing and compliance.</p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="glass-inset rounded-xl overflow-hidden border border-[rgba(120,90,70,0.1)] transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-[#2B2320] hover:text-[#E8703A]"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-[#E8703A]" /> : <ChevronRight className="w-4 h-4 text-[#8A7E76]" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-[#6B5E56] leading-relaxed border-t border-[rgba(120,90,70,0.06)] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {

  const capabilities = [
    {
      title: 'Automated Catalog Cleansing',
      description: 'Cleanses unstructured and messy distributor feeds with strict regex and token-level normalizations.',
      icon: Zap,
      gradient: 'from-[#FFD9A0] to-[#E8703A]',
    },
    {
      title: 'Canonical Brand Matching',
      description: 'Resolves vendor typos, abbreviations, and parent manufacturers using verified master dictionaries.',
      icon: Sparkles,
      gradient: 'from-[#FF9E7D] to-[#F2A65A]',
    },
    {
      title: 'Dense Attribute Extraction',
      description: 'Extracts critical technical specifications, dimensions, materials, and ratings with ground-truth citations.',
      icon: Layers,
      gradient: 'from-[#FDB4C0] to-[#D98CA6]',
    },
    {
      title: 'LOV & UOM Governance',
      description: 'Validates units against Unilog Master UOM Standards and controlled vocabulary dictionaries.',
      icon: ShieldCheck,
      gradient: 'from-[#C9B8E8] to-[#8E7FC7]',
    },
    {
      title: 'Human-in-the-Loop Workflow',
      description: 'Automatically routes uncertain or low-confidence predictions to a human review queue with 1-click actions.',
      icon: Award,
      gradient: 'from-[#FFD9A0] to-[#E8703A]',
    },
    {
      title: '252-Column Syndication Export',
      description: 'Exports fully validated product intelligence into standard CSV, Excel XLSX, or real-time JSON feeds.',
      icon: Database,
      gradient: 'from-[#AFD3E8] to-[#FF9E7D]',
    },
  ];

  const industries = [
    'Industrial & MRO Supplies',
    'Electrical & Electronic Components',
    'Plumbing, Valves & Fittings (Flagship)',
    'Fasteners, Hardware & Rigging',
    'HVAC & Refrigeration',
    'Safety & PPE Equipment',
    'Cutting Tools & Abrasives',
    'Automotive & Fleet Aftermarket',
    'Medical & Laboratory Devices',
    'Building & Construction Materials',
    'Oil, Gas & Energy Infrastructure',
    'Aerospace & Defense Components',
  ];

  const pipelineStages = [
    { num: '01', title: 'Header Normalization', desc: 'Auto-maps raw keys to Unilog schema' },
    { num: '02', title: 'Text Sanitization', desc: 'Cleans quotes, special characters & whitespace' },
    { num: '03', title: 'Brand Resolution', desc: 'Matches canonical supplier master' },
    { num: '04', title: 'Taxonomy Hierarchy', desc: 'Classifies Dept > Class > Fine > Category' },
    { num: '05', title: 'Attribute Extraction', desc: 'Extracts dense dimensions & ratings' },
    { num: '06', title: 'UOM Compliance', desc: 'Enforces standard spacing & units' },
    { num: '07', title: 'Content Generation', desc: 'Synthesizes Mobile, Short, Invoice texts' },
    { num: '08', title: 'Validation & Audit', desc: 'Runs 9-layer multi-engine governance' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF7] bg-sunrise-canvas text-[#2B2320] flex flex-col selection:bg-[#FBEEDD] selection:text-[#E8703A]">
      {/* 1. Top Enterprise Nav */}
      <header className="sticky top-0 z-50 border-b border-[rgba(120,90,70,0.12)] bg-[rgba(255,251,247,0.85)] backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFD9A0] to-[#E8703A] text-white flex items-center justify-center font-black text-lg shadow-md">
              A
            </div>
            <div>
              <span className="text-base font-black tracking-wider text-[#2B2320]">ANVAYA</span>
              <span className="text-[10px] block font-bold uppercase tracking-widest text-[#E8703A]">Product Intelligence</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#6B5E56]">
            <a href="#pipeline" className="hover:text-[#E8703A] transition-colors">8-Step Pipeline</a>
            <a href="#capabilities" className="hover:text-[#E8703A] transition-colors">Capabilities</a>
            <a href="#industries" className="hover:text-[#E8703A] transition-colors">12 Industries</a>
            <a href="#trust" className="hover:text-[#E8703A] transition-colors">Trust &amp; Governance</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onLogin}
              className="text-xs font-bold text-[#6B5E56] hover:text-[#2B2320] hover:bg-white/60 rounded-xl px-4 py-2"
            >
              Sign In
            </Button>
            <Button
              onClick={onGetStarted}
              className="btn-sunrise-primary text-xs font-bold rounded-xl px-5 py-2.5 shadow-md hover:shadow-lg transition-all"
            >
              Launch Platform
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Section 7) */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Soft Sunrise Backing Glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#FFD9A0]/30 via-[#FF9E7D]/25 to-[#C9B8E8]/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(199,127,46,0.25)] bg-[#FBEEDD] px-4 py-1.5 text-xs font-bold text-[#C77F2E] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E8703A]" />
            <span>Sunrise Liquid Glass Edition • Zero Hallucination AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#2B2320] tracking-tight leading-[1.1]">
            Turn Messy Product Data Into Clean, <span className="bg-gradient-to-r from-[#E8703A] via-[#F2A65A] to-[#D98CA6] bg-clip-text text-transparent">Grounded Intelligence</span>
          </h1>

          <p className="text-base sm:text-lg text-[#6B5E56] max-w-3xl mx-auto font-normal leading-relaxed">
            ANVAYA transforms raw, truncated distributor feeds into 100% normalized, classified, enriched, validated, and explainable product records.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="btn-sunrise-primary text-sm font-bold rounded-2xl px-8 py-6 shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
            >
              <span>Explore Master Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onLogin}
              className="border-[rgba(120,90,70,0.2)] bg-white/80 text-sm font-bold text-[#2B2320] rounded-2xl px-8 py-6 hover:bg-white shadow-sm"
            >
              <span>Login with Enterprise SSO</span>
            </Button>
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="glass-panel p-4 rounded-2xl">
              <p className="text-2xl font-black text-[#2B2320]">1,000</p>
              <p className="text-[11px] font-semibold text-[#8A7E76] uppercase tracking-wider mt-1">Real Verified SKUs</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl">
              <p className="text-2xl font-black text-[#E8703A]">252</p>
              <p className="text-[11px] font-semibold text-[#8A7E76] uppercase tracking-wider mt-1">Delivery Columns</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl">
              <p className="text-2xl font-black text-[#C77F2E]">94.6%</p>
              <p className="text-[11px] font-semibold text-[#8A7E76] uppercase tracking-wider mt-1">Auto-Pass Rate</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl">
              <p className="text-2xl font-black text-[#2B2320]">0.08s</p>
              <p className="text-[11px] font-semibold text-[#8A7E76] uppercase tracking-wider mt-1">Processing / SKU</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 8-Step Problem & Pipeline Section (Section 8) */}
      <section id="pipeline" className="py-20 px-6 border-t border-[rgba(120,90,70,0.1)] bg-[rgba(255,251,247,0.6)]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-3 py-1 rounded-full border border-[rgba(199,127,46,0.2)]">
              Deterministic Cleansing Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2B2320]">The 8-Stage Intelligence Pipeline</h2>
            <p className="text-xs text-[#6B5E56]">
              Every ingested record flows through our strict deterministic reference models and guardrailed extraction agents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineStages.map((stg) => (
              <div
                key={stg.num}
                className="glass-panel p-5 rounded-2xl space-y-2 border border-[rgba(120,90,70,0.12)] hover:border-[rgba(232,112,58,0.3)] transition-all"
              >
                <span className="text-xs font-mono font-black text-[#E8703A]">{stg.num}</span>
                <h3 className="text-sm font-bold text-[#2B2320]">{stg.title}</h3>
                <p className="text-xs text-[#6B5E56] leading-relaxed">{stg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 6 Enterprise Capability Cards (Section 9) */}
      <section id="capabilities" className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E8703A] bg-[#FBEEDD] px-3 py-1 rounded-full border border-[rgba(232,112,58,0.2)]">
              Enterprise Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2B2320]">Complete Catalog Governance Suite</h2>
            <p className="text-xs text-[#6B5E56]">
              Designed for Chief Data Officers, Catalog Operations teams, and B2B Distributors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  className="glass-panel p-6 rounded-3xl space-y-4 border border-[rgba(120,90,70,0.12)] hover:border-[rgba(232,112,58,0.3)] transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cap.gradient} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#2B2320]">{cap.title}</h3>
                  <p className="text-xs text-[#6B5E56] leading-relaxed">{cap.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. 12 Industry Use Cases (Section 11) */}
      <section id="industries" className="py-20 px-6 border-t border-[rgba(120,90,70,0.1)] bg-[rgba(255,251,247,0.6)]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-3 py-1 rounded-full border border-[rgba(199,127,46,0.2)]">
              Multi-Industry Coverage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2B2320]">12 Industrial Verticals Ready</h2>
            <p className="text-xs text-[#6B5E56]">
              Pre-configured taxonomy dictionaries and UOM rules tailored to major distribution sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {industries.map((ind, i) => (
              <div
                key={i}
                className="glass-inset p-4 rounded-xl flex items-center gap-3 border border-[rgba(120,90,70,0.1)] hover:border-[rgba(232,112,58,0.3)] transition-all"
              >
                <div className="w-2 h-2 rounded-full bg-[#E8703A]" />
                <span className="text-xs font-bold text-[#2B2320]">{ind}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Saturated CTA Footer (Section 14) */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#FFD9A0] via-[#FF9E7D] to-[#E8703A] p-10 sm:p-14 text-center text-white shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#2B2320]">
            Ready to Standardize Your Enterprise Catalog?
          </h2>
          <p className="text-sm sm:text-base text-[#2B2320]/80 max-w-2xl mx-auto font-medium">
            Launch ANVAYA today to experience 100% data-grounded AI enrichment with verifiable evidence trails.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-[#2B2320] hover:bg-[#1A1513] text-white text-xs font-bold rounded-2xl px-8 py-5 shadow-lg"
            >
              Launch Master Platform
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onLogin}
              className="border-white/40 bg-white/20 text-[#2B2320] hover:bg-white/30 text-xs font-bold rounded-2xl px-8 py-5"
            >
              Enterprise Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Bottom Copyright */}
      <footer className="border-t border-[rgba(120,90,70,0.1)] py-8 px-6 text-center text-xs text-[#8A7E76]">
        <p>© 2026 ANVAYA Product Intelligence. Built with Sunrise Liquid Glass Edition.</p>
      </footer>
    </div>
  );
}

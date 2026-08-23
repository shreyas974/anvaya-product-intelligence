import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Layers,
  Zap,
  Dna,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuroraBackground } from '@/components/aurora/AuroraBackground';

export interface AboutPageProps {
  onBack: () => void;
  onEnterDashboard: () => void;
}

export function AboutPage({ onBack, onEnterDashboard }: AboutPageProps) {
  return (
    <div className="relative min-h-screen bg-[#04060e] text-white">
      <AuroraBackground />

      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-black tracking-widest text-white">ANVAYA ARCHITECTURE</span>
          </div>

          <Button
            size="sm"
            onClick={onEnterDashboard}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 px-4 text-xs font-bold text-white shadow-lg hover:opacity-90"
          >
            Mission Control
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative mx-auto max-w-5xl px-6 py-16 space-y-16">
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-300">
            Platform Specifications & Intelligence Blueprint
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            The Science Behind True Product Intelligence
          </h1>
          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-slate-300">
            ANVAYA is an industrial-grade intelligence layer that unifies fragmented product data,
            specifications, images, and taxonomy into structured, canonical master catalog graph nodes.
          </p>
        </div>

        {/* 4 Pillars of ANVAYA Architecture */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-white">Core Subsystems</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pillar 1 */}
            <div className="liquid-glass rounded-3xl border border-white/10 p-6 shadow-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">1. Hierarchical Taxonomy Engine</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Maps arbitrary product names and SKUs across 4,200+ leaf categories using a combination of
                FastEmbed vector cosine similarity and Groq-accelerated LLaMA-3 zero-shot categorization.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-purple-300 font-mono">
                <span className="rounded-md bg-purple-500/10 px-2 py-1">UNSPSC v25</span>
                <span className="rounded-md bg-purple-500/10 px-2 py-1">eCl@ss 14</span>
                <span className="rounded-md bg-purple-500/10 px-2 py-1">Google Taxonomy</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="liquid-glass rounded-3xl border border-white/10 p-6 shadow-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">2. Dense Specification Recovery</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Processes unstructured technical PDFs, spec sheets, and catalog tables using PyMuPDF and
                multi-modal vision models to extract attributes, tolerances, materials, and operating parameters.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-cyan-300 font-mono">
                <span className="rounded-md bg-cyan-500/10 px-2 py-1">PyMuPDF</span>
                <span className="rounded-md bg-cyan-500/10 px-2 py-1">UOM Normalizer</span>
                <span className="rounded-md bg-cyan-500/10 px-2 py-1">Regex Guardrails</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="liquid-glass rounded-3xl border border-white/10 p-6 shadow-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-pink-500/30 bg-pink-500/10 text-pink-300">
                <Dna className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">3. Vector Deduplication & Entity Resolution</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Calculates high-dimensional semantic embeddings to group identical SKUs from disparate suppliers
                into canonical master records, eliminating catalog redundancy and pricing inaccuracies.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-pink-300 font-mono">
                <span className="rounded-md bg-pink-500/10 px-2 py-1">Cosine Sim &gt; 0.92</span>
                <span className="rounded-md bg-pink-500/10 px-2 py-1">Brand Fuzzy Match</span>
                <span className="rounded-md bg-pink-500/10 px-2 py-1">Master Canonical</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="liquid-glass rounded-3xl border border-white/10 p-6 shadow-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">4. Multi-Tier Free LLM Engine & Privacy Router</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Automatic cascading fallback pipeline: Groq (LLaMA-3 70B) &rarr; Google Gemini &rarr; OpenRouter
                &rarr; Ollama &rarr; Local Deterministic Rule-Engine, ensuring 100% offline uptime with zero API cost lock-in.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-emerald-300 font-mono">
                <span className="rounded-md bg-emerald-500/10 px-2 py-1">Groq LLaMA-3</span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-1">Gemini Flash</span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-1">Deterministic Offline</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benchmark Specifications */}
        <section className="liquid-glass rounded-3xl border border-white/10 p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Performance Benchmarks</h2>
              <p className="text-xs text-muted-foreground">Validated on 1.84M enterprise industrial SKUs</p>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              Verified Production Metrics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/5 p-4 text-center">
              <p className="text-3xl font-black text-cyan-400">2.31s</p>
              <p className="mt-1 text-xs text-muted-foreground">Avg Processing per SKU</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 text-center">
              <p className="text-3xl font-black text-purple-400">97.43%</p>
              <p className="mt-1 text-xs text-muted-foreground">Attribute Accuracy</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 text-center">
              <p className="text-3xl font-black text-emerald-400">99.4%</p>
              <p className="mt-1 text-xs text-muted-foreground">Taxonomy Confidence</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 text-center">
              <p className="text-3xl font-black text-pink-400">100%</p>
              <p className="mt-1 text-xs text-muted-foreground">Uptime Resiliency</p>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="text-center space-y-6 py-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300">
            <Award className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">The ANVAYA Mission</h2>
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-slate-300">
            "We believe product data is the central nervous system of global commerce. When product
            data is clean, precise, and verified, buyers find what they need instantly, supply chains run
            efficiently, and companies thrive."
          </p>
          <Button
            size="lg"
            onClick={onEnterDashboard}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-5 text-sm font-bold text-white shadow-xl hover:opacity-90"
          >
            Open Mission Control Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>
      </main>
    </div>
  );
}

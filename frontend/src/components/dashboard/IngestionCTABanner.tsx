import {
  UploadCloud,
  Sparkles,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Zap,
  ShieldCheck,
  WandSparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface IngestionCTABannerProps {
  onStartIngestion: () => void;
  onExploreCatalog: () => void;
}

export function IngestionCTABanner({
  onStartIngestion,
  onExploreCatalog,
}: IngestionCTABannerProps) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-xl shadow-primary/5">

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.10] via-transparent to-emerald-500/[0.06]" />

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl transition-all duration-700 group-hover:bg-primary/15" />

      <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-emerald-500/[0.08] blur-3xl" />

      {/* Decorative grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative z-10 p-6 sm:p-7 lg:p-8">

        {/* Top status */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              Autonomous Intelligence Engine
            </span>
          </div>

          <div className="hidden items-center gap-1.5 text-[10px] font-medium text-muted-foreground sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Enterprise-grade catalog processing</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

          {/* Main content */}
          <div className="max-w-3xl">

            <div className="mb-3 flex items-center gap-2 text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <WandSparkles className="h-4 w-4" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                AI-powered catalog transformation
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-[-0.035em] text-foreground sm:text-3xl">
              Turn messy vendor data into
              <span className="text-primary"> intelligent catalogs.</span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Upload unstructured CSV or JSON feeds and let ANVAYA automatically
              normalize brands, standardize attributes, recover missing
              specifications, detect duplicates, and score catalog quality.
            </p>

            {/* Capabilities */}
            <div className="mt-6 grid gap-2 sm:grid-cols-3">

              <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 transition-all duration-300 hover:border-primary/20 hover:bg-primary/5">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                </div>

                <p className="text-[11px] font-bold text-foreground">
                  Multi-source ingestion
                </p>

                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                  CSV & JSON vendor feeds
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 transition-all duration-300 hover:border-emerald-500/20 hover:bg-emerald-500/5">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Zap className="h-3.5 w-3.5 text-emerald-400" />
                </div>

                <p className="text-[11px] font-bold text-foreground">
                  AI attribute recovery
                </p>

                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                  Recover missing product data
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 transition-all duration-300 hover:border-blue-500/20 hover:bg-blue-500/5">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                  <Database className="h-3.5 w-3.5 text-blue-400" />
                </div>

                <p className="text-[11px] font-bold text-foreground">
                  Intelligent cleansing
                </p>

                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                  Deduplication & taxonomy
                </p>
              </div>

            </div>
          </div>

          {/* CTA panel */}
          <div className="relative lg:min-w-[255px]">

            <div className="rounded-2xl border border-primary/20 bg-background/50 p-4 shadow-lg backdrop-blur-sm">

              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <UploadCloud className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-foreground">
                    Ready to transform?
                  </p>

                  <p className="text-[10px] text-muted-foreground">
                    Start a new ingestion workflow
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={onStartIngestion}
                className="h-11 w-full gap-2 bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25"
              >
                <Sparkles className="h-4 w-4" />
                Launch Ingestion Studio
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={onExploreCatalog}
                className="mt-2 h-9 w-full text-xs font-semibold text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              >
                Explore existing catalog
              </Button>

            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-medium text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Structured explainability enabled</span>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom accent */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
}
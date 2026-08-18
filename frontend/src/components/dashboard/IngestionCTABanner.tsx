
import { UploadCloud, Sparkles, ArrowRight, Database, FileSpreadsheet, Zap } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/5 to-secondary/40 p-6 sm:p-8 shadow-lg">
      <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Autonomous Ingestion Engine</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Ingest Unstructured Catalogs &amp; Automate AI Enrichment
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Drag &amp; drop messy CSV or JSON vendor exports. ANVAYA automatically cleanses brand inconsistencies, standardizes units, recovers missing specifications via LLM entity extraction, and audits confidence scores.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5 text-foreground">
              <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
              <span>Multi-vendor CSV / JSON</span>
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Real-time Attribute Recovery</span>
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span>Deduplication &amp; Taxonomy</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
          <Button
            size="lg"
            onClick={onStartIngestion}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/25"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Launch Ingestion Studio</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onExploreCatalog}
            className="border-border hover:bg-secondary/60 text-foreground font-medium"
          >
            <span>Explore Catalog</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

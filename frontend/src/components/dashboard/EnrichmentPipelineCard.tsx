import {
  Sparkles,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Database,
  WandSparkles,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';

import { Product } from '@/types/product.types';
import { EnrichmentStatusResponse } from '@/types/enrichment.types';

export interface EnrichmentPipelineCardProps {
  activeJobStatus?: EnrichmentStatusResponse;
  recentProducts: Product[];
  onBatchEnrich?: () => void;
  onExploreCatalog?: () => void;
}

export function EnrichmentPipelineCard({
  activeJobStatus,
  recentProducts,
  onBatchEnrich,
  onExploreCatalog,
}: EnrichmentPipelineCardProps) {
  const enrichedProducts = recentProducts
    .filter(
      (p) =>
        p.enrichedData &&
        p.enrichedData.recoveredAttributes.length > 0
    )
    .slice(0, 3);

  const progress = activeJobStatus?.progress ?? 0;

  return (
    <Card
      className="
        group relative overflow-hidden
        border-border/60 bg-card
        shadow-lg shadow-black/5
        transition-all duration-500
        hover:border-primary/25
        hover:shadow-2xl hover:shadow-primary/5
      "
    >
      {/* Ambient AI glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-75 bg-primary/70 transition-transform duration-700 group-hover:scale-x-100" />

      <CardHeader className="relative pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          {/* Header identity */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm shadow-primary/10">
                <Sparkles className="h-5 w-5" />

                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-400" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="truncate text-lg font-bold tracking-tight">
                    AI Enrichment Pipeline
                  </CardTitle>

                  <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 sm:inline-flex">
                    Live
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Autonomous catalog intelligence
                  </span>
                </div>
              </div>
            </div>

            <CardDescription className="mt-3 max-w-xl text-xs leading-relaxed">
              Automated attribute recovery, brand normalization, and
              confidence auditing across your product catalog.
            </CardDescription>
          </div>

          {/* CTA */}
          {onBatchEnrich && (
            <Button
              size="sm"
              onClick={onBatchEnrich}
              className="
                h-9 shrink-0 gap-2
                bg-primary
                px-3.5
                text-xs font-bold
                text-primary-foreground
                shadow-md shadow-primary/20
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-primary/90
                hover:shadow-lg hover:shadow-primary/25
              "
            >
              <WandSparkles className="h-3.5 w-3.5" />
              Batch Enrich
              <Zap className="h-3 w-3 opacity-70" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5 pt-0">

        {/* Active Pipeline */}
        {activeJobStatus && (
          <div
            className="
              relative overflow-hidden
              rounded-2xl
              border border-primary/20
              bg-gradient-to-br from-primary/10 via-primary/5 to-transparent
              p-4
            "
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </div>

                  <span className="truncate text-xs font-bold text-foreground">
                    Active Pipeline
                  </span>

                  <code className="hidden truncate rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] text-primary sm:inline">
                    {activeJobStatus.jobId}
                  </code>
                </div>

                <span className="shrink-0 text-lg font-black tracking-tight text-primary">
                  {progress}%
                </span>
              </div>

              <Progress
                value={progress}
                indicatorClassName="bg-primary"
              />

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-muted-foreground" />

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Processed
                    </p>
                    <p className="text-xs font-bold text-foreground">
                      {activeJobStatus.processedProducts}
                      <span className="font-medium text-muted-foreground">
                        {' '}
                        / {activeJobStatus.totalProducts}
                      </span>
                    </p>
                  </div>
                </div>

                {activeJobStatus.estimatedTimeRemainingSeconds !==
                  undefined && (
                  <div className="flex items-center justify-end gap-2">
                    <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />

                    <div className="text-right">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        ETA
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        ~{activeJobStatus.estimatedTimeRemainingSeconds}s
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recovery feed */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                </div>

                <span className="text-xs font-bold text-foreground">
                  Recovered Intelligence
                </span>
              </div>

              <p className="mt-1 pl-8 text-[10px] text-muted-foreground">
                Recently recovered attributes with confidence signals
              </p>
            </div>

            {onExploreCatalog && (
              <button
                onClick={onExploreCatalog}
                className="
                  flex items-center gap-1
                  text-[10px] font-bold
                  text-primary
                  transition-all duration-200
                  hover:gap-1.5 hover:text-primary/80
                "
              >
                Full Catalog
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {enrichedProducts.length > 0 ? (
              enrichedProducts.map((product) => {
                const recovered =
                  product.enrichedData?.recoveredAttributes || [];

                return (
                  <div
                    key={product.id}
                    className="
                      group/product
                      rounded-xl
                      border border-border/50
                      bg-secondary/15
                      p-3.5
                      transition-all duration-300
                      hover:-translate-y-0.5
                      hover:border-primary/20
                      hover:bg-secondary/30
                    "
                  >
                    {/* Product header */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <StatusBadge status={product.status} />

                        <span className="truncate text-xs font-bold text-foreground">
                          {product.title}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-md bg-background/60 px-1.5 py-1 font-mono text-[9px] text-muted-foreground">
                          {product.sku}
                        </span>

                        <ConfidenceBadge
                          score={product.confidenceScore}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Recovered attributes */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {recovered.map((attr) => (
                        <div
                          key={attr.key}
                          className="
                            inline-flex items-center gap-1.5
                            rounded-lg
                            border border-emerald-500/20
                            bg-emerald-500/5
                            px-2 py-1
                            text-[10px]
                            transition-all duration-200
                            hover:border-emerald-500/40
                            hover:bg-emerald-500/10
                          "
                          title={`Extracted via ${attr.explainability.extractionMethod}: "${attr.explainability.evidenceSnippet}"`}
                        >
                          <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-400" />

                          <span className="font-semibold text-muted-foreground">
                            {attr.displayName}
                          </span>

                          <span className="font-bold text-emerald-300">
                            {Array.isArray(attr.recoveredValue)
                              ? attr.recoveredValue.join(', ')
                              : String(attr.recoveredValue)}
                          </span>

                          <span className="rounded bg-emerald-500/10 px-1 py-0.5 font-mono text-[8px] font-bold text-emerald-400">
                            {Math.round(attr.confidence * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-secondary/10 px-4 py-8 text-center">
                <Sparkles className="mx-auto h-5 w-5 text-muted-foreground" />

                <p className="mt-2 text-xs font-semibold text-foreground">
                  Awaiting recovered attributes
                </p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  Start an enrichment run to populate intelligence signals.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Explainability / trust layer */}
        <div
          className="
            flex items-start gap-3
            rounded-xl
            border border-emerald-500/15
            bg-emerald-500/5
            px-3.5 py-3
          "
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold text-foreground">
              Safe explainability enabled
            </p>

            <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
              Structured evidence metadata is available for recovered
              attributes without exposing internal model reasoning.
            </p>
          </div>

          <ShieldCheck className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-emerald-400" />
        </div>
      </CardContent>
    </Card>
  );
}
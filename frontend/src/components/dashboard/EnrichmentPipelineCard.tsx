
import {
  Sparkles,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
    .filter((p) => p.enrichedData && p.enrichedData.recoveredAttributes.length > 0)
    .slice(0, 3);

  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>AI Enrichment Pipeline</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Automated attribute recovery, brand normalization, and confidence auditing.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {onBatchEnrich && (
              <Button
                size="sm"
                onClick={onBatchEnrich}
                className="h-8 gap-1.5 bg-primary/90 hover:bg-primary text-xs font-semibold text-primary-foreground"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Batch Enrich</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        {/* Active Enrichment Job Banner */}
        {activeJobStatus && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  Active Pipeline Job: <code className="font-mono text-primary">{activeJobStatus.jobId}</code>
                </span>
              </div>
              <span className="text-xs font-semibold text-primary">
                {activeJobStatus.progress}% Complete
              </span>
            </div>

            <Progress value={activeJobStatus.progress} indicatorClassName="bg-primary" />

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>
                Processed {activeJobStatus.processedProducts} of {activeJobStatus.totalProducts} items
              </span>
              {activeJobStatus.estimatedTimeRemainingSeconds !== undefined && (
                <span>~{activeJobStatus.estimatedTimeRemainingSeconds}s remaining</span>
              )}
            </div>
          </div>
        )}

        {/* Live Recovered Attributes Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Recently Recovered Attributes & Explainability</span>
            </div>
            {onExploreCatalog && (
              <button
                onClick={onExploreCatalog}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <span>Full Catalog</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {enrichedProducts.map((product) => {
              const recovered = product.enrichedData?.recoveredAttributes || [];

              return (
                <div
                  key={product.id}
                  className="rounded-lg border border-border/50 bg-secondary/20 p-3 transition-all hover:bg-secondary/40 space-y-2"
                >
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusBadge status={product.status} />
                      <span className="truncate text-xs font-bold text-foreground">
                        {product.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] font-mono text-muted-foreground">{product.sku}</span>
                      <ConfidenceBadge score={product.confidenceScore} size="sm" />
                    </div>
                  </div>

                  {/* Recovered attribute pills */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {recovered.map((attr) => (
                      <div
                        key={attr.key}
                        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300"
                        title={`Extracted via ${attr.explainability.extractionMethod}: "${attr.explainability.evidenceSnippet}"`}
                      >
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        <span className="font-semibold">{attr.displayName}:</span>
                        <span className="font-medium text-emerald-200">
                          {Array.isArray(attr.recoveredValue)
                            ? attr.recoveredValue.join(', ')
                            : String(attr.recoveredValue)}
                        </span>
                        <span className="rounded bg-emerald-500/20 px-1 py-0.1 text-[9px] font-mono text-emerald-300">
                          {Math.round(attr.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explainability notice */}
        <div className="flex items-center gap-2 rounded-md bg-secondary/30 px-3 py-2 text-[11px] text-muted-foreground border border-border/40">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
          <span>
            Safe structured explainability metadata active on all recovered attributes. No internal reasoning exposed.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

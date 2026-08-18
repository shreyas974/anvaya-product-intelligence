
import { Copy, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SemanticDuplicateCluster } from '@/types/intelligence.types';

export interface DuplicateClustersCardProps {
  duplicateClusters: SemanticDuplicateCluster[];
  onViewDuplicates?: () => void;
  onMergeCluster?: (clusterId: string) => void;
}

export function DuplicateClustersCard({
  duplicateClusters,
  onViewDuplicates,
  onMergeCluster,
}: DuplicateClustersCardProps) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Copy className="h-4 w-4 text-primary" />
              <span>Semantic Duplicate Clusters</span>
            </CardTitle>
            <CardDescription className="text-xs">
              AI vector similarity detection identifying near-duplicate products across disparate vendor feeds.
            </CardDescription>
          </div>

          <div className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            Est. Savings: ₹63.5k/mo
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5 pt-1">
        {duplicateClusters.map((cluster) => {
          const simPct = Math.round(cluster.similarityScore * 100);

          return (
            <div
              key={cluster.clusterId}
              className="rounded-lg border border-border/60 bg-secondary/25 p-3.5 space-y-3 hover:bg-secondary/40 transition-colors"
            >
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">{cluster.clusterName}</span>
                  <span className="rounded bg-primary/15 border border-primary/30 px-1.5 py-0.2 text-[10px] font-mono text-primary">
                    {simPct}% match
                  </span>
                </div>
                {onMergeCluster && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMergeCluster(cluster.clusterId)}
                    className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
                  >
                    Merge Cluster
                  </Button>
                )}
              </div>

              {/* Canonical vs Duplicate comparison */}
              <div className="grid gap-2 text-xs sm:grid-cols-2">
                {/* Canonical */}
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <span>Canonical Master</span>
                    <span>Score: {cluster.canonicalProduct.qualityScore}</span>
                  </div>
                  <div className="font-semibold text-foreground truncate">
                    {cluster.canonicalProduct.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-mono">{cluster.canonicalProduct.sku}</span>
                    <span className="font-medium text-emerald-300">
                      ₹{cluster.canonicalProduct.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Duplicate */}
                {cluster.duplicates[0] && (
                  <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      <span>Detected Duplicate</span>
                      <span>{cluster.duplicates[0].sourceCatalog || 'Raw Feed'}</span>
                    </div>
                    <div className="font-semibold text-foreground truncate">
                      {cluster.duplicates[0].title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-mono">{cluster.duplicates[0].sku}</span>
                      <span className="font-medium text-rose-300">
                        ₹{cluster.duplicates[0].price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Discrepancy highlights */}
              {cluster.duplicates[0]?.discrepancySummary && (
                <div className="rounded bg-secondary/40 p-2 text-[11px] text-muted-foreground space-y-0.5">
                  <div className="font-medium text-foreground text-[10px] uppercase tracking-wider">
                    Variances Identified:
                  </div>
                  <ul className="list-disc pl-3 space-y-0.5">
                    {cluster.duplicates[0].discrepancySummary.map((disc, i) => (
                      <li key={i}>{disc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        {onViewDuplicates && (
          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDuplicates}
              className="text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Explore All Clusters &amp; Duplicates &rarr;</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

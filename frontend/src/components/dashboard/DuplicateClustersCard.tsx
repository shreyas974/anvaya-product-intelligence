import {
  Copy,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  GitMerge,
  CircleAlert,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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
  const totalDuplicates = duplicateClusters.reduce(
    (sum, cluster) => sum + cluster.duplicates.length,
    0
  );

  return (
    <Card className="group relative overflow-hidden border-border/70 bg-card shadow-lg shadow-black/5 transition-all duration-300 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/[0.06] blur-3xl transition-all duration-500 group-hover:bg-primary/[0.10]" />

      <CardHeader className="relative pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

          {/* Header */}
          <div>
            <div className="flex items-center gap-2.5">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Copy className="h-4 w-4 text-primary" />
              </div>

              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  Semantic Duplicate Intelligence
                </CardTitle>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                    AI similarity engine active
                  </span>
                </div>
              </div>
            </div>

            <CardDescription className="mt-2 max-w-2xl text-xs leading-relaxed">
              Vector similarity identifies near-identical products across
              disconnected vendor feeds and highlights the safest canonical
              record for consolidation.
            </CardDescription>
          </div>

          {/* Savings */}
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06] px-3.5 py-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Estimated savings
              </p>

              <p className="text-sm font-black text-emerald-400">
                ₹63.5k
                <span className="ml-1 text-[9px] font-medium text-muted-foreground">
                  / month
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Intelligence summary */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">

          <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Clusters
            </p>

            <p className="mt-1 text-xl font-black tracking-tight text-foreground">
              {duplicateClusters.length}
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Duplicates
            </p>

            <p className="mt-1 text-xl font-black tracking-tight text-foreground">
              {totalDuplicates}
            </p>
          </div>

          <div className="hidden rounded-xl border border-border/50 bg-secondary/20 p-3 sm:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Detection
            </p>

            <p className="mt-1 flex items-center gap-1.5 text-sm font-black text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              Active
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3 pt-0">

        {/* Section heading */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />

            <span className="text-[11px] font-bold text-foreground">
              Highest-confidence duplicate clusters
            </span>
          </div>

          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            Similarity audit
          </span>
        </div>

        {/* Clusters */}
        <div className="space-y-3">

          {duplicateClusters.map((cluster) => {
            const simPct = Math.round(cluster.similarityScore * 100);
            const duplicate = cluster.duplicates[0];

            return (
              <div
                key={cluster.clusterId}
                className="group/cluster relative overflow-hidden rounded-xl border border-border/50 bg-secondary/15 p-4 transition-all duration-300 hover:border-primary/20 hover:bg-primary/[0.025]"
              >

                {/* Cluster top */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex min-w-0 items-center gap-2">

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <GitMerge className="h-3.5 w-3.5 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">
                        {cluster.clusterName}
                      </p>

                      <p className="text-[9px] text-muted-foreground">
                        Cluster ID: {cluster.clusterId}
                      </p>
                    </div>

                    <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[9px] font-black text-primary">
                      {simPct}% match
                    </span>
                  </div>

                  {onMergeCluster && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMergeCluster(cluster.clusterId)}
                      className="h-8 shrink-0 gap-1.5 border-primary/25 bg-primary/[0.03] text-[10px] font-bold text-primary transition-all hover:bg-primary/10 hover:text-primary"
                    >
                      <GitMerge className="h-3 w-3" />
                      Merge Safely
                    </Button>
                  )}
                </div>

                {/* Comparison */}
                <div className="mt-3 grid gap-2 md:grid-cols-2">

                  {/* Canonical */}
                  <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/[0.045] p-3">

                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        Canonical master
                      </span>

                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                        {cluster.canonicalProduct.qualityScore} pts
                      </span>
                    </div>

                    <p className="truncate text-xs font-bold text-foreground">
                      {cluster.canonicalProduct.title}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                      <span className="font-mono">
                        {cluster.canonicalProduct.sku}
                      </span>

                      <span className="font-bold text-emerald-300">
                        ₹{cluster.canonicalProduct.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Duplicate */}
                  {duplicate ? (
                    <div className="relative overflow-hidden rounded-xl border border-rose-500/20 bg-rose-500/[0.045] p-3">

                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-rose-400">
                          <CircleAlert className="h-3 w-3" />
                          Detected duplicate
                        </span>

                        <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-rose-300">
                          {duplicate.sourceCatalog || 'Raw Feed'}
                        </span>
                      </div>

                      <p className="truncate text-xs font-bold text-foreground">
                        {duplicate.title}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                        <span className="font-mono">
                          {duplicate.sku}
                        </span>

                        <span className="font-bold text-rose-300">
                          ₹{duplicate.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-border/40 bg-secondary/20 p-3 text-[10px] text-muted-foreground">
                      No duplicate record available
                    </div>
                  )}
                </div>

                {/* Discrepancies */}
                {duplicate?.discrepancySummary &&
                  duplicate.discrepancySummary.length > 0 && (
                    <div className="mt-2.5 rounded-xl border border-border/40 bg-background/30 p-3">

                      <div className="mb-2 flex items-center gap-1.5">
                        <CircleAlert className="h-3 w-3 text-amber-400" />

                        <span className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                          Variances identified
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {duplicate.discrepancySummary.map((disc, index) => (
                          <span
                            key={index}
                            className="rounded-md border border-border/50 bg-secondary/40 px-2 py-1 text-[9px] font-medium text-muted-foreground"
                          >
                            {disc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Confidence line */}
                <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2.5">

                  <span className="text-[9px] text-muted-foreground">
                    Semantic similarity confidence
                  </span>

                  <span className="text-[10px] font-black text-primary">
                    {simPct}%
                  </span>
                </div>

                {/* Hover accent */}
                <div className="absolute bottom-0 left-4 right-4 h-px bg-border/30">
                  <div className="h-full w-1/4 bg-primary/50 transition-all duration-500 group-hover/cluster:w-full" />
                </div>
              </div>
            );
          })}

          {duplicateClusters.length === 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 text-center">

              <ShieldCheck className="mx-auto h-6 w-6 text-emerald-400" />

              <p className="mt-2 text-xs font-bold text-foreground">
                No semantic duplicates detected
              </p>

              <p className="mt-1 text-[10px] text-muted-foreground">
                Your catalog currently looks clean.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {onViewDuplicates && (
          <div className="flex items-center justify-between border-t border-border/40 pt-3">

            <div className="hidden items-center gap-1.5 text-[9px] text-muted-foreground sm:flex">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Canonical selection uses quality signals</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDuplicates}
              className="ml-auto h-8 gap-1.5 text-[10px] font-bold text-primary hover:bg-primary/10 hover:text-primary"
            >
              Explore all clusters
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* Bottom accent */}
      <div className="absolute inset-x-5 bottom-0 h-px overflow-hidden bg-border/30">
        <div className="h-full w-1/3 bg-primary/50 transition-all duration-700 group-hover:w-full" />
      </div>
    </Card>
  );
}
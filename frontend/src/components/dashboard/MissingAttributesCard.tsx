import {
  Wrench,
  Sparkles,
  ArrowRight,
  Search,
  ShieldAlert,
  Layers3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MissingAttributeAnomaly } from '@/types/quality.types';

export interface MissingAttributesCardProps {
  missingAttributes: MissingAttributeAnomaly[];
  onRecoverMissing?: (attributeName: string) => void;
}

export function MissingAttributesCard({
  missingAttributes,
  onRecoverMissing,
}: MissingAttributesCardProps) {
  const totalAffected = missingAttributes.reduce(
    (sum, item) => sum + item.affectedProductsCount,
    0
  );

  return (
    <Card className="group relative overflow-hidden border-border/70 bg-card shadow-lg shadow-black/5 transition-all duration-300 hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-500/[0.07] blur-3xl transition-all duration-500 group-hover:bg-amber-500/[0.12]" />

      <CardHeader className="relative pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          {/* Heading */}
          <div>
            <div className="flex items-center gap-2.5">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
              </div>

              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  Missing Attribute Recovery
                </CardTitle>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-400">
                    Recovery opportunities detected
                  </span>
                </div>
              </div>
            </div>

            <CardDescription className="mt-2 max-w-2xl text-xs leading-relaxed">
              Critical product attributes missing from vendor feeds and impacting
              search discovery, filtering, and catalog quality.
            </CardDescription>
          </div>

          {/* Summary */}
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-3.5 py-2.5">

            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Gaps
              </p>

              <p className="text-xl font-black tracking-tight text-amber-400">
                {missingAttributes.length}
              </p>
            </div>

            <div className="h-8 w-px bg-border/50" />

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Impact
              </p>

              <p className="text-sm font-black text-foreground">
                {totalAffected.toLocaleString()}
              </p>

              <p className="text-[9px] text-muted-foreground">
                affected SKUs
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3 pt-0">

        {/* Section label */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-primary" />

            <span className="text-[11px] font-bold text-foreground">
              Highest-impact recovery gaps
            </span>
          </div>

          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            AI detected
          </span>
        </div>

        {/* Missing attributes */}
        <div className="space-y-2.5">

          {missingAttributes.map((item, index) => (
            <div
              key={item.attributeName}
              className="group/item relative overflow-hidden rounded-xl border border-border/50 bg-secondary/20 p-3.5 transition-all duration-300 hover:border-amber-500/20 hover:bg-amber-500/[0.04]"
            >

              {/* Left severity accent */}
              <div className="absolute inset-y-0 left-0 w-0.5 bg-amber-400/60 transition-all duration-300 group-hover/item:bg-amber-400" />

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                {/* Attribute information */}
                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-1.5">

                    <span className="rounded-md border border-border/50 bg-background/50 px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                      {item.attributeName}
                    </span>

                    <span className="rounded-md bg-secondary/70 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.category}
                    </span>

                    <span className="rounded-md border border-amber-500/15 bg-amber-500/10 px-2 py-1 text-[9px] font-bold text-amber-400">
                      {item.affectedProductsCount.toLocaleString()} SKUs
                    </span>

                    {index === 0 && (
                      <span className="rounded-md border border-rose-500/15 bg-rose-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-rose-400">
                        Highest impact
                      </span>
                    )}
                  </div>

                  <p className="mt-2 max-w-3xl text-[11px] leading-relaxed text-muted-foreground">
                    {item.recommendation}
                  </p>
                </div>

                {/* Action */}
                {onRecoverMissing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRecoverMissing(item.attributeName)}
                    className="h-8 shrink-0 gap-1.5 border-primary/25 bg-primary/[0.04] text-[10px] font-bold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    <Sparkles className="h-3 w-3" />
                    Auto-Recover
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {missingAttributes.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] py-8 text-center">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>

              <p className="mt-3 text-xs font-bold text-foreground">
                Catalog attributes look healthy
              </p>

              <p className="mt-1 text-[10px] text-muted-foreground">
                No significant recovery gaps detected.
              </p>
            </div>
          )}
        </div>

        {/* Intelligence notice */}
        <div className="relative overflow-hidden rounded-xl border border-primary/15 bg-primary/[0.04] p-3">

          <div className="flex items-start gap-2.5">

            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Wrench className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold text-foreground">
                ANVAYA AI Recovery Engine
              </p>

              <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                LLM-powered entity extraction mines unstructured descriptions
                and specifications to recover missing attributes while preserving
                structured explainability metadata.
              </p>
            </div>

            <Layers3 className="ml-auto hidden h-4 w-4 shrink-0 text-primary/40 sm:block" />
          </div>
        </div>

      </CardContent>

      {/* Bottom accent */}
      <div className="absolute inset-x-5 bottom-0 h-px overflow-hidden bg-border/30">
        <div className="h-full w-1/3 bg-amber-400/50 transition-all duration-700 group-hover:w-full" />
      </div>
    </Card>
  );
}
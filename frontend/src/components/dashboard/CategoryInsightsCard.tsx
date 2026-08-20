import { useState } from 'react';
import {
  Layers,
  BarChart3,
  Package,
  TrendingUp,
  IndianRupee,
  Sparkles,
  ArrowUpRight,
  Target,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CategoryInsight } from '@/types/intelligence.types';

export interface CategoryInsightsCardProps {
  categories: CategoryInsight[];
  onCategorySelect?: (categorySlug: string) => void;
}

export function CategoryInsightsCard({
  categories,
  onCategorySelect,
}: CategoryInsightsCardProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    categories[0]?.categorySlug || 'electronics-mobiles'
  );

  const activeCategory =
    categories.find((c) => c.categorySlug === selectedSlug) || categories[0];

  const handleSelect = (slug: string) => {
    setSelectedSlug(slug);
    onCategorySelect?.(slug);
  };

  if (!activeCategory) return null;

  const qualityScore = Number(activeCategory.averageQualityScore);
  const qualityLabel =
    qualityScore >= 90
      ? 'Excellent'
      : qualityScore >= 80
        ? 'Healthy'
        : qualityScore >= 70
          ? 'Needs Attention'
          : 'Critical';

  return (
    <Card
      className="
        group relative overflow-hidden
        border-border/70 bg-card
        shadow-lg shadow-black/5
        transition-all duration-300
        hover:border-primary/20
        hover:shadow-xl hover:shadow-primary/5
      "
    >
      {/* Ambient background glow */}
      <div
        className="
          pointer-events-none absolute
          -right-24 -top-24
          h-64 w-64 rounded-full
          bg-primary/5 blur-3xl
        "
      />

      <CardHeader className="relative pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-xl
                  border border-primary/20
                  bg-primary/10
                  text-primary
                "
              >
                <BarChart3 className="h-4 w-4" />
              </div>

              <div>
                <CardTitle className="text-lg font-bold tracking-tight">
                  Category Intelligence
                </CardTitle>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                    AI benchmarking active
                  </span>
                </div>
              </div>
            </div>

            <CardDescription className="max-w-2xl text-xs leading-relaxed">
              Compare category health, market concentration, pricing signals,
              and attribute coverage across your catalog.
            </CardDescription>
          </div>

          {/* Intelligence badge */}
          <div
            className="
              flex w-fit items-center gap-2
              rounded-xl border border-primary/20
              bg-primary/5 px-3 py-2
            "
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Intelligence Layer
              </p>
              <p className="text-xs font-bold text-foreground">
                Category-aware
              </p>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="pt-3">
          <Tabs
            value={selectedSlug}
            onValueChange={handleSelect}
            className="w-full"
          >
            <TabsList
              className="
                h-auto w-full justify-start gap-1
                overflow-x-auto rounded-xl
                border border-border/50
                bg-secondary/30 p-1
              "
            >
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.categorySlug}
                  value={cat.categorySlug}
                  className="
                    whitespace-nowrap rounded-lg
                    px-3 py-1.5 text-xs font-semibold
                    transition-all duration-200
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    data-[state=active]:shadow-md
                    data-[state=active]:shadow-primary/20
                  "
                >
                  {cat.category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5 pt-0">
        {/* Category overview */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Products */}
          <div
            className="
              group/kpi relative overflow-hidden
              rounded-xl border border-border/50
              bg-secondary/20 p-3.5
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-primary/20
              hover:bg-primary/5
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Product Count
                </p>

                <p className="mt-1.5 text-xl font-black tracking-tight text-foreground">
                  {activeCategory.productCount.toLocaleString()}
                </p>

                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  active SKUs
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Quality */}
          <div
            className="
              group/kpi relative overflow-hidden
              rounded-xl border border-emerald-500/15
              bg-emerald-500/5 p-3.5
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-emerald-500/30
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Avg Quality
                </p>

                <div className="mt-1.5 flex items-baseline gap-1">
                  <p className="text-xl font-black tracking-tight text-emerald-400">
                    {activeCategory.averageQualityScore}
                  </p>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    /100
                  </span>
                </div>

                <p className="mt-0.5 text-[10px] font-semibold text-emerald-400">
                  {qualityLabel}
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Median price */}
          <div
            className="
              group/kpi relative overflow-hidden
              rounded-xl border border-border/50
              bg-secondary/20 p-3.5
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-primary/20
              hover:bg-primary/5
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Median Price
                </p>

                <p className="mt-1.5 text-xl font-black tracking-tight text-foreground">
                  ₹{activeCategory.priceRange.median.toLocaleString()}
                </p>

                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  market midpoint
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Completeness */}
          <div
            className="
              group/kpi relative overflow-hidden
              rounded-xl border border-blue-500/15
              bg-blue-500/5 p-3.5
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-blue-500/30
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Completeness
                </p>

                <p className="mt-1.5 text-xl font-black tracking-tight text-blue-400">
                  {activeCategory.completenessRate}%
                </p>

                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  attributes populated
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Target className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Market + coverage */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Brand concentration */}
          <div
            className="
              rounded-xl border border-border/50
              bg-secondary/15 p-4
            "
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary" />

                  <span className="text-xs font-bold text-foreground">
                    Brand Market Concentration
                  </span>
                </div>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Distribution across leading brands
                </p>
              </div>

              <span className="rounded-full border border-border/50 bg-secondary/40 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Market Share
              </span>
            </div>

            <div className="space-y-3">
              {activeCategory.topBrands.map((brand, index) => (
                <div key={brand.brand} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="
                          flex h-5 w-5 items-center justify-center
                          rounded-md bg-primary/10
                          text-[9px] font-black text-primary
                        "
                      >
                        {index + 1}
                      </span>

                      <span className="text-xs font-semibold text-foreground">
                        {brand.brand}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                      {brand.marketSharePct}%
                    </span>
                  </div>

                  <Progress
                    value={brand.marketSharePct}
                    indicatorClassName="bg-primary"
                  />

                  <div className="flex justify-end">
                    <span className="text-[9px] text-muted-foreground">
                      {brand.count.toLocaleString()} SKUs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attribute coverage */}
          <div
            className="
              rounded-xl border border-border/50
              bg-secondary/15 p-4
            "
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-emerald-400" />

                  <span className="text-xs font-bold text-foreground">
                    Key Attribute Coverage
                  </span>
                </div>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  AI-populated field coverage
                </p>
              </div>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                Live
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(activeCategory.keyAttributeCoverage).map(
                ([attr, rate]) => (
                  <div key={attr} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-secondary/50 px-2 py-1 font-mono text-[10px] font-semibold text-foreground">
                        {attr}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {rate >= 90 && (
                          <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                        )}

                        <span
                          className={`text-[10px] font-bold ${
                            rate >= 90
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {rate}%
                        </span>
                      </div>
                    </div>

                    <Progress
                      value={rate}
                      indicatorClassName={
                        rate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                      }
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom intelligence insight */}
        <div
          className="
            flex items-center gap-3
            rounded-xl border border-primary/15
            bg-primary/5 px-3.5 py-3
          "
        >
          <div
            className="
              flex h-8 w-8 shrink-0 items-center justify-center
              rounded-lg bg-primary/10 text-primary
            "
          >
            <Sparkles className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
              ANVAYA Intelligence
            </p>

            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              Category-level signals combine catalog quality, pricing,
              brand distribution, and attribute recovery to identify
              high-impact optimization opportunities.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
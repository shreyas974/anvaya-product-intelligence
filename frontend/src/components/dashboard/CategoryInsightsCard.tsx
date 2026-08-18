import { useState } from 'react';
import { Layers, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
    if (onCategorySelect) onCategorySelect(slug);
  };

  if (!activeCategory) return null;

  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Category Intelligence &amp; Benchmarking</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Quality health, price distributions, and brand market concentration across product categories.
            </CardDescription>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="pt-2 overflow-x-auto">
          <Tabs value={selectedSlug} onValueChange={handleSelect} className="w-full">
            <TabsList className="bg-secondary/40 border border-border/40">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.categorySlug}
                  value={cat.categorySlug}
                  onClick={() => handleSelect(cat.categorySlug)}
                  className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                >
                  {cat.category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Category KPIs */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/40 bg-secondary/25 p-3 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Product Count
            </span>
            <div className="text-lg font-bold text-foreground">
              {activeCategory.productCount.toLocaleString()} SKUs
            </div>
          </div>

          <div className="rounded-lg border border-border/40 bg-secondary/25 p-3 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Avg Quality Score
            </span>
            <div className="text-lg font-bold text-emerald-400">
              {activeCategory.averageQualityScore} pts
            </div>
          </div>

          <div className="rounded-lg border border-border/40 bg-secondary/25 p-3 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Median Price
            </span>
            <div className="text-lg font-bold text-foreground">
              ₹{activeCategory.priceRange.median.toLocaleString()}
            </div>
          </div>

          <div className="rounded-lg border border-border/40 bg-secondary/25 p-3 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Completeness
            </span>
            <div className="text-lg font-bold text-primary">
              {activeCategory.completenessRate}%
            </div>
          </div>
        </div>

        {/* Top Brands Distribution & Attribute Coverage */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Brands */}
          <div className="rounded-lg border border-border/50 bg-secondary/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span>Brand Market Concentration</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Market Share</span>
            </div>

            <div className="space-y-2.5">
              {activeCategory.topBrands.map((brand) => (
                <div key={brand.brand} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{brand.brand}</span>
                    <span className="font-mono text-muted-foreground text-[11px]">
                      {brand.count} SKUs ({brand.marketSharePct}%)
                    </span>
                  </div>
                  <Progress
                    value={brand.marketSharePct}
                    indicatorClassName="bg-primary/80"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Key Attribute Coverage */}
          <div className="rounded-lg border border-border/50 bg-secondary/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span>Key Attribute Fill Rates</span>
              <span className="text-[10px] text-muted-foreground">% Populated</span>
            </div>

            <div className="space-y-2.5">
              {Object.entries(activeCategory.keyAttributeCoverage).map(([attr, rate]) => (
                <div key={attr} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-foreground">{attr}</span>
                    <span className="font-semibold text-emerald-400 text-[11px]">{rate}%</span>
                  </div>
                  <Progress
                    value={rate}
                    indicatorClassName={rate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

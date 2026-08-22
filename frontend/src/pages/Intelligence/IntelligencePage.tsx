import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Copy,
  DollarSign,
  GitBranch,
  Layers3,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { PageHeader } from '@/components/common/PageHeader';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import {
  CategoryInsight,
  MarketTrendInsight,
  SemanticDuplicateCluster,
  TaxonomyNode,
} from '@/types/intelligence.types';

import {
  intelligenceService,
} from '@/services/intelligence.service';

import {
  mockAnomalyInsightSummary,
  mockMarketTrendInsights,
} from '@/services/mocks/mockIntelligence';

function formatCurrency(value: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function scoreClass(score: number) {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 80) return 'text-amber-600';
  return 'text-red-600';
}

function TaxonomyTree({
  nodes,
  expanded,
  onToggle,
}: {
  nodes: TaxonomyNode[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const isExpanded = expanded.has(node.id);

        return (
          <div key={node.id}>
            <div
              className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/60 cursor-pointer"
              onClick={() => hasChildren && onToggle(node.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )
                ) : (
                  <span className="w-4" />
                )}

                <Layers3 className="h-4 w-4 text-primary shrink-0" />

                <span className="font-medium truncate">
                  {node.name}
                </span>

                <span className="text-xs text-muted-foreground">
                  L{node.level}
                </span>
              </div>

              <span className="text-sm text-muted-foreground">
                {node.productCount.toLocaleString()} products
              </span>
            </div>

            {isExpanded && node.children && (
              <div className="ml-6 border-l pl-2">
                <TaxonomyTree
                  nodes={node.children}
                  expanded={expanded}
                  onToggle={onToggle}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CategoryOverview({ category }: { category: CategoryInsight }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Products</p>
            <p className="text-2xl font-bold">
              {category.productCount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Average Quality
            </p>
            <p className={`text-2xl font-bold ${scoreClass(category.averageQualityScore)}`}>
              {category.averageQualityScore.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Completeness
            </p>
            <p className="text-2xl font-bold">
              {category.completenessRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Average Price
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(category.averagePrice, category.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Brand Market Share
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {category.topBrands.map((brand) => (
              <div key={brand.brand} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{brand.brand}</span>
                  <span className="text-muted-foreground">
                    {brand.marketSharePct.toFixed(1)}%
                  </span>
                </div>

                <Progress value={brand.marketSharePct} />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{brand.count} products</span>
                  <span>
                    Quality {brand.averageQualityScore.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Attribute Coverage</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {Object.entries(category.keyAttributeCoverage).map(
              ([attribute, coverage]) => (
                <div key={attribute} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">
                      {attribute.replace(/_/g, ' ')}
                    </span>
                    <span>{coverage}%</span>
                  </div>

                  <Progress value={coverage} />
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Common Missing Attributes</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {category.commonMissingAttributes.map((attribute) => (
                <span
                  key={attribute}
                  className="rounded-full border bg-muted px-3 py-1.5 text-sm"
                >
                  {attribute.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Intelligence</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Minimum</p>
              <p className="font-semibold">
                {formatCurrency(category.priceRange.min, category.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Maximum</p>
              <p className="font-semibold">
                {formatCurrency(category.priceRange.max, category.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Median</p>
              <p className="font-semibold">
                {formatCurrency(category.priceRange.median, category.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="font-semibold">
                {formatCurrency(category.priceRange.average, category.currency)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DuplicateClusterCard({
  cluster,
}: {
  cluster: SemanticDuplicateCluster;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              {cluster.clusterName}
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Cluster {cluster.clusterId}
            </p>
          </div>

          <ConfidenceBadge score={cluster.matchConfidence} />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              Similarity
            </p>
            <p className="text-xl font-bold">
              {(cluster.similarityScore * 100).toFixed(0)}%
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              Match Confidence
            </p>
            <p className="text-xl font-bold">
              {(cluster.matchConfidence * 100).toFixed(0)}%
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              Savings Potential
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {formatCurrency(
                cluster.estimatedCostSavingsPotential ?? 0,
                'INR'
              )}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">
            Match Criteria
          </p>

          <div className="flex flex-wrap gap-2">
            {cluster.matchCriteria.map((criteria) => (
              <span
                key={criteria}
                className="rounded-full border px-3 py-1 text-xs"
              >
                {criteria.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <p className="mb-2 text-sm font-semibold">
            Canonical Product
          </p>

          <div className="grid gap-2 md:grid-cols-4 text-sm">
            <div>
              <span className="text-muted-foreground">SKU</span>
              <p className="font-medium">{cluster.canonicalProduct.sku}</p>
            </div>

            <div className="md:col-span-2">
              <span className="text-muted-foreground">Title</span>
              <p className="font-medium">
                {cluster.canonicalProduct.title}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground">Quality</span>
              <p className="font-medium">
                {cluster.canonicalProduct.qualityScore}
              </p>
            </div>
          </div>
        </div>

        {cluster.duplicates.map((duplicate) => (
          <div
            key={duplicate.id}
            className="rounded-lg border border-dashed p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:justify-between">
              <div>
                <p className="font-semibold">{duplicate.title}</p>
                <p className="text-sm text-muted-foreground">
                  {duplicate.sku} · {duplicate.brand}
                </p>
              </div>

              <div className="text-sm md:text-right">
                <p className="font-semibold">
                  {formatCurrency(duplicate.price, duplicate.currency)}
                </p>
                <p className="text-muted-foreground">
                  {(duplicate.similarityScore * 100).toFixed(0)}% similar
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {duplicate.discrepancySummary.map((item) => (
                <div
                  key={item}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TrendCard({ trend }: { trend: MarketTrendInsight }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-lg bg-primary/10 p-2">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>

          <ConfidenceBadge score={trend.confidence} />
        </div>

        <h3 className="mt-4 font-semibold">{trend.title}</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          {trend.category}
        </p>

        <p className="mt-4 text-sm leading-6">
          {trend.summary}
        </p>

        <div className="mt-5 rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            {trend.metricChange.label}
          </p>
          <p
            className={`mt-1 text-lg font-bold ${trend.metricChange.positive
                ? 'text-emerald-600'
                : 'text-red-600'
              }`}
          >
            {trend.metricChange.value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function IntelligencePage() {
  const [categories, setCategories] = useState<CategoryInsight[]>([]);
  const [duplicates, setDuplicates] = useState<SemanticDuplicateCluster[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyNode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const [categoryData, duplicateData, taxonomyData] =
        await Promise.all([
          intelligenceService.fetchCategoryInsights(),
          intelligenceService.fetchDuplicates(),
          intelligenceService.fetchTaxonomy(),
        ]);

      if (!mounted) return;

      setCategories(categoryData);
      setDuplicates(duplicateData);
      setTaxonomy(taxonomyData);
      setSelectedCategory(categoryData[0]?.categorySlug ?? '');
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const selected = useMemo(
    () =>
      categories.find(
        (category) => category.categorySlug === selectedCategory
      ),
    [categories, selectedCategory]
  );

  const filteredDuplicates = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return duplicates;

    return duplicates.filter((cluster) =>
      [
        cluster.clusterName,
        cluster.clusterId,
        cluster.canonicalProduct.title,
        cluster.canonicalProduct.sku,
        ...cluster.duplicates.flatMap((duplicate) => [
          duplicate.title,
          duplicate.sku,
          duplicate.brand,
        ]),
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [duplicates, search]);

  const toggleNode = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Intelligence"
          description="AI-powered category, duplicate, taxonomy and market intelligence."
        />
        <SkeletonLoader />
        <SkeletonLoader />
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog Intelligence"
        description="Turn catalog data into actionable intelligence using semantic analysis, benchmarking and AI-driven insights."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="group overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
          <CardContent className="relative p-5">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-300 group-hover:bg-primary/20" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Categories
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {categories.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Active catalog segments
                </p>
              </div>
              <div className="rounded-xl border border-primary/15 bg-primary/10 p-3 transition-transform duration-300 group-hover:scale-110">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
          <CardContent className="relative p-5">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-300 group-hover:bg-primary/20" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Duplicate Clusters
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {duplicates.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Semantic matches detected
                </p>
              </div>
              <div className="rounded-xl border border-primary/15 bg-primary/10 p-3 transition-transform duration-300 group-hover:scale-110">
                <Copy className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
          <CardContent className="relative p-5">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-300 group-hover:bg-primary/20" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Taxonomy Roots
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {taxonomy.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Canonical hierarchy nodes
                </p>
              </div>
              <div className="rounded-xl border border-primary/15 bg-primary/10 p-3 transition-transform duration-300 group-hover:scale-110">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
          <CardContent className="relative p-5">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-300 group-hover:bg-primary/20" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Auto Remediation
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {mockAnomalyInsightSummary.autoRemediationRatePct}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Issues resolved automatically
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 p-3 transition-transform duration-300 group-hover:scale-110">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="categories">
            Category Intelligence
          </TabsTrigger>
          <TabsTrigger value="duplicates">
            Duplicate Intelligence
          </TabsTrigger>
          <TabsTrigger value="taxonomy">
            Taxonomy Explorer
          </TabsTrigger>
          <TabsTrigger value="trends">
            Market & Anomalies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Benchmarking</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.categorySlug}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(category.categorySlug)
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${selectedCategory === category.categorySlug
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                      }`}
                  >
                    {category.category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selected && <CategoryOverview category={selected} />}
        </TabsContent>

        <TabsContent value="duplicates" className="mt-6 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search duplicate clusters, SKU or product..."
                  className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          {filteredDuplicates.length > 0 ? (
            filteredDuplicates.map((cluster) => (
              <DuplicateClusterCard
                key={cluster.clusterId}
                cluster={cluster}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No duplicate clusters match your search.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="taxonomy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Canonical Taxonomy
              </CardTitle>
            </CardHeader>

            <CardContent>
              <TaxonomyTree
                nodes={taxonomy}
                expanded={expanded}
                onToggle={toggleNode}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6 space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Market Trends
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {mockMarketTrendInsights.map((trend) => (
                <TrendCard key={trend.id} trend={trend} />
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Anomaly Intelligence
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Total Anomalies
                  </p>
                  <p className="text-2xl font-bold">
                    {mockAnomalyInsightSummary.totalAnomalies}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Highest Risk Category
                  </p>
                  <p className="text-lg font-bold">
                    {mockAnomalyInsightSummary.highestRiskCategory}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Auto Remediation
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {mockAnomalyInsightSummary.autoRemediationRatePct}%
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 font-semibold">
                  Anomaly Distribution
                </p>

                <div className="space-y-3">
                  {Object.entries(
                    mockAnomalyInsightSummary.distributionByType
                  ).map(([type, count]) => (
                    <div key={type}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="capitalize">
                          {type.replace(/_/g, ' ')}
                        </span>
                        <span>{count}</span>
                      </div>

                      <Progress
                        value={
                          (count /
                            mockAnomalyInsightSummary.totalAnomalies) *
                          100
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 font-semibold">
                  Common Root Causes
                </p>

                <div className="space-y-2">
                  {mockAnomalyInsightSummary.commonRootCauses.map(
                    (cause) => (
                      <div
                        key={cause}
                        className="rounded-lg border p-3 text-sm"
                      >
                        {cause}
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

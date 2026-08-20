import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Brain,
  GitMerge,
  RefreshCw,
  Search,
  Tags,
  TrendingUp,
} from 'lucide-react';

import { intelligenceService } from '@/services/intelligence.service';
import type {
  AnomalyInsightSummary,
  CategoryInsight,
  MarketTrendInsight,
  SemanticDuplicateCluster,
  TaxonomyNode,
} from '@/types/intelligence.types';

import { PageHeader } from '@/components/common/PageHeader';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { StatCard } from '@/components/common/StatCard';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

export function IntelligencePage() {
  const [categories, setCategories] = useState<CategoryInsight[]>([]);
  const [duplicates, setDuplicates] = useState<SemanticDuplicateCluster[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyNode[]>([]);
  const [trends, setTrends] = useState<MarketTrendInsight[]>([]);
  const [anomalySummary, setAnomalySummary] =
    useState<AnomalyInsightSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadIntelligenceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        categoryResponse,
        duplicateResponse,
        taxonomyResponse,
      ] = await Promise.all([
        intelligenceService.fetchCategoryInsights(),
        intelligenceService.fetchDuplicates({ page: 1, limit: 50 }),
        intelligenceService.fetchTaxonomy(),
      ]);

      setCategories(categoryResponse);
      setDuplicates(duplicateResponse);
      setTaxonomy(taxonomyResponse);

      // These two datasets are currently mock-backed and are not exposed
      // by the service yet, so derive them from the available mock-backed
      // intelligence responses where possible.
      setTrends([]);
      setAnomalySummary(null);
    } catch (err) {
      console.error('Failed to load intelligence data:', err);
      setError('Unable to load intelligence data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIntelligenceData();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !query ||
        category.category.toLowerCase().includes(query) ||
        category.topBrands.some((brand) =>
          brand.brand.toLowerCase().includes(query)
        ) ||
        category.commonMissingAttributes.some((attribute) =>
          attribute.toLowerCase().includes(query)
        );

      const matchesCategory =
        selectedCategory === 'all' ||
        category.categorySlug === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [categories, search, selectedCategory]);

  const totalProducts = categories.reduce(
    (sum, category) => sum + category.productCount,
    0
  );

  const averageQuality = categories.length
    ? categories.reduce(
        (sum, category) => sum + category.averageQualityScore,
        0
      ) / categories.length
    : 0;

  const duplicateSavings = duplicates.reduce(
    (sum, cluster) => sum + (cluster.estimatedCostSavingsPotential ?? 0),
    0
  );

  const taxonomyNodes = useMemo(() => {
    const countNodes = (nodes: TaxonomyNode[]): number =>
      nodes.reduce(
        (count, node) =>
          count + 1 + (node.children ? countNodes(node.children) : 0),
        0
      );

    return countNodes(taxonomy);
  }, [taxonomy]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Intelligence"
          description="AI-powered category insights, semantic deduplication, and catalog intelligence."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </div>

        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Intelligence"
          description="AI-powered category insights, semantic deduplication, and catalog intelligence."
        />

        <EmptyState
          icon={AlertTriangle}
          title="Intelligence data unavailable"
          description={error}
          action={
            <Button onClick={() => void loadIntelligenceData()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intelligence"
        description="AI-powered category insights, semantic deduplication, and catalog intelligence."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadIntelligenceData()}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Categories Analyzed"
          value={categories.length}
          icon={Brain}
        />
        <StatCard
          title="Products Analyzed"
          value={totalProducts.toLocaleString()}
          icon={Tags}
        />
        <StatCard
          title="Average Quality"
          value={`${averageQuality.toFixed(1)}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Duplicate Savings"
          value={`₹${duplicateSavings.toLocaleString('en-IN')}`}
          icon={GitMerge}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Category Intelligence</h2>
          <p className="text-sm text-muted-foreground">
            Compare catalog quality, completeness, pricing, brands, and attribute coverage by category.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories, brands, or missing attributes..."
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.categorySlug} value={category.categorySlug}>
                {category.category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filteredCategories.map((category) => (
            <div
              key={category.categorySlug}
              className="rounded-lg border border-border/70 bg-background/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{category.category}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category.productCount.toLocaleString()} products
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {category.averageQualityScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    quality score
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Completeness</p>
                  <p className="mt-1 font-semibold">
                    {category.completenessRate.toFixed(1)}%
                  </p>
                </div>

                <div className="rounded-md bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Avg. Price</p>
                  <p className="mt-1 font-semibold">
                    ₹{category.averagePrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium">Top brands</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {category.topBrands.map((brand) => (
                    <span
                      key={brand.brand}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs"
                    >
                      {brand.brand} · {brand.marketSharePct.toFixed(1)}%
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium">Common missing attributes</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {category.commonMissingAttributes.map((attribute) => (
                    <span
                      key={attribute}
                      className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
                    >
                      {attribute.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium">No categories found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try changing your search or category filter.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Semantic Duplicate Clusters</h2>
          <p className="text-sm text-muted-foreground">
            AI-detected product groups that can be consolidated into canonical catalog records.
          </p>
        </div>

        <div className="space-y-3">
          {duplicates.map((cluster) => (
            <div
              key={cluster.clusterId}
              className="rounded-lg border border-border/70 bg-background/50 p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="font-medium">{cluster.clusterName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Canonical: {cluster.canonicalProduct.title}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ConfidenceBadge
                      score={cluster.matchConfidence}
                      size="sm"
                    />

                    <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                      Similarity {(cluster.similarityScore * 100).toFixed(0)}%
                    </span>

                    <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                      {cluster.duplicates.length} duplicate
                      {cluster.duplicates.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {cluster.estimatedCostSavingsPotential !== undefined && (
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-muted-foreground">
                      Estimated savings
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      ₹
                      {cluster.estimatedCostSavingsPotential.toLocaleString(
                        'en-IN'
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {cluster.duplicates.map((duplicate) => (
                  <div
                    key={duplicate.id}
                    className="rounded-md bg-secondary/60 p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {duplicate.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {duplicate.sku} · {duplicate.brand}
                        </p>
                      </div>

                      <span className="text-xs font-medium">
                        {(duplicate.similarityScore * 100).toFixed(0)}% match
                      </span>
                    </div>

                    {duplicate.discrepancySummary.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {duplicate.discrepancySummary.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Canonical Taxonomy</h2>
            <p className="text-sm text-muted-foreground">
              Structured category hierarchy and attribute requirements used by ANVAYA.
            </p>
          </div>

          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
            {taxonomyNodes} nodes
          </span>
        </div>

        <div className="space-y-3">
          {taxonomy.map((node) => (
            <TaxonomyBranch key={node.id} node={node} />
          ))}
        </div>
      </div>

      {trends.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Market Trends</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {trends.map((trend) => (
              <div
                key={trend.id}
                className="rounded-lg border border-border/70 p-4"
              >
                <h3 className="font-medium">{trend.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {trend.summary}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs">{trend.metricChange.label}</span>
                  <span className="text-sm font-semibold">
                    {trend.metricChange.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {anomalySummary && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Anomaly Intelligence</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Highest risk category: {anomalySummary.highestRiskCategory}
          </p>
        </div>
      )}
    </div>
  );
}

function TaxonomyBranch({ node }: { node: TaxonomyNode }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">{node.name}</p>
          <p className="text-xs text-muted-foreground">
            Level {node.level} · {node.productCount.toLocaleString()} products
          </p>
        </div>

        {node.attributeSchema && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">
            {node.attributeSchema.length} attributes
          </span>
        )}
      </div>

      {node.attributeSchema && node.attributeSchema.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {node.attributeSchema.map((attribute) => (
            <span
              key={attribute.name}
              className="rounded-md border border-border px-2 py-1 text-xs"
            >
              {attribute.displayName}
              {attribute.required ? ' · required' : ''}
            </span>
          ))}
        </div>
      )}

      {node.children && node.children.length > 0 && (
        <div className="mt-3 space-y-2 border-l border-border pl-4">
          {node.children.map((child) => (
            <TaxonomyBranch key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Sparkles,
  Tag,
} from 'lucide-react';

import { productsService } from '@/services/products.service';
import type { Product, ProductStatus } from '@/types/product.types';
import type { EnrichmentStatus } from '@/types/enrichment.types';

import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { Button } from '@/components/ui/button';

type SortField =
  | 'title'
  | 'brand'
  | 'category'
  | 'qualityScore'
  | 'confidenceScore';

type SortDirection = 'asc' | 'desc';

interface ProductsPageProps {
  onProductSelect: (productId: string) => void;
}

export function ProductsPage({
  onProductSelect,
}: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [enrichmentStatus, setEnrichmentStatus] =
    useState<EnrichmentStatus | ''>('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [minQuality, setMinQuality] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] =
    useState<SortDirection>('asc');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productsService.fetchProducts({
        page: 1,
        limit: 100,
      });

      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category))).sort(),
    [products]
  );

  const brands = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.brand))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        !query ||
        [product.title, product.sku, product.brand, product.category].some(
          (value) => value.toLowerCase().includes(query)
        );

      const matchesCategory =
        !category || product.category === category;

      const matchesBrand =
        !brand || product.brand === brand;

      const matchesEnrichment =
        !enrichmentStatus ||
        product.enrichmentStatus === enrichmentStatus;

      const matchesStatus =
        !status || product.status === status;

      const matchesQuality =
        !minQuality ||
        product.qualityScore >= Number(minQuality);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesEnrichment &&
        matchesStatus &&
        matchesQuality
      );
    });

    return filtered.sort((a, b) => {
      let comparison = 0;

      if (
        sortField === 'qualityScore' ||
        sortField === 'confidenceScore'
      ) {
        comparison =
          Number(a[sortField]) - Number(b[sortField]);
      } else {
        comparison = String(a[sortField]).localeCompare(
          String(b[sortField])
        );
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [
    products,
    search,
    category,
    brand,
    enrichmentStatus,
    status,
    minQuality,
    sortField,
    sortDirection,
  ]);

  const stats = useMemo(() => {
    const enriched = products.filter(
      (product) => product.enrichmentStatus === 'enriched'
    ).length;

    const needsReview = products.filter(
      (product) => product.enrichmentStatus === 'needs_review'
    ).length;

    const averageQuality =
      products.length > 0
        ? Math.round(
          products.reduce(
            (total, product) => total + product.qualityScore,
            0
          ) / products.length
        )
        : 0;

    return {
      total: products.length,
      enriched,
      needsReview,
      averageQuality,
    };
  }, [products]);

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setEnrichmentStatus('');
    setStatus('');
    setMinQuality('');
    setSortField('title');
    setSortDirection('asc');
  };

  const hasActiveFilters =
    search ||
    category ||
    brand ||
    enrichmentStatus ||
    status ||
    minQuality;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage, inspect, and enrich your product catalog."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadProducts()}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-4">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
      ) : error ? (
        <EmptyState
          icon={Package}
          title="Unable to load products"
          description={error}
          action={
            <Button onClick={() => void loadProducts()}>
              Try Again
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Products"
              value={stats.total}
              icon={Package}
            />

            <StatCard
              title="Enriched"
              value={stats.enriched}
              icon={Package}
            />

            <StatCard
              title="Needs Review"
              value={stats.needsReview}
              icon={Package}
            />

            <StatCard
              title="Avg. Quality"
              value={`${stats.averageQuality}%`}
              icon={Package}
            />
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">Search & Filters</h2>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, SKU, brand or category..."
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Brands</option>
                {brands.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={enrichmentStatus}
                onChange={(event) =>
                  setEnrichmentStatus(
                    event.target.value as EnrichmentStatus | ''
                  )
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Enrichment</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="enriched">Enriched</option>
                <option value="failed">Failed</option>
                <option value="needs_review">Needs Review</option>
              </select>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ProductStatus | '')
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="raw">Raw</option>
                <option value="cleaned">Cleaned</option>
                <option value="enriched">Enriched</option>
                <option value="flagged">Flagged</option>
                <option value="approved">Approved</option>
              </select>

              <select
                value={minQuality}
                onChange={(event) => setMinQuality(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Any Quality</option>
                <option value="90">90%+</option>
                <option value="80">80%+</option>
                <option value="70">70%+</option>
                <option value="60">60%+</option>
              </select>

              <select
                value={`${sortField}:${sortDirection}`}
                onChange={(event) => {
                  const [field, direction] =
                    event.target.value.split(':') as [
                      SortField,
                      SortDirection
                    ];

                  setSortField(field);
                  setSortDirection(direction);
                }}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="title:asc">Name A–Z</option>
                <option value="title:desc">Name Z–A</option>
                <option value="brand:asc">Brand A–Z</option>
                <option value="brand:desc">Brand Z–A</option>
                <option value="qualityScore:desc">
                  Quality: High → Low
                </option>
                <option value="qualityScore:asc">
                  Quality: Low → High
                </option>
                <option value="confidenceScore:desc">
                  Confidence: High → Low
                </option>
                <option value="confidenceScore:asc">
                  Confidence: Low → High
                </option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="Try changing your search or filter criteria."
              action={
                hasActiveFilters ? (
                  <Button onClick={resetFilters}>
                    Reset Filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onProductSelect(product.id)}
                  className="
        group relative overflow-hidden rounded-2xl
        border border-border/70
        bg-card text-left
        shadow-sm
        transition-all duration-300 ease-out
        hover:-translate-y-1.5
        hover:border-primary/40
        hover:shadow-2xl hover:shadow-primary/10
        focus:outline-none
        focus:ring-2 focus:ring-primary/40
      "
                >
                  {/* Top intelligence glow */}
                  <div
                    className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-gradient-to-r from-transparent via-primary/70 to-transparent
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
                  />

                  {/* Product visual */}
                  <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-cyan-500/5">
                    <div
                      className="
            absolute h-32 w-32 rounded-full
            bg-primary/10 blur-3xl
            transition-all duration-500
            group-hover:scale-125
            group-hover:bg-primary/15
          "
                    />

                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="
                          relative z-10 h-32 w-32 object-contain
                          drop-shadow-xl
                          transition-transform duration-500 ease-out
                          group-hover:scale-110
                        "
                      />
                    ) : (
                      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl border border-border/60 bg-background/60 text-muted-foreground">
                        <Package className="h-10 w-10" />
                      </div>
                    )}

                    {/* Status */}
                    <div className="absolute left-3 top-3 z-20">
                      <StatusBadge status={product.status} />
                    </div>

                    {/* Open indicator */}
                    <div
                      className="
            absolute right-3 top-3 z-20
            flex h-8 w-8 items-center justify-center
            rounded-full border border-border/60
            bg-background/70 backdrop-blur
            opacity-0
            translate-x-2
            transition-all duration-300
            group-hover:translate-x-0
            group-hover:opacity-100
          "
                    >
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>

                  {/* Product information */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold tracking-tight text-foreground">
                          {product.title}
                        </p>

                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>

                      <Sparkles
                        className="
              h-4 w-4 shrink-0 text-primary/40
              transition-all duration-300
              group-hover:scale-110
              group-hover:text-primary
            "
                      />
                    </div>

                    {/* Brand / category */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/40 px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        {product.brand}
                      </span>

                      <span className="truncate rounded-lg border border-border/60 bg-secondary/40 px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground">
                        {product.category}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Quality
                        </p>

                        <div className="mt-1.5 flex items-end gap-1">
                          <span className="text-lg font-black text-foreground">
                            {product.qualityScore}
                          </span>
                          <span className="mb-0.5 text-[10px] font-semibold text-muted-foreground">
                            %
                          </span>
                        </div>

                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{
                              width: `${Math.min(product.qualityScore, 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Confidence
                        </p>

                        <div className="mt-2">
                          <ConfidenceBadge score={product.confidenceScore} />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                      <span className="text-[10px] font-semibold capitalize text-muted-foreground">
                        {product.enrichmentStatus.replace('_', ' ')}
                      </span>

                      <span className="flex items-center gap-1 text-[10px] font-bold text-primary opacity-70 transition-all duration-300 group-hover:gap-2 group-hover:opacity-100">
                        Inspect
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}

            </div>
          )}
        </>
      )
      }
    </div >
  );
}
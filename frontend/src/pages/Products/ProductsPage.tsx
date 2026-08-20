import { useEffect, useMemo, useState } from 'react';
import { Package, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';

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
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Brand
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Quality
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Confidence
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Enrichment
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        onClick={() => onProductSelect(product.id)}
                        className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/20"
                      >
                        <td className="max-w-xs px-4 py-4">
                          <div className="font-medium text-foreground">
                            {product.title}
                          </div>

                          <div className="mt-1 font-mono text-xs text-muted-foreground">
                            {product.sku}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-muted-foreground">
                          {product.brand}
                        </td>

                        <td className="max-w-xs px-4 py-4 text-muted-foreground">
                          {product.category}
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-semibold">
                            {product.qualityScore}%
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <ConfidenceBadge
                            score={product.confidenceScore}
                          />
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-xs font-medium text-muted-foreground capitalize">
                            {product.enrichmentStatus.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={product.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
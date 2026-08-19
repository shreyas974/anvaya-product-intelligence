import { useEffect, useMemo, useState } from 'react';
import { Package, RefreshCw, Search } from 'lucide-react';

import { productsService } from '@/services/products.service';
import type { Product } from '@/types/product.types';

import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { Button } from '@/components/ui/button';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
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

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [product.title, product.sku, product.brand, product.category].some(
        (value) => value.toLowerCase().includes(query)
      )
    );
  }, [products, search]);

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

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, SKU, brand or category..."
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="Try changing your search criteria."
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
                        className="border-b border-border last:border-0 hover:bg-muted/20"
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
                          <span className="text-xs font-medium text-muted-foreground capitalize">{product.enrichmentStatus.replace("_", " ")}</span>
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

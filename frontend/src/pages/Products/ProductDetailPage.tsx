import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Package,
    RefreshCw,
} from 'lucide-react';

import { productsService } from '@/services/products.service';
import type { Product } from '@/types/product.types';

import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { Button } from '@/components/ui/button';

interface ProductDetailPageProps {
    productId: string;
    onBack: () => void;
}

export function ProductDetailPage({
    productId,
    onBack,
}: ProductDetailPageProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await productsService.fetchProductById(productId);
            setProduct(data);
        } catch (err) {
            console.error('Failed to load product:', err);
            setError('Unable to load this product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Product Details"
                    description="Loading product information..."
                />

                <div className="space-y-4">
                    <div className="h-32 animate-pulse rounded-lg border border-border bg-muted/30" />
                    <div className="h-48 animate-pulse rounded-lg border border-border bg-muted/30" />
                    <div className="h-48 animate-pulse rounded-lg border border-border bg-muted/30" />
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Product Details"
                    description="The requested product could not be loaded."
                    actions={
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Products
                        </Button>
                    }
                />

                <EmptyState
                    icon={Package}
                    title="Unable to load product"
                    description={error ?? 'Product not found.'}
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onBack}>
                                Back to Products
                            </Button>

                            <Button onClick={() => void loadProduct()}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        </div>
                    }
                />
            </div>
        );
    }

    const attributes = Object.entries(product.attributes ?? {});
    const normalizedAttributes = Object.entries(
        product.enrichedData?.normalizedAttributes ?? {}
    );

    const recoveredAttributes =
        product.enrichedData?.recoveredAttributes ?? [];

    const missingAttributes =
        product.enrichedData?.missingAttributes ?? [];

    return (
        <div className="space-y-6">
            <PageHeader
                title={product.title}
                description={`${product.brand} • ${product.category}`}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => void loadProduct()}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                }
            />

            {/* Product overview */}
            <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Images */}
                    <div className="w-full lg:w-1/3">
                        {product.images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {product.images.map((image, index) => (
                                    <img
                                        key={`${image}-${index}`}
                                        src={image}
                                        alt={`${product.title} ${index + 1}`}
                                        className="aspect-square w-full rounded-lg border border-border object-cover"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
                                <Package className="h-12 w-12 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Basic information */}
                    <div className="flex-1 space-y-5">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                SKU
                            </p>
                            <p className="mt-1 font-mono text-sm">{product.sku}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Description
                            </p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {product.description || 'No description available.'}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg border border-border p-4">
                                <p className="text-xs text-muted-foreground">
                                    Price
                                </p>
                                <p className="mt-1 text-lg font-semibold">
                                    {product.currency} {product.price}
                                </p>
                            </div>

                            <div className="rounded-lg border border-border p-4">
                                <p className="text-xs text-muted-foreground">
                                    Quality Score
                                </p>
                                <p className="mt-1 text-lg font-semibold">
                                    {product.qualityScore}%
                                </p>
                            </div>

                            <div className="rounded-lg border border-border p-4">
                                <p className="text-xs text-muted-foreground">
                                    Confidence
                                </p>
                                <div className="mt-2">
                                    <ConfidenceBadge
                                        score={product.confidenceScore}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Brand
                                </p>
                                <p className="mt-1 font-medium">
                                    {product.brand}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Category
                                </p>
                                <p className="mt-1 font-medium">
                                    {product.category}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                                <p className="mt-1 font-medium capitalize">
                                    {product.status.replace('_', ' ')}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">
                                Enrichment Status
                            </p>
                            <p className="mt-1 font-medium capitalize">
                                {product.enrichmentStatus.replace('_', ' ')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attributes */}
            <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border p-5">
                    <h2 className="font-semibold">Product Attributes</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Attributes available in the product catalog.
                    </p>
                </div>

                {attributes.length === 0 ? (
                    <div className="p-5 text-sm text-muted-foreground">
                        No attributes available.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold">
                                        Attribute
                                    </th>
                                    <th className="px-5 py-3 text-left font-semibold">
                                        Value
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {attributes.map(([key, value]) => (
                                    <tr
                                        key={key}
                                        className="border-b border-border last:border-0"
                                    >
                                        <td className="px-5 py-3 font-medium">
                                            {key}
                                        </td>

                                        <td className="px-5 py-3 text-muted-foreground">
                                            {Array.isArray(value)
                                                ? value.join(', ')
                                                : String(value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Enriched data */}
            <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border p-5">
                    <h2 className="font-semibold">
                        Enriched Product Intelligence
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Standardized and AI-enriched product information.
                    </p>
                </div>

                {!product.enrichedData ? (
                    <div className="p-5 text-sm text-muted-foreground">
                        This product has not been enriched yet.
                    </div>
                ) : (
                    <div className="space-y-6 p-5">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-border p-4">
                                <p className="text-xs text-muted-foreground">
                                    Standardized Title
                                </p>
                                <p className="mt-1 font-medium">
                                    {product.enrichedData.standardizedTitle}
                                </p>
                            </div>

                            <div className="rounded-lg border border-border p-4">
                                <p className="text-xs text-muted-foreground">
                                    Normalized Brand
                                </p>
                                <p className="mt-1 font-medium">
                                    {product.enrichedData.normalizedBrand}
                                </p>
                            </div>

                            <div className="rounded-lg border border-border p-4">
                                <p className="text-xs text-muted-foreground">
                                    Canonical Category
                                </p>
                                <p className="mt-1 font-medium">
                                    {product.enrichedData.canonicalCategory}
                                </p>
                            </div>
                        </div>

                        {normalizedAttributes.length > 0 && (
                            <div>
                                <h3 className="mb-3 font-medium">
                                    Normalized Attributes
                                </h3>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {normalizedAttributes.map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="rounded-lg border border-border p-4"
                                        >
                                            <p className="text-xs text-muted-foreground">
                                                {key}
                                            </p>
                                            <p className="mt-1 text-sm font-medium">
                                                {Array.isArray(value)
                                                    ? value.join(', ')
                                                    : String(value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recoveredAttributes.length > 0 && (
                            <div>
                                <h3 className="mb-3 font-medium">
                                    Recovered Attributes
                                </h3>

                                <div className="space-y-2">
                                    {recoveredAttributes.map((attribute, index) => (
                                        <div
                                            key={`${attribute.displayName}-${index}`}
                                            className="rounded-lg border border-border p-4"
                                        >
                                            <p className="font-medium">
                                                {attribute.displayName}
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {String(attribute.recoveredValue)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {missingAttributes.length > 0 && (
                            <div>
                                <h3 className="mb-3 font-medium">
                                    Missing Attributes
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    {missingAttributes.map((attribute) => (
                                        <span
                                            key={attribute}
                                            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                                        >
                                            {attribute}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Raw data */}
            <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border p-5">
                    <h2 className="font-semibold">Raw Product Data</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Original product information received from the source.
                    </p>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Raw Title
                        </p>
                        <p className="mt-1 text-sm">
                            {product.rawData.rawTitle || '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Raw Brand
                        </p>
                        <p className="mt-1 text-sm">
                            {product.rawData.rawBrand || '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Raw Category
                        </p>
                        <p className="mt-1 text-sm">
                            {product.rawData.rawCategory || '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Source Catalog
                        </p>
                        <p className="mt-1 text-sm">
                            {product.rawData.sourceCatalog || '—'}
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-xs text-muted-foreground">
                            Raw Description
                        </p>
                        <p className="mt-1 text-sm leading-6">
                            {product.rawData.rawDescription || '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Timestamps */}
            <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="font-semibold">Timeline</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Created
                        </p>
                        <p className="mt-1 text-sm">
                            {new Date(
                                product.timestamps.createdAt
                            ).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Updated
                        </p>
                        <p className="mt-1 text-sm">
                            {new Date(
                                product.timestamps.updatedAt
                            ).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Last Enriched
                        </p>
                        <p className="mt-1 text-sm">
                            {product.timestamps.lastEnrichedAt
                                ? new Date(
                                    product.timestamps.lastEnrichedAt
                                ).toLocaleString()
                                : '—'}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Last Audited
                        </p>
                        <p className="mt-1 text-sm">
                            {product.timestamps.lastAuditedAt
                                ? new Date(
                                    product.timestamps.lastAuditedAt
                                ).toLocaleString()
                                : '—'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

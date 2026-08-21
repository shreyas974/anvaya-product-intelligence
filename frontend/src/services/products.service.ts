import {
  Product,
  ProductListQuery,
  UpdateProductInput,
  BatchEnrichInput,
  BatchEnrichmentResponse,
} from '@/types/product.types';
import { PaginatedResponse, ApiResponse } from '@/types/api.types';
import { apiClient } from './api/apiClient';
import { isUseMocks, simulateLatency } from './api/apiConfig';
import { mockProducts } from './mocks/mockProducts';
import { mockDefaultBatchResponse } from './mocks/mockEnrichment';

// Local in-memory state copy for interactive mock updates
let localMockProducts: Product[] = JSON.parse(JSON.stringify(mockProducts));

export const resetMockProducts = (): void => {
  localMockProducts = JSON.parse(JSON.stringify(mockProducts));
};

/**
 * Filter and paginate local mock products deterministically.
 */
function getFilteredMockProducts(params?: ProductListQuery): PaginatedResponse<Product> {
  let filtered = [...localMockProducts];

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (params?.category) {
    filtered = filtered.filter((p) =>
      p.category.toLowerCase().includes(params.category!.toLowerCase())
    );
  }

  if (params?.brand) {
    filtered = filtered.filter(
      (p) => p.brand.toLowerCase() === params.brand!.toLowerCase()
    );
  }

  if (params?.status) {
    filtered = filtered.filter((p) => p.status === params.status);
  }

  if (params?.enrichmentStatus) {
    filtered = filtered.filter((p) => p.enrichmentStatus === params.enrichmentStatus);
  }

  if (params?.minQualityScore !== undefined) {
    filtered = filtered.filter((p) => p.qualityScore >= params.minQualityScore!);
  }

  if (params?.maxQualityScore !== undefined) {
    filtered = filtered.filter((p) => p.qualityScore <= params.maxQualityScore!);
  }

  if (params?.minConfidence !== undefined) {
    const minConf = params.minConfidence > 1 ? params.minConfidence / 100 : params.minConfidence;
    filtered = filtered.filter((p) => {
      const pConf = p.confidenceScore > 1 ? p.confidenceScore / 100 : p.confidenceScore;
      return pConf >= minConf;
    });
  }

  const page = Math.max(1, Number(params?.page) || 1);
  const limit = Math.max(1, Number(params?.limit) || 10);
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Products Service for catalog management, search, updates, and batch enrichment.
 */
export const productsService = {
  /**
   * Fetch paginated list of products with optional search and filters.
   */
  async fetchProducts(params?: ProductListQuery): Promise<PaginatedResponse<Product>> {
    if (isUseMocks()) {
      await simulateLatency();
      return getFilteredMockProducts(params);
    }

    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
        '/products',
        { params: params as Record<string, string | number | boolean | undefined> }
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      return getFilteredMockProducts(params);
    } catch (error) {
      console.warn('[ANVAYA API Fallback] Failed to fetch products from API, using mock fallback:', error);
      await simulateLatency();
      return getFilteredMockProducts(params);
    }
  },

  /**
   * Fetch single product by ID.
   */
  async fetchProductById(id: string): Promise<Product> {
    if (isUseMocks()) {
      await simulateLatency();
      const found = localMockProducts.find((p) => p.id === id);
      if (!found) {
        throw new Error(`Product with ID "${id}" not found`);
      }
      return found;
    }

    try {
      const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      if (response && response.success && response.data) {
        return response.data;
      }
      const found = localMockProducts.find((p) => p.id === id);
      if (!found) throw new Error(`Product with ID "${id}" not found`);
      return found;
    } catch (error) {
      console.warn(`[ANVAYA API Fallback] Failed to fetch product ${id} from API, using mock fallback:`, error);
      await simulateLatency();
      const found = localMockProducts.find((p) => p.id === id);
      if (!found) {
        throw new Error(`Product with ID "${id}" not found`);
      }
      return found;
    }
  },

  /**
   * Update existing product details.
   */
  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    if (isUseMocks()) {
      await simulateLatency();
      const index = localMockProducts.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error(`Product with ID "${id}" not found`);
      }
      const existing = localMockProducts[index];
      const updated: Product = {
        ...existing,
        ...input,
        timestamps: {
          ...existing.timestamps,
          updatedAt: new Date().toISOString(),
        },
      };
      localMockProducts[index] = updated;
      return updated;
    }

    try {
      const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, input);
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn(`[ANVAYA API Fallback] Failed to update product ${id} via API, using mock fallback:`, error);
      await simulateLatency();
      const index = localMockProducts.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error(`Product with ID "${id}" not found`);
      }
      const existing = localMockProducts[index];
      const updated: Product = {
        ...existing,
        ...input,
        timestamps: {
          ...existing.timestamps,
          updatedAt: new Date().toISOString(),
        },
      };
      localMockProducts[index] = updated;
      return updated;
    }
  },

  /**
   * Trigger batch enrichment across multiple product IDs.
   */
  async batchEnrich(input: BatchEnrichInput): Promise<BatchEnrichmentResponse> {
    if (isUseMocks()) {
      await simulateLatency();
      // Optimistically update statuses of target products
      localMockProducts = localMockProducts.map((p) =>
        input.productIds.includes(p.id)
          ? { ...p, enrichmentStatus: 'in_progress' as const }
          : p
      );
      return {
        jobId: `job-batch-${Date.now()}`,
        status: 'in_progress',
        queuedCount: input.productIds.length,
        estimatedDurationSeconds: Math.max(5, input.productIds.length * 3),
      };
    }

    try {
      const response = await apiClient.post<ApiResponse<BatchEnrichmentResponse>>(
        '/products/batch-enrich',
        input
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      return mockDefaultBatchResponse;
    } catch (error) {
      console.warn('[ANVAYA API Fallback] Failed to trigger batch enrichment via API, using mock fallback:', error);
      await simulateLatency();
      return {
        jobId: `job-batch-${Date.now()}`,
        status: 'in_progress',
        queuedCount: input.productIds.length,
        estimatedDurationSeconds: Math.max(5, input.productIds.length * 3),
      };
    }
  },
};

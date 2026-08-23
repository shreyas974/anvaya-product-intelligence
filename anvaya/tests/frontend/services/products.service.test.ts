import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { productsService, resetMockProducts } from '@/services/products.service';
import { apiConfig, setUseMocks } from '@/services/api/apiConfig';

describe('ProductsService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    resetMockProducts();
    setUseMocks(true);
    apiConfig.simulatedLatencyMinMs = 0;
    apiConfig.simulatedLatencyMaxMs = 0;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Mock Mode (isUseMocks = true)', () => {
    it('fetches all mock products with pagination metadata', async () => {
      const response = await productsService.fetchProducts();

      expect(response.data.length).toBeGreaterThanOrEqual(8);
      expect(response.pagination.currentPage).toBe(1);
      expect(response.pagination.totalItems).toBeGreaterThanOrEqual(8);
      expect(response.pagination.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('filters products by search query across title, SKU, and brand', async () => {
      const response = await productsService.fetchProducts({ search: 'boAt' });

      expect(response.data.length).toBeGreaterThan(0);
      response.data.forEach((p) => {
        const matches =
          p.title.toLowerCase().includes('boat') ||
          p.sku.toLowerCase().includes('boat') ||
          p.brand.toLowerCase().includes('boat');
        expect(matches).toBe(true);
      });
    });

    it('filters products by category and brand', async () => {
      const response = await productsService.fetchProducts({ brand: 'Samsung' });

      expect(response.data.length).toBeGreaterThan(0);
      response.data.forEach((p) => {
        expect(p.brand.toLowerCase()).toBe('samsung');
      });
    });

    it('filters products by min quality score', async () => {
      const response = await productsService.fetchProducts({ minQualityScore: 90 });

      expect(response.data.length).toBeGreaterThan(0);
      response.data.forEach((p) => {
        expect(p.qualityScore).toBeGreaterThanOrEqual(90);
      });
    });

    it('paginates product records properly', async () => {
      const page1 = await productsService.fetchProducts({ page: 1, limit: 3 });
      const page2 = await productsService.fetchProducts({ page: 2, limit: 3 });

      expect(page1.data.length).toBe(3);
      expect(page2.data.length).toBe(3);
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
      expect(page1.pagination.currentPage).toBe(1);
      expect(page2.pagination.currentPage).toBe(2);
    });

    it('fetches a single product by ID', async () => {
      const product = await productsService.fetchProductById('prod-001');

      expect(product).toBeDefined();
      expect(product.id).toBe('prod-001');
      expect(product.brand).toBe('boAt');
    });

    it('throws an error for non-existent product ID', async () => {
      await expect(productsService.fetchProductById('prod-non-existent')).rejects.toThrow(
        'not found'
      );
    });

    it('updates product fields in local mock memory', async () => {
      const updated = await productsService.updateProduct('prod-001', {
        title: 'Updated boAt Earbuds Title',
        qualityScore: 98,
      });

      expect(updated.title).toBe('Updated boAt Earbuds Title');
      expect(updated.qualityScore).toBe(98);

      const refetched = await productsService.fetchProductById('prod-001');
      expect(refetched.title).toBe('Updated boAt Earbuds Title');
    });

    it('triggers batch enrichment and updates target product statuses', async () => {
      const batchResult = await productsService.batchEnrich({
        productIds: ['prod-001', 'prod-003'],
      });

      expect(batchResult.jobId).toBeDefined();
      expect(batchResult.queuedCount).toBe(2);
      expect(batchResult.status).toBe('in_progress');

      const prod3 = await productsService.fetchProductById('prod-003');
      expect(prod3.enrichmentStatus).toBe('in_progress');
    });
  });

  describe('API Mode with Fallback (isUseMocks = false)', () => {
    it('returns API response when backend is available', async () => {
      setUseMocks(false);
      const apiMockData = {
        success: true,
        data: {
          data: [{ id: 'api-prod-1', title: 'API Product', sku: 'SKU-1' }],
          pagination: { currentPage: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => apiMockData,
      } as unknown as Response);

      const result = await productsService.fetchProducts();

      expect(result.data[0].id).toBe('api-prod-1');
    });

    it('gracefully falls back to mock products when API fails', async () => {
      setUseMocks(false);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Simulate backend server down (500 internal server error or network refusal)
      global.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await productsService.fetchProducts();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ANVAYA API Fallback]'),
        expect.anything()
      );
      expect(result.data.length).toBeGreaterThanOrEqual(8);
      expect(result.data[0].id).toBe('prod-001');
    });

    it('falls back to mock product by ID when API fails', async () => {
      setUseMocks(false);
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const product = await productsService.fetchProductById('prod-001');

      expect(product.id).toBe('prod-001');
      expect(product.brand).toBe('boAt');
    });
  });
});

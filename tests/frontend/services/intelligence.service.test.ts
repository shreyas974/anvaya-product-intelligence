import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { intelligenceService } from '@/services/intelligence.service';
import { apiConfig, setUseMocks } from '@/services/api/apiConfig';

describe('IntelligenceService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setUseMocks(true);
    apiConfig.simulatedLatencyMinMs = 0;
    apiConfig.simulatedLatencyMaxMs = 0;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Mock Mode (isUseMocks = true)', () => {
    it('fetches category insights across e-commerce categories', async () => {
      const insights = await intelligenceService.fetchCategoryInsights();

      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0].category).toBeDefined();
      expect(insights[0].topBrands.length).toBeGreaterThan(0);
      expect(insights[0].priceRange).toBeDefined();
      expect(insights[0].keyAttributeCoverage).toBeDefined();
    });

    it('filters category insights by category slug', async () => {
      const insights = await intelligenceService.fetchCategoryInsights('audio-wearables');

      expect(insights.length).toBe(1);
      expect(insights[0].categorySlug).toBe('audio-wearables');
    });

    it('fetches semantic duplicate clusters', async () => {
      const duplicates = await intelligenceService.fetchDuplicates();

      expect(duplicates.length).toBeGreaterThan(0);
      expect(duplicates[0].clusterId).toBeDefined();
      expect(duplicates[0].similarityScore).toBeGreaterThan(0.8);
      expect(duplicates[0].canonicalProduct).toBeDefined();
      expect(duplicates[0].duplicates.length).toBeGreaterThan(0);
    });

    it('fetches hierarchical taxonomy tree with attribute schemas', async () => {
      const taxonomy = await intelligenceService.fetchTaxonomy();

      expect(taxonomy.length).toBeGreaterThan(0);
      const electronics = taxonomy.find((t) => t.slug === 'electronics');
      expect(electronics).toBeDefined();
      expect(electronics?.children?.length).toBeGreaterThan(0);

      const leafSmartphones = electronics?.children?.[0]?.children?.[0];
      expect(leafSmartphones?.attributeSchema).toBeDefined();
      expect(leafSmartphones?.attributeSchema?.length).toBeGreaterThan(0);
    });
  });

  describe('API Mode with Fallback (isUseMocks = false)', () => {
    it('returns API response when backend is available', async () => {
      setUseMocks(false);
      const apiTaxonomy = [{ id: 'tax-1', name: 'Root Category', slug: 'root', level: 1, productCount: 10 }];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true, data: apiTaxonomy }),
      } as unknown as Response);

      const result = await intelligenceService.fetchTaxonomy();
      expect(result).toEqual(apiTaxonomy);
    });

    it('gracefully falls back to mock taxonomy when API fails', async () => {
      setUseMocks(false);
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const taxonomy = await intelligenceService.fetchTaxonomy();
      expect(taxonomy.length).toBeGreaterThan(0);
      expect(taxonomy[0].slug).toBe('electronics');
    });
  });
});

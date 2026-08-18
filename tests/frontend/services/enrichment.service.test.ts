import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { enrichmentService, resetMockEnrichment } from '@/services/enrichment.service';
import { apiConfig, setUseMocks } from '@/services/api/apiConfig';

describe('EnrichmentService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    resetMockEnrichment();
    setUseMocks(true);
    apiConfig.simulatedLatencyMinMs = 0;
    apiConfig.simulatedLatencyMaxMs = 0;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Mock Mode (isUseMocks = true)', () => {
    it('triggers enrichment job for specified product IDs', async () => {
      const job = await enrichmentService.triggerEnrichment(['prod-001', 'prod-002']);

      expect(job.id).toMatch(/^job-enr-/);
      expect(job.status).toBe('in_progress');
      expect(job.totalCount).toBe(2);
      expect(job.productIds).toEqual(['prod-001', 'prod-002']);
    });

    it('retrieves status and progress of existing enrichment job', async () => {
      const status = await enrichmentService.getEnrichmentStatus('job-enr-801');

      expect(status.jobId).toBe('job-enr-801');
      expect(status.status).toBe('in_progress');
      expect(status.progress).toBe(75);
      expect(status.totalProducts).toBe(4);
    });

    it('previews enrichment changes for a product including recovered attributes', async () => {
      const preview = await enrichmentService.previewEnrichment('prod-003');

      expect(preview.productId).toBe('prod-003');
      expect(preview.projectedQualityScore).toBeGreaterThan(preview.currentQualityScore);
      expect(preview.recoveredAttributes.length).toBeGreaterThan(0);
      expect(preview.confidenceScore).toBeGreaterThan(0.8);

      const brandAttr = preview.recoveredAttributes.find((a) => a.key === 'brand');
      expect(brandAttr).toBeDefined();
      expect(brandAttr?.recoveredValue).toBe('Samsung');
      expect(brandAttr?.explainability.source).toBe('brand_dictionary');
    });
  });

  describe('API Mode with Fallback (isUseMocks = false)', () => {
    it('returns API response when backend is available', async () => {
      setUseMocks(false);
      const apiJob = {
        id: 'job-api-123',
        status: 'in_progress' as const,
        productIds: ['prod-001'],
        totalCount: 1,
        processedCount: 0,
        failedCount: 0,
        progress: 0,
        createdAt: '2026-08-18T12:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true, data: apiJob }),
      } as unknown as Response);

      const result = await enrichmentService.triggerEnrichment(['prod-001']);
      expect(result.id).toBe('job-api-123');
    });

    it('gracefully falls back to mock preview when API fails', async () => {
      setUseMocks(false);
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const preview = await enrichmentService.previewEnrichment('prod-003');

      expect(preview.productId).toBe('prod-003');
      expect(preview.projectedQualityScore).toBe(94);
    });
  });
});

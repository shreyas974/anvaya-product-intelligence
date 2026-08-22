import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { qualityService, resetMockQuality } from '@/services/quality.service';
import { apiConfig, setUseMocks } from '@/services/api/apiConfig';

describe('QualityService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    resetMockQuality();
    setUseMocks(true);
    apiConfig.simulatedLatencyMinMs = 0;
    apiConfig.simulatedLatencyMaxMs = 0;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Mock Mode (isUseMocks = true)', () => {
    it('fetches quality metrics with overall score and dimension breakdowns', async () => {
      const metrics = await qualityService.fetchQualityMetrics();

      expect(metrics.overallQualityScore).toBe(88.4);
      expect(metrics.dimensions.completeness).toBe(84.2);
      expect(metrics.dimensions.consistency).toBe(91.0);
      expect(metrics.dimensions.accuracy).toBe(93.5);
      expect(metrics.dimensions.uniqueness).toBe(85.0);
      expect(metrics.categoryBreakdown.length).toBeGreaterThan(0);
      expect(metrics.historicalTrend.length).toBeGreaterThan(0);
    });

    it('fetches catalog anomalies with pagination and filters', async () => {
      const allAnomalies = await qualityService.fetchAnomalies();
      expect(allAnomalies.data.length).toBeGreaterThan(0);

      const criticalAnomalies = await qualityService.fetchAnomalies({ severity: 'critical' });
      expect(criticalAnomalies.data.length).toBeGreaterThan(0);
      criticalAnomalies.data.forEach((a) => expect(a.severity).toBe('critical'));

      const openAnomalies = await qualityService.fetchAnomalies({ status: 'open' });
      expect(openAnomalies.data.length).toBeGreaterThan(0);
      openAnomalies.data.forEach((a) => expect(a.status).toBe('open'));
    });

    it('resolves an anomaly with accepted suggestion', async () => {
      const resolved = await qualityService.resolveAnomaly('anom-001', {
        status: 'resolved',
        action: 'accept_suggestion',
        resolutionNote: 'Approved brand spelling correction to Samsung',
      });

      expect(resolved.id).toBe('anom-001');
      expect(resolved.status).toBe('resolved');
      expect(resolved.currentValue).toBe('Samsung');
      expect(resolved.resolvedAt).toBeDefined();
    });
  });

  describe('API Mode with Fallback (isUseMocks = false)', () => {
    it('returns API response when backend is available', async () => {
      setUseMocks(false);
      const apiMetrics = {
        overallQualityScore: 99.0,
        dimensions: { completeness: 99, consistency: 99, accuracy: 99, uniqueness: 99 },
        totalProductsAudited: 100,
        totalAnomaliesCount: 0,
        criticalAnomaliesCount: 0,
        highAnomaliesCount: 0,
        mediumAnomaliesCount: 0,
        lowAnomaliesCount: 0,
        resolvedAnomaliesCount: 10,
        categoryBreakdown: [],
        historicalTrend: [],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true, data: apiMetrics }),
      } as unknown as Response);

      const result = await qualityService.fetchQualityMetrics();
      expect(result.overallQualityScore).toBe(99.0);
    });

    it('gracefully falls back to mock quality metrics when API fails', async () => {
      setUseMocks(false);
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const metrics = await qualityService.fetchQualityMetrics();
      expect(metrics.overallQualityScore).toBe(88.4);
    });
  });
});

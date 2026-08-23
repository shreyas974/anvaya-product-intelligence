import {
  QualityMetricsSummary,
  CatalogAnomaly,
  QualityMetricsQuery,
  AnomaliesQuery,
  AnomalyResolutionInput,
} from '@/types/quality.types';
import { PaginatedResponse, ApiResponse } from '@/types/api.types';
import { apiClient } from './api/apiClient';
import { isUseMocks, simulateLatency } from './api/apiConfig';
import { mockQualityMetrics, mockCatalogAnomalies } from './mocks/mockQuality';

let localAnomalies: CatalogAnomaly[] = JSON.parse(JSON.stringify(mockCatalogAnomalies));

export const resetMockQuality = (): void => {
  localAnomalies = JSON.parse(JSON.stringify(mockCatalogAnomalies));
};

function getFilteredAnomalies(params?: AnomaliesQuery): PaginatedResponse<CatalogAnomaly> {
  let filtered = [...localAnomalies];

  if (params?.severity) {
    filtered = filtered.filter((a) => a.severity === params.severity);
  }

  if (params?.status) {
    filtered = filtered.filter((a) => a.status === params.status);
  }

  if (params?.type) {
    filtered = filtered.filter((a) => a.type === params.type);
  }

  if (params?.productId) {
    filtered = filtered.filter((a) => a.productId === params.productId);
  }

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.productTitle.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.field.toLowerCase().includes(q)
    );
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
 * Quality Service for catalog audits, quality metrics scoring, and anomaly resolution.
 */
export const qualityService = {
  /**
   * Fetch aggregate quality scores, dimension breakdowns, and historical trends.
   */
  async fetchQualityMetrics(params?: QualityMetricsQuery): Promise<QualityMetricsSummary> {
    if (isUseMocks()) {
      await simulateLatency();
      return mockQualityMetrics;
    }

    try {
      const response = await apiClient.get<ApiResponse<QualityMetricsSummary>>(
        '/quality/metrics',
        { params: params as Record<string, string | number | boolean | undefined> }
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      return mockQualityMetrics;
    } catch (error) {
      console.warn('[ANVAYA API Fallback] Failed to fetch quality metrics from API, using mock fallback:', error);
      await simulateLatency();
      return mockQualityMetrics;
    }
  },

  /**
   * Fetch paginated list of catalog anomalies with severity and status filters.
   */
  async fetchAnomalies(params?: AnomaliesQuery): Promise<PaginatedResponse<CatalogAnomaly>> {
    if (isUseMocks()) {
      await simulateLatency();
      return getFilteredAnomalies(params);
    }

    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<CatalogAnomaly>>>(
        '/quality/anomalies',
        { params: params as Record<string, string | number | boolean | undefined> }
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      return getFilteredAnomalies(params);
    } catch (error) {
      console.warn('[ANVAYA API Fallback] Failed to fetch anomalies from API, using mock fallback:', error);
      await simulateLatency();
      return getFilteredAnomalies(params);
    }
  },

  /**
   * Resolve an anomaly (accept AI suggestion, manual override, or dismiss false positive).
   */
  async resolveAnomaly(
    anomalyId: string,
    resolution: AnomalyResolutionInput
  ): Promise<CatalogAnomaly> {
    if (isUseMocks()) {
      await simulateLatency();
      const index = localAnomalies.findIndex((a) => a.id === anomalyId);
      if (index === -1) {
        throw new Error(`Anomaly with ID "${anomalyId}" not found`);
      }
      const existing = localAnomalies[index];
      const updated: CatalogAnomaly = {
        ...existing,
        status: resolution.status,
        resolvedAt: new Date().toISOString(),
        resolvedBy: resolution.resolvedBy || 'catalog_analyst',
        resolutionNote: resolution.resolutionNote || `Action applied: ${resolution.action}`,
        currentValue:
          resolution.action === 'manual_override'
            ? resolution.overrideValue
            : resolution.action === 'accept_suggestion'
            ? existing.suggestedValue
            : existing.currentValue,
      };
      localAnomalies[index] = updated;
      return updated;
    }

    try {
      const response = await apiClient.post<ApiResponse<CatalogAnomaly>>(
        `/quality/anomalies/${anomalyId}/resolve`,
        resolution
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn(`[ANVAYA API Fallback] Failed to resolve anomaly ${anomalyId} via API, using mock fallback:`, error);
      await simulateLatency();
      const index = localAnomalies.findIndex((a) => a.id === anomalyId);
      if (index === -1) {
        throw new Error(`Anomaly with ID "${anomalyId}" not found`);
      }
      const existing = localAnomalies[index];
      const updated: CatalogAnomaly = {
        ...existing,
        status: resolution.status,
        resolvedAt: new Date().toISOString(),
        resolvedBy: resolution.resolvedBy || 'catalog_analyst',
        resolutionNote: resolution.resolutionNote || `Action applied: ${resolution.action}`,
        currentValue:
          resolution.action === 'manual_override'
            ? resolution.overrideValue
            : resolution.action === 'accept_suggestion'
            ? existing.suggestedValue
            : existing.currentValue,
      };
      localAnomalies[index] = updated;
      return updated;
    }
  },
};

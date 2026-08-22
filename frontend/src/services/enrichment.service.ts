import {
  EnrichmentJob,
  EnrichmentStatusResponse,
  EnrichmentPreviewResult,
  EnrichmentOptions,
} from '@/types/enrichment.types';
import { ApiResponse } from '@/types/api.types';
import { apiClient } from './api/apiClient';
import { isUseMocks, simulateLatency } from './api/apiConfig';
import {
  mockEnrichmentJobs,
  mockEnrichmentStatusMap,
  mockEnrichmentPreviews,
} from './mocks/mockEnrichment';

let localEnrichmentJobs: EnrichmentJob[] = JSON.parse(JSON.stringify(mockEnrichmentJobs));

export const resetMockEnrichment = (): void => {
  localEnrichmentJobs = JSON.parse(JSON.stringify(mockEnrichmentJobs));
};

/**
 * Enrichment Service for executing AI extraction pipelines, monitoring jobs, and previewing attribute recovery.
 */
export const enrichmentService = {
  /**
   * Trigger asynchronous AI enrichment for given product IDs.
   */
  async triggerEnrichment(
    productIds: string[],
    options?: EnrichmentOptions
  ): Promise<EnrichmentJob> {
    if (isUseMocks()) {
      await simulateLatency();
      const newJob: EnrichmentJob = {
        id: `job-enr-${Date.now().toString().slice(-4)}`,
        status: 'in_progress',
        productIds,
        totalCount: productIds.length,
        processedCount: 0,
        failedCount: 0,
        progress: 10,
        createdAt: new Date().toISOString(),
      };
      localEnrichmentJobs.unshift(newJob);
      return newJob;
    }

    try {
      const response = await apiClient.post<ApiResponse<EnrichmentJob>>(
        '/enrichment/trigger',
        { productIds, options }
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn('[ANVAYA API Fallback] Failed to trigger enrichment via API, using mock fallback:', error);
      await simulateLatency();
      const newJob: EnrichmentJob = {
        id: `job-enr-${Date.now().toString().slice(-4)}`,
        status: 'in_progress',
        productIds,
        totalCount: productIds.length,
        processedCount: 0,
        failedCount: 0,
        progress: 10,
        createdAt: new Date().toISOString(),
      };
      localEnrichmentJobs.unshift(newJob);
      return newJob;
    }
  },

  /**
   * Fetch current status and progress of an enrichment job.
   */
  async getEnrichmentStatus(jobId: string): Promise<EnrichmentStatusResponse> {
    if (isUseMocks()) {
      await simulateLatency();
      if (mockEnrichmentStatusMap[jobId]) {
        return mockEnrichmentStatusMap[jobId];
      }
      const existingJob = localEnrichmentJobs.find((j) => j.id === jobId);
      return {
        jobId,
        status: existingJob ? existingJob.status : 'in_progress',
        progress: existingJob ? existingJob.progress : 50,
        totalProducts: existingJob ? existingJob.totalCount : 4,
        processedProducts: existingJob ? existingJob.processedCount : 2,
        estimatedTimeRemainingSeconds: 6,
        resultsSummary: {
          enrichedCount: existingJob ? existingJob.processedCount : 2,
          flaggedCount: 0,
          errorCount: 0,
        },
      };
    }

    try {
      const response = await apiClient.get<ApiResponse<EnrichmentStatusResponse>>(
        `/enrichment/status/${jobId}`
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn(`[ANVAYA API Fallback] Failed to fetch enrichment status for ${jobId}, using mock fallback:`, error);
      await simulateLatency();
      return (
        mockEnrichmentStatusMap[jobId] || {
          jobId,
          status: 'in_progress',
          progress: 50,
          totalProducts: 4,
          processedProducts: 2,
          estimatedTimeRemainingSeconds: 6,
          resultsSummary: {
            enrichedCount: 2,
            flaggedCount: 0,
            errorCount: 0,
          },
        }
      );
    }
  },

  /**
   * Preview proposed AI enrichments, recovered attributes, and projected quality score before applying.
   */
  async previewEnrichment(productId: string): Promise<EnrichmentPreviewResult> {
    if (isUseMocks()) {
      await simulateLatency();
      if (mockEnrichmentPreviews[productId]) {
        return mockEnrichmentPreviews[productId];
      }
      // Fallback default preview for products without custom mockup
      return {
        productId,
        currentQualityScore: 60,
        projectedQualityScore: 92,
        recoveredAttributes: [
          {
            key: 'brand',
            displayName: 'Normalized Brand',
            originalValue: null,
            recoveredValue: 'Verified Brand',
            confidence: 0.95,
            explainability: {
              source: 'brand_dictionary',
              evidenceSnippet: 'Auto-mapped from canonical dictionary',
              extractionMethod: 'schema_normalization',
              confidence: 0.95,
              validationStatus: 'validated',
            },
          },
        ],
        missingAttributes: [],
        normalizedFields: {},
        confidenceScore: 0.92,
      };
    }

    try {
      const response = await apiClient.get<ApiResponse<EnrichmentPreviewResult>>(
        `/enrichment/preview/${productId}`
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn(`[ANVAYA API Fallback] Failed to preview enrichment for ${productId}, using mock fallback:`, error);
      await simulateLatency();
      return (
        mockEnrichmentPreviews[productId] || {
          productId,
          currentQualityScore: 60,
          projectedQualityScore: 92,
          recoveredAttributes: [],
          missingAttributes: [],
          normalizedFields: {},
          confidenceScore: 0.9,
        }
      );
    }
  },
};

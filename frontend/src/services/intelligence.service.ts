import {
  CategoryInsight,
  TaxonomyNode,
  SemanticDuplicateCluster,
  DuplicateQuery,
} from '@/types/intelligence.types';
import { ApiResponse } from '@/types/api.types';
import { apiClient } from './api/apiClient';
import { isUseMocks, simulateLatency } from './api/apiConfig';
import {
  mockCategoryInsights,
  mockSemanticDuplicateClusters,
  mockTaxonomyTree,
} from './mocks/mockIntelligence';

/**
 * Intelligence Service for category analytics, semantic deduplication clusters, and canonical taxonomy.
 */
export const intelligenceService = {
  /**
   * Fetch category-level benchmarking insights, brand distributions, and completeness stats.
   */
  async fetchCategoryInsights(categorySlug?: string): Promise<CategoryInsight[]> {
    if (isUseMocks()) {
      await simulateLatency();
      if (categorySlug) {
        return mockCategoryInsights.filter(
          (c) => c.categorySlug.toLowerCase() === categorySlug.toLowerCase()
        );
      }
      return mockCategoryInsights;
    }

    try {
      const response = await apiClient.get<ApiResponse<CategoryInsight[]>>(
        '/intelligence/category-insights',
        { params: categorySlug ? { categorySlug } : undefined }
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      return categorySlug
        ? mockCategoryInsights.filter((c) => c.categorySlug.toLowerCase() === categorySlug.toLowerCase())
        : mockCategoryInsights;
    } catch (error) {
      console.warn('[ANVAYA API Fallback] Failed to fetch category insights from API, using mock fallback:', error);
      await simulateLatency();
      return categorySlug
        ? mockCategoryInsights.filter((c) => c.categorySlug.toLowerCase() === categorySlug.toLowerCase())
        : mockCategoryInsights;
    }
  },

  /**
   * Fetch AI semantic duplicate clusters across catalogs with similarity scores.
   */
  async fetchDuplicates(params?: DuplicateQuery): Promise<SemanticDuplicateCluster[]> {
    if (isUseMocks()) {
      await simulateLatency();
      let clusters = [...mockSemanticDuplicateClusters];

      if (params?.minSimilarity !== undefined) {
        const minSim = params.minSimilarity > 1 ? params.minSimilarity / 100 : params.minSimilarity;
        clusters = clusters.filter((c) => c.similarityScore >= minSim);
      }

      if (params?.clusterId) {
        clusters = clusters.filter((c) => c.clusterId === params.clusterId);
      }

      return clusters;
    }

    try {
      const response = await apiClient.get<ApiResponse<SemanticDuplicateCluster[]>>(
        '/intelligence/duplicates',
        { params: params as Record<string, string | number | boolean | undefined> }
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      return mockSemanticDuplicateClusters;
    } catch (error) {
      console.warn('[ANVAYA API Fallback] Failed to fetch duplicates from API, using mock fallback:', error);
      await simulateLatency();
      return mockSemanticDuplicateClusters;
    }
  },

  /**
   * Fetch hierarchical catalog taxonomy tree with attribute schemas.
   */
  async fetchTaxonomy(): Promise<TaxonomyNode[]> {
    if (isUseMocks()) {
      await simulateLatency();
      return mockTaxonomyTree;
    }

    try {
      const response = await apiClient.get<ApiResponse<TaxonomyNode[]>>('/intelligence/taxonomy');
      if (response && response.success && response.data) {
        return response.data;
      }
      return mockTaxonomyTree;
    } catch (error) {
      console.warn('[ANVAYA API Fallback] Failed to fetch taxonomy from API, using mock fallback:', error);
      await simulateLatency();
      return mockTaxonomyTree;
    }
  },
};

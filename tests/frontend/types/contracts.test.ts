import { describe, it, expect } from 'vitest';
import { mockProducts } from '@/services/mocks/mockProducts';
import { mockEnrichmentPreviews, mockEnrichmentJobs } from '@/services/mocks/mockEnrichment';
import { mockQualityMetrics, mockCatalogAnomalies } from '@/services/mocks/mockQuality';
import {
  mockCategoryInsights,
  mockSemanticDuplicateClusters,
  mockTaxonomyTree,
} from '@/services/mocks/mockIntelligence';
import { Product } from '@/types/product.types';

describe('Domain Type Contracts & Mock Data Integrity', () => {
  describe('Product Contracts', () => {
    it('contains between 8 and 12 realistic products', () => {
      expect(mockProducts.length).toBeGreaterThanOrEqual(8);
      expect(mockProducts.length).toBeLessThanOrEqual(12);
    });

    it('validates every product has required schema fields', () => {
      mockProducts.forEach((product: Product) => {
        expect(product.id).toBeDefined();
        expect(product.sku).toBeDefined();
        expect(product.title).toBeDefined();
        expect(product.description).toBeDefined();
        expect(product.brand).toBeDefined();
        expect(product.category).toBeDefined();
        expect(typeof product.price).toBe('number');
        expect(product.currency).toBe('INR');
        expect(Array.isArray(product.images)).toBe(true);
        expect(typeof product.attributes).toBe('object');
        expect(typeof product.rawData).toBe('object');
        expect(typeof product.qualityScore).toBe('number');
        expect(product.qualityScore).toBeGreaterThanOrEqual(0);
        expect(product.qualityScore).toBeLessThanOrEqual(100);
        expect(['pending', 'in_progress', 'enriched', 'failed', 'needs_review']).toContain(
          product.enrichmentStatus
        );
        expect(['raw', 'cleaned', 'enriched', 'flagged', 'approved']).toContain(product.status);
        expect(product.timestamps.createdAt).toBeDefined();
        expect(product.timestamps.updatedAt).toBeDefined();
      });
    });

    it('ensures safe explainability metadata is present on enriched products without chain-of-thought', () => {
      const enrichedProducts = mockProducts.filter((p) => p.enrichedData !== undefined);
      expect(enrichedProducts.length).toBeGreaterThan(0);

      enrichedProducts.forEach((p) => {
        const enriched = p.enrichedData!;
        expect(enriched.standardizedTitle).toBeDefined();
        expect(enriched.normalizedBrand).toBeDefined();
        expect(enriched.enrichmentMetadata.pipelineVersion).toBeDefined();
        expect(enriched.enrichmentMetadata.safetyAuditPassed).toBe(true);

        if (enriched.recoveredAttributes.length > 0) {
          enriched.recoveredAttributes.forEach((attr) => {
            expect(attr.key).toBeDefined();
            expect(attr.confidence).toBeGreaterThan(0);
            expect(attr.confidence).toBeLessThanOrEqual(1);
            expect(attr.explainability).toBeDefined();
            expect(attr.explainability.source).toBeDefined();
            expect(attr.explainability.evidenceSnippet).toBeDefined();
            expect(attr.explainability.extractionMethod).toBeDefined();
            expect(attr.explainability.validationStatus).toBeDefined();

            // Ensure no internal chain-of-thought is leaked
            const explainabilityKeys = Object.keys(attr.explainability);
            expect(explainabilityKeys).not.toContain('chainOfThought');
            expect(explainabilityKeys).not.toContain('internalReasoning');
            expect(explainabilityKeys).not.toContain('promptTrace');
          });
        }
      });
    });
  });

  describe('Enrichment Contracts', () => {
    it('validates mock enrichment previews and jobs schema', () => {
      expect(mockEnrichmentJobs.length).toBeGreaterThan(0);
      mockEnrichmentJobs.forEach((job) => {
        expect(job.id).toMatch(/^job-enr-/);
        expect(job.totalCount).toBeGreaterThan(0);
        expect(job.progress).toBeGreaterThanOrEqual(0);
        expect(job.progress).toBeLessThanOrEqual(100);
      });

      const preview3 = mockEnrichmentPreviews['prod-003'];
      expect(preview3).toBeDefined();
      expect(preview3.currentQualityScore).toBeLessThan(preview3.projectedQualityScore);
      expect(preview3.recoveredAttributes.length).toBeGreaterThan(0);
    });
  });

  describe('Quality Contracts', () => {
    it('validates quality metrics dimensions and anomalies schema', () => {
      expect(mockQualityMetrics.overallQualityScore).toBeGreaterThan(0);
      expect(mockQualityMetrics.dimensions.completeness).toBeGreaterThan(0);
      expect(mockQualityMetrics.dimensions.consistency).toBeGreaterThan(0);
      expect(mockQualityMetrics.dimensions.accuracy).toBeGreaterThan(0);
      expect(mockQualityMetrics.dimensions.uniqueness).toBeGreaterThan(0);
      expect(mockQualityMetrics.categoryBreakdown.length).toBeGreaterThan(0);

      expect(mockCatalogAnomalies.length).toBeGreaterThan(0);
      mockCatalogAnomalies.forEach((anomaly) => {
        expect(anomaly.id).toMatch(/^anom-/);
        expect(anomaly.productId).toBeDefined();
        expect(['critical', 'high', 'medium', 'low']).toContain(anomaly.severity);
        expect(['open', 'investigating', 'resolved', 'ignored']).toContain(anomaly.status);
      });
    });
  });

  describe('Intelligence Contracts', () => {
    it('validates category insights, semantic clusters, and taxonomy schemas', () => {
      expect(mockCategoryInsights.length).toBeGreaterThan(0);
      mockCategoryInsights.forEach((cat) => {
        expect(cat.category).toBeDefined();
        expect(cat.categorySlug).toBeDefined();
        expect(cat.productCount).toBeGreaterThan(0);
        expect(cat.topBrands.length).toBeGreaterThan(0);
        expect(cat.priceRange.min).toBeLessThanOrEqual(cat.priceRange.max);
      });

      expect(mockSemanticDuplicateClusters.length).toBeGreaterThan(0);
      mockSemanticDuplicateClusters.forEach((cluster) => {
        expect(cluster.clusterId).toBeDefined();
        expect(cluster.similarityScore).toBeGreaterThan(0.8);
        expect(cluster.canonicalProduct).toBeDefined();
        expect(cluster.duplicates.length).toBeGreaterThan(0);
      });

      expect(mockTaxonomyTree.length).toBeGreaterThan(0);
      mockTaxonomyTree.forEach((root) => {
        expect(root.level).toBe(1);
        expect(root.children).toBeDefined();
      });
    });
  });
});

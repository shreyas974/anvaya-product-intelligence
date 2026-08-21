import {
  EnrichmentJob,
  EnrichmentStatusResponse,
  EnrichmentPreviewResult,
  BatchEnrichmentResponse,
} from '@/types/enrichment.types';

export const mockEnrichmentJobs: EnrichmentJob[] = [
  {
    id: 'job-enr-801',
    status: 'in_progress',
    productIds: ['prod-001', 'prod-003', 'prod-005', 'prod-007'],
    totalCount: 4,
    processedCount: 3,
    failedCount: 0,
    progress: 75,
    createdAt: '2026-08-18T12:40:00Z',
  },
  {
    id: 'job-enr-800',
    status: 'enriched',
    productIds: ['prod-004', 'prod-006', 'prod-008', 'prod-009', 'prod-010'],
    totalCount: 5,
    processedCount: 5,
    failedCount: 0,
    progress: 100,
    createdAt: '2026-08-18T10:00:00Z',
    completedAt: '2026-08-18T10:02:15Z',
  },
];

export const mockEnrichmentStatusMap: Record<string, EnrichmentStatusResponse> = {
  'job-enr-801': {
    jobId: 'job-enr-801',
    status: 'in_progress',
    progress: 75,
    totalProducts: 4,
    processedProducts: 3,
    estimatedTimeRemainingSeconds: 8,
    resultsSummary: {
      enrichedCount: 3,
      flaggedCount: 0,
      errorCount: 0,
    },
  },
  'job-enr-800': {
    jobId: 'job-enr-800',
    status: 'enriched',
    progress: 100,
    totalProducts: 5,
    processedProducts: 5,
    estimatedTimeRemainingSeconds: 0,
    resultsSummary: {
      enrichedCount: 5,
      flaggedCount: 0,
      errorCount: 0,
    },
  },
};

export const mockEnrichmentPreviews: Record<string, EnrichmentPreviewResult> = {
  'prod-003': {
    productId: 'prod-003',
    currentQualityScore: 48,
    projectedQualityScore: 94,
    recoveredAttributes: [
      {
        key: 'brand',
        displayName: 'Brand Name',
        originalValue: 'Samsuung',
        recoveredValue: 'Samsung',
        confidence: 0.99,
        explainability: {
          source: 'brand_dictionary',
          evidenceSnippet: 'Samsuung -> Samsung (Fuzzy distance: 1)',
          extractionMethod: 'schema_normalization',
          confidence: 0.99,
          validationStatus: 'validated',
          ruleApplied: 'brand_dictionary_exact_levenshtein_le1',
        },
      },
      {
        key: 'processor',
        displayName: 'Processor Chipset',
        originalValue: null,
        recoveredValue: 'Snapdragon 8 Gen 2 Mobile Platform',
        confidence: 0.94,
        explainability: {
          source: 'description_ner',
          evidenceSnippet: 'snapdragon 8 gen 2 mobile platform',
          extractionMethod: 'named_entity_recognition',
          confidence: 0.94,
          validationStatus: 'validated',
        },
      },
      {
        key: 'battery_capacity',
        displayName: 'Battery Capacity',
        originalValue: null,
        recoveredValue: '3900 mAh',
        unit: 'mAh',
        confidence: 0.95,
        explainability: {
          source: 'description_ner',
          evidenceSnippet: '3900mah battery',
          extractionMethod: 'regex_pattern',
          confidence: 0.95,
          validationStatus: 'validated',
        },
      },
      {
        key: 'category',
        displayName: 'Canonical Taxonomy Category',
        originalValue: 'Mobiles',
        recoveredValue: 'Electronics > Mobile Phones > Smartphones',
        confidence: 0.97,
        explainability: {
          source: 'cross_catalog_inference',
          evidenceSnippet: 'S23 5G Snapdragon Smartphone',
          extractionMethod: 'heuristic_rule',
          confidence: 0.97,
          validationStatus: 'validated',
        },
      },
    ],
    missingAttributes: [],
    normalizedFields: {
      title: {
        before: 'Samsuung Galxy S23 5G 8GB RAM 128GB Storage Green Phone !!! BRAND NEW UNOPENED',
        after: 'Samsung Galaxy S23 5G (Green, 8GB RAM, 128GB Storage)',
        confidence: 0.96,
      },
      brand: {
        before: 'Samsuung',
        after: 'Samsung',
        confidence: 0.99,
      },
      category: {
        before: 'Mobiles',
        after: 'Electronics > Mobile Phones > Smartphones',
        confidence: 0.97,
      },
    },
    confidenceScore: 0.95,
  },
  'prod-002': {
    productId: 'prod-002',
    currentQualityScore: 52,
    projectedQualityScore: 92,
    recoveredAttributes: [
      {
        key: 'brand',
        displayName: 'Brand Name',
        originalValue: 'BOAT',
        recoveredValue: 'boAt',
        confidence: 0.99,
        explainability: {
          source: 'brand_dictionary',
          evidenceSnippet: 'BOAT -> boAt',
          extractionMethod: 'schema_normalization',
          confidence: 0.99,
          validationStatus: 'validated',
        },
      },
      {
        key: 'playback_time',
        displayName: 'Total Playback Time',
        originalValue: '42h',
        recoveredValue: '42 Hours',
        unit: 'Hours',
        confidence: 0.96,
        explainability: {
          source: 'description_ner',
          evidenceSnippet: '42 hours backup',
          extractionMethod: 'schema_normalization',
          confidence: 0.96,
          validationStatus: 'validated',
        },
      },
    ],
    missingAttributes: [],
    normalizedFields: {
      title: {
        before: 'BOAT Airdopes 141 TWS Ear Buds with 42H Playtime Mic Black',
        after: 'boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds (Bold Black)',
        confidence: 0.95,
      },
    },
    confidenceScore: 0.94,
  },
};

export const mockDefaultBatchResponse: BatchEnrichmentResponse = {
  jobId: `job-enr-${Date.now().toString().slice(-4)}`,
  status: 'pending',
  queuedCount: 4,
  estimatedDurationSeconds: 12,
};

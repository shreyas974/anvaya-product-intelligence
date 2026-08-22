export type EnrichmentStatus =
  | 'pending'
  | 'in_progress'
  | 'enriched'
  | 'failed'
  | 'needs_review';

export type ValidationStatus =
  | 'validated'
  | 'provisional'
  | 'needs_manual_review'
  | 'flagged'
  | 'rejected';

export type ExtractionSource =
  | 'title_parsing'
  | 'description_ner'
  | 'specification_table'
  | 'cross_catalog_inference'
  | 'image_ocr'
  | 'attribute_normalizer'
  | 'brand_dictionary'
  | 'rule_engine';

export type ExtractionMethod =
  | 'named_entity_recognition'
  | 'regex_pattern'
  | 'schema_normalization'
  | 'llm_zero_shot'
  | 'llm_few_shot'
  | 'heuristic_rule';

/**
 * Safe structured explainability metadata without internal chain-of-thought.
 */
export interface ExplainabilityMetadata {
  source: ExtractionSource;
  evidenceSnippet: string;
  extractionMethod: ExtractionMethod;
  confidence: number; // 0.0 - 1.0
  validationStatus: ValidationStatus;
  ruleApplied?: string;
}

export interface RecoveredAttribute {
  key: string;
  displayName: string;
  originalValue: string | number | boolean | null;
  recoveredValue: string | number | boolean | string[];
  unit?: string;
  confidence: number; // 0.0 - 1.0
  explainability: ExplainabilityMetadata;
}

export interface MissingAttribute {
  key: string;
  displayName: string;
  importance: 'critical' | 'recommended' | 'optional';
  suggestedValue?: string | number | boolean;
  confidence?: number;
}

export interface EnrichmentMetadata {
  pipelineVersion: string;
  modelProvider: string;
  executionTimeMs: number;
  fieldsProcessed: number;
  attributesRecoveredCount: number;
  safetyAuditPassed: boolean;
  lastEnrichedAt: string;
}

export interface EnrichmentJob {
  id: string;
  status: EnrichmentStatus;
  productIds: string[];
  totalCount: number;
  processedCount: number;
  failedCount: number;
  progress: number; // 0 - 100
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface EnrichmentStatusResponse {
  jobId: string;
  status: EnrichmentStatus;
  progress: number; // 0 - 100
  totalProducts: number;
  processedProducts: number;
  estimatedTimeRemainingSeconds?: number;
  resultsSummary?: {
    enrichedCount: number;
    flaggedCount: number;
    errorCount: number;
  };
}

export interface EnrichmentPreviewResult {
  productId: string;
  currentQualityScore: number;
  projectedQualityScore: number;
  recoveredAttributes: RecoveredAttribute[];
  missingAttributes: MissingAttribute[];
  normalizedFields: Record<
    string,
    {
      before: unknown;
      after: unknown;
      confidence: number;
    }
  >;
  confidenceScore: number; // 0.0 - 1.0
}

export interface BatchEnrichInput {
  productIds: string[];
  priority?: 'low' | 'normal' | 'high';
  autoApproveHighConfidence?: boolean;
  enrichmentTiers?: Array<'attributes' | 'taxonomy' | 'brand' | 'dimensions'>;
}

export interface BatchEnrichmentResponse {
  jobId: string;
  status: EnrichmentStatus;
  queuedCount: number;
  estimatedDurationSeconds: number;
}

export interface EnrichmentOptions {
  forceReenrich?: boolean;
  minConfidenceThreshold?: number;
  priority?: 'low' | 'normal' | 'high';
}

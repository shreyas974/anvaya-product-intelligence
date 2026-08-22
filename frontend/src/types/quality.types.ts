import { PaginationParams } from './api.types';

export type AnomalyType =
  | 'missing_critical_attribute'
  | 'unit_inconsistency'
  | 'outlier_price'
  | 'fuzzy_duplicate'
  | 'brand_mismatch'
  | 'invalid_format'
  | 'category_misclassification';

export type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';

export type AnomalyStatus = 'open' | 'investigating' | 'resolved' | 'ignored';

export interface CatalogAnomaly {
  id: string;
  productId: string;
  productTitle: string;
  productSku: string;
  type: AnomalyType;
  field: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  description: string;
  currentValue: unknown;
  suggestedValue: unknown;
  confidence: number; // 0.0 - 1.0
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface MissingAttributeAnomaly {
  attributeName: string;
  category: string;
  affectedProductsCount: number;
  severity: AnomalySeverity;
  recommendation: string;
}

export interface DuplicateGroup {
  clusterId: string;
  canonicalProductId: string;
  duplicateProductIds: string[];
  similarityScore: number;
  matchReason: string;
  priceDiscrepancyPct?: number;
}

export interface QualityDimensionScores {
  completeness: number; // 0 - 100
  consistency: number; // 0 - 100
  accuracy: number; // 0 - 100
  uniqueness: number; // 0 - 100
}

export interface CategoryQualityScore {
  category: string;
  productCount: number;
  overallScore: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  uniqueness: number;
  openAnomaliesCount: number;
}

export interface QualityTrendPoint {
  date: string;
  score: number;
  completeness: number;
  consistency: number;
}

export interface QualityMetricsSummary {
  overallQualityScore: number; // 0 - 100
  dimensions: QualityDimensionScores;
  totalProductsAudited: number;
  totalAnomaliesCount: number;
  criticalAnomaliesCount: number;
  highAnomaliesCount: number;
  mediumAnomaliesCount: number;
  lowAnomaliesCount: number;
  resolvedAnomaliesCount: number;
  categoryBreakdown: CategoryQualityScore[];
  historicalTrend: QualityTrendPoint[];
}

export interface QualityMetricsQuery {
  categoryId?: string;
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export interface AnomaliesFilterParams {
  severity?: AnomalySeverity;
  status?: AnomalyStatus;
  type?: AnomalyType;
  productId?: string;
}

export type AnomaliesQuery = PaginationParams & AnomaliesFilterParams;

export interface AnomalyResolutionInput {
  status: 'resolved' | 'ignored';
  action: 'accept_suggestion' | 'manual_override' | 'dismiss_false_positive';
  overrideValue?: unknown;
  resolutionNote?: string;
  resolvedBy?: string;
}

import {
  EnrichmentStatus,
  ExplainabilityMetadata,
  EnrichmentMetadata,
  RecoveredAttribute,
  BatchEnrichInput,
  BatchEnrichmentResponse,
} from './enrichment.types';
import { PaginationParams } from './api.types';

export type ProductStatus =
  | 'raw'
  | 'cleaned'
  | 'enriched'
  | 'flagged'
  | 'approved';

export interface ProductAttribute {
  key: string;
  name: string;
  value: string | number | boolean | string[];
  unit?: string;
  isStandardized?: boolean;
  confidence?: number;
  explainability?: ExplainabilityMetadata;
}

export interface RawProductData {
  rawTitle?: string;
  rawDescription?: string;
  rawSpecs?: Record<string, string | number>;
  sourceCatalog?: string;
  rawBrand?: string;
  rawCategory?: string;
  rawPriceString?: string;
  unparsedPayload?: Record<string, unknown>;
}

export interface EnrichedProductData {
  standardizedTitle: string;
  normalizedBrand: string;
  canonicalCategory: string;
  normalizedAttributes: Record<string, string | number | boolean | string[]>;
  recoveredAttributes: RecoveredAttribute[];
  missingAttributes: string[];
  perAttributeConfidence: Record<string, number>;
  explainability: Record<string, ExplainabilityMetadata>;
  enrichmentMetadata: EnrichmentMetadata;
}

export interface ProductTimestamps {
  createdAt: string;
  updatedAt: string;
  lastEnrichedAt?: string;
  lastAuditedAt?: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  images: string[];
  attributes: Record<string, string | number | boolean | string[]>;
  rawData: RawProductData;
  enrichedData?: EnrichedProductData;
  qualityScore: number; // 0 - 100
  enrichmentStatus: EnrichmentStatus;
  confidenceScore: number; // 0.0 - 1.0 or 0 - 100
  status: ProductStatus;
  timestamps: ProductTimestamps;
}

export interface ProductFilterParams {
  category?: string;
  brand?: string;
  status?: ProductStatus;
  enrichmentStatus?: EnrichmentStatus;
  minQualityScore?: number;
  maxQualityScore?: number;
  minConfidence?: number;
  hasAnomalies?: boolean;
  search?: string;
}

export type ProductListQuery = PaginationParams & ProductFilterParams;

export interface CreateProductInput {
  sku: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  currency?: string;
  images?: string[];
  attributes?: Record<string, string | number | boolean | string[]>;
  rawData?: RawProductData;
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  currency?: string;
  images?: string[];
  attributes?: Record<string, string | number | boolean | string[]>;
  status?: ProductStatus;
  enrichmentStatus?: EnrichmentStatus;
  qualityScore?: number;
  confidenceScore?: number;
  enrichedData?: EnrichedProductData;
}

export type { BatchEnrichInput, BatchEnrichmentResponse };

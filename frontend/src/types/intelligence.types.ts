import { PaginationParams } from './api.types';

export interface BrandMarketShare {
  brand: string;
  count: number;
  marketSharePct: number;
  averageQualityScore: number;
}

export interface PriceRangeStats {
  min: number;
  max: number;
  median: number;
  average: number;
}

export interface CategoryInsight {
  category: string;
  categorySlug: string;
  productCount: number;
  averageQualityScore: number;
  averagePrice: number;
  currency: string;
  topBrands: BrandMarketShare[];
  completenessRate: number; // 0 - 100
  commonMissingAttributes: string[];
  priceRange: PriceRangeStats;
  keyAttributeCoverage: Record<string, number>; // Attribute name -> percentage (0 - 100)
}

export interface TaxonomyAttribute {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'array';
  required: boolean;
  unit?: string;
  allowedValues?: string[];
}

export interface TaxonomyNode {
  id: string;
  name: string;
  slug: string;
  level: number;
  parentId?: string;
  productCount: number;
  children?: TaxonomyNode[];
  attributeSchema?: TaxonomyAttribute[];
}

export interface DuplicateItem {
  id: string;
  sku: string;
  title: string;
  price: number;
  currency: string;
  brand: string;
  similarityScore: number; // 0.0 - 1.0
  discrepancySummary: string[];
  sourceCatalog?: string;
}

export interface CanonicalProductSummary {
  id: string;
  sku: string;
  title: string;
  price: number;
  currency: string;
  brand: string;
  qualityScore: number;
}

export interface SemanticDuplicateCluster {
  clusterId: string;
  clusterName: string;
  similarityScore: number; // 0.0 - 1.0
  matchConfidence: number; // 0.0 - 1.0
  matchCriteria: string[];
  canonicalProduct: CanonicalProductSummary;
  duplicates: DuplicateItem[];
  estimatedCostSavingsPotential?: number;
}

export interface MarketTrendInsight {
  id: string;
  title: string;
  category: string;
  trendType: 'price_volatility' | 'attribute_gap' | 'catalog_growth' | 'quality_risk';
  summary: string;
  metricChange: {
    label: string;
    value: string;
    positive: boolean;
  };
  confidence: number;
}

export interface AnomalyInsightSummary {
  totalAnomalies: number;
  distributionByType: Record<string, number>;
  highestRiskCategory: string;
  commonRootCauses: string[];
  autoRemediationRatePct: number;
}

export interface DuplicateFilterParams {
  minSimilarity?: number;
  category?: string;
  clusterId?: string;
}

export type DuplicateQuery = PaginationParams & DuplicateFilterParams;

from pydantic import BaseModel


class QualityDimensionScores(BaseModel):
    completeness: float
    consistency: float
    accuracy: float
    uniqueness: float


class QualityMetricsSummary(BaseModel):
    overallQualityScore: float
    dimensions: QualityDimensionScores
    totalProductsAudited: int
    totalAnomaliesCount: int
    criticalAnomaliesCount: int
    highAnomaliesCount: int
    mediumAnomaliesCount: int
    lowAnomaliesCount: int
    resolvedAnomaliesCount: int
    categoryBreakdown: list
    historicalTrend: list
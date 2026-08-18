import { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  ShieldCheck,
  Zap,
  Copy,
  UploadCloud,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { Button } from '@/components/ui/button';

import { QualityMetricsCard } from '@/components/dashboard/QualityMetricsCard';
import { EnrichmentPipelineCard } from '@/components/dashboard/EnrichmentPipelineCard';
import { MissingAttributesCard } from '@/components/dashboard/MissingAttributesCard';
import { DuplicateClustersCard } from '@/components/dashboard/DuplicateClustersCard';
import { CategoryInsightsCard } from '@/components/dashboard/CategoryInsightsCard';
import { IngestionCTABanner } from '@/components/dashboard/IngestionCTABanner';

import { qualityService } from '@/services/quality.service';
import { enrichmentService } from '@/services/enrichment.service';
import { productsService } from '@/services/products.service';
import { intelligenceService } from '@/services/intelligence.service';
import { mockMissingAttributeAnomalies } from '@/services/mocks/mockQuality';

import { QualityMetricsSummary } from '@/types/quality.types';
import { EnrichmentStatusResponse } from '@/types/enrichment.types';
import { Product } from '@/types/product.types';
import { SemanticDuplicateCluster, CategoryInsight } from '@/types/intelligence.types';
import { NavigationSection } from '@/layouts/Sidebar';

export interface DashboardPageProps {
  onNavigate?: (section: NavigationSection) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [qualityMetrics, setQualityMetrics] = useState<QualityMetricsSummary | null>(null);
  const [activeJobStatus, setActiveJobStatus] = useState<EnrichmentStatusResponse | undefined>(undefined);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [duplicateClusters, setDuplicateClusters] = useState<SemanticDuplicateCluster[]>([]);
  const [categoryInsights, setCategoryInsights] = useState<CategoryInsight[]>([]);

  const loadDashboardData = async () => {
    try {
      const [metrics, jobStatus, productsResp, duplicates, categories] = await Promise.all([
        qualityService.fetchQualityMetrics(),
        enrichmentService.getEnrichmentStatus('job-enr-801'),
        productsService.fetchProducts({ limit: 6 }),
        intelligenceService.fetchDuplicates(),
        intelligenceService.fetchCategoryInsights(),
      ]);

      setQualityMetrics(metrics);
      setActiveJobStatus(jobStatus);
      setRecentProducts(productsResp.data);
      setDuplicateClusters(duplicates);
      setCategoryInsights(categories);
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleBatchEnrich = async () => {
    await productsService.batchEnrich({ productIds: ['prod-001', 'prod-002', 'prod-003'] });
    await loadDashboardData();
  };

  const handleMergeCluster = async (clusterId: string) => {
    console.log(`Merge cluster triggered for: ${clusterId}`);
    if (onNavigate) onNavigate('intelligence');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" data-testid="dashboard-loading">
        <div className="h-14 w-1/3 bg-muted rounded-md" />
        <SkeletonLoader variant="stat" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 bg-card rounded-lg border border-border/50" />
          <div className="h-80 bg-card rounded-lg border border-border/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Dashboard Page Header */}
      <PageHeader
        title="ANVAYA Product Intelligence"
        description="Autonomous data cleansing, attribute recovery, and catalog intelligence platform."
        badge={
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Telemetry Active</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('products')}
              className="gap-1.5 text-xs"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>View Catalog</span>
            </Button>
            <Button
              size="sm"
              onClick={() => onNavigate?.('ingestion')}
              className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs shadow-sm shadow-primary/20"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Ingest Raw Data</span>
            </Button>
          </div>
        }
      />

      {/* KPI Stat Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Ingested Products"
          value={qualityMetrics?.totalProductsAudited.toLocaleString() || '1,420'}
          icon={Database}
          change={{ value: '+18%', direction: 'up', label: 'vs last import' }}
        />
        <StatCard
          title="Catalog Quality Score"
          value={qualityMetrics ? `${qualityMetrics.overallQualityScore}/100` : '88.4/100'}
          icon={ShieldCheck}
          change={{ value: '+13.9 pts', direction: 'up', label: 'post-enrichment' }}
        />
        <StatCard
          title="AI Enrichment Rate"
          value="90.7%"
          icon={Zap}
          change={{ value: '1,288 SKUs', direction: 'up', label: 'recovered' }}
        />
        <StatCard
          title="Duplicate Clusters"
          value={`${duplicateClusters.length} Clusters`}
          icon={Copy}
          change={{ value: '₹63.5k/mo', direction: 'neutral', label: 'est. savings' }}
        />
      </div>

      {/* Main Two-Column Grid: Quality Score & Enrichment Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        {qualityMetrics && (
          <QualityMetricsCard
            metrics={qualityMetrics}
            onViewAnomalies={() => onNavigate?.('quality')}
          />
        )}
        <EnrichmentPipelineCard
          activeJobStatus={activeJobStatus}
          recentProducts={recentProducts}
          onBatchEnrich={handleBatchEnrich}
          onExploreCatalog={() => onNavigate?.('products')}
        />
      </div>

      {/* Secondary Two-Column Grid: Missing Attributes & Duplicate Clusters */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MissingAttributesCard
          missingAttributes={mockMissingAttributeAnomalies}
          onRecoverMissing={handleBatchEnrich}
        />
        <DuplicateClustersCard
          duplicateClusters={duplicateClusters}
          onViewDuplicates={() => onNavigate?.('intelligence')}
          onMergeCluster={handleMergeCluster}
        />
      </div>

      {/* Category Intelligence & Benchmarking */}
      {categoryInsights.length > 0 && (
        <CategoryInsightsCard
          categories={categoryInsights}
          onCategorySelect={(slug) => console.log('Selected category:', slug)}
        />
      )}

      {/* High-Impact Ingestion CTA Banner */}
      <IngestionCTABanner
        onStartIngestion={() => onNavigate?.('ingestion')}
        onExploreCatalog={() => onNavigate?.('products')}
      />
    </div>
  );
}

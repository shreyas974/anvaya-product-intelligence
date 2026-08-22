import { useState, useEffect } from 'react';
import { AICopilot } from '@/components/common/AICopilot';
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
import { Brain, ArrowRight, CheckCircle2 } from 'lucide-react';


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
      {/* AI Executive Insight */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-lg">
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
                <Brain className="h-5 w-5 text-primary" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    AI Executive Insight
                  </h3>

                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                    LIVE ANALYSIS
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                  ANVAYA has analyzed your latest catalog telemetry and identified
                  the areas most likely to improve your catalog health.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => onNavigate?.('quality')}
              className="gap-1.5 shrink-0"
            >
              Review Insights
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">

            <div className="rounded-xl border border-border/50 bg-background/40 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Catalog Health
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold">
                {qualityMetrics?.overallQualityScore ?? 88.4}/100
              </p>

              <p className="mt-1 text-[10px] text-emerald-400">
                Healthy trajectory
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-background/40 p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Biggest Opportunity
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold">
                Recover missing attributes
              </p>

              <p className="mt-1 text-[10px] text-muted-foreground">
                {mockMissingAttributeAnomalies.length} areas need attention
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-background/40 p-3">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Next Recommended Step
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold">
                Review duplicate clusters
              </p>

              <p className="mt-1 text-[10px] text-muted-foreground">
                {duplicateClusters.length} clusters detected
              </p>
            </div>

          </div>
        </div>
      </div>
      {/* Priority Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              What needs your attention
            </h3>
            <p className="text-xs text-muted-foreground">
              AI-prioritized actions based on your catalog telemetry
            </p>
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {3} priorities
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">

          {/* Priority 1 */}
          <div className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                  High Priority
                </span>
              </div>

              <span className="text-[10px] text-muted-foreground">
                Quality impact
              </span>
            </div>

            <h4 className="mt-3 text-sm font-semibold">
              Recover missing attributes
            </h4>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Important product information is missing across several catalog areas.
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('quality')}
              className="mt-3 h-7 px-0 text-xs text-primary hover:bg-transparent"
            >
              Review attributes →
            </Button>
          </div>

          {/* Priority 2 */}
          <div className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Medium Priority
                </span>
              </div>

              <span className="text-[10px] text-muted-foreground">
                Data hygiene
              </span>
            </div>

            <h4 className="mt-3 text-sm font-semibold">
              Review duplicate clusters
            </h4>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {duplicateClusters.length} semantic clusters may contain overlapping products.
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('intelligence')}
              className="mt-3 h-7 px-0 text-xs text-primary hover:bg-transparent"
            >
              Review duplicates →
            </Button>
          </div>

          {/* Priority 3 */}
          <div className="group rounded-xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Optimization
                </span>
              </div>

              <span className="text-[10px] text-muted-foreground">
                AI enrichment
              </span>
            </div>

            <h4 className="mt-3 text-sm font-semibold">
              Validate enrichment results
            </h4>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Review lower-confidence AI recoveries before finalizing your catalog.
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('quality')}
              className="mt-3 h-7 px-0 text-xs text-primary hover:bg-transparent"
            >
              Review enrichment →
            </Button>
          </div>

        </div>
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

      <AICopilot
        qualityScore={qualityMetrics?.overallQualityScore}
        totalProducts={qualityMetrics?.totalProductsAudited}
        enrichmentRate={90.7}
        duplicateClusters={duplicateClusters.length}
        missingAttributes={mockMissingAttributeAnomalies.length}
        products={recentProducts}
      />
    </div>

  );
}

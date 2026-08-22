import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';

import { qualityService } from '@/services/quality.service';
import type {
  AnomalySeverity,
  AnomalyStatus,
  CatalogAnomaly,
  QualityMetricsSummary,
} from '@/types/quality.types';

import { PageHeader } from '@/components/common/PageHeader';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';
import { StatCard } from '@/components/common/StatCard';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

export function QualityPage() {
  const [metrics, setMetrics] = useState<QualityMetricsSummary | null>(null);
  const [anomalies, setAnomalies] = useState<CatalogAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [anomaliesLoading, setAnomaliesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<
    AnomalySeverity | 'all'
  >('all');
  const [statusFilter, setStatusFilter] = useState<
    AnomalyStatus | 'all'
  >('all');

  const loadQualityData = async () => {
    setLoading(true);
    setAnomaliesLoading(true);
    setError(null);

    try {
      const [metricsResponse, anomaliesResponse] = await Promise.all([
        qualityService.fetchQualityMetrics(),
        qualityService.fetchAnomalies({ page: 1, limit: 50 }),
      ]);

      setMetrics(metricsResponse);
      setAnomalies(anomaliesResponse.data);
    } catch (err) {
      console.error('Failed to load quality data:', err);
      setError('Unable to load quality data. Please try again.');
    } finally {
      setLoading(false);
      setAnomaliesLoading(false);
    }
  };

  useEffect(() => {
    void loadQualityData();
  }, []);

  const filteredAnomalies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return anomalies.filter((anomaly) => {
      const matchesSearch =
        !query ||
        anomaly.productTitle.toLowerCase().includes(query) ||
        anomaly.productSku.toLowerCase().includes(query) ||
        anomaly.description.toLowerCase().includes(query) ||
        anomaly.field.toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === 'all' || anomaly.severity === severityFilter;

      const matchesStatus =
        statusFilter === 'all' || anomaly.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [anomalies, search, severityFilter, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quality"
          description="Catalog health, anomaly detection, and quality monitoring."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Quality"
          description="Catalog health, anomaly detection, and quality monitoring."
        />
        <EmptyState
          icon={AlertTriangle}
          title="Quality data unavailable"
          description={error ?? 'No quality metrics are available.'}
          action={
            <Button onClick={() => void loadQualityData()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality"
        description="Catalog health, anomaly detection, and quality monitoring."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadQualityData()}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Catalog Health</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Overall quality across {metrics.totalProductsAudited.toLocaleString()} audited products.
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {metrics.overallQualityScore.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">out of 100</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Completeness"
          value={`${metrics.dimensions.completeness.toFixed(1)}%`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Consistency"
          value={`${metrics.dimensions.consistency.toFixed(1)}%`}
          icon={ShieldCheck}
        />
        <StatCard
          title="Accuracy"
          value={`${metrics.dimensions.accuracy.toFixed(1)}%`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Uniqueness"
          value={`${metrics.dimensions.uniqueness.toFixed(1)}%`}
          icon={ShieldCheck}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Critical"
          value={metrics.criticalAnomaliesCount}
          icon={AlertTriangle}
        />
        <StatCard
          title="High"
          value={metrics.highAnomaliesCount}
          icon={AlertTriangle}
        />
        <StatCard
          title="Medium"
          value={metrics.mediumAnomaliesCount}
          icon={AlertTriangle}
        />
        <StatCard
          title="Resolved"
          value={metrics.resolvedAnomaliesCount}
          icon={CheckCircle2}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Anomalies</h2>
          <p className="text-sm text-muted-foreground">
            Detect and review issues identified in the product catalog.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, SKU, field, or description..."
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value as AnomalySeverity | 'all')
            }
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as AnomalyStatus | 'all')
            }
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>
        </div>

        {anomaliesLoading ? (
          <div className="mt-6">
            <SkeletonLoader />
          </div>
        ) : filteredAnomalies.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium">No anomalies found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try changing the search or filters.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {filteredAnomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="rounded-lg border border-border/70 bg-background/50 p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{anomaly.productTitle}</h3>
                      <span className="text-xs text-muted-foreground">
                        {anomaly.productSku}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {anomaly.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs capitalize">
                        {anomaly.type.replace(/_/g, ' ')}
                      </span>

                      <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                        Field: {anomaly.field}
                      </span>

                      <ConfidenceBadge
                        score={anomaly.confidence}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize">
                      {anomaly.severity}
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize">
                      {anomaly.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

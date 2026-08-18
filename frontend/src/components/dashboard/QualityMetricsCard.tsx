
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QualityMetricsSummary } from '@/types/quality.types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface QualityMetricsCardProps {
  metrics: QualityMetricsSummary;
  onViewAnomalies?: () => void;
}

export function QualityMetricsCard({ metrics, onViewAnomalies }: QualityMetricsCardProps) {
  const { dimensions, historicalTrend, overallQualityScore } = metrics;

  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Catalog Quality Health Index</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Multi-dimensional scoring across completeness, consistency, accuracy, and uniqueness.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-400">
              <span className="text-xl font-extrabold">{overallQualityScore}</span>
              <span className="text-xs font-semibold text-emerald-400/80">/ 100</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* 4 Dimension Bars */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 rounded-lg border border-border/40 bg-secondary/30 p-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Completeness</span>
              <span className="font-semibold text-foreground">{dimensions.completeness}%</span>
            </div>
            <Progress value={dimensions.completeness} indicatorClassName="bg-blue-500" />
            <span className="text-[10px] text-muted-foreground">Attributes populated</span>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border/40 bg-secondary/30 p-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Consistency</span>
              <span className="font-semibold text-foreground">{dimensions.consistency}%</span>
            </div>
            <Progress value={dimensions.consistency} indicatorClassName="bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">Units & format standardized</span>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border/40 bg-secondary/30 p-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-semibold text-foreground">{dimensions.accuracy}%</span>
            </div>
            <Progress value={dimensions.accuracy} indicatorClassName="bg-teal-500" />
            <span className="text-[10px] text-muted-foreground">Brand & specs verified</span>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border/40 bg-secondary/30 p-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Uniqueness</span>
              <span className="font-semibold text-foreground">{dimensions.uniqueness}%</span>
            </div>
            <Progress value={dimensions.uniqueness} indicatorClassName="bg-amber-500" />
            <span className="text-[10px] text-muted-foreground">Deduplicated catalog</span>
          </div>
        </div>

        {/* Historical Quality Score Trend Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>7-Day Quality Score Trajectory</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-400">+13.9 pts growth</span>
          </div>

          <div className="h-44 w-full rounded-lg border border-border/40 bg-secondary/20 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val: string) => val.slice(5)}
                />
                <YAxis
                  domain={[60, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: number) => [`${val} pts`, 'Quality Score']}
                  labelFormatter={(label: string) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#qualityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Audit Breakdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-semibold text-muted-foreground">Anomaly Audit:</span>
            <div className="flex items-center gap-1.5 text-rose-400 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{metrics.criticalAnomaliesCount} Critical</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{metrics.highAnomaliesCount} High</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400 font-medium">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{metrics.mediumAnomaliesCount + metrics.lowAnomaliesCount} Medium/Low</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{metrics.resolvedAnomaliesCount} Resolved</span>
            </div>
          </div>

          {onViewAnomalies && (
            <button
              onClick={onViewAnomalies}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Audit Anomalies &rarr;
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

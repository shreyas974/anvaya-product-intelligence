import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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

export function QualityMetricsCard({
  metrics,
  onViewAnomalies,
}: QualityMetricsCardProps) {
  const {
    dimensions,
    historicalTrend,
    overallQualityScore,
  } = metrics;

  const score = Number(overallQualityScore);

  const scoreLabel =
    score >= 90
      ? 'Excellent'
      : score >= 80
        ? 'Healthy'
        : score >= 70
          ? 'Needs Attention'
          : 'Critical';

  const scoreColor =
    score >= 90
      ? 'text-emerald-400'
      : score >= 80
        ? 'text-blue-400'
        : score >= 70
          ? 'text-amber-400'
          : 'text-rose-400';

  return (
    <Card
      className="
        group relative overflow-hidden
        border-border/70 bg-card
        shadow-lg shadow-black/5
        transition-all duration-300
        hover:border-primary/20
        hover:shadow-xl hover:shadow-primary/5
      "
    >
      {/* Ambient glow */}
      <div className="
        pointer-events-none absolute
        -right-24 -top-24
        h-64 w-64
        rounded-full
        bg-primary/5
        blur-3xl
      " />

      <CardHeader className="relative pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="
                flex h-8 w-8 items-center justify-center
                rounded-xl
                border border-emerald-500/20
                bg-emerald-500/10
              ">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>

              <div>
                <CardTitle className="text-lg font-bold tracking-tight">
                  Catalog Quality Health
                </CardTitle>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    AI quality monitoring active
                  </span>
                </div>
              </div>
            </div>

            <CardDescription className="max-w-xl text-xs leading-relaxed">
              Multi-dimensional intelligence across completeness,
              consistency, accuracy, and catalog uniqueness.
            </CardDescription>
          </div>

          {/* Score */}
          <div className="
            relative flex shrink-0 items-center gap-3
            rounded-2xl
            border border-emerald-500/20
            bg-emerald-500/5
            px-4 py-3
          ">
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Overall Score
              </p>

              <div className="flex items-baseline justify-end gap-1">
                <span className={`text-3xl font-black tracking-tight ${scoreColor}`}>
                  {overallQualityScore}
                </span>

                <span className="text-xs font-semibold text-muted-foreground">
                  /100
                </span>
              </div>

              <span className={`text-[10px] font-bold uppercase tracking-wider ${scoreColor}`}>
                {scoreLabel}
              </span>
            </div>

            <div className="
              flex h-11 w-11 items-center justify-center
              rounded-full
              border border-emerald-500/20
              bg-emerald-500/10
            ">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6 pt-0">

        {/* Dimension cards */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Quality Dimensions
              </span>
            </div>

            <span className="text-[10px] font-medium text-muted-foreground">
              Live catalog health
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">

            {/* Completeness */}
            <div className="
              group/dimension
              rounded-xl
              border border-border/50
              bg-secondary/20
              p-3.5
              transition-all duration-300
              hover:border-blue-500/20
              hover:bg-blue-500/5
            ">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Completeness
                </span>

                <span className="text-sm font-black text-blue-400">
                  {dimensions.completeness}%
                </span>
              </div>

              <Progress
                value={dimensions.completeness}
                indicatorClassName="bg-blue-500"
              />

              <p className="mt-2 text-[10px] text-muted-foreground">
                Attributes populated
              </p>
            </div>

            {/* Consistency */}
            <div className="
              group/dimension
              rounded-xl
              border border-border/50
              bg-secondary/20
              p-3.5
              transition-all duration-300
              hover:border-emerald-500/20
              hover:bg-emerald-500/5
            ">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Consistency
                </span>

                <span className="text-sm font-black text-emerald-400">
                  {dimensions.consistency}%
                </span>
              </div>

              <Progress
                value={dimensions.consistency}
                indicatorClassName="bg-emerald-500"
              />

              <p className="mt-2 text-[10px] text-muted-foreground">
                Units & format standardized
              </p>
            </div>

            {/* Accuracy */}
            <div className="
              group/dimension
              rounded-xl
              border border-border/50
              bg-secondary/20
              p-3.5
              transition-all duration-300
              hover:border-cyan-500/20
              hover:bg-cyan-500/5
            ">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Accuracy
                </span>

                <span className="text-sm font-black text-cyan-400">
                  {dimensions.accuracy}%
                </span>
              </div>

              <Progress
                value={dimensions.accuracy}
                indicatorClassName="bg-cyan-500"
              />

              <p className="mt-2 text-[10px] text-muted-foreground">
                Brand & specs verified
              </p>
            </div>

            {/* Uniqueness */}
            <div className="
              group/dimension
              rounded-xl
              border border-border/50
              bg-secondary/20
              p-3.5
              transition-all duration-300
              hover:border-amber-500/20
              hover:bg-amber-500/5
            ">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Uniqueness
                </span>

                <span className="text-sm font-black text-amber-400">
                  {dimensions.uniqueness}%
                </span>
              </div>

              <Progress
                value={dimensions.uniqueness}
                indicatorClassName="bg-amber-500"
              />

              <p className="mt-2 text-[10px] text-muted-foreground">
                Duplicate-free catalog
              </p>
            </div>
          </div>
        </div>

        {/* Historical trend */}
        <div className="
          rounded-xl
          border border-border/50
          bg-secondary/15
          p-3.5
        ">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />

                <span className="text-xs font-bold text-foreground">
                  Quality Score Trajectory
                </span>
              </div>

              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Last 7 days of catalog health
              </p>
            </div>

            <div className="
              flex items-center gap-1
              rounded-full
              border border-emerald-500/20
              bg-emerald-500/10
              px-2.5 py-1
              text-[10px] font-bold text-emerald-400
            ">
              <ArrowUpRight className="h-3 w-3" />
              +13.9 pts
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historicalTrend}
                margin={{
                  top: 10,
                  right: 8,
                  left: -25,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="qualityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#3b82f6"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="#3b82f6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: '#94a3b8',
                    fontSize: 9,
                  }}
                  tickFormatter={(val: string) => val.slice(5)}
                />

                <YAxis
                  domain={[60, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: '#64748b',
                    fontSize: 9,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: number) => [
                    `${val} pts`,
                    'Quality Score',
                  ]}
                  labelFormatter={(label: string) =>
                    `Date: ${label}`
                  }
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

        {/* Anomaly audit */}
        <div className="
          rounded-xl
          border border-border/50
          bg-secondary/20
          p-3.5
        ">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-foreground">
                Anomaly Audit
              </span>

              <p className="text-[10px] text-muted-foreground">
                Issues requiring catalog attention
              </p>
            </div>

            {onViewAnomalies && (
              <button
                onClick={onViewAnomalies}
                className="
                  flex items-center gap-1
                  text-[10px] font-bold
                  text-primary
                  transition-colors
                  hover:text-primary/80
                "
              >
                View audit
                <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
          {historicalTrend?.length >= 2 && (() => {
            const firstScore = Number(historicalTrend[0]?.score ?? 0);
            const latestScore = Number(
              historicalTrend[historicalTrend.length - 1]?.score ?? 0
            );

            const change = latestScore - firstScore;
            const isImproving = change > 0;
            const isDeclining = change < 0;

            return (
              <div
                className={`
        flex items-center gap-1
        rounded-full
        border px-2.5 py-1
        text-[10px] font-bold
        ${isImproving
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                    : isDeclining
                      ? 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                      : 'border-border/60 bg-secondary/60 text-muted-foreground'
                  }
      `}
              >
                <ArrowUpRight
                  className={`h-3 w-3 ${isDeclining ? 'rotate-90' : ''
                    }`}
                />

                {change > 0 ? '+' : ''}
                {change.toFixed(1)} pts
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

            <div className="
              rounded-lg
              border border-rose-500/15
              bg-rose-500/5
              p-2.5
            ">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Critical
                </span>
              </div>

              <p className="mt-1 text-lg font-black text-rose-400">
                {metrics.criticalAnomaliesCount}
              </p>
            </div>

            <div className="
              rounded-lg
              border border-amber-500/15
              bg-amber-500/5
              p-2.5
            ">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[10px] font-semibold text-muted-foreground">
                  High
                </span>
              </div>

              <p className="mt-1 text-lg font-black text-amber-400">
                {metrics.highAnomaliesCount}
              </p>
            </div>

            <div className="
              rounded-lg
              border border-blue-500/15
              bg-blue-500/5
              p-2.5
            ">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Medium / Low
                </span>
              </div>

              <p className="mt-1 text-lg font-black text-blue-400">
                {metrics.mediumAnomaliesCount +
                  metrics.lowAnomaliesCount}
              </p>
            </div>

            <div className="
              rounded-lg
              border border-emerald-500/15
              bg-emerald-500/5
              p-2.5
            ">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Resolved
                </span>
              </div>

              <p className="mt-1 text-lg font-black text-emerald-400">
                {metrics.resolvedAnomaliesCount}
              </p>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}









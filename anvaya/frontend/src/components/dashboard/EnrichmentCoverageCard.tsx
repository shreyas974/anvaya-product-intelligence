import { Target } from 'lucide-react';

export function EnrichmentCoverageCard() {
  const percentage = 92.7;
  const remaining = 7.3;

  const histogramBars = [45, 62, 78, 90, 85, 94, 88, 92, 96, 91, 95, 98];

  return (
    <div className="liquid-glass group relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Enrichment Coverage</h3>
            <p className="text-[10px] text-muted-foreground">
              Across all critical attributes
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-400">92.7%</span>
      </div>

      {/* Radial Progress Ring */}
      <div className="relative mt-3 flex flex-col items-center justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="8"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 * (1 - percentage / 100)}
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            />
          </svg>

          {/* Centered Text */}
          <div className="absolute flex flex-col items-center text-center">
            <span className="text-2xl font-black text-white">{percentage}%</span>
            <span className="text-[9px] font-semibold text-emerald-400">Validated</span>
          </div>
        </div>

        <p className="mt-1 text-[11px] font-medium text-slate-300">
          <span className="font-bold text-emerald-400">{remaining}%</span> to perfection
        </p>
      </div>

      {/* Activity Histogram Bars */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="flex items-end justify-between gap-1.5 h-7">
          {histogramBars.map((h, idx) => (
            <div
              key={idx}
              style={{ height: `${h}%` }}
              className="w-full rounded-t-sm bg-gradient-to-t from-emerald-500/20 to-emerald-400 transition-all hover:bg-emerald-300"
              title={`Batch ${idx + 1}: ${h}%`}
            />
          ))}
        </div>
        <p className="mt-1 text-right text-[9px] text-muted-foreground">
          Last 12 enrichment batches
        </p>
      </div>
    </div>
  );
}

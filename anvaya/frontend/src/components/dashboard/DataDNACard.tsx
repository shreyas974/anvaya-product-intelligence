import { Dna } from 'lucide-react';

export function DataDNACard() {
  const overallScore = 96.4;

  const dimensions = [
    { label: 'Completeness', value: 96.8, angle: -Math.PI / 2 },
    { label: 'Consistency', value: 95.1, angle: -Math.PI / 2 + (Math.PI * 2) / 5 },
    { label: 'Freshness', value: 98.3, angle: -Math.PI / 2 + ((Math.PI * 2) / 5) * 2 },
    { label: 'Uniqueness', value: 94.6, angle: -Math.PI / 2 + ((Math.PI * 2) / 5) * 3 },
    { label: 'Accuracy', value: 97.2, angle: -Math.PI / 2 + ((Math.PI * 2) / 5) * 4 },
  ];

  const size = 200;
  const center = size / 2;
  const maxRadius = 68;

  // Calculate polygon points
  const points = dimensions
    .map((dim) => {
      const r = (dim.value / 100) * maxRadius;
      const x = center + Math.cos(dim.angle) * r;
      const y = center + Math.sin(dim.angle) * r;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="liquid-glass group relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <Dna className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Data DNA — The 5 Dimensions</h3>
            <p className="text-[10px] text-muted-foreground">
              Holistic quality score powered by Anvaya DNA
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-cyan-400">96.4 Score</span>
      </div>

      {/* 5-Axis Radar Chart */}
      <div className="relative mt-3 flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background Concentric Webs */}
          {[0.25, 0.5, 0.75, 1].map((scale, i) => {
            const webPoints = dimensions
              .map((dim) => {
                const r = maxRadius * scale;
                const x = center + Math.cos(dim.angle) * r;
                const y = center + Math.sin(dim.angle) * r;
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <polygon
                key={i}
                points={webPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis Radial Spokes */}
          {dimensions.map((dim, i) => {
            const endX = center + Math.cos(dim.angle) * maxRadius;
            const endY = center + Math.sin(dim.angle) * maxRadius;
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="rgba(6, 182, 212, 0.2)"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Aurora Polygon */}
          <polygon
            points={points}
            fill="rgba(6, 182, 212, 0.25)"
            stroke="#06b6d4"
            strokeWidth="2"
            className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
          />

          {/* Radar Vertices */}
          {dimensions.map((dim, i) => {
            const r = (dim.value / 100) * maxRadius;
            const x = center + Math.cos(dim.angle) * r;
            const y = center + Math.sin(dim.angle) * r;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#38bdf8"
                stroke="#04060e"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* Center Score Badge */}
        <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
          <span className="text-lg font-black text-white">{overallScore}</span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-400">
            DNA Index
          </span>
        </div>
      </div>

      {/* Metric Breakdown Badges */}
      <div className="mt-2 grid grid-cols-5 gap-1 text-center">
        {dimensions.map((dim, idx) => (
          <div key={idx} className="rounded-lg bg-white/5 p-1">
            <p className="truncate text-[8px] uppercase tracking-wider text-muted-foreground">
              {dim.label}
            </p>
            <p className="text-[11px] font-bold text-cyan-300">{dim.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

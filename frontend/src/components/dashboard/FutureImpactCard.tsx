import { TrendingUp } from 'lucide-react';

export function FutureImpactCard() {
  const dataPoints = [
    { month: 'Jul', value: 1.4 },
    { month: 'Aug', value: 1.8 },
    { month: 'Sep', value: 2.2 },
    { month: 'Oct', value: 2.7 },
    { month: 'Nov', value: 3.2 },
    { month: 'Dec', value: 3.8 },
  ];

  const svgWidth = 240;
  const svgHeight = 70;
  const maxVal = 4.2;

  const points = dataPoints.map((d, i) => {
    const x = (i / (dataPoints.length - 1)) * (svgWidth - 20) + 10;
    const y = svgHeight - (d.value / maxVal) * (svgHeight - 15) - 5;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  return (
    <div className="liquid-glass group relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-pink-500/30 bg-pink-500/10 text-pink-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Future Impact Predictor</h3>
            <p className="text-[10px] text-muted-foreground">AI forecasts your next leap</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Projected Impact</p>
          <p className="text-xs font-black text-pink-400">$3.8M by Dec 2026</p>
        </div>
      </div>

      {/* Aurora Flowing Line Chart */}
      <div className="relative mt-2 flex justify-center">
        <svg width={svgWidth} height={svgHeight} className="overflow-visible">
          <defs>
            <linearGradient id="futureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill Area */}
          <path d={areaD} fill="url(#futureGradient)" />

          {/* Glow Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#ec4899"
            strokeWidth="2.5"
            className="filter drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]"
          />

          {/* Glowing Peak Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === points.length - 1 ? '4' : '2.5'}
              fill="#f472b6"
              stroke="#04060e"
              strokeWidth="1.5"
              className={i === points.length - 1 ? 'animate-pulse' : ''}
            />
          ))}
        </svg>
      </div>

      {/* 4 Bottom Metric Cards */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-2.5">
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-[9px] font-medium text-muted-foreground">Revenue Lift</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-white">$3.8M</span>
            <span className="text-[10px] font-bold text-emerald-400">↑ 34%</span>
          </div>
        </div>

        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-[9px] font-medium text-muted-foreground">Cost Savings</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-white">$1.2M</span>
            <span className="text-[10px] font-bold text-emerald-400">↑ 26%</span>
          </div>
        </div>

        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-[9px] font-medium text-muted-foreground">Time Saved</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-white">2,640 hrs</span>
            <span className="text-[10px] font-bold text-emerald-400">↑ 22%</span>
          </div>
        </div>

        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-[9px] font-medium text-muted-foreground">Quality Gain</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-white">+18.7%</span>
            <span className="text-[10px] font-bold text-emerald-400">↑ 16%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

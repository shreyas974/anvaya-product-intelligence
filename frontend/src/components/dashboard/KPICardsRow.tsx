import {
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  Gem,
} from 'lucide-react';

export interface KPIData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  color: 'cyan' | 'purple' | 'emerald' | 'blue' | 'magenta';
  icon: any;
  glowClass: string;
}

const KPIS: KPIData[] = [
  {
    title: 'Products Processed',
    value: '18,42,391',
    change: '↑ 12.6%',
    isPositive: true,
    color: 'cyan',
    icon: Layers,
    glowClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
  },
  {
    title: 'Enrichment Accuracy',
    value: '97.43%',
    change: '↑ 2.1%',
    isPositive: true,
    color: 'purple',
    icon: Sparkles,
    glowClass: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
  },
  {
    title: 'Avg. Enrichment Time',
    value: '2.31s',
    change: '↓ 18%',
    isPositive: true,
    color: 'emerald',
    icon: Zap,
    glowClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  },
  {
    title: 'Human Review Saved',
    value: '1,248 hrs',
    change: '↑ 31%',
    isPositive: true,
    color: 'blue',
    icon: ShieldCheck,
    glowClass: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  },
  {
    title: 'Business Impact',
    value: '$2.41M',
    change: '↑ 28%',
    isPositive: true,
    color: 'magenta',
    icon: Gem,
    glowClass: 'bg-pink-500/10 text-pink-400 border-pink-500/25',
  },
];

export function KPICardsRow() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {KPIS.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="liquid-glass-card group relative overflow-hidden rounded-2xl p-4 transition-all duration-300"
          >
            {/* Ambient Background Flare */}
            <div
              className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60 ${
                kpi.color === 'cyan'
                  ? 'bg-cyan-500/20'
                  : kpi.color === 'purple'
                  ? 'bg-purple-500/20'
                  : kpi.color === 'emerald'
                  ? 'bg-emerald-500/20'
                  : kpi.color === 'blue'
                  ? 'bg-blue-500/20'
                  : 'bg-pink-500/20'
              }`}
            />

            {/* Top Row: Icon + Title */}
            <div className="relative flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
                {kpi.title}
              </span>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl border ${kpi.glowClass} shadow-sm`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Main Metric Value */}
            <div className="relative mt-3">
              <p className="text-2xl font-black tracking-tight text-white sm:text-[26px]">
                {kpi.value}
              </p>
            </div>

            {/* Bottom Change Badge */}
            <div className="relative mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
              <span>{kpi.change}</span>
              <span className="text-[10px] font-normal text-muted-foreground/80">vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

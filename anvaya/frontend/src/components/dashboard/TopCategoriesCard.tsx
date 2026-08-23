import { Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TopCategoriesProps {
  onViewAll?: () => void;
}

export function TopCategoriesCard({ onViewAll }: TopCategoriesProps) {
  const categories = [
    { rank: 1, name: 'Pipe Fittings', accuracy: 98.7, color: 'from-cyan-500 to-blue-500' },
    { rank: 2, name: 'Faucets', accuracy: 97.9, color: 'from-purple-500 to-pink-500' },
    { rank: 3, name: 'Valves', accuracy: 96.5, color: 'from-emerald-500 to-teal-500' },
    { rank: 4, name: 'Fasteners', accuracy: 95.8, color: 'from-blue-500 to-indigo-500' },
    { rank: 5, name: 'HVAC', accuracy: 94.2, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="liquid-glass group relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Top Performing Categories</h3>
            <p className="text-[10px] text-muted-foreground">By enrichment accuracy</p>
          </div>
        </div>
        <span className="text-xs font-bold text-purple-400">Top 5</span>
      </div>

      {/* Category Rows with Progress Lines */}
      <div className="mt-3 space-y-2.5">
        {categories.map((cat) => (
          <div key={cat.rank} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-slate-300">
                  {cat.rank}
                </span>
                <span className="font-semibold text-slate-200">{cat.name}</span>
              </div>
              <span className="font-bold text-white">{cat.accuracy}%</span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${cat.color}`}
                style={{ width: `${cat.accuracy}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onViewAll}
        className="mt-3.5 w-full gap-1.5 border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/10 hover:border-purple-500/40"
      >
        <span>View All Categories</span>
        <ArrowRight className="h-3 w-3 text-purple-400" />
      </Button>
    </div>
  );
}

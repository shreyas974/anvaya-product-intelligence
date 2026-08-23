import { useState, useEffect } from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeedItem {
  id: string;
  type: 'enriched' | 'attribute' | 'brand' | 'anomaly' | 'content';
  action: string;
  detail: string;
  time: string;
  color: string;
}

const INITIAL_FEED: FeedItem[] = [
  {
    id: '1',
    type: 'enriched',
    action: 'New product enriched',
    detail: 'DanFoss Valve 123B',
    time: '2s ago',
    color: 'bg-emerald-400',
  },
  {
    id: '2',
    type: 'attribute',
    action: 'Attribute extracted',
    detail: 'Material: Brass',
    time: '5s ago',
    color: 'bg-cyan-400',
  },
  {
    id: '3',
    type: 'brand',
    action: 'Brand matched',
    detail: 'Freud → Canonical',
    time: '7s ago',
    color: 'bg-purple-400',
  },
  {
    id: '4',
    type: 'anomaly',
    action: 'Anomaly detected',
    detail: 'Missing: Voltage',
    time: '10s ago',
    color: 'bg-red-400',
  },
  {
    id: '5',
    type: 'content',
    action: 'Content generated',
    detail: 'Title + 5 Descriptions',
    time: '12s ago',
    color: 'bg-blue-400',
  },
];

export function LiveFeedBar() {
  const [items, setItems] = useState<FeedItem[]>(INITIAL_FEED);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live incoming stream
      const sampleEvents: FeedItem[] = [
        {
          id: Math.random().toString(),
          type: 'enriched',
          action: 'Product re-indexed',
          detail: 'Schneider Circuit Breaker C60N',
          time: 'Just now',
          color: 'bg-emerald-400',
        },
        {
          id: Math.random().toString(),
          type: 'attribute',
          action: 'UOM normalized',
          detail: '150 PSI → 10.34 bar',
          time: 'Just now',
          color: 'bg-cyan-400',
        },
        {
          id: Math.random().toString(),
          type: 'brand',
          action: 'Cluster merged',
          detail: 'boAt Airdopes 141 (2 duplicates)',
          time: 'Just now',
          color: 'bg-purple-400',
        },
      ];

      const randomEv = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      setItems((prev) => [randomEv, ...prev.slice(0, 4)]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="liquid-glass group relative overflow-hidden rounded-2xl border border-white/10 p-4 shadow-2xl transition-all">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Title & Status Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Anvaya Live Feed
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Stream Active
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">The heartbeat of your ecosystem</p>
          </div>
        </div>

        {/* Live Activity Items Horizontal Stream */}
        <div className="flex flex-1 items-center gap-3 overflow-x-auto py-1 scrollbar-none">
          {items.map((item) => (
            <div
              key={item.id}
              className="liquid-glass-interactive flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-xs backdrop-blur-md"
            >
              <span className={`h-2 w-2 rounded-full ${item.color} shadow-[0_0_8px_currentColor]`} />
              <div>
                <span className="font-semibold text-slate-200">{item.action}</span>
                <span className="mx-1 text-muted-foreground">•</span>
                <span className="font-mono text-[11px] text-cyan-300">{item.detail}</span>
              </div>
              <span className="text-[9px] text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>

        {/* Right CTA */}
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/10 hover:border-cyan-500/40"
        >
          <span>View Live Feed</span>
          <ArrowRight className="h-3 w-3 text-cyan-400" />
        </Button>
      </div>
    </div>
  );
}

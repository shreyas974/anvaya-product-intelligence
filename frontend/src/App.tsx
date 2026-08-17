import { Sparkles, Activity, ShieldCheck, Database } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>ANVAYA • Connect Data. Discover Intelligence.</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            ANVAYA Frontend
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered Product Intelligence and Product Data Enrichment Platform
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="p-4 rounded-lg bg-card border border-border/60 text-left space-y-1">
            <div className="text-primary flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </div>
            <div className="text-lg font-bold text-white">Active</div>
            <div className="text-[11px] text-muted-foreground">Ingestion Engine</div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border/60 text-left space-y-1">
            <div className="text-emerald-400 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligence</span>
            </div>
            <div className="text-lg font-bold text-white">Ready</div>
            <div className="text-[11px] text-muted-foreground">AI Enrichment</div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border/60 text-left space-y-1">
            <div className="text-blue-400 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quality</span>
            </div>
            <div className="text-lg font-bold text-white">100%</div>
            <div className="text-[11px] text-muted-foreground">Verification</div>
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground/80 flex items-center justify-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Vite + React + TypeScript + Tailwind CSS initialized successfully</span>
        </div>
      </div>
    </div>
  );
}

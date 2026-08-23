import { useEffect, useRef } from 'react';
import { ArrowRight, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AnomalyRadarProps {
  onViewAll?: () => void;
}

export function AnomalyRadarCard({ onViewAll }: AnomalyRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const width = (canvas.width = 160);
    const height = (canvas.height = 120);

    const renderRadar = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.04;

      const centerX = width / 2;
      const centerY = height / 2 + 5;

      // Radar Concentric Rings
      for (let r = 15; r <= 50; r += 16) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, r * 1.2, r * 0.55, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Rotating Radar Sweep Line
      const sweepAngle = time;
      const sweepEndX = centerX + Math.cos(sweepAngle) * 56;
      const sweepEndY = centerY + Math.sin(sweepAngle) * 26;

      const sweepGrad = ctx.createLinearGradient(centerX, centerY, sweepEndX, sweepEndY);
      sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
      sweepGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepEndX, sweepEndY);
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing Anomaly Peaks / Blips
      const anomalies = [
        { x: centerX + 25, y: centerY - 12, color: 'rgba(239, 68, 68, 0.95)', size: 3.5 },
        { x: centerX - 32, y: centerY + 8, color: 'rgba(249, 115, 22, 0.9)', size: 3 },
        { x: centerX + 12, y: centerY + 16, color: 'rgba(245, 158, 11, 0.85)', size: 2.5 },
        { x: centerX - 18, y: centerY - 18, color: 'rgba(6, 182, 212, 0.8)', size: 2.5 },
      ];

      anomalies.forEach((a, i) => {
        const pulse = Math.sin(time * 3 + i) * 2;
        ctx.fillStyle = a.color;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size + pulse * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = a.color;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size + 4 + pulse, 0, Math.PI * 2);
        ctx.stroke();
      });

      animId = requestAnimationFrame(renderRadar);
    };

    renderRadar();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="liquid-glass group relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
            <Radar className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">Real-time Anomaly Radar</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">AI detects what humans miss</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
          497 Detected
        </span>
      </div>

      {/* Center 3D Radar + Severity Breakdown */}
      <div className="mt-3 grid grid-cols-2 items-center gap-2">
        <div className="flex items-center justify-center">
          <canvas ref={canvasRef} className="h-28 w-36" />
        </div>

        {/* Severity Metrics List */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              <span className="text-[11px] font-semibold text-slate-200">Critical</span>
            </div>
            <span className="font-bold text-red-400">12</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-orange-500/10 px-2.5 py-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
              <span className="text-[11px] font-semibold text-slate-200">High</span>
            </div>
            <span className="font-bold text-orange-400">45</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              <span className="text-[11px] font-semibold text-slate-200">Medium</span>
            </div>
            <span className="font-bold text-amber-400">128</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-cyan-500/10 px-2.5 py-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              <span className="text-[11px] font-semibold text-slate-200">Low</span>
            </div>
            <span className="font-bold text-cyan-400">312</span>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onViewAll}
        className="mt-3.5 w-full gap-1.5 border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/10 hover:border-red-500/40"
      >
        <span>View All Anomalies</span>
        <ArrowRight className="h-3 w-3 text-red-400" />
      </Button>
    </div>
  );
}

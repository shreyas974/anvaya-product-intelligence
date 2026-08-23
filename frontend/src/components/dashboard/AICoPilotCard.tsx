import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Brain, Mic, Send } from 'lucide-react';

export function AICoPilotCard() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<
    { sender: 'user' | 'ai'; text: string; time: string }[]
  >([]);
  const [isThinking, setIsThinking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Holographic AI Orb Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const width = (canvas.width = 160);
    const height = (canvas.height = 140);
    const centerX = width / 2;
    const centerY = height / 2;

    const renderOrb = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.035;

      // Outer Holographic Aura
      const auraGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        15,
        centerX,
        centerY,
        60
      );
      auraGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
      auraGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.28)');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Translucent Liquid Glass Sphere
      const r = 38 + Math.sin(time * 1.5) * 2;
      const sphereGrad = ctx.createRadialGradient(
        centerX - 10,
        centerY - 10,
        5,
        centerX,
        centerY,
        r
      );
      sphereGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      sphereGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.6)');
      sphereGrad.addColorStop(0.7, 'rgba(147, 51, 234, 0.4)');
      sphereGrad.addColorStop(1, 'rgba(4, 6, 14, 0.8)');

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Inner Intelligent Swirls
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const angleOffset = time + (i * Math.PI * 2) / 3;
        const radiusX = r * 0.75;
        const radiusY = r * 0.35 * Math.sin(time * 0.8 + i);
        ctx.ellipse(centerX, centerY, radiusX, Math.abs(radiusY) + 4, angleOffset * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center Core Sparkle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(centerX - 8, centerY - 10, 4, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(renderOrb);
    };

    renderOrb();

    return () => cancelAnimationFrame(animId);
  }, []);

  const handleQuickAction = (actionText: string) => {
    setQuery(actionText);
    handleSend(actionText);
  };

  const handleSend = (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: q, time: 'Just now' },
    ]);
    setQuery('');
    setIsThinking(true);

    setTimeout(() => {
      let aiReply =
        'ANVAYA analyzed the telemetry. 14 items had ambiguous parent categories; 5 have been normalized to "Industrial Valves & Actuators" with 98.4% confidence.';
      if (q.includes('unmatched')) {
        aiReply =
          'Product SKU #DF-8819 is unmatched due to missing manufacturer part prefix "065B". Autofix payload is ready.';
      } else if (q.includes('title')) {
        aiReply =
          'Generated 5 B2B canonical titles following taxonomy structure: [Brand] + [Series] + [Primary Spec] + [Key Attribute].';
      } else if (q.includes('missing')) {
        aiReply =
          'Identified 42 products missing "Operating Pressure (PSI)" and "Voltage (V)". Auto-recovery queued with 96.2% confidence.';
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: aiReply, time: 'Just now' },
      ]);
      setIsThinking(false);
    }, 900);
  };

  return (
    <div className="liquid-glass group relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Co-Pilot</h3>
            <p className="text-[10px] text-muted-foreground">Always here to assist</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </span>
      </div>

      {/* Holographic AI Orb & Prompt Area */}
      <div className="mt-2 flex flex-col items-center justify-center text-center">
        <canvas ref={canvasRef} className="h-28 w-32" />
        <p className="mt-1 text-xs font-semibold text-slate-200">
          Ask me anything about your data...
        </p>
      </div>

      {/* Messages Thread if active */}
      {messages.length > 0 && (
        <div className="mt-3 max-h-36 space-y-2 overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-2.5">
          {messages.slice(-2).map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg p-2 text-xs ${
                msg.sender === 'user'
                  ? 'ml-auto max-w-[85%] bg-cyan-500/20 text-cyan-200'
                  : 'mr-auto max-w-[90%] bg-purple-500/15 text-slate-200'
              }`}
            >
              <p className="text-[11px] leading-relaxed">{msg.text}</p>
            </div>
          ))}
          {isThinking && (
            <p className="text-[10px] text-cyan-400 animate-pulse">
              ANVAYA is reasoning across catalog graph...
            </p>
          )}
        </div>
      )}

      {/* Quick Action Suggestion Pills */}
      <div className="mt-3.5 space-y-1.5">
        {[
          'Why this product is unmatched?',
          'Suggest better title for 5 products',
          'Show data quality issues',
          'Find missing attributes',
        ].map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickAction(pill)}
            className="liquid-glass-interactive flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-medium text-slate-300 hover:text-white transition-all"
          >
            <span className="truncate">{pill}</span>
            <ArrowRight className="h-3 w-3 text-cyan-400 opacity-60" />
          </button>
        ))}
      </div>

      {/* Glass Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-4 flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/50 p-1.5 backdrop-blur-xl"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 bg-transparent px-2.5 text-xs text-white placeholder:text-muted-foreground outline-none"
        />
        <button
          type="button"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-white"
          title="Voice command"
        >
          <Mic className="h-3.5 w-3.5" />
        </button>
        <button
          type="submit"
          disabled={!query.trim()}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500 text-black transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          <Send className="h-3 w-3" />
        </button>
      </form>
    </div>
  );
}

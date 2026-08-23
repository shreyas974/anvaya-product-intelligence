import { useEffect, useRef } from 'react';

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle twinkling stars & atmospheric particles
    const particleCount = 75;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      speedY: -(Math.random() * 0.15 + 0.05),
      speedX: (Math.random() - 0.5) * 0.1,
      pulse: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.pulse += 0.02;
        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.fillStyle = `rgba(220, 240, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#04060e]">
      {/* Base Deep Midnight Gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#04060e]/70 to-[#020307]" />

      {/* Aurora Layer 1: Flowing Cyan / Teal Ribbon */}
      <div
        className="animate-aurora-1 absolute -left-[15%] -top-[20%] h-[75vh] w-[90vw] rounded-[100%] opacity-50 blur-[130px] filter"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.45) 0%, rgba(20, 184, 166, 0.25) 45%, transparent 75%)',
        }}
      />

      {/* Aurora Layer 2: Flowing Violet / Magenta Wave */}
      <div
        className="animate-aurora-2 absolute -right-[15%] top-[10%] h-[80vh] w-[85vw] rounded-[100%] opacity-45 blur-[140px] filter"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.45) 0%, rgba(217, 70, 239, 0.22) 50%, transparent 75%)',
        }}
      />

      {/* Aurora Layer 3: Deep Emerald & Blue Grounding Ribbon */}
      <div
        className="animate-aurora-3 absolute bottom-[-15%] left-[20%] h-[60vh] w-[70vw] rounded-[100%] opacity-40 blur-[120px] filter"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.3) 0%, rgba(59, 130, 246, 0.25) 50%, transparent 75%)',
        }}
      />

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />

      {/* Geometric Ambient Grid Structure */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Vignette Depth Guard */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#04060e] via-transparent to-transparent opacity-80" />
    </div>
  );
}

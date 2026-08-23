import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Layers,
  Box,
  Share2,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronDown,
  Zap,
  X,
  Orbit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NodeData {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  hexColor: number;
  stats: {
    processed: string;
    confidence: string;
    latency: string;
  };
  angle: number;
  distance: number;
  speed: number;
}

const GALAXY_NODES: NodeData[] = [
  {
    id: 'classification',
    name: 'Classification',
    category: 'Hierarchical Taxonomy',
    description: 'Autonomous zero-shot taxonomy mapping across 4,200 industrial leaf categories.',
    color: '#a855f7',
    hexColor: 0xa855f7,
    stats: { processed: '682,410 SKUs', confidence: '99.4%', latency: '12ms' },
    angle: 0,
    distance: 4.8,
    speed: 0.005,
  },
  {
    id: 'attributes',
    name: 'Attributes',
    category: 'Dense Recovery',
    description: 'LLM & regex hybrid extraction for electrical, physical, and chemical attributes.',
    color: '#06b6d4',
    hexColor: 0x06b6d4,
    stats: { processed: '1,420,119 Extracted', confidence: '97.8%', latency: '18ms' },
    angle: (Math.PI * 2) / 5,
    distance: 6.2,
    speed: 0.004,
  },
  {
    id: 'content',
    name: 'Content',
    category: 'Studio Generator',
    description: 'B2B compliant title structuring, feature bullet synthesis, and multi-channel SEO copy.',
    color: '#10b981',
    hexColor: 0x10b981,
    stats: { processed: '891,200 Titles', confidence: '98.9%', latency: '24ms' },
    angle: ((Math.PI * 2) / 5) * 2,
    distance: 5.2,
    speed: -0.0035,
  },
  {
    id: 'assets',
    name: 'Assets',
    category: 'Digital Hub',
    description: 'Resolution verification, background removal, and multi-angle spec validation.',
    color: '#3b82f6',
    hexColor: 0x3b82f6,
    stats: { processed: '412,050 Images', confidence: '99.1%', latency: '35ms' },
    angle: ((Math.PI * 2) / 5) * 3,
    distance: 7.0,
    speed: 0.003,
  },
  {
    id: 'uom_normalizer',
    name: 'UOM Normalizer',
    category: 'Unit Conversion Engine',
    description: 'Standardizes imperial & metric units (mm, inch, PSI, bar, kW, HP) with deterministic precision.',
    color: '#ec4899',
    hexColor: 0xec4899,
    stats: { processed: '2,940,300 Conversions', confidence: '100%', latency: '4ms' },
    angle: ((Math.PI * 2) / 5) * 4,
    distance: 5.8,
    speed: -0.0045,
  },
];

export function IntelligenceGalaxy() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [activeRail, setActiveRail] = useState<'layers' | 'cube' | 'network' | '3d'>('3d');
  const [orbitView, setOrbitView] = useState<'Standard' | 'Top-Down' | 'Kinetic'>('Standard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationId: number;
    let resizeObserver: ResizeObserver | null = null;

    try {
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 520;

      // Three.js Scene Setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x04060e, 0.035);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 5, 15);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const coreLight = new THREE.PointLight(0x06b6d4, 3, 20);
      coreLight.position.set(0, 0, 0);
      scene.add(coreLight);

      const purpleLight = new THREE.PointLight(0xa855f7, 2, 25);
      purpleLight.position.set(5, 4, 5);
      scene.add(purpleLight);

      // Galaxy Master Group
      const galaxyGroup = new THREE.Group();
      scene.add(galaxyGroup);

      // 1. Central Core Sphere
      const coreGeo = new THREE.SphereGeometry(1.6, 32, 32);
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.2,
        transmission: 0.6,
        transparent: true,
        opacity: 0.9,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      galaxyGroup.add(coreMesh);

      // Core Outer Wireframe Halo
      const haloGeo = new THREE.IcosahedronGeometry(2.1, 2);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      galaxyGroup.add(haloMesh);

      // 2. Orbital Rings
      const ringRadii = [4.8, 5.2, 5.8, 6.2, 7.0];
      ringRadii.forEach((radius, i) => {
        const ringGeo = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x06b6d4 : 0xa855f7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.22,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + (i * 0.08 - 0.16);
        ringMesh.rotation.y = i * 0.05;
        galaxyGroup.add(ringMesh);
      });

      // 3. Holographic Circular Base Platform
      const baseGeo = new THREE.CircleGeometry(8.5, 48);
      const baseMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -2.8;
      baseMesh.rotation.x = -Math.PI / 2;
      galaxyGroup.add(baseMesh);

      const baseRingGeo = new THREE.RingGeometry(8.4, 8.6, 64);
      const baseRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const baseRingMesh = new THREE.Mesh(baseRingGeo, baseRingMat);
      baseRingMesh.position.y = -2.78;
      baseRingMesh.rotation.x = -Math.PI / 2;
      galaxyGroup.add(baseRingMesh);

      // 4. Satellite Nodes
      const nodeMeshes: { mesh: THREE.Mesh; halo: THREE.Mesh; data: NodeData }[] = [];

      GALAXY_NODES.forEach((node) => {
        const nodeGroup = new THREE.Group();

        const nGeo = new THREE.SphereGeometry(0.55, 24, 24);
        const nMat = new THREE.MeshStandardMaterial({
          color: node.hexColor,
          emissive: node.hexColor,
          emissiveIntensity: 0.6,
          roughness: 0.2,
        });
        const mesh = new THREE.Mesh(nGeo, nMat);

        const nHaloGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const nHaloMat = new THREE.MeshBasicMaterial({
          color: node.hexColor,
          wireframe: true,
          transparent: true,
          opacity: 0.3,
        });
        const halo = new THREE.Mesh(nHaloGeo, nHaloMat);

        nodeGroup.add(mesh);
        nodeGroup.add(halo);
        galaxyGroup.add(nodeGroup);

        (mesh as any).userData = node;

        nodeMeshes.push({ mesh, halo, data: node });
      });

      // 5. Streaming Particles along orbits
      const particleCount = 180;
      const particleGeo = new THREE.BufferGeometry();
      const particlePos = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const r = ringRadii[i % ringRadii.length] + (Math.random() - 0.5) * 0.3;
        const theta = Math.random() * Math.PI * 2;
        particlePos[i * 3] = Math.cos(theta) * r;
        particlePos[i * 3 + 1] = (Math.random() - 0.5) * 0.6;
        particlePos[i * 3 + 2] = Math.sin(theta) * r;

        const c = new THREE.Color(i % 2 === 0 ? 0x06b6d4 : 0xa855f7);
        particleColors[i * 3] = c.r;
        particleColors[i * 3 + 1] = c.g;
        particleColors[i * 3 + 2] = c.b;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
      particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });
      const particleSystem = new THREE.Points(particleGeo, particleMat);
      galaxyGroup.add(particleSystem);

      // Connecting Lines from Core to Nodes
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.25,
      });
      const lineGeos: THREE.BufferGeometry[] = [];
      const lines: THREE.Line[] = [];

      GALAXY_NODES.forEach(() => {
        const lGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, 0),
        ]);
        lineGeos.push(lGeo);
        const line = new THREE.Line(lGeo, lineMat);
        galaxyGroup.add(line);
        lines.push(line);
      });

      // Raycaster for Hover & Click
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(-100, -100);

      // Mouse Interaction Variables
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;
      let targetRotationY = 0;
      let targetRotationX = 0.2;
      let zoomDistance = 15;

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      };

      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (isDragging) {
          const deltaX = e.clientX - prevMouseX;
          const deltaY = e.clientY - prevMouseY;
          targetRotationY += deltaX * 0.006;
          targetRotationX += deltaY * 0.006;
          prevMouseX = e.clientX;
          prevMouseY = e.clientY;
        }
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        zoomDistance += e.deltaY * 0.01;
        zoomDistance = Math.max(8, Math.min(22, zoomDistance));
      };

      const onClick = () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          nodeMeshes.map((n) => n.mesh)
        );
        if (intersects.length > 0) {
          const node = (intersects[0].object as any).userData as NodeData;
          setSelectedNode(node);
        }
      };

      canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('wheel', onWheel, { passive: false });
      canvas.addEventListener('click', onClick);

      // Resize Observer
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (!container) return;
          const w = container.clientWidth;
          const h = container.clientHeight || 520;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer?.setSize(w, h);
        });
        resizeObserver.observe(container);
      }

      // Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Smooth Rotation & Camera Zoom
        galaxyGroup.rotation.y += (targetRotationY - galaxyGroup.rotation.y) * 0.05 + 0.0015;
        galaxyGroup.rotation.x += (targetRotationX - galaxyGroup.rotation.x) * 0.05;
        camera.position.z += (zoomDistance - camera.position.z) * 0.08;

        // Pulse Core
        haloMesh.rotation.y += 0.005;
        haloMesh.rotation.x += 0.003;
        const coreScale = 1 + Math.sin(time * 2) * 0.03;
        coreMesh.scale.set(coreScale, coreScale, coreScale);

        // Rotate Nodes along Orbits
        nodeMeshes.forEach((item, index) => {
          item.data.angle += item.data.speed;
          const x = Math.cos(item.data.angle) * item.data.distance;
          const z = Math.sin(item.data.angle) * item.data.distance;
          const y = Math.sin(time + index) * 0.35;

          item.mesh.parent?.position.set(x, y, z);
          item.halo.rotation.y += 0.02;

          // Update connecting line
          const positions = lines[index].geometry.attributes.position as THREE.BufferAttribute;
          positions.setXYZ(0, 0, 0, 0);
          positions.setXYZ(1, x, y, z);
          positions.needsUpdate = true;
        });

        // Rotate Particle System
        particleSystem.rotation.y -= 0.002;

        // Raycasting for hover state
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          nodeMeshes.map((n) => n.mesh)
        );

        if (intersects.length > 0) {
          const found = (intersects[0].object as any).userData as NodeData;
          setHoveredNode(found);
          document.body.style.cursor = 'pointer';
        } else {
          setHoveredNode(null);
          document.body.style.cursor = 'default';
        }

        renderer?.render(scene, camera);
      };

      animate();
    } catch {
      // Graceful fallback for non-WebGL environments / test runners
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (resizeObserver) resizeObserver.disconnect();
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`liquid-glass group relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-2xl transition-all duration-500 ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[530px] w-full'
      }`}
    >
      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              <Orbit className="h-4 w-4 animate-spin" style={{ animationDuration: '16s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Intelligence Galaxy
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  3D Universe
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time 3D view of your product data universe
              </p>
            </div>
          </div>
        </div>

        {/* View Controls & Fullscreen */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() =>
                setOrbitView((prev) =>
                  prev === 'Standard' ? 'Top-Down' : prev === 'Top-Down' ? 'Kinetic' : 'Standard'
                )
              }
              className="liquid-glass-interactive flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:text-white"
            >
              <span>{orbitView} View</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="liquid-glass-interactive flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-white"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Floating Left Control Rail */}
      <div className="absolute left-5 top-24 z-10 flex flex-col gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl">
        {[
          { id: 'layers', icon: Layers, label: 'Taxonomy Layers' },
          { id: 'cube', icon: Box, label: '3D Geometry' },
          { id: 'network', icon: Share2, label: 'Neural Connections' },
          { id: '3d', icon: Sparkles, label: 'Interactive Galaxy' },
        ].map((btn) => {
          const Icon = btn.icon;
          const isActive = activeRail === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveRail(btn.id as any)}
              title={btn.label}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-muted-foreground hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Three.js 3D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Core Center Watermark Overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center transition-all duration-300">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/80 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            Product
          </p>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/90 drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
            Intelligence Core
          </p>
        </div>
      </div>

      {/* Hover Node Tooltip Pill */}
      {hoveredNode && !selectedNode && (
        <div className="pointer-events-none absolute bottom-14 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/70 px-4 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-xl">
          <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
          {hoveredNode.name} • <span className="text-muted-foreground">{hoveredNode.category}</span>
        </div>
      )}

      {/* Bottom Interaction Hint */}
      <div className="pointer-events-none absolute bottom-4 left-5 z-10 flex items-center gap-3 text-[11px] text-muted-foreground/70">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          Drag to rotate
        </span>
        <span>•</span>
        <span>Scroll to zoom</span>
        <span>•</span>
        <span>Click nodes for details</span>
      </div>

      {/* Selected Node Inspector Drawer/Modal */}
      {selectedNode && (
        <div className="absolute right-5 top-20 z-20 w-80 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="rounded-2xl border border-white/15 bg-black/80 p-4.5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shadow-[0_0_10px_currentColor]"
                  style={{ backgroundColor: selectedNode.color, color: selectedNode.color }}
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedNode.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{selectedNode.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              {selectedNode.description}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
              <div className="rounded-lg bg-white/5 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Volume</p>
                <p className="text-xs font-bold text-white">{selectedNode.stats.processed}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Confidence</p>
                <p className="text-xs font-bold text-emerald-400">{selectedNode.stats.confidence}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Latency</p>
                <p className="text-xs font-bold text-cyan-400">{selectedNode.stats.latency}</p>
              </div>
            </div>

            <Button
              size="sm"
              className="mt-3 w-full gap-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold text-white hover:opacity-90"
              onClick={() => setSelectedNode(null)}
            >
              <Zap className="h-3.5 w-3.5" />
              Launch Deep Inspector
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

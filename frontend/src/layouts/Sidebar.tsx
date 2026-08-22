import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Layers,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database,
  Activity,
  Circle,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export type NavigationSection =
  | 'overview'
  | 'ingestion'
  | 'products'
  | 'quality'
  | 'intelligence';

export interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  code: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, code: '00' },
  { id: 'ingestion', label: 'Ingestion', icon: UploadCloud, code: '01' },
  { id: 'products', label: 'Products', icon: Layers, code: '02' },
  { id: 'quality', label: 'Quality', icon: ShieldCheck, code: '03' },
  { id: 'intelligence', label: 'Intelligence', icon: Sparkles, code: '04' },
];

export interface SidebarProps {
  activeSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'relative flex h-full min-h-screen flex-col',
        'border-r border-border bg-card',
        'transition-all duration-300 select-none z-30',
        collapsed ? 'w-[68px]' : 'w-[248px]',
        className
      )}
      aria-label="Main Navigation"
    >
      {/* Ambient signal */}
      <div className="pointer-events-none absolute left-0 top-0 h-40 w-full overflow-hidden opacity-60">
        <div className="absolute -left-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Brand / System Header */}
      <div
        className={cn(
          'relative flex h-[76px] shrink-0 items-center border-b border-border',
          collapsed ? 'justify-center px-3' : 'px-5'
        )}
      >
        {collapsed ? (
          <div className="relative flex h-9 w-9 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
            <Database className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 h-2 w-2 bg-primary shadow-[0_0_10px_rgba(211,255,77,0.8)]" />
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
                <Database className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 h-2 w-2 bg-primary shadow-[0_0_10px_rgba(211,255,77,0.8)]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold tracking-[0.16em] text-foreground">
                    ANVAYA
                  </span>
                  <span className="anvaya-mono text-[8px] font-bold text-primary">
                    AI
                  </span>
                </div>

                <div className="anvaya-label mt-1">
                  Product Intelligence
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-primary lg:flex"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* System State */}
      {!collapsed && (
        <div className="relative mx-4 mt-5 border border-border bg-background/40 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="anvaya-label">SYSTEM STATE</span>

            <span className="flex items-center gap-1.5 text-[9px] font-medium text-primary">
              <span className="h-1.5 w-1.5 animate-pulse bg-primary shadow-[0_0_8px_rgba(211,255,77,0.9)]" />
              ONLINE
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Activity className="h-3 w-3 text-primary" />

            <div className="anvaya-mono text-[10px] text-muted-foreground">
              PIPELINE / READY
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-6">
        {!collapsed && (
          <div className="anvaya-label mb-3 px-2">
            MODULES
          </div>
        )}

        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex w-full items-center text-left',
                  'border transition-all duration-200',
                  collapsed
                    ? 'h-11 justify-center border-transparent'
                    : 'h-12 gap-3 px-3',
                  isActive
                    ? 'border-primary/25 bg-primary/[0.07] text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary/40 hover:text-foreground'
                )}
              >
                {/* Active signal rail */}
                {isActive && (
                  <span className="absolute left-0 top-0 h-full w-[2px] bg-primary shadow-[0_0_12px_rgba(211,255,77,0.8)]" />
                )}

                {/* Module number */}
                {!collapsed && (
                  <span
                    className={cn(
                      'anvaya-mono w-5 text-[9px]',
                      isActive ? 'text-primary' : 'text-muted-foreground/40'
                    )}
                  >
                    {item.code}
                  </span>
                )}

                <Icon
                  className={cn(
                    'h-[17px] w-[17px] shrink-0 transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />

                {!collapsed && (
                  <>
                    <span
                      className={cn(
                        'flex-1 text-[12px] tracking-wide',
                        isActive && 'font-medium'
                      )}
                    >
                      {item.label}
                    </span>

                    {isActive && (
                      <Circle className="h-1.5 w-1.5 fill-primary text-primary" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer telemetry */}
      <div className="relative border-t border-border p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="anvaya-label">ENVIRONMENT</span>
              <span className="anvaya-mono text-[9px] text-primary">
                FRONTEND
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Platform
              </span>
              <span className="anvaya-mono text-[9px] text-foreground/60">
                UNIHACK 2026
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Build
              </span>
              <span className="anvaya-mono text-[9px] text-foreground/60">
                0.1.0
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="mt-2 hidden w-full items-center justify-center gap-2 border border-border py-2 text-[9px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary lg:flex"
            >
              <ChevronLeft className="h-3 w-3" />
              Collapse
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-9 w-full items-center justify-center text-muted-foreground transition-colors hover:text-primary lg:flex"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'ingestion', label: 'Ingestion', icon: UploadCloud },
  { id: 'products', label: 'Products', icon: Layers },
  { id: 'quality', label: 'Quality', icon: ShieldCheck },
  { id: 'intelligence', label: 'Intelligence', icon: Sparkles },
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
        'flex flex-col border-r border-border bg-card/90 backdrop-blur-md transition-all duration-300 select-none z-30',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/60">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 flex-shrink-0">
              <Database className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wider text-foreground">
                  ANVAYA
                </span>
                <span className="rounded bg-primary/15 px-1 py-0.2 text-[9px] font-semibold text-primary">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground truncate">
                Product Intelligence
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20">
            <Database className="h-4 w-4" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            'h-7 w-7 text-muted-foreground hover:text-foreground hidden lg:flex',
            collapsed && 'hidden'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150 relative text-left',
                isActive
                  ? 'bg-primary/10 text-primary shadow-xs font-semibold'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-transform duration-150',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                  !collapsed && 'group-hover:scale-105'
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Toggle for collapsed state */}
      <div className="p-3 border-t border-border/60">
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-full h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hidden lg:flex"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="rounded-md bg-secondary/40 p-2.5 border border-border/40 text-[11px] space-y-1 text-muted-foreground">
            <div className="flex items-center justify-between font-medium text-foreground">
              <span>Branch</span>
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-1 py-0.2 rounded">
                feature/frontend
              </span>
            </div>
            <div>Unihack 2026 Platform</div>
          </div>
        )}
      </div>
    </aside>
  );
}

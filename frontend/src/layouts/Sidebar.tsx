import React from 'react';
import {
  LayoutDashboard,
  Package,
  Sparkles,
  Zap,
  CheckCircle2,
  Inbox,
  Activity,
  Bot,
  BarChart3,
  Settings,
  SunMedium,
  Wrench,
  FileCheck,
  AlertTriangle,
  UploadCloud,
  Download,
  HelpCircle,
  PlayCircle,
} from 'lucide-react';

export type NavigationSection = string;

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'primary' | 'warning' | 'teal';
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Mission Control', icon: LayoutDashboard },
  { id: 'datasets', label: 'Datasets & Profiler', icon: UploadCloud, badge: 'AUTO', badgeVariant: 'teal' },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'enrichment', label: 'Enrichment', icon: Zap },
  { id: 'validation', label: 'Validation', icon: CheckCircle2 },
  { id: 'review', label: 'Review Queue', icon: Inbox, badgeVariant: 'warning' },
  { id: 'fittings', label: 'Fittings Lab', icon: Wrench, badge: 'FLAGSHIP', badgeVariant: 'teal' },
  { id: 'conflicts', label: 'Conflict Center', icon: AlertTriangle, badgeVariant: 'warning' },
  { id: 'evaluation', label: 'Benchmark Eval', icon: FileCheck, badge: 'TRUTH', badgeVariant: 'primary' },
  { id: 'intelligence', label: 'Intelligence', icon: Sparkles },
  { id: 'copilot', label: 'AI Copilot', icon: Bot },
  { id: 'quality', label: 'Data Quality', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'export', label: 'Delivery Export', icon: Download, badge: '252 COLS', badgeVariant: 'primary' },
  { id: 'help', label: 'Help & Guides', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export interface SidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  reviewCount?: number;
  onReplayTour?: () => void;
  userRole?: string;
  className?: string;
}

export function Sidebar({
  activeSection,
  onSectionChange,
  collapsed = false,
  reviewCount = 0,
  onReplayTour,
  userRole = 'ADMIN',
  className = '',
}: SidebarProps) {
  return (
    <aside
      className={`relative flex h-full min-h-screen flex-col border-r border-[rgba(120,90,70,0.12)] bg-[rgba(255,251,247,0.92)] backdrop-blur-md transition-all duration-300 select-none z-30 ${
        collapsed ? 'w-20' : 'w-[260px]'
      } ${className}`}
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="relative flex h-20 shrink-0 items-center border-b border-[rgba(120,90,70,0.12)] px-5 bg-[rgba(255,251,247,0.7)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD9A0] to-[#E8703A] text-white shadow-md">
            <SunMedium className="h-5 w-5" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-wider text-[#2B2320]">ANVAYA</span>
                <span className="rounded bg-[#FBEEDD] px-1.5 py-0.5 text-[9px] font-bold text-[#C77F2E] border border-[rgba(199,127,46,0.2)]">
                  {userRole}
                </span>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#E8703A]">
                True Product Intelligence
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const badgeValue = item.id === 'review' ? reviewCount : item.badge;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'sunrise-active-nav'
                  : 'text-[#6B5E56] hover:bg-white/80 hover:text-[#2B2320]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-[#E8703A]' : 'text-[#9C8F86] group-hover:text-[#E8703A]'
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </div>

              {!collapsed && badgeValue !== undefined && badgeValue !== 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.badgeVariant === 'teal'
                      ? 'bg-[#FBEEDD] text-[#C77F2E] border border-[rgba(199,127,46,0.2)]'
                      : item.badgeVariant === 'warning'
                      ? 'bg-[#FDEADE] text-[#C2571F] border border-[rgba(194,87,31,0.2)]'
                      : 'bg-[#FBEEDD] text-[#E8703A] border border-[rgba(232,112,58,0.2)]'
                  }`}
                >
                  {badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Interactive Tour Trigger & Footer System Status */}
      {!collapsed && (
        <div className="border-t border-[rgba(120,90,70,0.12)] p-4 bg-[rgba(255,251,247,0.5)] space-y-2">
          {onReplayTour && (
            <button
              onClick={onReplayTour}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold text-[#E8703A] bg-[#FBEEDD] hover:bg-[#F8E2CD] transition-all border border-[rgba(232,112,58,0.2)]"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Replay Product Tour</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 rounded-xl bg-[#FAF5EF] p-2.5 border border-[rgba(120,90,70,0.1)]">
            <div className="h-2 w-2 rounded-full bg-[#C77F2E] animate-pulse shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-[#2B2320] truncate">Reference Masters Active</p>
              <p className="text-[9px] text-[#6B5E56] truncate">1,000 SKUs • Fittings • UOMs</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
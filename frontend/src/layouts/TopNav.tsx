import { Search, Bell, Menu, Sparkles, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationSection } from './Sidebar';
import { cn } from '@/utils/cn';

export interface TopNavProps {
  activeSection: NavigationSection;
  onOpenMobileMenu: () => void;
  className?: string;
}

const sectionTitles: Record<NavigationSection, string> = {
  overview: 'Platform Overview',
  ingestion: 'Data Ingestion & Pipeline',
  products: 'Product Catalog Intelligence',
  quality: 'Data Quality & Anomaly Center',
  intelligence: 'Market & Category Intelligence',
};

export function TopNav({
  activeSection,
  onOpenMobileMenu,
  className,
}: TopNavProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 backdrop-blur-md sm:px-6',
        className
      )}
    >
      {/* Left side: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-semibold text-foreground/70 hidden sm:inline">
            ANVAYA
          </span>
          <span className="text-muted-foreground/60 hidden sm:inline">/</span>
          <span className="font-medium text-foreground capitalize">
            {sectionTitles[activeSection] || activeSection}
          </span>
        </div>
      </div>

      {/* Center: Global Search trigger placeholder */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="w-full relative">
          <button
            type="button"
            className="w-full flex items-center justify-between rounded-lg border border-border/60 bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground hover:border-border hover:bg-secondary/50 transition-colors cursor-pointer"
            aria-label="Global search products and attributes"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Search products, attributes, or SKU...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/80 bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </div>

      {/* Right side: Status indicator + Notifications + Profile/Demo info */}
      <div className="flex items-center gap-3">
        {/* Live Status Pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Pipeline Online</span>
        </div>

        {/* AI Ready Indicator */}
        <Badge
          variant="outline"
          className="hidden xl:inline-flex gap-1 border-primary/30 bg-primary/10 text-primary text-[11px]"
        >
          <Sparkles className="h-3 w-3" />
          <span>v0.1 Shell</span>
        </Badge>

        {/* Notifications Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        {/* Profile / Workspace Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground text-xs font-semibold ring-1 ring-border">
            <Terminal className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium text-foreground leading-tight">
              Shantha
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Frontend
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

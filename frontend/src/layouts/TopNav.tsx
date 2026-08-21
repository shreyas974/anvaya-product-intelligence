import {
  Search,
  Bell,
  Menu,
  Sparkles,
  Activity,
  Command,
} from 'lucide-react';
import { NavigationSection } from './Sidebar';
import { cn } from '@/utils/cn';

export interface TopNavProps {
  activeSection: NavigationSection;
  onOpenMobileMenu: () => void;
  className?: string;
}

const sectionTitles: Record<NavigationSection, string> = {
  overview: 'Platform Overview',
  ingestion: 'Data Ingestion',
  products: 'Product Intelligence',
  quality: 'Quality Control',
  intelligence: 'Market Intelligence',
};

const sectionCodes: Record<NavigationSection, string> = {
  overview: 'OVR-00',
  ingestion: 'ING-01',
  products: 'PRD-02',
  quality: 'QLT-03',
  intelligence: 'INT-04',
};

export function TopNav({
  activeSection,
  onOpenMobileMenu,
  className,
}: TopNavProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-[76px] w-full items-center',
        'border-b border-border bg-background/90 backdrop-blur-xl',
        'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary lg:hidden"
          aria-label="Open mobile menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="anvaya-mono text-[9px] text-muted-foreground/50">
            ANVAYA
          </span>

          <span className="h-3 w-px bg-border" />

          <span className="anvaya-mono text-[9px] text-primary">
            {sectionCodes[activeSection]}
          </span>

          <span className="h-3 w-px bg-border" />

          <span className="max-w-[220px] truncate text-xs font-medium tracking-wide text-foreground">
            {sectionTitles[activeSection]}
          </span>
        </div>

        <div className="sm:hidden">
          <div className="anvaya-label">ACTIVE MODULE</div>
          <div className="mt-0.5 text-xs font-medium">
            {sectionTitles[activeSection]}
          </div>
        </div>
      </div>

      {/* Center command search */}
      <div className="mx-6 hidden flex-1 justify-center md:flex">
        <button
          type="button"
          className="group flex h-9 w-full max-w-[460px] items-center justify-between border border-border bg-card/50 px-3 text-left transition-all hover:border-primary/25 hover:bg-card"
          aria-label="Global search products and attributes"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />

            <span className="text-[11px] text-muted-foreground">
              Search catalog, SKU, attribute...
            </span>
          </div>

          <div className="flex items-center gap-1">
            <kbd className="flex h-5 items-center gap-1 border border-border bg-background px-1.5 font-mono text-[9px] text-muted-foreground">
              <Command className="h-2.5 w-2.5" />
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right telemetry */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-2 lg:flex">
          <Activity className="h-3 w-3 text-primary" />

          <span className="anvaya-mono text-[9px] text-muted-foreground">
            PIPELINE
          </span>

          <span className="h-1.5 w-1.5 animate-pulse bg-primary shadow-[0_0_8px_rgba(211,255,77,0.8)]" />

          <span className="anvaya-mono text-[9px] text-primary">
            LIVE
          </span>
        </div>

        <div className="hidden h-5 w-px bg-border lg:block" />

        <div className="hidden items-center gap-1.5 xl:flex">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="anvaya-mono text-[9px] text-muted-foreground">
            AI ENGINE
          </span>
          <span className="anvaya-mono text-[9px] text-primary">
            READY
          </span>
        </div>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 bg-primary shadow-[0_0_7px_rgba(211,255,77,0.8)]" />
        </button>

        <div className="hidden h-7 w-px bg-border sm:block" />

        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center border border-primary/20 bg-primary/5">
            <span className="anvaya-mono text-[9px] text-primary">
              SV
            </span>
          </div>

          <div className="hidden flex-col md:flex">
            <span className="text-[10px] font-medium text-foreground">
              Shantha
            </span>
            <span className="anvaya-mono text-[8px] text-muted-foreground">
              FRONTEND
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
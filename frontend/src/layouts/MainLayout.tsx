import React, { useState } from 'react';
import { Sidebar, NavigationSection } from './Sidebar';
import { TopNav } from './TopNav';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export interface MainLayoutProps {
  children: React.ReactNode;
  activeSection?: NavigationSection;
  onSectionChange?: (section: NavigationSection) => void;
  className?: string;
}

export function MainLayout({
  children,
  activeSection = 'overview',
  onSectionChange,
  className,
}: MainLayoutProps) {
  const [currentSection, setCurrentSection] = useState<NavigationSection>(activeSection);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSectionChange = (section: NavigationSection) => {
    setCurrentSection(section);
    if (onSectionChange) {
      onSectionChange(section);
    }
    setMobileOpen(false);
  };

  const active = onSectionChange ? activeSection : currentSection;

  return (
    <div className={cn('min-h-screen bg-background text-foreground flex flex-col', className)}>
      {/* Desktop & Tablet Sidebar */}
      <div className="flex flex-1 min-h-screen overflow-hidden">
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar
            activeSection={active}
            onSectionChange={handleSectionChange}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in-0 duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          >
            <div
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-xl flex flex-col border-r border-border animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-bold text-sm text-foreground">Navigation</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  activeSection={active}
                  onSectionChange={handleSectionChange}
                  collapsed={false}
                  onToggleCollapse={() => { }}
                  className="border-none w-full bg-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopNav
            activeSection={active}
            onOpenMobileMenu={() => setMobileOpen(true)}
            onNavigate={handleSectionChange}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

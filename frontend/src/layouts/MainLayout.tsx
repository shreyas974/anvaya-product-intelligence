import React, { useState } from 'react';
import { Sidebar, NavigationSection } from './Sidebar';
import { TopNav } from './TopNav';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MainLayoutProps {
  children: React.ReactNode;
  activeSection?: NavigationSection;
  onSectionChange?: (section: NavigationSection) => void;
  reviewCount?: number;
  onReplayTour?: () => void;
  onStartTour?: () => void;
  userRole?: string;
  userName?: string;
  userEmail?: string;
  className?: string;
}

export function MainLayout({
  children,
  activeSection = 'overview',
  onSectionChange,
  reviewCount = 0,
  onReplayTour,
  onStartTour,
  userRole = 'ADMIN',
  userName = 'Devin Vance',
  userEmail = 'lead.architect@enterprise.com',
  className = '',
}: MainLayoutProps) {
  const [currentSection, setCurrentSection] = useState<NavigationSection>(activeSection);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSectionChange = (section: NavigationSection) => {
    setCurrentSection(section);
    if (onSectionChange) {
      onSectionChange(section);
    }
    setMobileOpen(false);
  };

  const active = onSectionChange ? activeSection : currentSection;
  const tourTrigger = onStartTour || onReplayTour;

  return (
    <div className={`relative min-h-screen bg-[#FFFBF7] bg-sunrise-canvas text-[#2B2320] flex flex-col ${className}`}>
      <div className="relative z-10 flex flex-1 min-h-screen overflow-hidden">
        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar
            activeSection={active}
            onSectionChange={handleSectionChange}
            reviewCount={reviewCount}
            onReplayTour={tourTrigger}
            userRole={userRole}
            collapsed={false}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden animate-in fade-in-0 duration-200"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[rgba(255,251,247,0.95)] backdrop-blur-xl shadow-2xl flex flex-col border-r border-[rgba(120,90,70,0.15)] animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-[rgba(120,90,70,0.12)]">
                <span className="font-bold text-sm text-[#2B2320]">ANVAYA Navigation</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  className="h-8 w-8 text-[#6B5E56] hover:text-[#2B2320]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  activeSection={active}
                  onSectionChange={handleSectionChange}
                  reviewCount={reviewCount}
                  onReplayTour={tourTrigger}
                  userRole={userRole}
                  collapsed={false}
                  className="border-none w-full bg-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopNav
            activeSection={active}
            onOpenMobileMenu={() => setMobileOpen(true)}
            onNavigate={handleSectionChange}
            onStartTour={tourTrigger}
            onReplayTour={tourTrigger}
            userRole={userRole}
            userName={userName}
            userEmail={userEmail}
          />
          <main className="flex-1 p-5 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

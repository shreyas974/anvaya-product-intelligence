import { KPICardsRow } from '@/components/dashboard/KPICardsRow';
import { IntelligenceGalaxy } from '@/components/galaxy/IntelligenceGalaxy';
import { AICoPilotCard } from '@/components/dashboard/AICoPilotCard';
import { AnomalyRadarCard } from '@/components/dashboard/AnomalyRadarCard';
import { DataDNACard } from '@/components/dashboard/DataDNACard';
import { EnrichmentCoverageCard } from '@/components/dashboard/EnrichmentCoverageCard';
import { TopCategoriesCard } from '@/components/dashboard/TopCategoriesCard';
import { FutureImpactCard } from '@/components/dashboard/FutureImpactCard';
import { LiveFeedBar } from '@/components/dashboard/LiveFeedBar';

export interface MissionControlPageProps {
  onNavigate?: (section: any) => void;
}

export function MissionControlPage({ onNavigate }: MissionControlPageProps) {
  return (
    <div className="relative space-y-5 pb-6">
      {/* 1. TOP ROW: Exactly FIVE 3D Glass KPI Cards */}
      <section aria-label="Key Performance Indicators">
        <KPICardsRow />
      </section>

      {/* 2. CENTER STAGE: Intelligence Galaxy (Left/Center) + AI Co-Pilot & Anomaly Radar (Right) */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Large 3D Intelligence Galaxy Panel (8 cols) */}
        <div className="lg:col-span-8">
          <IntelligenceGalaxy />
        </div>

        {/* Right Stack: AI Co-Pilot & Anomaly Radar (4 cols) */}
        <div className="flex flex-col gap-5 lg:col-span-4">
          <AICoPilotCard />
          <AnomalyRadarCard onViewAll={() => onNavigate?.('quality')} />
        </div>
      </section>

      {/* 3. BOTTOM-MIDDLE ANALYTICS: 4-Column Balanced Grid */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DataDNACard />
        <EnrichmentCoverageCard />
        <TopCategoriesCard onViewAll={() => onNavigate?.('products')} />
        <FutureImpactCard />
      </section>

      {/* 4. BOTTOM HEARTBEAT: Full-width Anvaya Live Feed */}
      <section aria-label="Live Heartbeat Feed">
        <LiveFeedBar />
      </section>
    </div>
  );
}

import { useState } from 'react';
import { IngestionPage } from '@/pages/Ingestion/IngestionPage';
import { ProductsPage } from '@/pages/Products/ProductsPage';
import { MainLayout } from '@/layouts/MainLayout';
import { NavigationSection } from '@/layouts/Sidebar';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { DashboardPage } from '@/pages/DashboardPage';
import { Layers } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavigationSection>('overview');

  return (
    <MainLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {activeSection === 'overview' && (
        <DashboardPage onNavigate={setActiveSection} />
      )}
{activeSection === 'ingestion' && (
  <IngestionPage onBack={() => setActiveSection('overview')} />
)}

{/* Placeholder sections for Products, Quality, Intelligence */}
      {activeSection === 'products' && <ProductsPage />}

{activeSection !== 'overview' && activeSection !== 'ingestion' && activeSection !== 'products' && (
        <div className="space-y-6">
          <PageHeader
            title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            description={`ANVAYA ${activeSection} module placeholder ready for Phase 5+ implementation.`}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('overview')}
              >
                Back to Dashboard
              </Button>
            }
          />
          <EmptyState
            icon={Layers}
            title={`${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Module`}
            description={`The foundation for the ${activeSection} module has been prepared with full typed services and mock fallback. This view will be fully activated in subsequent phases.`}
            action={
              <Button onClick={() => setActiveSection('overview')} variant="secondary">
                Return to Dashboard
              </Button>
            }
          />
        </div>
      )}
    </MainLayout>
  );
}

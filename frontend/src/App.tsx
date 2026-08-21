import { useState } from 'react';

import { LoginPage } from '@/pages/LoginPage';

import { IngestionPage } from '@/pages/Ingestion/IngestionPage';
import { ProductsPage } from '@/pages/Products/ProductsPage';
import { ProductDetailPage } from '@/pages/Products/ProductDetailPage';
import { QualityPage } from '@/pages/Quality/QualityPage';
import { IntelligencePage } from '@/pages/Intelligence/IntelligencePage';
import { MainLayout } from '@/layouts/MainLayout';
import { NavigationSection } from '@/layouts/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  const [activeSection, setActiveSection] =
    useState<NavigationSection>('overview');

  const [selectedProductId, setSelectedProductId] =
    useState<string | null>(null);

  const handleSectionChange = (section: NavigationSection) => {
    setActiveSection(section);
    setSelectedProductId(null);
  };

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <MainLayout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {activeSection === 'overview' && (
        <DashboardPage onNavigate={handleSectionChange} />
      )}

      {activeSection === 'ingestion' && (
        <IngestionPage
          onBack={() => handleSectionChange('overview')}
        />
      )}

      {activeSection === 'products' && selectedProductId && (
        <ProductDetailPage
          productId={selectedProductId}
          onBack={() => setSelectedProductId(null)}
        />
      )}

      {activeSection === 'products' && !selectedProductId && (
        <ProductsPage
          onProductSelect={setSelectedProductId}
        />
      )}

      {activeSection === 'quality' && <QualityPage />}
      {activeSection === 'intelligence' && <IntelligencePage />}
    </MainLayout>
  );
}
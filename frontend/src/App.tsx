import { useState, useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/Products/ProductsPage';
import { ProductDetailPage } from '@/pages/Products/ProductDetailPage';
import { ReviewQueuePage } from '@/pages/Review/ReviewQueuePage';
import { CopilotPage } from '@/pages/Copilot/CopilotPage';
import { QualityPage } from '@/pages/Quality/QualityPage';
import { ValidationPage } from '@/pages/Validation/ValidationPage';
import { EnrichmentPage } from '@/pages/Enrichment/EnrichmentPage';
import { IntelligencePage } from '@/pages/Intelligence/IntelligencePage';
import { AnalyticsPage } from '@/pages/Analytics/AnalyticsPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { HelpPage } from '@/pages/Help/HelpPage';
import { FittingsDemoPage } from '@/pages/Fittings/FittingsDemoPage';
import { EvaluationPage } from '@/pages/Evaluation/EvaluationPage';
import { ConflictsPage } from '@/pages/Conflicts/ConflictsPage';
import { DatasetPage } from '@/pages/Datasets/DatasetPage';
import { ExportPage } from '@/pages/Export/ExportPage';
import { CommandPalette } from '@/components/common/CommandPalette';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { ProductTour } from '@/components/tour/ProductTour';
import { DatasetProvider, useDataset } from '@/context/DatasetContext';
import { request } from '@/services/api/apiClient';

export interface AppProps {
  initialView?: 'app' | 'landing' | 'login';
}

function AppContent({ initialView = 'landing' }: AppProps) {
  const { activeDatasetId } = useDataset();

  const [currentView, setCurrentView] = useState<'app' | 'landing' | 'login'>(initialView);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [userRole, setUserRole] = useState<'ADMIN' | 'DATA_MANAGER' | 'REVIEWER' | 'VIEWER'>('ADMIN');
  const [userName, setUserName] = useState('Devin Vance');
  const [userEmail, setUserEmail] = useState('lead.architect@enterprise.com');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check onboarding status for first-time non-test sessions
    try {
      const seenOnboarding = typeof window !== 'undefined' ? localStorage.getItem('anvaya_onboarding_completed') : 'true';
      if (!seenOnboarding && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'test') {
        setShowOnboarding(true);
      }
    } catch {
      // Ignore in strict test runners
    }

    async function fetchReviewCount() {
      if (!activeDatasetId) {
        setReviewCount(0);
        return;
      }
      try {
        const res = await request<any>(`/reviews?status_filter=PENDING&dataset_id=${activeDatasetId}`);
        if (res?.data?.total_pending !== undefined) {
          setReviewCount(res.data.total_pending);
        }
      } catch {
        // Keep current count
      }
    }
    fetchReviewCount();
  }, [activeDatasetId]);

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'landing') {
      setCurrentView('landing');
      return;
    }
    if (sectionId === 'login') {
      setCurrentView('login');
      return;
    }
    setCurrentView('app');
    setActiveSection(sectionId);
    setSelectedProductId(null);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleBackToProducts = () => {
    setSelectedProductId(null);
    setActiveSection('products');
  };

  const handleLoginSuccess = (role: string, name: string, email: string) => {
    setUserRole(role as any);
    setUserName(name);
    setUserEmail(email);
    setCurrentView('app');
    setActiveSection('overview');
  };

  if (currentView === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setCurrentView('app')}
        onLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  const renderContent = () => {
    if (selectedProductId) {
      return (
        <ProductDetailPage
          productId={selectedProductId}
          onBack={handleBackToProducts}
          onSelectSimilar={(id) => setSelectedProductId(id)}
        />
      );
    }

    switch (activeSection) {
      case 'overview':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'datasets':
        return <DatasetPage onStartEnrichment={() => handleNavigate('enrichment')} onNavigate={handleNavigate} />;
      case 'products':
        return <ProductsPage onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} />;
      case 'fittings':
        return <FittingsDemoPage />;
      case 'evaluation':
        return <EvaluationPage />;
      case 'conflicts':
        return <ConflictsPage onSelectProduct={handleSelectProduct} />;
      case 'review':
        return (
          <ReviewQueuePage
            onSelectProduct={handleSelectProduct}
            onCountChange={(cnt: number) => setReviewCount(cnt)}
            onNavigate={handleNavigate}
          />
        );
      case 'copilot':
        return <CopilotPage onSelectProduct={handleSelectProduct} onNavigate={handleNavigate} />;
      case 'quality':
        return <QualityPage />;
      case 'validation':
        return <ValidationPage onNavigate={handleNavigate} />;
      case 'enrichment':
        return <EnrichmentPage />;
      case 'export':
        return <ExportPage onNavigate={handleNavigate} />;
      case 'intelligence':
        return <IntelligencePage />;
      case 'analytics':
        return <AnalyticsPage onNavigate={handleNavigate} />;
      case 'help':
        return <HelpPage onStartTour={() => setShowTour(true)} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <CommandPalette onNavigate={handleNavigate} onOpenCopilot={() => handleNavigate('copilot')} />

      {/* Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('anvaya_onboarding_completed', 'true');
        }}
        onStartTour={() => {
          setShowOnboarding(false);
          setShowTour(true);
        }}
      />

      {/* Product Tour */}
      <ProductTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onNavigate={(sec) => handleNavigate(sec)}
      />

      <MainLayout
        activeSection={activeSection}
        onSectionChange={handleNavigate}
        reviewCount={reviewCount}
        onStartTour={() => setShowTour(true)}
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
      >
        {renderContent()}
      </MainLayout>
    </>
  );
}

export default function App({ initialView = 'landing' }: AppProps) {
  return (
    <DatasetProvider>
      <AppContent initialView={initialView} />
    </DatasetProvider>
  );
}
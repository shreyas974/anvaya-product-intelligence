import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DashboardPage } from '@/pages/DashboardPage';
import { apiConfig, setUseMocks } from '@/services/api/apiConfig';

describe('DashboardPage Component', () => {
  beforeEach(() => {
    setUseMocks(true);
    apiConfig.simulatedLatencyMinMs = 0;
    apiConfig.simulatedLatencyMaxMs = 0;
    vi.restoreAllMocks();
  });

  it('renders loading skeleton initially and resolves telemetry data', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    expect(screen.getByText('ANVAYA Product Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Total Ingested Products')).toBeInTheDocument();
    expect(screen.getByText('Catalog Quality Score')).toBeInTheDocument();
  });

  it('renders Quality Health Index and 4 dimension scores', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Catalog Quality Health Index')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Completeness').length).toBeGreaterThan(0);
    expect(screen.getByText('Consistency')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Uniqueness')).toBeInTheDocument();
    expect(screen.getByText('7-Day Quality Score Trajectory')).toBeInTheDocument();
  });

  it('renders active AI Enrichment pipeline job and recently recovered attributes with explainability', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/AI Enrichment Pipeline/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Active Pipeline Job:/i)).toBeInTheDocument();
    expect(screen.getByText(/Recently Recovered Attributes & Explainability/i)).toBeInTheDocument();
    expect(screen.getByText(/Safe structured explainability metadata active/i)).toBeInTheDocument();
  });

  it('renders missing attribute recovery gaps and duplicate clusters', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Missing Attribute Recovery Gaps')).toBeInTheDocument();
    });

    expect(screen.getByText('fabric')).toBeInTheDocument();
    expect(screen.getByText('Semantic Duplicate Clusters')).toBeInTheDocument();
    expect(screen.getByText(/boAt Airdopes 141 True Wireless Earbuds/i)).toBeInTheDocument();
    expect(screen.getByText(/Est\. Savings: ₹63\.5k\/mo/i)).toBeInTheDocument();
  });

  it('renders Category Intelligence benchmarking and allows tab interaction', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Category Intelligence & Benchmarking/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: 'Electronics & Mobiles' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Audio & Wearables' })).toBeInTheDocument();

    const audioTab = screen.getByRole('tab', { name: 'Audio & Wearables' });
    fireEvent.click(audioTab);

    expect(screen.getByText('boAt')).toBeInTheDocument();
  });

  it('renders Ingestion CTA Banner and triggers navigation callbacks', async () => {
    const onNavigate = vi.fn();
    render(<DashboardPage onNavigate={onNavigate} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Ingest Unstructured Catalogs & Automate AI Enrichment/i)
      ).toBeInTheDocument();
    });

    const launchBtn = screen.getByRole('button', { name: /Launch Ingestion Studio/i });
    fireEvent.click(launchBtn);
    expect(onNavigate).toHaveBeenCalledWith('ingestion');

    const exploreBtn = screen.getByRole('button', { name: /Explore Catalog/i });
    fireEvent.click(exploreBtn);
    expect(onNavigate).toHaveBeenCalledWith('products');
  });
});

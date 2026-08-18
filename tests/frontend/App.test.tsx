import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '@/App';
import { apiConfig, setUseMocks } from '@/services/api/apiConfig';

describe('App Integration', () => {
  beforeEach(() => {
    setUseMocks(true);
    apiConfig.simulatedLatencyMinMs = 0;
    apiConfig.simulatedLatencyMaxMs = 0;
  });

  it('renders the ANVAYA application shell and Dashboard overview header', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('ANVAYA Product Intelligence')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Autonomous data cleansing, attribute recovery, and catalog intelligence platform./i)
    ).toBeInTheDocument();
  });

  it('renders the core dashboard KPI cards', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Total Ingested Products')).toBeInTheDocument();
    });

    expect(screen.getByText('1,420')).toBeInTheDocument();
    expect(screen.getByText('Catalog Quality Score')).toBeInTheDocument();
    expect(screen.getByText('AI Enrichment Rate')).toBeInTheDocument();
  });

  it('allows navigation from dashboard to placeholder sections and back', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('ANVAYA Product Intelligence')).toBeInTheDocument();
    });

    // Navigate to Ingestion via sidebar nav button
    const ingestNav = screen.getByRole('button', { name: 'Ingestion' });
    fireEvent.click(ingestNav);

    expect(screen.getByText('Ingestion Module')).toBeInTheDocument();

    // Click Return to Dashboard
    const returnBtn = screen.getByRole('button', { name: /Return to Dashboard/i });
    fireEvent.click(returnBtn);

    await waitFor(() => {
      expect(screen.getByText('ANVAYA Product Intelligence')).toBeInTheDocument();
    });
  });
});

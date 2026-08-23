import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DashboardPage } from '@/pages/DashboardPage';
import { DatasetProvider } from '@/context/DatasetContext';
import { apiConfig, setUseMocks } from '@/services/api/apiConfig';

describe('DashboardPage Component', () => {
  beforeEach(() => {
    setUseMocks(true);
    apiConfig.simulatedLatencyMinMs = 0;
    apiConfig.simulatedLatencyMaxMs = 0;
    vi.restoreAllMocks();
  });

  it('renders clean workspace empty state when no dataset is uploaded or active', async () => {
    render(
      <DatasetProvider>
        <DashboardPage />
      </DatasetProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    expect(screen.getByText('Welcome to ANVAYA')).toBeInTheDocument();
    expect(screen.getByText('Clean Workspace State')).toBeInTheDocument();
    expect(screen.getByText(/You haven't uploaded a dataset yet/i)).toBeInTheDocument();
  });

  it('renders dataset onboarding value propositions', async () => {
    render(
      <DatasetProvider>
        <DashboardPage />
      </DatasetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('1. Bring Your File')).toBeInTheDocument();
    });

    expect(screen.getByText('2. Dynamic Profiling')).toBeInTheDocument();
    expect(screen.getByText('3. Zero Fabrication')).toBeInTheDocument();
  });

  it('triggers navigation callbacks for dataset upload', async () => {
    const onNavigate = vi.fn();
    render(
      <DatasetProvider>
        <DashboardPage onNavigate={onNavigate} />
      </DatasetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome to ANVAYA')).toBeInTheDocument();
    });

    const uploadBtn = screen.getByRole('button', { name: /Upload Dataset/i });
    fireEvent.click(uploadBtn);

    expect(onNavigate).toHaveBeenCalledWith('datasets');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from '@/App';
import { apiConfig, setUseMocks } from '@/services/api/apiConfig';

describe('App Integration', () => {
  beforeEach(() => {
    setUseMocks(true);
    apiConfig.simulatedLatencyMinMs = 0;
    apiConfig.simulatedLatencyMaxMs = 0;
  });

  it('renders the Landing Page first on launch with hero and capabilities', async () => {
    render(<App initialView="landing" />);

    await waitFor(() => {
      expect(screen.getByText(/Turn Messy Product Data Into Clean/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/100% normalized, classified, enriched, validated/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Launch Platform/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Sign In/i }).length).toBeGreaterThan(0);
  });

  it('renders the Login Page when navigating to login', async () => {
    render(<App initialView="login" />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise Product Intelligence/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Sign In to Workspace/i })).toBeInTheDocument();
  });

  it('renders Mission Control and allows navigation between sections', async () => {
    render(<App initialView="app" />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to ANVAYA')).toBeInTheDocument();
    });

    expect(screen.getByText('Default Enterprise Workspace')).toBeInTheDocument();
    expect(screen.getByText('No Dataset Selected')).toBeInTheDocument();

    // Navigate to Products via sidebar
    const productsNav = screen.getByRole('button', { name: /^Products$/i });
    fireEvent.click(productsNav);

    // Verify Products page is rendered
    await waitFor(() => {
      expect(screen.getByText(/No Active Dataset Selected/i)).toBeInTheDocument();
    });

    // Navigate back to Mission Control
    const missionControlNav = screen.getByRole('button', { name: /Mission Control/i });
    fireEvent.click(missionControlNav);

    await waitFor(() => {
      expect(screen.getByText('Welcome to ANVAYA')).toBeInTheDocument();
    });
  });
});
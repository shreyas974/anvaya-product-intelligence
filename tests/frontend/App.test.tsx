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

  it('renders the ANVAYA application shell and Clean Workspace welcome banner', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to ANVAYA')).toBeInTheDocument();
    });

    expect(screen.getByText(/Clean Workspace State/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Dataset/i)).toBeInTheDocument();
  });

  it('renders the core navigation elements and workspace switcher', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Default Enterprise Workspace')).toBeInTheDocument();
    });

    expect(screen.getByText('No Dataset Selected')).toBeInTheDocument();
  });

  it('allows navigation from Mission Control to Products page and back', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to ANVAYA')).toBeInTheDocument();
    });

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
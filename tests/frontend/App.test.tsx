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
    try {
      localStorage.clear();
    } catch {}
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

  it('renders the Login / Registration Page and allows creating an account', async () => {
    render(<App initialView="login" />);

    await waitFor(() => {
      expect(screen.getByText(/Enterprise Product Intelligence/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Create Account & Enter Workspace/i })).toBeInTheDocument();

    // Fill in registration form
    fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), { target: { value: 'Alex Morgan' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your enterprise name/i), { target: { value: 'Global Parts Co' } });
    fireEvent.change(screen.getByPlaceholderText(/name@enterprise.com/i), { target: { value: 'alex@globalparts.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Create a secure password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByPlaceholderText(/Re-type your password/i), { target: { value: 'Password123!' } });

    // Submit registration
    const createBtn = screen.getByRole('button', { name: /Create Account & Enter Workspace/i });
    fireEvent.click(createBtn);

    // Verify workspace is reached with new user
    await waitFor(() => {
      expect(screen.getByText('Welcome to ANVAYA')).toBeInTheDocument();
    });

    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText('alex@globalparts.com')).toBeInTheDocument();
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
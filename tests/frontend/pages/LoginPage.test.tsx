import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { LoginPage } from '@/pages/LoginPage';

describe('LoginPage Component', () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {}
  });

  it('renders Google, Microsoft, and GitHub SSO login buttons with brand header', () => {
    render(<LoginPage />);

    expect(screen.getByText('ANVAYA')).toBeInTheDocument();
    expect(screen.getByText(/Enterprise Product Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with Google \/ Gmail/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with Microsoft Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with GitHub/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In with Email/i })).toBeInTheDocument();
  });

  it('allows logging in with Google SSO', async () => {
    const handleLoginSuccess = vi.fn();
    render(<LoginPage onLoginSuccess={handleLoginSuccess} />);

    // Click Google SSO
    const googleBtn = screen.getByText(/Continue with Google \/ Gmail/i);
    fireEvent.click(googleBtn);

    // OAuth modal should open
    expect(screen.getByText(/Google SSO Login/i)).toBeInTheDocument();

    const authorizeBtn = screen.getByRole('button', { name: /Authorize & Enter/i });
    fireEvent.click(authorizeBtn);

    await waitFor(() => {
      expect(handleLoginSuccess).toHaveBeenCalledWith(
        'ADMIN',
        'Alex Mercer',
        'alex.engineer@gmail.com'
      );
    });

    const session = JSON.parse(localStorage.getItem('anvaya_active_session') || '{}');
    expect(session.email).toBe('alex.engineer@gmail.com');
    expect(session.provider).toBe('google');
  });

  it('allows logging in with Microsoft SSO', async () => {
    const handleLoginSuccess = vi.fn();
    render(<LoginPage onLoginSuccess={handleLoginSuccess} />);

    // Click Microsoft SSO
    const msBtn = screen.getByText(/Continue with Microsoft Account/i);
    fireEvent.click(msBtn);

    expect(screen.getByText(/Microsoft SSO Login/i)).toBeInTheDocument();

    const authorizeBtn = screen.getByRole('button', { name: /Authorize & Enter/i });
    fireEvent.click(authorizeBtn);

    await waitFor(() => {
      expect(handleLoginSuccess).toHaveBeenCalledWith(
        'ADMIN',
        'Sarah Chen',
        'sarah.data@outlook.com'
      );
    });
  });

  it('allows logging in with GitHub SSO', async () => {
    const handleLoginSuccess = vi.fn();
    render(<LoginPage onLoginSuccess={handleLoginSuccess} />);

    // Click GitHub SSO
    const ghBtn = screen.getByText(/Continue with GitHub/i);
    fireEvent.click(ghBtn);

    expect(screen.getByText(/GitHub SSO Login/i)).toBeInTheDocument();

    const authorizeBtn = screen.getByRole('button', { name: /Authorize & Enter/i });
    fireEvent.click(authorizeBtn);

    await waitFor(() => {
      expect(handleLoginSuccess).toHaveBeenCalledWith(
        'ADMIN',
        'Marcus Vance',
        'marcus-dev@github.com'
      );
    });
  });

  it('allows switching to Reset tab and sending reset instructions', async () => {
    render(<LoginPage />);

    const resetTab = screen.getByRole('button', { name: 'Reset' });
    fireEvent.click(resetTab);

    expect(screen.getByRole('button', { name: /Send Reset Instructions/i })).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('name@enterprise.com');
    fireEvent.change(emailInput, { target: { value: 'user@enterprise.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Send Reset Instructions/i }));

    await waitFor(() => {
      expect(screen.getByText(/No account found/i)).toBeInTheDocument();
    });
  });
});

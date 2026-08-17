import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('App Minimal Verification', () => {
  it('renders the ANVAYA header and tagline', () => {
    render(<App />);
    expect(screen.getByText(/ANVAYA Frontend/i)).toBeInTheDocument();
    expect(
      screen.getByText(/AI-powered Product Intelligence and Product Data Enrichment Platform/i)
    ).toBeInTheDocument();
  });

  it('renders the core status indicators', () => {
    render(<App />);
    expect(screen.getByText('Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
  });
});

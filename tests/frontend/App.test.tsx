import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('App Integration', () => {
  it('renders the ANVAYA application shell and overview header', () => {
    render(<App />);
    expect(screen.getByText('ANVAYA Overview')).toBeInTheDocument();
    expect(
      screen.getByText(/Transform messy, unstructured product data into verified, high-confidence product intelligence./i)
    ).toBeInTheDocument();
  });

  it('renders the core design system StatCards', () => {
    render(<App />);
    expect(screen.getByText('Total Ingested Products')).toBeInTheDocument();
    expect(screen.getByText('1,420')).toBeInTheDocument();
    expect(screen.getByText('AI Enriched SKUs')).toBeInTheDocument();
    expect(screen.getByText('Average Quality Score')).toBeInTheDocument();
  });
});

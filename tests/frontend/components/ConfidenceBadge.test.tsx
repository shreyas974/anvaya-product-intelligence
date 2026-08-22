import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';

describe('ConfidenceBadge Component', () => {
  it('renders high confidence percentage and tier (>= 85%)', () => {
    render(<ConfidenceBadge score={92} />);
    expect(screen.getByText('92% High')).toBeInTheDocument();
  });

  it('renders medium confidence percentage and tier (60 - 84%)', () => {
    render(<ConfidenceBadge score={74} />);
    expect(screen.getByText('74% Medium')).toBeInTheDocument();
  });

  it('renders low confidence percentage and tier (< 60%)', () => {
    render(<ConfidenceBadge score={45} />);
    expect(screen.getByText('45% Low')).toBeInTheDocument();
  });

  it('correctly handles decimal scores (0.0 to 1.0)', () => {
    render(<ConfidenceBadge score={0.88} />);
    expect(screen.getByText('88% High')).toBeInTheDocument();
  });

  it('provides an accessible aria-label with confidence and tier', () => {
    render(<ConfidenceBadge score={95} />);
    const badge = screen.getByLabelText(/Confidence: 95%, Tier: High/i);
    expect(badge).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/common/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders raw status label', () => {
    render(<StatusBadge status="raw" />);
    expect(screen.getByText('Raw')).toBeInTheDocument();
  });

  it('renders cleaned status label', () => {
    render(<StatusBadge status="cleaned" />);
    expect(screen.getByText('Cleaned')).toBeInTheDocument();
  });

  it('renders enriched status label', () => {
    render(<StatusBadge status="enriched" />);
    expect(screen.getByText('Enriched')).toBeInTheDocument();
  });

  it('renders flagged status label', () => {
    render(<StatusBadge status="flagged" />);
    expect(screen.getByText('Flagged')).toBeInTheDocument();
  });

  it('renders approved status label', () => {
    render(<StatusBadge status="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
});

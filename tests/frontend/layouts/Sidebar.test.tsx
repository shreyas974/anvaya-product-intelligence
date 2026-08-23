import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/layouts/Sidebar';

describe('Sidebar Component', () => {
  it('renders core enterprise navigation items', () => {
    render(
      <Sidebar
        activeSection="overview"
        onSectionChange={() => {}}
        collapsed={false}
        reviewCount={5}
      />
    );

    expect(screen.getByText('Mission Control')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Fittings Lab')).toBeInTheDocument();
    expect(screen.getByText('Benchmark Eval')).toBeInTheDocument();
    expect(screen.getByText('Conflict Center')).toBeInTheDocument();
    expect(screen.getByText('Review Queue')).toBeInTheDocument();
    expect(screen.getByText('Enrichment')).toBeInTheDocument();
    expect(screen.getByText('Validation')).toBeInTheDocument();
    expect(screen.getByText('Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Data Quality')).toBeInTheDocument();
    expect(screen.getByText('AI Copilot')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('triggers onSectionChange callback when a navigation item is clicked', () => {
    const handleSectionChange = vi.fn();
    render(
      <Sidebar
        activeSection="overview"
        onSectionChange={handleSectionChange}
        collapsed={false}
      />
    );

    fireEvent.click(screen.getByText('Fittings Lab'));
    expect(handleSectionChange).toHaveBeenCalledWith('fittings');
  });

  it('highlights the active navigation item', () => {
    render(
      <Sidebar
        activeSection="fittings"
        onSectionChange={() => {}}
        collapsed={false}
      />
    );

    const fittingsButton = screen.getByRole('button', { name: /fittings lab/i });
    expect(fittingsButton).toHaveAttribute('aria-current', 'page');
  });
});

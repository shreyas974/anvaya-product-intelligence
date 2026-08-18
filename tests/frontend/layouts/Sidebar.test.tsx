import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/layouts/Sidebar';

describe('Sidebar Component', () => {
  it('renders all 5 core navigation items', () => {
    render(
      <Sidebar
        activeSection="overview"
        onSectionChange={() => {}}
        collapsed={false}
        onToggleCollapse={() => {}}
      />
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Ingestion')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('Intelligence')).toBeInTheDocument();
  });

  it('triggers onSectionChange callback when a navigation item is clicked', () => {
    const handleSectionChange = vi.fn();
    render(
      <Sidebar
        activeSection="overview"
        onSectionChange={handleSectionChange}
        collapsed={false}
        onToggleCollapse={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Products'));
    expect(handleSectionChange).toHaveBeenCalledWith('products');
  });

  it('highlights the active navigation item', () => {
    render(
      <Sidebar
        activeSection="quality"
        onSectionChange={() => {}}
        collapsed={false}
        onToggleCollapse={() => {}}
      />
    );

    const qualityButton = screen.getByRole('button', { name: /quality/i });
    expect(qualityButton).toHaveAttribute('aria-current', 'page');
  });
});

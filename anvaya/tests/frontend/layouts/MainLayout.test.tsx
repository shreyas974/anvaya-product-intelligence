import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MainLayout } from '@/layouts/MainLayout';
import { DatasetProvider } from '@/context/DatasetContext';

describe('MainLayout Component', () => {
  it('renders children content inside main area', () => {
    render(
      <DatasetProvider>
        <MainLayout activeSection="overview">
          <div data-testid="test-content">ANVAYA Dashboard Content</div>
        </MainLayout>
      </DatasetProvider>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('ANVAYA Dashboard Content')).toBeInTheDocument();
  });

  it('renders navigation shell with brand header and system status', () => {
    render(
      <DatasetProvider>
        <MainLayout activeSection="overview">
          <div>Content</div>
        </MainLayout>
      </DatasetProvider>
    );

    expect(screen.getAllByText('ANVAYA').length).toBeGreaterThan(0);
    expect(screen.getByText('True Product Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Reference Masters Active')).toBeInTheDocument();
  });
});

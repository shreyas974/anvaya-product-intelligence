import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from '@/layouts/MainLayout';

describe('MainLayout Component', () => {
  it('renders children content inside main area', () => {
    render(
      <MainLayout activeSection="overview">
        <div data-testid="test-content">ANVAYA Dashboard Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('ANVAYA Dashboard Content')).toBeInTheDocument();
  });

  it('renders navigation shell with breadcrumbs and user profile', () => {
    render(
      <MainLayout activeSection="overview">
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Platform Overview')).toBeInTheDocument();
    expect(screen.getByText('Shantha')).toBeInTheDocument();
    expect(screen.getByText('Pipeline Online')).toBeInTheDocument();
  });
});

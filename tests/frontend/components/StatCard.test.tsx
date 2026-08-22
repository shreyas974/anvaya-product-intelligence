import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/common/StatCard';
import { Database } from 'lucide-react';

describe('StatCard Component', () => {
  it('renders title and value accurately', () => {
    render(<StatCard title="Total SKUs" value="1,250" />);
    expect(screen.getByText('Total SKUs')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
  });

  it('renders trend change when supplied', () => {
    render(
      <StatCard
        title="Quality Score"
        value="92.4"
        change={{ value: '+5.2%', direction: 'up', label: 'vs last month' }}
      />
    );
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('renders icon when supplied', () => {
    render(<StatCard title="Products" value="500" icon={Database} />);
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders loading placeholder skeleton when loading is true', () => {
    const { container } = render(
      <StatCard title="Total SKUs" value="1,250" loading={true} />
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByText('1,250')).not.toBeInTheDocument();
  });
});

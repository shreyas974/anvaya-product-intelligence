import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RawDataPreview } from '@/components/ingestion/RawDataPreview';

describe('RawDataPreview', () => {
  const headers = ['name', 'price', 'category'];

  const rows = [
    { name: 'Phone', price: 100, category: 'Electronics' },
    { name: 'Laptop', price: 800, category: 'Computers' },
  ];

  it('renders table headers and row data', () => {
    render(
      <RawDataPreview
        fileName="products.csv"
        headers={headers}
        rows={rows}
      />
    );

    expect(screen.getByText('Raw Data Preview')).toBeInTheDocument();

    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('price')).toBeInTheDocument();
    expect(screen.getByText('category')).toBeInTheDocument();

    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('limits the preview to maxRows', () => {
    const manyRows = [
      { name: 'Product 1', price: 10, category: 'A' },
      { name: 'Product 2', price: 20, category: 'B' },
      { name: 'Product 3', price: 30, category: 'C' },
    ];

    render(
      <RawDataPreview
        fileName="products.csv"
        headers={headers}
        rows={manyRows}
        maxRows={2}
      />
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.queryByText('Product 3')).not.toBeInTheDocument();

    expect(
      screen.getByText('Showing 2 of 3 detected rows')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Preview limited to 2 rows')
    ).toBeInTheDocument();
  });

  it('displays a dash for empty values', () => {
    render(
      <RawDataPreview
        fileName="products.csv"
        headers={headers}
        rows={[
          {
            name: 'Phone',
            price: null,
            category: '',
          },
        ]}
      />
    );

    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('shows an empty state when there is no preview data', () => {
    render(
      <RawDataPreview
        fileName="products.csv"
        headers={[]}
        rows={[]}
      />
    );

    expect(
      screen.getByText('No preview data is available.')
    ).toBeInTheDocument();
  });

  it('supports JSON files', () => {
    render(
      <RawDataPreview
        fileName="products.json"
        headers={headers}
        rows={rows}
      />
    );

    expect(screen.getByText('Raw Data Preview')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });
});

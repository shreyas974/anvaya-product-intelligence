import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FileValidationSummary } from '@/components/ingestion/FileValidationSummary';

describe('FileValidationSummary', () => {
  it('shows a valid file as ready for ingestion', () => {
    render(
      <FileValidationSummary
        status="valid"
        fileName="products.csv"
        rowCount={120}
        columnCount={8}
      />
    );

    expect(screen.getByText('products.csv')).toBeInTheDocument();
    expect(screen.getByText('Ready for ingestion')).toBeInTheDocument();
    expect(screen.getByText('VALID')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('shows warning status and issues', () => {
    render(
      <FileValidationSummary
        status="warning"
        fileName="catalog.json"
        issues={['Missing product descriptions', 'Duplicate SKUs detected']}
      />
    );

    expect(screen.getByText('Ready with warnings')).toBeInTheDocument();
    expect(screen.getByText('WARNING')).toBeInTheDocument();
    expect(screen.getByText('Missing product descriptions')).toBeInTheDocument();
    expect(screen.getByText('Duplicate SKUs detected')).toBeInTheDocument();
  });

  it('shows error status', () => {
    render(
      <FileValidationSummary
        status="error"
        fileName="invalid.csv"
        issues={['Required column is missing']}
      />
    );

    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('ERROR')).toBeInTheDocument();
    expect(screen.getByText('Required column is missing')).toBeInTheDocument();
  });

  it('does not render row and column statistics when they are not provided', () => {
    render(
      <FileValidationSummary
        status="valid"
        fileName="products.csv"
      />
    );

    expect(screen.queryByText('Rows detected')).not.toBeInTheDocument();
    expect(screen.queryByText('Columns detected')).not.toBeInTheDocument();
  });
});

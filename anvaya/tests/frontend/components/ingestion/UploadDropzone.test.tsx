import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UploadDropzone } from '@/components/ingestion/UploadDropzone';

describe('UploadDropzone', () => {
  it('renders the upload interface', () => {
    render(<UploadDropzone />);

    expect(screen.getByText('Upload your product catalog')).toBeInTheDocument();
    expect(
      screen.getByText('Drag & drop a CSV or JSON file here, or click to browse.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose File' })).toBeInTheDocument();
  });

  it('accepts a valid CSV file and calls onFileSelected', () => {
    const onFileSelected = vi.fn();

    render(<UploadDropzone onFileSelected={onFileSelected} />);

    const input = screen.getByRole('button', {
      name: 'Upload CSV or JSON file',
    }).querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['name,price\nPhone,100'], 'products.csv', {
      type: 'text/csv',
    });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(onFileSelected).toHaveBeenCalledWith(file);
    expect(screen.getByText('products.csv')).toBeInTheDocument();
  });

  it('rejects unsupported file types', () => {
    const onFileSelected = vi.fn();

    render(<UploadDropzone onFileSelected={onFileSelected} />);

    const input = screen.getByRole('button', {
      name: 'Upload CSV or JSON file',
    }).querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['hello'], 'products.txt', {
      type: 'text/plain',
    });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(
      screen.getByText('Only CSV and JSON files are supported.')
    ).toBeInTheDocument();

    expect(onFileSelected).not.toHaveBeenCalled();
  });

  it('rejects files larger than the configured limit', () => {
    const onFileSelected = vi.fn();

    render(
      <UploadDropzone
        onFileSelected={onFileSelected}
        maxSizeMB={1}
      />
    );

    const input = screen.getByRole('button', {
      name: 'Upload CSV or JSON file',
    }).querySelector('input[type="file"]') as HTMLInputElement;

    const largeFile = new File(
      [new Uint8Array(2 * 1024 * 1024)],
      'large.csv',
      { type: 'text/csv' }
    );

    fireEvent.change(input, {
      target: { files: [largeFile] },
    });

    expect(
      screen.getByText('File size must be smaller than 1 MB.')
    ).toBeInTheDocument();

    expect(onFileSelected).not.toHaveBeenCalled();
  });

  it('removes a selected file', () => {
    render(<UploadDropzone />);

    const input = screen.getByRole('button', {
      name: 'Upload CSV or JSON file',
    }).querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['id,name'], 'products.csv', {
      type: 'text/csv',
    });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(screen.getByText('products.csv')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove selected file' })
    );

    expect(screen.queryByText('products.csv')).not.toBeInTheDocument();
    expect(screen.getByText('Upload your product catalog')).toBeInTheDocument();
  });
});

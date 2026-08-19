import { useState } from 'react';
import { UploadCloud, ArrowLeft } from 'lucide-react';

import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { UploadDropzone } from '@/components/ingestion/UploadDropzone';
import {
  FileValidationSummary,
  ValidationStatus,
} from '@/components/ingestion/FileValidationSummary';
import { RawDataPreview } from '@/components/ingestion/RawDataPreview';
import { startIngestion } from '@/services/ingestion.service';

interface PreviewRow {
  [key: string]: string | number | null;
}

export function IngestionPage({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>('valid');

  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);
const [ingestionMessage, setIngestionMessage] = useState<string | null>(null);
  

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);

    if (file.name.toLowerCase().endsWith('.json')) {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

       const records: PreviewRow[] = Array.isArray(parsed)
  ? parsed.filter(
      (item): item is PreviewRow =>
        typeof item === 'object' && item !== null && !Array.isArray(item)
    )
  : Array.isArray(parsed.products)
    ? parsed.products.filter(
        (item: unknown): item is PreviewRow =>
          typeof item === 'object' &&
          item !== null &&
          !Array.isArray(item)
      )
    : [];

if (records.length === 0) {
          setHeaders([]);
          setRows([]);
          setValidationStatus('warning');
          return;
        }

        const discoveredHeaders = Array.from(
          new Set(records.flatMap((record) => Object.keys(record)))
        );

        setHeaders(discoveredHeaders);
        setRows(records);
        setValidationStatus('valid');
      } catch {
        setHeaders([]);
        setRows([]);
        setValidationStatus('error');
      }

      return;
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);

    if (lines.length < 2) {
      setHeaders([]);
      setRows([]);
      setValidationStatus('warning');
      return;
    }

    const discoveredHeaders = lines[0]
      .split(',')
      .map((header) => header.trim());

    const parsedRows = lines.slice(1).map((line) => {
      const values = line.split(',');

      return discoveredHeaders.reduce<Record<string, string>>(
        (record, header, index) => {
          record[header] = values[index]?.trim() ?? '';
          return record;
        },
        {}
      );
    });

    setHeaders(discoveredHeaders);
    setRows(parsedRows);
    setValidationStatus('valid');
  };
    const handleStartIngestion = async () => {
    if (!selectedFile || validationStatus !== 'valid') {
      return;
    }

    setIsIngesting(true);
    setIngestionMessage(null);

    try {
      const result = await startIngestion({
        fileName: selectedFile.name,
        fileType: selectedFile.name.toLowerCase().endsWith('.json')
          ? 'json'
          : 'csv',
        rowCount: rows.length,
        columnCount: headers.length,
      });

      setIngestionMessage(result.message);
    } catch {
      setIngestionMessage('Failed to start ingestion.');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Ingestion"
        description="Upload a product catalog and validate its structure before ingestion."
        badge={
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            Phase 5
          </span>
        }
        actions={
          onBack ? (
  <Button variant="outline" size="sm" onClick={onBack}>
    <ArrowLeft className="mr-2 h-4 w-4" />
    Return to Dashboard
  </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6">
        <UploadDropzone onFileSelected={handleFileSelected} />

        {selectedFile && (
          <>
            <FileValidationSummary
              status={validationStatus}
              fileName={selectedFile.name}
              rowCount={rows.length}
              columnCount={headers.length}
              issues={
                validationStatus === 'error'
                  ? ['The uploaded file could not be parsed.']
                  : []
              }
            />

            <RawDataPreview
              fileName={selectedFile.name}
              headers={headers}
              rows={rows}
              maxRows={5}
            />

            {validationStatus === 'valid' && (
              <div className="flex justify-end">
                <Button onClick={handleStartIngestion} disabled={isIngesting}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                {isIngesting ? 'Starting Ingestion...' : 'Start Ingestion'}
                </Button>
              </div>
            )}
            {ingestionMessage && (
                <p className="text-right text-sm text-green-600">
                    {ingestionMessage}
                </p>

            )}
          </>
        )}
      </div>
    </div>
  );
}
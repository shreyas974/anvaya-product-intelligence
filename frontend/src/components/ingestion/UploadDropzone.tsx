import { useRef, useState } from 'react';
import { FileUp, FileJson, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface UploadDropzoneProps {
  onFileSelected?: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function UploadDropzone({
  onFileSelected,
  accept = '.csv,.json',
  maxSizeMB = 20,
  disabled = false,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (selectedFile: File) => {
    const extension = selectedFile.name.toLowerCase().split('.').pop();

    if (extension !== 'csv' && extension !== 'json') {
      return 'Only CSV and JSON files are supported.';
    }

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      return `File size must be smaller than ${maxSizeMB} MB.`;
    }

    return null;
  };

  const handleFile = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }

    setError(null);
    setFile(selectedFile);
    onFileSelected?.(selectedFile);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    if (disabled) return;

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload CSV or JSON file"
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(event) => {
            if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled) setDragActive(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={[
            'rounded-lg border-2 border-dashed p-10 text-center transition-colors cursor-pointer',
            dragActive
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/60 hover:bg-muted/30',
            disabled ? 'cursor-not-allowed opacity-50' : '',
          ].join(' ')}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleInputChange}
            disabled={disabled}
          />

          {!file ? (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <FileUp className="h-7 w-7 text-primary" />
              </div>

              <h3 className="text-lg font-semibold">
                Upload your product catalog
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Drag & drop a CSV or JSON file here, or click to browse.
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Maximum file size: {maxSizeMB} MB
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={(event) => {
                  event.stopPropagation();
                  inputRef.current?.click();
                }}
                disabled={disabled}
              >
                Choose File
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center gap-4">
              {file.name.toLowerCase().endsWith('.json') ? (
                <FileJson className="h-8 w-8 text-primary" />
              ) : (
                <FileText className="h-8 w-8 text-primary" />
              )}

              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove selected file"
                onClick={(event) => {
                  event.stopPropagation();
                  clearFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

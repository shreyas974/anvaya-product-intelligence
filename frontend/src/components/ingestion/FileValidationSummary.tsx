import { AlertCircle, CheckCircle2, FileWarning } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type ValidationStatus = 'valid' | 'warning' | 'error';

export interface FileValidationSummaryProps {
  status: ValidationStatus;
  fileName: string;
  rowCount?: number;
  columnCount?: number;
  issues?: string[];
}

const statusConfig = {
  valid: {
    label: 'Ready for ingestion',
    icon: CheckCircle2,
    className: 'text-emerald-500',
  },
  warning: {
    label: 'Ready with warnings',
    icon: FileWarning,
    className: 'text-amber-500',
  },
  error: {
    label: 'Validation failed',
    icon: AlertCircle,
    className: 'text-destructive',
  },
};

export function FileValidationSummary({
  status,
  fileName,
  rowCount,
  columnCount,
  issues = [],
}: FileValidationSummaryProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.className}`} />
          File Validation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <div>
            <p className="font-medium">{fileName}</p>
            <p className="text-sm text-muted-foreground">{config.label}</p>
          </div>

          <div className={`text-sm font-semibold ${config.className}`}>
            {status.toUpperCase()}
          </div>
        </div>

        {(rowCount !== undefined || columnCount !== undefined) && (
          <div className="grid grid-cols-2 gap-3">
            {rowCount !== undefined && (
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Rows detected</p>
                <p className="mt-1 text-lg font-semibold">
                  {rowCount.toLocaleString()}
                </p>
              </div>
            )}

            {columnCount !== undefined && (
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Columns detected</p>
                <p className="mt-1 text-lg font-semibold">
                  {columnCount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {issues.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Detected issues</p>

            <ul className="space-y-1">
              {issues.map((issue, index) => (
                <li
                  key={`${issue}-${index}`}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

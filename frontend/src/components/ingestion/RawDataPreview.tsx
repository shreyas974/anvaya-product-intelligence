import { AlertTriangle, FileJson, FileText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface RawDataPreviewProps {
  fileName: string;
  headers: string[];
  rows: Array<Record<string, string | number | null>>;
  maxRows?: number;
}

export function RawDataPreview({
  fileName,
  headers,
  rows,
  maxRows = 5,
}: RawDataPreviewProps) {
  const visibleRows = rows.slice(0, maxRows);
  const isJson = fileName.toLowerCase().endsWith('.json');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isJson ? (
            <FileJson className="h-5 w-5 text-primary" />
          ) : (
            <FileText className="h-5 w-5 text-primary" />
          )}
          Raw Data Preview
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {visibleRows.length} of {rows.length} detected rows
          </p>

          {rows.length > maxRows && (
            <span className="text-xs text-muted-foreground">
              Preview limited to {maxRows} rows
            </span>
          )}
        </div>

        {headers.length === 0 || rows.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            No preview data is available.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-max text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-t border-border/60 hover:bg-muted/20"
                  >
                    {headers.map((header) => (
                      <td
                        key={`${rowIndex}-${header}`}
                        className="max-w-xs px-4 py-3 text-left"
                      >
                        <span className="block truncate">
                          {row[header] === null ||
                          row[header] === undefined ||
                          row[header] === ''
                            ? '—'
                            : String(row[header])}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

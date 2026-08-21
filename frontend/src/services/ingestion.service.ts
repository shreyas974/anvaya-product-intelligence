export interface IngestionRequest {
  fileName: string;
  fileType: 'csv' | 'json';
  rowCount: number;
  columnCount: number;
}

export interface IngestionResult {
  ingestionId: string;
  status: 'started';
  message: string;
}

/**
 * Starts an ingestion job.
 *
 * This is currently a frontend-safe placeholder because
 * the backend ingestion endpoint is not available in this checkout.
 */
export async function startIngestion(
  request: IngestionRequest
): Promise<IngestionResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    ingestionId: `local-${Date.now()}`,
    status: 'started',
    message: `Ingestion started for ${request.fileName}.`,
  };
}

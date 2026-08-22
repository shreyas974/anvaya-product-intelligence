import { apiClient } from '@/services/api/apiClient';

export interface IngestionResult {
  ingestionId: string;
  status: 'started' | 'completed';
  message: string;
}

interface PipelineResponse {
  source_file?: string;
  pipeline_status?: string;
  ai_response?: unknown;
  ai_message?: string;
}

export async function startIngestion(
  file: File
): Promise<IngestionResult> {
  const formData = new FormData();
  formData.append('file', file);

  const result = await apiClient.post<PipelineResponse>(
    '/documents/pipeline',
    formData,
  );

  const isCompleted = result.pipeline_status === 'completed';

  return {
    ingestionId: result.source_file ?? file.name,
    status: isCompleted ? 'completed' : 'started',
    message: isCompleted
      ? `Ingestion completed for ${file.name}.`
      : result.ai_message ?? `Ingestion started for ${file.name}.`,
  };
}

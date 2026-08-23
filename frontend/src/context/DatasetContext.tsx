import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { request } from '@/services/api/apiClient';

export interface DatasetItem {
  id: number;
  name: string;
  file_name: string;
  file_size_bytes: number;
  file_format: string;
  row_count: number;
  column_count: number;
  status: string; // UPLOADED, PROFILED, PROCESSING, PROCESSED, ERROR
  version: string;
  uploaded_by: string;
  created_at: string | null;
  profiling?: {
    total_rows: number;
    total_columns: number;
    duplicate_rows: number;
    overall_null_rate: number;
    columns: Array<{
      name: string;
      role: string;
      data_type: string;
      non_null_count: number;
      null_count: number;
      null_rate_percent: number;
      unique_count: number;
      sample_values: string[];
    }>;
    inferred_mappings: Record<string, string>;
    sample_records: Array<Record<string, any>>;
  };
  column_mapping?: Record<string, string>;
}

interface DatasetContextType {
  datasets: DatasetItem[];
  activeDataset: DatasetItem | null;
  activeDatasetId: number | null;
  loading: boolean;
  setActiveDatasetId: (id: number | null) => void;
  refreshDatasets: () => Promise<DatasetItem[]>;
  uploadDataset: (file: File) => Promise<DatasetItem>;
  processDataset: (datasetId: number, mappings?: Record<string, string>) => Promise<any>;
  deleteDataset: (datasetId: number) => Promise<void>;
  createVersion: (datasetId: number, file: File) => Promise<DatasetItem>;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [activeDatasetId, setActiveDatasetIdState] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('anvaya_active_dataset_id');
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshDatasets = useCallback(async (): Promise<DatasetItem[]> => {
    try {
      setLoading(true);
      const res = await request<any>('/datasets');
      const items: DatasetItem[] = res?.data?.items || [];
      setDatasets(items);

      if (items.length > 0) {
        // If current activeDatasetId is not in the list, set to the first one
        if (!activeDatasetId || !items.some((d) => d.id === activeDatasetId)) {
          const firstId = items[0].id;
          setActiveDatasetIdState(firstId);
          localStorage.setItem('anvaya_active_dataset_id', String(firstId));
        }
      } else {
        setActiveDatasetIdState(null);
        localStorage.removeItem('anvaya_active_dataset_id');
      }
      return items;
    } catch (e) {
      console.error('Failed to load datasets:', e);
      return [];
    } finally {
      setLoading(false);
    }
  }, [activeDatasetId]);

  useEffect(() => {
    refreshDatasets();
  }, []);

  const setActiveDatasetId = (id: number | null) => {
    setActiveDatasetIdState(id);
    if (id !== null) {
      localStorage.setItem('anvaya_active_dataset_id', String(id));
    } else {
      localStorage.removeItem('anvaya_active_dataset_id');
    }
  };

  const uploadDataset = async (file: File): Promise<DatasetItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:8000/api/v1/datasets/upload', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.detail || 'Failed to upload dataset');
    }

    const created: DatasetItem = json.data;
    await refreshDatasets();
    setActiveDatasetId(created.id);
    return created;
  };

  const processDataset = async (datasetId: number, mappings?: Record<string, string>) => {
    const res = await request<any>(`/datasets/${datasetId}/process`, {
      method: 'POST',
      body: mappings ? { column_mappings: mappings } : {},
    });
    await refreshDatasets();
    return res?.data;
  };

  const deleteDataset = async (datasetId: number) => {
    await request(`/datasets/${datasetId}`, {
      method: 'DELETE',
    });
    await refreshDatasets();
  };

  const createVersion = async (datasetId: number, file: File): Promise<DatasetItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`http://localhost:8000/api/v1/datasets/${datasetId}/version`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.detail || 'Failed to upload version');
    }

    const created: DatasetItem = json.data;
    await refreshDatasets();
    setActiveDatasetId(created.id);
    return created;
  };

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || null;

  return (
    <DatasetContext.Provider
      value={{
        datasets,
        activeDataset,
        activeDatasetId,
        loading,
        setActiveDatasetId,
        refreshDatasets,
        uploadDataset,
        processDataset,
        deleteDataset,
        createVersion,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}

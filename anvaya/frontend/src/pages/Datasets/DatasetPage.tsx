import { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Trash2,
  GitBranch,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useDataset, DatasetItem } from '@/context/DatasetContext';
import { ColumnMappingModal } from './ColumnMappingModal';

export interface DatasetPageProps {
  onStartEnrichment?: () => void;
  onNavigate?: (sectionId: string) => void;
}

export function DatasetPage({ onStartEnrichment, onNavigate: _ }: DatasetPageProps) {
  const {
    datasets,
    activeDatasetId,
    setActiveDatasetId,
    refreshDatasets,
    uploadDataset,
    processDataset,
    deleteDataset,
    createVersion,
    loading,
  } = useDataset();

  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mappingModalDataset, setMappingModalDataset] = useState<DatasetItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [versionModalDataset, setVersionModalDataset] = useState<DatasetItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const versionFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setErrorMessage(null);
      const created = await uploadDataset(file);
      setSuccessMessage(`Dataset '${created.name}' uploaded! Profiling complete.`);
      setMappingModalDataset(created);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload dataset');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVersionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !versionModalDataset) return;

    try {
      setUploading(true);
      setErrorMessage(null);
      const created = await createVersion(versionModalDataset.id, file);
      setSuccessMessage(`New version '${created.version}' uploaded!`);
      setVersionModalDataset(null);
      setMappingModalDataset(created);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create new version');
    } finally {
      setUploading(false);
      if (versionFileInputRef.current) versionFileInputRef.current.value = '';
    }
  };

  const handleConfirmMappingAndProcess = async (mappings: Record<string, string>) => {
    if (!mappingModalDataset) return;
    try {
      await processDataset(mappingModalDataset.id, mappings);
      setSuccessMessage(`Dataset '${mappingModalDataset.name}' processed successfully through 8-stage pipeline!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      if (onStartEnrichment) onStartEnrichment();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process dataset');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDataset(id);
      setDeleteConfirmId(null);
      setSuccessMessage('Dataset and all associated records deleted.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete dataset');
    }
  };

  const filteredDatasets = datasets.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.xlsx,.xls,.json,.tsv"
        className="hidden"
      />
      <input
        type="file"
        ref={versionFileInputRef}
        onChange={handleVersionUpload}
        accept=".csv,.xlsx,.xls,.json,.tsv"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-2.5 py-0.5 rounded-full border border-[rgba(199,127,46,0.2)]">
              Data Ingestion &amp; Profiling
            </span>
            <span className="text-xs text-[#8A7E76] font-mono">{datasets.length} Uploaded Datasets</span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Dataset Management &amp; Versioning</h1>
          <p className="text-xs text-[#6B5E56]">
            Upload your product spreadsheets (CSV, XLSX, JSON, TSV). ANVAYA dynamically detects column roles, profiles null rates, and isolates data per catalogue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshDatasets()}
            className="border-[rgba(120,90,70,0.2)] bg-white/80 text-xs font-semibold text-[#2B2320] rounded-xl hover:bg-white"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-[#8A7E76]" />
            Refresh
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-sunrise-primary gap-1.5 text-xs font-bold rounded-xl px-4 py-2 shadow-md"
          >
            <UploadCloud className="h-4 w-4" />
            <span>{uploading ? 'Profiling File...' : 'Upload Dataset'}</span>
          </Button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="rounded-xl border border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] p-3.5 text-xs font-semibold text-[#C77F2E] flex items-center gap-2 animate-in fade-in-0">
          <CheckCircle2 className="h-4 w-4 text-[#C77F2E] flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-[rgba(178,59,46,0.3)] bg-[#FBE3DE] p-3.5 text-xs font-semibold text-[#B23B2E] flex items-center gap-2 animate-in fade-in-0">
          <AlertTriangle className="h-4 w-4 text-[#B23B2E] flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Hero Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="glass-panel p-8 text-center rounded-3xl border-2 border-dashed border-[rgba(120,90,70,0.2)] hover:border-[#E8703A]/60 cursor-pointer transition-all hover:bg-white/50 space-y-3"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD9A0] to-[#E8703A] text-white flex items-center justify-center mx-auto shadow-md">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-base font-black text-[#2B2320]">
          Drag &amp; Drop Your Product Dataset Here
        </h3>
        <p className="text-xs text-[#6B5E56] max-w-md mx-auto leading-relaxed">
          Supports <strong>CSV, XLSX, JSON, and TSV</strong> with arbitrary schemas. ANVAYA never requires pre-formatted headers.
        </p>
        <div className="pt-2 flex items-center justify-center gap-2">
          <span className="rounded-md bg-[#FAF5EF] px-2.5 py-1 text-[10px] font-mono font-bold text-[#8A7E76] border border-[rgba(120,90,70,0.1)]">
            .CSV
          </span>
          <span className="rounded-md bg-[#FAF5EF] px-2.5 py-1 text-[10px] font-mono font-bold text-[#8A7E76] border border-[rgba(120,90,70,0.1)]">
            .XLSX
          </span>
          <span className="rounded-md bg-[#FAF5EF] px-2.5 py-1 text-[10px] font-mono font-bold text-[#8A7E76] border border-[rgba(120,90,70,0.1)]">
            .JSON
          </span>
          <span className="rounded-md bg-[#FAF5EF] px-2.5 py-1 text-[10px] font-mono font-bold text-[#8A7E76] border border-[rgba(120,90,70,0.1)]">
            .TSV
          </span>
        </div>
      </div>

      {/* Dataset List / Management */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(120,90,70,0.12)]">
        <div className="border-b border-[rgba(120,90,70,0.1)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Uploaded Catalogues &amp; Versions</h3>
            <p className="text-xs text-[#6B5E56]">Select an active dataset to scope all dashboard, products, validation, and AI chatbot queries.</p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9C8F86]" />
            <input
              type="text"
              placeholder="Search uploaded datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#6B5E56]">
            <span className="h-5 w-5 rounded-full border-2 border-[#E8703A] border-t-transparent animate-spin inline-block mr-2 align-middle" />
            Loading datasets...
          </div>
        ) : datasets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl space-y-3">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-[#9C8F86] opacity-60" />
            <h4 className="text-base font-bold text-[#2B2320]">No Datasets Uploaded Yet</h4>
            <p className="text-xs text-[#6B5E56] max-w-sm mx-auto">
              Your workspace is ready. Click <strong>Upload Dataset</strong> above to ingest your first supplier catalog.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(120,90,70,0.08)]">
            {filteredDatasets.map((d) => {
              const isActive = d.id === activeDatasetId;
              const isProcessed = d.status === 'PROCESSED';

              return (
                <div
                  key={d.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isActive ? 'bg-[#FBEEDD]/40' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-[#2B2320]">{d.name}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FAF5EF] text-[#E8703A] border border-[rgba(120,90,70,0.1)]">
                        {d.version}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBEEDD] text-[#C77F2E] border border-[rgba(199,127,46,0.25)]">
                          Active Dataset
                        </span>
                      )}
                      <StatusBadge status={isProcessed ? 'verified' : 'inferred'} showIcon={false} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B5E56]">
                      <span className="font-mono text-[#8A7E76]">{d.file_name}</span>
                      <span>•</span>
                      <span><strong>{d.row_count.toLocaleString()}</strong> Rows</span>
                      <span>•</span>
                      <span><strong>{d.column_count}</strong> Columns</span>
                      <span>•</span>
                      <span>Uploaded by {d.uploaded_by}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveDatasetId(d.id)}
                        className="text-xs font-bold border-[rgba(120,90,70,0.2)] bg-white rounded-xl h-8"
                      >
                        Set Active
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMappingModalDataset(d)}
                      className="text-xs font-semibold border-[rgba(120,90,70,0.2)] bg-white rounded-xl h-8 gap-1 text-[#2B2320]"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#E8703A]" />
                      <span>{isProcessed ? 'Edit Schema' : 'Map & Process'}</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVersionModalDataset(d);
                        versionFileInputRef.current?.click();
                      }}
                      className="text-xs font-semibold border-[rgba(120,90,70,0.2)] bg-white rounded-xl h-8 gap-1 text-[#2B2320]"
                      title="Upload newer version of this catalog"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-[#8A7E76]" />
                      <span>New Version</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(d.id)}
                      className="text-xs text-[#B23B2E] hover:bg-[#FBE3DE] rounded-xl h-8 px-2"
                      title="Delete dataset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-0">
          <div className="rounded-3xl glass-surface-floating border border-[rgba(178,59,46,0.3)] p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <h3 className="text-base font-bold text-[#B23B2E]">Delete Dataset &amp; All Records?</h3>
            <p className="text-xs text-[#6B5E56] leading-relaxed">
              This action will permanently delete dataset #{deleteConfirmId} and all associated products, extracted attributes, validation issues, review items, and audit logs.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
                className="text-xs font-semibold text-[#8A7E76]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(deleteConfirmId)}
                className="bg-[#B23B2E] hover:bg-[#963024] text-white text-xs font-bold rounded-xl"
              >
                Delete Dataset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Column Mapping Modal */}
      {mappingModalDataset && (
        <ColumnMappingModal
          isOpen={!!mappingModalDataset}
          onClose={() => setMappingModalDataset(null)}
          dataset={mappingModalDataset}
          onConfirmMapping={handleConfirmMappingAndProcess}
          onDeleteDataset={handleDelete}
        />
      )}
    </div>
  );
}

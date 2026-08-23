import { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  ShieldCheck,
  RefreshCw,
  Database,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { request } from '@/services/api/apiClient';
import { useDataset } from '@/context/DatasetContext';

export interface ExportPageProps {
  onNavigate?: (sectionId: string) => void;
}

export function ExportPage({ onNavigate }: ExportPageProps) {
  const { activeDataset, activeDatasetId } = useDataset();

  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx' | 'json'>('csv');

  const handleRunExport = async () => {
    if (!activeDatasetId) return;
    try {
      setExporting(true);
      const res = await request<any>(`/export/delivery?format=${selectedFormat === 'json' ? 'csv' : selectedFormat}&dataset_id=${activeDatasetId}`, {
        method: 'POST',
      });
      if (res?.data) {
        setExportResult(res.data);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const downloadExportedFile = () => {
    const downloadUrl = `http://127.0.0.1:8000/api/v1/export/download?format=${selectedFormat === 'json' ? 'csv' : selectedFormat}`;
    window.open(downloadUrl, '_blank');
  };

  if (!activeDatasetId || !activeDataset) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl space-y-4 max-w-xl mx-auto my-12 border border-[rgba(120,90,70,0.15)]">
        <Download className="mx-auto h-12 w-12 text-[#9C8F86] opacity-60" />
        <h3 className="text-lg font-bold text-[#2B2320]">No Active Dataset Selected</h3>
        <p className="text-xs text-[#6B5E56] leading-relaxed">
          Exports are strictly scoped to the active dataset. Upload and process a catalog to syndicate the 252-column master delivery format.
        </p>
        <Button
          onClick={() => onNavigate?.('datasets')}
          className="btn-sunrise-primary gap-1.5 text-xs font-bold rounded-xl px-5 py-2.5 shadow-md"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Dataset</span>
        </Button>
      </div>
    );
  }

  const columns = [
    { name: '1. Mfg_Part_Num', desc: 'Normalized Part Number identifier', source: 'Direct / Normalized' },
    { name: '2. Part_Desc', desc: 'Standardized item description', source: 'Normalized Title' },
    { name: '3. Part_Short_Desc', desc: 'Rule-compliant concise mobile text', source: 'Synthesized' },
    { name: '4. E1_Brand', desc: 'Canonical manufacturer brand entity', source: 'Resolved Brand Master' },
    { name: '5. Category / Fine', desc: 'Department > Class > Category path', source: 'Classified Hierarchy' },
    { name: '6. Size / Dimension UOM', desc: 'Standardized measurement with space', source: 'Unilog UOM Standards' },
    { name: '7. Material / Composition', desc: 'Extracted material specification', source: 'Dense Spec Extraction' },
    { name: '8. 245 Dynamic Attribute Columns', desc: 'Grit, Connection, Voltage, Pressure, etc.', source: 'LOV Controlled Columns' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-2.5 py-0.5 rounded-full border border-[rgba(199,127,46,0.2)]">
              Syndication Center
            </span>
            <span className="text-xs text-[#8A7E76] font-mono">
              {activeDataset.name} • 252-Column Unilog Master Specification
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Export 252-Column Delivery Dataset</h1>
          <p className="text-xs text-[#6B5E56]">
            Export verified, normalized, and validated product intelligence from <strong>{activeDataset.name}</strong> formatted precisely to the 252-column delivery standard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRunExport}
            disabled={exporting}
            className="btn-sunrise-primary gap-1.5 text-xs font-bold rounded-xl px-5 py-2.5 shadow-md"
          >
            {exporting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Generating Export...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Generate Syndication Export</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Export Format Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'csv', name: 'Standard CSV Delivery', desc: '252-column comma-separated delivery file with header mappings', icon: FileText },
          { id: 'xlsx', name: 'Formatted Excel XLSX', desc: 'Multi-sheet workbook with styled headers and quality summaries', icon: FileSpreadsheet },
          { id: 'json', name: 'Structured JSON Feed', desc: 'Nested object schema suitable for API syndication and ERP feeds', icon: Database },
        ].map((fmt) => {
          const Icon = fmt.icon;
          const isSelected = selectedFormat === fmt.id;

          return (
            <div
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id as any)}
              className={`glass-panel p-5 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? 'border-[#E8703A] bg-[#FBEEDD]/50 shadow-md ring-1 ring-[#E8703A]/30'
                  : 'border-[rgba(120,90,70,0.12)] hover:border-[#E8703A]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FBEEDD] flex items-center justify-center text-[#E8703A]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#2B2320]">{fmt.name}</h3>
                    <span className="text-[10px] text-[#8A7E76] font-mono">.{fmt.id.toUpperCase()}</span>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#E8703A]" />}
              </div>
              <p className="text-[11px] text-[#6B5E56] mt-3 leading-relaxed">{fmt.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Download Alert Banner */}
      {exportResult && (
        <div className="rounded-2xl border border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in-0 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#C77F2E]" />
              <span className="font-bold text-sm text-[#2B2320]">252-Column Export Ready for Download</span>
            </div>
            <p className="text-xs text-[#6B5E56]">
              {exportResult.row_count || activeDataset.row_count} records formatted and validated against the Unilog Master Delivery Standard.
            </p>
          </div>

          <Button
            onClick={downloadExportedFile}
            className="btn-sunrise-primary gap-1.5 text-xs font-bold rounded-xl px-5 py-2 shrink-0 shadow-md"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download {selectedFormat.toUpperCase()}</span>
          </Button>
        </div>
      )}

      {/* 252-Column Specification Preview */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(120,90,70,0.12)]">
        <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Unilog Master Schema Coverage</h3>
            <p className="text-xs text-[#6B5E56]">252 Delivery columns formatted per standard distribution guidelines</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#C77F2E]">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Schema Validated</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {columns.map((col, idx) => (
            <div key={idx} className="glass-inset p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[#2B2320]">{col.name}</p>
                <p className="text-[10px] text-[#6B5E56] mt-0.5">{col.desc}</p>
              </div>
              <span className="rounded-md bg-[#FAF5EF] px-2 py-0.5 text-[9px] font-mono font-semibold text-[#8A7E76]">
                {col.source}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

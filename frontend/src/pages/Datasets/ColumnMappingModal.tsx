import { useState } from 'react';
import {
  X,
  Play,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatasetItem } from '@/context/DatasetContext';

export interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: DatasetItem;
  onConfirmMapping: (mappings: Record<string, string>) => Promise<void>;
  onDeleteDataset?: (id: number) => Promise<void>;
}

export function ColumnMappingModal({
  isOpen,
  onClose,
  dataset,
  onConfirmMapping,
  onDeleteDataset,
}: ColumnMappingModalProps) {
  const profiling = dataset.profiling;
  const initialMappings = dataset.column_mapping || profiling?.inferred_mappings || {};

  const [mappings, setMappings] = useState<Record<string, string>>(initialMappings);
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !profiling) return null;

  const roleOptions = [
    { value: 'mpn', label: 'Product Identifier / MPN', color: 'text-[#E8703A] bg-[#FBEEDD]' },
    { value: 'description', label: 'Product Description / Title', color: 'text-[#2B2320] bg-white' },
    { value: 'brand', label: 'Brand Name', color: 'text-[#C77F2E] bg-[#FBEEDD]' },
    { value: 'manufacturer', label: 'Manufacturer Name', color: 'text-[#8E7FC7] bg-[#F5F2FA]' },
    { value: 'category', label: 'Taxonomy / Category', color: 'text-[#B8863B] bg-[#FBEEDD]' },
    { value: 'attribute', label: 'Technical Attribute', color: 'text-[#6B5E56] bg-white' },
    { value: 'price', label: 'Price / Cost', color: 'text-[#6B5E56] bg-white' },
    { value: 'ignore', label: 'Ignore / Skip Column', color: 'text-[#8A7E76] bg-[#F1ECE7]' },
  ];

  const handleRoleChange = (columnName: string, role: string) => {
    setMappings((prev) => ({
      ...prev,
      [columnName]: role,
    }));
  };

  const handleStartProcessing = async () => {
    try {
      setProcessing(true);
      await onConfirmMapping(mappings);
      onClose();
    } catch (e) {
      console.error('Processing failed:', e);
    } finally {
      setProcessing(false);
    }
  };

  const handleDiscard = async () => {
    if (!onDeleteDataset) {
      onClose();
      return;
    }
    if (window.confirm(`Discard and delete newly uploaded dataset '${dataset.name}'?`)) {
      try {
        setDeleting(true);
        await onDeleteDataset(dataset.id);
        onClose();
      } catch (e) {
        console.error('Discard failed:', e);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl glass-surface-floating border border-[rgba(120,90,70,0.2)] p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[rgba(120,90,70,0.1)] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-2.5 py-0.5 rounded-full border border-[rgba(199,127,46,0.2)]">
                Dynamic Schema Profiling
              </span>
              <span className="text-xs font-mono text-[#8A7E76]">{profiling.total_rows.toLocaleString()} Rows • {profiling.total_columns} Columns</span>
            </div>
            <h2 className="text-xl font-black text-[#2B2320] mt-1">Review Column Semantic Mappings</h2>
            <p className="text-xs text-[#6B5E56]">
              ANVAYA dynamically detected the roles for dataset <strong>{dataset.name}</strong>. Verify or adjust the assignments before running the 8-stage intelligence pipeline.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#8A7E76] hover:text-[#2B2320] p-1.5 rounded-xl hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Column Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          <div className="rounded-2xl border border-[rgba(120,90,70,0.12)] overflow-hidden bg-white/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(120,90,70,0.1)] bg-[rgba(241,236,231,0.6)] text-[#6B5E56] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Detected Column</th>
                  <th className="py-3 px-4">Assigned Semantic Role</th>
                  <th className="py-3 px-4">Sample Values from File</th>
                  <th className="py-3 px-4">Fill Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(120,90,70,0.06)]">
                {profiling.columns.map((col) => {
                  const currentRole = mappings[col.name] || col.role || 'attribute';
                  const fillPct = (100 - col.null_rate_percent).toFixed(1);

                  return (
                    <tr key={col.name} className="hover:bg-white/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#2B2320]">{col.name}</span>
                        <span className="block text-[10px] text-[#8A7E76] mt-0.5">Type: {col.data_type}</span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(col.name, e.target.value)}
                          className="rounded-xl border border-[rgba(120,90,70,0.2)] bg-white px-3 py-1.5 text-xs font-bold text-[#2B2320] outline-none focus:ring-2 focus:ring-[#E8703A]/20 cursor-pointer shadow-2xs"
                        >
                          {roleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {col.sample_values.length === 0 ? (
                            <span className="text-[10px] text-[#8A7E76] italic">No values</span>
                          ) : (
                            col.sample_values.map((v, i) => (
                              <span
                                key={i}
                                className="rounded bg-[#FAF5EF] border border-[rgba(120,90,70,0.1)] px-1.5 py-0.5 text-[10px] text-[#2B2320] font-mono truncate max-w-[160px]"
                                title={v}
                              >
                                {v}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-[rgba(120,90,70,0.1)] overflow-hidden">
                            <div
                              className="h-full bg-[#C77F2E] rounded-full"
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px] text-[#2B2320]">{fillPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-[#FBEEDD] border border-[rgba(199,127,46,0.3)] text-xs text-[#C77F2E] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span><strong>Deterministic Guarantee:</strong> Ingested column roles dictate how text sanitization, canonical brand dictionary matching, and UOM standards are executed.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(120,90,70,0.1)] mt-4">
          <div className="flex items-center gap-2">
            {onDeleteDataset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscard}
                disabled={deleting}
                className="text-xs text-[#B23B2E] hover:bg-[#FBE3DE] font-semibold gap-1 rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Discarding...' : 'Discard & Delete'}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-[#8A7E76] hover:text-[#2B2320] font-semibold"
            >
              Cancel
            </Button>
          </div>

          <Button
            onClick={handleStartProcessing}
            disabled={processing}
            className="btn-sunrise-primary gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl shadow-md"
          >
            {processing ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin mr-1" />
                <span>Processing 8-Stage Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Confirm Mapping &amp; Start Processing</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

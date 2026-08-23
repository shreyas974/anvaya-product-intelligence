import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Check,
  X,
  Filter,
  Eye,
  Inbox,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { request } from '@/services/api/apiClient';
import { useDataset } from '@/context/DatasetContext';

export interface ReviewQueuePageProps {
  onSelectProduct?: (productId: string) => void;
  onCountChange?: (count: number) => void;
  onNavigate?: (section: string) => void;
}

export function ReviewQueuePage({ onSelectProduct, onCountChange, onNavigate }: ReviewQueuePageProps) {
  const { activeDataset, activeDatasetId } = useDataset();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [issueFilter, setIssueFilter] = useState('ALL');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function fetchReviews() {
    if (!activeDatasetId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await request<any>(`/reviews?status_filter=${statusFilter}&dataset_id=${activeDatasetId}`);
      if (res?.data) {
        setReviews(res.data.items || []);
        if (statusFilter === 'PENDING' && onCountChange) {
          onCountChange(res.data.total_pending ?? res.data.items.length);
        }
      }
    } catch (e) {
      console.error('Failed to fetch review queue:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [activeDatasetId, statusFilter]);

  const handleApprove = async (id: number) => {
    try {
      await request(`/reviews/${id}/approve`, {
        method: 'POST',
        body: { action: 'approve', reviewer_notes: 'Verified by human reviewer' },
      });
      setActionSuccess(`Review #${id} approved! Product status updated to PASS.`);
      setReviews((prev) => {
        const next = prev.filter((r) => r.id !== id);
        if (onCountChange) onCountChange(next.length);
        return next;
      });
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e) {
      console.error('Approve failed:', e);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await request(`/reviews/${id}/reject`, {
        method: 'POST',
        body: { action: 'reject', reviewer_notes: 'Rejected prediction' },
      });
      setActionSuccess(`Review #${id} rejected.`);
      setReviews((prev) => {
        const next = prev.filter((r) => r.id !== id);
        if (onCountChange) onCountChange(next.length);
        return next;
      });
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e) {
      console.error('Reject failed:', e);
    }
  };

  const handleEditSubmit = async (id: number, fieldName: string) => {
    if (!editValue.trim()) return;
    try {
      await request(`/reviews/${id}/edit`, {
        method: 'POST',
        body: {
          action: 'edit',
          field_name: fieldName,
          new_value: editValue.trim(),
          reviewer_notes: 'Manually updated by catalog reviewer',
        },
      });
      setActionSuccess(`Review #${id} updated with value '${editValue.trim()}'.`);
      setEditingId(null);
      setEditValue('');
      setReviews((prev) => {
        const next = prev.filter((r) => r.id !== id);
        if (onCountChange) onCountChange(next.length);
        return next;
      });
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e) {
      console.error('Edit failed:', e);
    }
  };

  const filteredReviews = issueFilter === 'ALL'
    ? reviews
    : reviews.filter((r) => (r.reason || '').toLowerCase().includes(issueFilter.toLowerCase()));

  if (!activeDatasetId) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl space-y-4 max-w-xl mx-auto my-12 border border-[rgba(120,90,70,0.15)]">
        <Inbox className="mx-auto h-12 w-12 text-[#9C8F86] opacity-60" />
        <h3 className="text-lg font-bold text-[#2B2320]">No Active Dataset Selected</h3>
        <p className="text-xs text-[#6B5E56] leading-relaxed">
          Human review queues are isolated per dataset. Upload or select a dataset to inspect escalated items.
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C2571F] bg-[#FDEADE] px-2.5 py-0.5 rounded-full border border-[rgba(194,87,31,0.25)]">
              Human-in-the-Loop Review
            </span>
            <span className="text-xs text-[#8A7E76] font-mono">
              {activeDataset?.name} • {reviews.length} Items Pending
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Review Queue &amp; Resolution Center</h1>
          <p className="text-xs text-[#6B5E56]">
            "Automate what can be trusted. Escalate what cannot." Review low-confidence predictions and anomalies for dataset <strong>{activeDataset?.name}</strong>.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[rgba(120,90,70,0.15)] bg-[rgba(241,236,231,0.6)] p-1 text-xs font-semibold">
          {['PENDING', 'APPROVED', 'REJECTED', 'EDITED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                statusFilter === st
                  ? 'bg-[#FFFBF7] text-[#E8703A] shadow-sm font-bold'
                  : 'text-[#6B5E56] hover:text-[#2B2320]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="rounded-xl border border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] p-3 text-xs font-semibold text-[#C77F2E] flex items-center gap-2 animate-in fade-in-0">
          <CheckCircle2 className="h-4 w-4 text-[#C77F2E] flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Secondary Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-3.5 rounded-xl border border-[rgba(120,90,70,0.12)]">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#E8703A]" />
          <span className="text-xs font-bold text-[#2B2320]">Issue Category:</span>
          <div className="flex flex-wrap gap-1">
            {['ALL', 'Brand', 'Confidence', 'Category', 'LOV'].map((cat) => (
              <button
                key={cat}
                onClick={() => setIssueFilter(cat)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  issueFilter === cat
                    ? 'bg-[#FBEEDD] text-[#C77F2E] font-bold border border-[rgba(199,127,46,0.3)]'
                    : 'text-[#6B5E56] hover:bg-white/60'
                }`}
              >
                {cat === 'ALL' ? 'All Issues' : cat}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-mono text-[#8A7E76]">
          Showing {filteredReviews.length} records
        </span>
      </div>

      {/* Review Card List */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-panel p-12 text-center text-[#6B5E56] text-xs">
            <span className="h-5 w-5 rounded-full border-2 border-[#E8703A] border-t-transparent animate-spin inline-block mr-2 align-middle" />
            Loading review queue from active dataset...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl">
            <CheckCircle2 className="mx-auto h-10 w-10 text-[#C77F2E]" />
            <h3 className="mt-3 text-base font-bold text-[#2B2320]">Review Queue Clear</h3>
            <p className="mt-1 text-xs text-[#6B5E56]">
              {statusFilter === 'PENDING'
                ? `All predictions in ${activeDataset?.name || 'this dataset'} meet confidence criteria!`
                : `No items found with status '${statusFilter}'.`}
            </p>
          </div>
        ) : (
          filteredReviews.map((item) => (
            <div key={item.id} className="glass-panel p-5 rounded-2xl space-y-3.5 border border-[rgba(120,90,70,0.12)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#E8703A]">{item.sku}</span>
                    <span className="rounded-full bg-[#FDEADE] border border-[rgba(194,87,31,0.25)] px-2 py-0.5 text-[10px] font-bold text-[#C2571F]">
                      {item.reason}
                    </span>
                    <span className="text-[10px] text-[#8A7E76]">Review ID #{item.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#2B2320]">{item.cleaned_name}</h4>
                  <p className="text-xs text-[#6B5E56]">
                    <span className="font-semibold text-[#2B2320]">Raw Source:</span> "{item.raw_description}"
                  </p>
                </div>

                {/* Inline Actions */}
                {statusFilter === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Enter corrected value..."
                          className="rounded-lg border border-[#E8703A] bg-white px-2.5 py-1 text-xs outline-none"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleEditSubmit(item.id, item.field_name || 'Brand')}
                          className="btn-sunrise-primary h-7 px-2.5 text-xs font-bold"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                          className="h-7 px-2 text-xs text-[#6B5E56]"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditValue(item.suggested_value || item.current_value || '');
                          }}
                          className="h-8 gap-1 border-[rgba(120,90,70,0.2)] bg-white/80 text-xs font-semibold text-[#2B2320] hover:bg-white rounded-xl"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-[#E8703A]" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(item.id)}
                          className="h-8 gap-1 border-[rgba(178,59,46,0.25)] bg-[#FBE3DE]/50 text-xs font-semibold text-[#B23B2E] hover:bg-[#FBE3DE] rounded-xl"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleApprove(item.id)}
                          className="btn-sunrise-primary h-8 gap-1 text-xs font-bold rounded-xl px-3"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </Button>

                        {onSelectProduct && item.product_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectProduct(String(item.product_id))}
                            className="h-8 text-xs font-semibold text-[#6B5E56] hover:text-[#2B2320]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Original vs Suggested Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[rgba(120,90,70,0.08)] text-xs">
                <div className="glass-inset p-3 rounded-xl border border-[rgba(120,90,70,0.1)]">
                  <span className="text-[10px] font-bold uppercase text-[#8A7E76] block mb-1">
                    Original Value ({item.field_name || 'Field'})
                  </span>
                  <p className="font-mono font-semibold text-[#2B2320]">{item.current_value || 'None / Empty'}</p>
                </div>
                <div className="glass-inset p-3 rounded-xl border border-[rgba(232,112,58,0.25)] bg-[rgba(255,247,237,0.7)]">
                  <span className="text-[10px] font-bold uppercase text-[#E8703A] block mb-1">
                    Suggested Canonical Value
                  </span>
                  <p className="font-mono font-bold text-[#E8703A]">{item.suggested_value || 'Manual Review Required'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { request } from '@/services/api/apiClient';
import { useDataset } from '@/context/DatasetContext';

export interface ProductsPageProps {
  onSelectProduct?: (productId: string) => void;
  onProductSelect?: (productId: string) => void;
  onNavigate?: (section: string) => void;
}

export function ProductsPage({ onSelectProduct, onProductSelect, onNavigate }: ProductsPageProps) {
  const handleSelect = onSelectProduct || onProductSelect || (() => {});
  const { activeDataset, activeDatasetId } = useDataset();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [minCompleteness, setMinCompleteness] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  async function fetchProducts() {
    if (!activeDatasetId) {
      setItems([]);
      setTotalItems(0);
      setTotalPages(1);
      return;
    }

    try {
      setLoading(true);
      const params: Record<string, any> = {
        dataset_id: activeDatasetId,
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedBrand !== 'ALL') params.brand = selectedBrand;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedStatus !== 'ALL') params.validation_status = selectedStatus;
      if (minCompleteness !== undefined) params.min_completeness = minCompleteness;

      const res = await request<any>('/products', { params });
      if (res?.data) {
        setItems(res.data.items || []);
        setTotalItems(res.data.pagination.total_items || 0);
        setTotalPages(res.data.pagination.total_pages || 1);
      }
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [activeDatasetId, page, pageSize, selectedBrand, selectedCategory, selectedStatus, minCompleteness, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Extract unique brands and categories dynamically from loaded items
  const uniqueBrands = ['ALL', ...Array.from(new Set(items.map((i) => i.canonical_brand).filter(Boolean)))];
  const uniqueCategories = ['ALL', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];

  if (!activeDatasetId) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl space-y-4 max-w-xl mx-auto my-12 border border-[rgba(120,90,70,0.15)]">
        <Package className="mx-auto h-12 w-12 text-[#9C8F86] opacity-60" />
        <h3 className="text-lg font-bold text-[#2B2320]">No Active Dataset Selected</h3>
        <p className="text-xs text-[#6B5E56] leading-relaxed">
          Product records are strictly scoped to the active dataset. Upload a dataset to inspect and query products.
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-2.5 py-0.5 rounded-full border border-[rgba(199,127,46,0.2)]">
              Product Explorer
            </span>
            <span className="text-xs text-[#8A7E76] font-mono">
              {activeDataset ? activeDataset.name : 'Active Catalog'} • {totalItems.toLocaleString()} Products
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Grounded Product Catalog</h1>
          <p className="text-xs text-[#6B5E56]">
            Filter, search, and inspect records from active dataset <strong>{activeDataset?.name}</strong> with full evidence traces and validation statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setSelectedBrand('ALL');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
              setMinCompleteness(undefined);
              setPage(1);
            }}
            className="text-xs font-semibold border-[rgba(120,90,70,0.2)] bg-white/80 text-[#2B2320] hover:bg-white rounded-xl"
          >
            Reset All Filters
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl space-y-4 border border-[rgba(120,90,70,0.12)]">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9C8F86]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by part number, title, description, brand, or extracted specifications..."
              className="w-full rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/90 py-2.5 pl-10 pr-4 text-xs text-[#2B2320] placeholder:text-[#9C8F86] outline-none focus:ring-2 focus:ring-[#E8703A]/20 transition-all"
            />
          </div>
          <Button type="submit" size="sm" className="btn-sunrise-primary px-5 text-xs font-bold rounded-xl">
            Search
          </Button>
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-3 py-1.5">
            <span className="text-[11px] font-semibold text-[#8A7E76]">Brand:</span>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-bold text-[#2B2320] outline-none cursor-pointer text-xs max-w-xs truncate"
            >
              {uniqueBrands.map((b: any) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-3 py-1.5">
            <span className="text-[11px] font-semibold text-[#8A7E76]">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-bold text-[#2B2320] outline-none cursor-pointer text-xs max-w-xs truncate"
            >
              {uniqueCategories.map((c: any) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Validation Status Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-3 py-1.5">
            <span className="text-[11px] font-semibold text-[#8A7E76]">Validation:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-bold text-[#2B2320] outline-none cursor-pointer text-xs"
            >
              <option value="ALL">ALL Statuses</option>
              <option value="PASS">Pass (Verified)</option>
              <option value="REVIEW_REQUIRED">Needs Review</option>
              <option value="WARNING">Warning</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-[#8A7E76]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-[#2B2320] outline-none"
            >
              <option value="id">Product ID</option>
              <option value="mfg_part_num">SKU Part #</option>
              <option value="completeness_score">Completeness</option>
              <option value="confidence_score">Confidence</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 p-2 text-[#6B5E56] hover:text-[#2B2320]"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(120,90,70,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[rgba(120,90,70,0.1)] bg-[rgba(241,236,231,0.5)] text-[#6B5E56] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">SKU / MPN</th>
                <th className="py-3 px-4">Cleaned Title</th>
                <th className="py-3 px-4">Resolved Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Completeness</th>
                <th className="py-3 px-4">Validation</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(120,90,70,0.06)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8A7E76]">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-[#E8703A] border-t-transparent animate-spin" />
                      <span>Loading products from active dataset...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8A7E76]">
                    <Package className="mx-auto h-8 w-8 text-[#9C8F86] opacity-50" />
                    <p className="mt-2 text-sm font-bold text-[#2B2320]">No products match these filters</p>
                    <p className="text-xs text-[#8A7E76]">Try adjusting search or processing this dataset.</p>
                  </td>
                </tr>
              ) : (
                items.map((prod) => (
                  <tr
                    key={prod.id}
                    onClick={() => handleSelect(String(prod.id))}
                    className="hover:bg-white/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#2B2320]">
                      <span className="text-[#E8703A]">{prod.mfg_part_num}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#2B2320] max-w-[320px] truncate" title={prod.cleaned_name}>
                      {prod.cleaned_name || prod.part_desc || 'Unformatted Item'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-[#FAF5EF] border border-[rgba(120,90,70,0.12)] px-2 py-0.5 font-semibold text-[#2B2320]">
                        {prod.canonical_brand}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6B5E56] max-w-[200px] truncate">
                      {prod.category}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 rounded-full bg-[rgba(120,90,70,0.1)] overflow-hidden">
                          <div
                            className="h-full bg-[#C77F2E] rounded-full"
                            style={{ width: `${prod.completeness_score}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#2B2320] text-[11px]">{prod.completeness_score}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={
                          prod.validation_status === 'PASS'
                            ? 'verified'
                            : prod.validation_status === 'REVIEW_REQUIRED'
                            ? 'needs_review'
                            : 'inferred'
                        }
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(String(prod.id));
                        }}
                        className="h-7 gap-1 px-2.5 text-xs text-[#E8703A] hover:bg-[#FBEEDD] rounded-lg font-bold"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-[rgba(120,90,70,0.1)] px-4 py-3 bg-[rgba(241,236,231,0.4)] text-xs text-[#6B5E56]">
          <div className="flex items-center gap-2">
            <span>Showing {items.length > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, totalItems)} of {totalItems.toLocaleString()} products</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 rounded-xl border border-[rgba(120,90,70,0.15)] bg-white px-2 py-1 text-xs outline-none"
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="h-8 w-8 p-0 border-[rgba(120,90,70,0.2)] bg-white/80 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 font-bold text-[#2B2320]">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 w-8 p-0 border-[rgba(120,90,70,0.2)] bg-white/80 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
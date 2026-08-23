import { useEffect, useState } from 'react';
import {
  Search,
  LayoutDashboard,
  Package,
  Wrench,
  FileCheck,
  AlertTriangle,
  Inbox,
  Zap,
  CheckCircle2,
  Bot,
  BarChart3,
  Settings,
  Download,
  UploadCloud,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export interface CommandPaletteProps {
  onNavigate?: (sectionId: string) => void;
  onOpenCopilot?: () => void;
}

export function CommandPalette({ onNavigate, onOpenCopilot }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { id: 'overview', title: 'Mission Control', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'products', title: 'Product Catalog', icon: Package, category: 'Navigation' },
    { id: 'fittings', title: 'Fittings Lab (Flagship)', icon: Wrench, category: 'Flagship Intelligence' },
    { id: 'evaluation', title: 'Ground-Truth Benchmark', icon: FileCheck, category: 'Governance & Audits' },
    { id: 'conflicts', title: 'Conflict Resolution Center', icon: AlertTriangle, category: 'Governance & Audits' },
    { id: 'review', title: 'Human Review Queue', icon: Inbox, category: 'Governance & Audits' },
    { id: 'enrichment', title: 'Batch Enrichment Pipeline', icon: Zap, category: 'Operations' },
    { id: 'validation', title: 'Quality & LOV Validation', icon: CheckCircle2, category: 'Operations' },
    { id: 'datasets', title: 'Dataset Upload & Profiler', icon: UploadCloud, category: 'Operations' },
    { id: 'export', title: 'Export 252-Column Delivery Format', icon: Download, category: 'Operations' },
    { id: 'copilot', title: 'ANVAYA AI Copilot', icon: Bot, category: 'AI Intelligence' },
    { id: 'analytics', title: 'Platform Analytics', icon: BarChart3, category: 'System' },
    { id: 'settings', title: 'Workspace Settings', icon: Settings, category: 'System' },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    setOpen(false);
    setSearch('');
    if (id === 'copilot' && onOpenCopilot) {
      onOpenCopilot();
    } else if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-xl bg-white border border-[#EAE4DC] shadow-2xl rounded-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EAE4DC] bg-[#FAF8F5]">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or jump to page... (e.g., Fittings Lab, Export, Review)"
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-block rounded bg-white px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500 border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No matching commands or pages found for "{search}".
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => handleSelect(cmd.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-orange-50/70 hover:text-orange-950 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-orange-100 text-slate-600 group-hover:text-orange-600 transition">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-800 group-hover:text-orange-900">
                      {cmd.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-orange-600">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">↑</kbd>{' '}
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">↵</kbd> to select
            </span>
          </div>
          <span>ANVAYA Enterprise Command</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

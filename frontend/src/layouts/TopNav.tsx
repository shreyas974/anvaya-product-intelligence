import { useState } from 'react';
import {
  Search,
  Command,
  PlayCircle,
  Building,
  Check,
  ChevronDown,
  FileSpreadsheet,
  Plus,
  Trash2,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDataset } from '@/context/DatasetContext';

export interface TopNavProps {
  activeSectionTitle?: string;
  activeSection?: string;
  onOpenCommandPalette?: () => void;
  onOpenCopilot?: () => void;
  onStartTour?: () => void;
  onReplayTour?: () => void;
  onOpenMobileMenu?: () => void;
  onNavigate?: (section: string) => void;
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export function TopNav({
  activeSectionTitle,
  activeSection = 'overview',
  onOpenCommandPalette,
  onOpenCopilot: _,
  onStartTour,
  onReplayTour,
  onOpenMobileMenu: _onOpenMobileMenu,
  onNavigate,
  userRole: _userRole = 'ADMIN',
  userName = 'Devin Vance',
  userEmail = 'lead.architect@enterprise.com',
}: TopNavProps) {
  const { datasets, activeDataset, activeDatasetId, setActiveDatasetId, deleteDataset } = useDataset();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [datasetMenuOpen, setDatasetMenuOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('Default Enterprise Workspace');

  const workspaces = [
    { id: 'ws-1', name: 'Default Enterprise Workspace', desc: 'Active Workspace' },
    { id: 'ws-2', name: 'Plumbing & Fittings Sandbox', desc: 'Isolated Staging Workspace' },
    { id: 'ws-3', name: 'Unilog Delivery Staging', desc: '252-Column Syndication Workspace' },
  ];

  const sectionDisplayTitle = activeSectionTitle || activeSection.charAt(0).toUpperCase() + activeSection.slice(1);
  const tourTrigger = onStartTour || onReplayTour;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[rgba(120,90,70,0.12)] bg-[rgba(255,251,247,0.85)] px-6 backdrop-blur-md">
      {/* Left: Workspace & Dataset Dropdowns */}
      <div className="flex items-center gap-3">
        {/* 1. Workspace Dropdown (Section 56) */}
        <div className="relative">
          <button
            onClick={() => {
              setWorkspaceMenuOpen(!workspaceMenuOpen);
              setDatasetMenuOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-3 py-1.5 text-xs font-bold text-[#2B2320] hover:bg-white transition-all shadow-2xs"
          >
            <Building className="w-3.5 h-3.5 text-[#E8703A]" />
            <span className="max-w-[140px] truncate">{activeWorkspace}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A7E76]" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-[rgba(120,90,70,0.15)] bg-[#FFFBF7] p-2 shadow-xl backdrop-blur-lg z-50 animate-in fade-in-0">
              <div className="px-3 py-2 border-b border-[rgba(120,90,70,0.08)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7E76]">Workspaces (Section 56)</p>
              </div>
              <div className="py-1 space-y-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws.name);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-start justify-between transition-all ${
                      activeWorkspace === ws.name
                        ? 'bg-[#FBEEDD] text-[#2B2320] font-bold border border-[rgba(199,127,46,0.25)]'
                        : 'hover:bg-white/80 text-[#6B5E56]'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[#2B2320]">{ws.name}</p>
                      <p className="text-[10px] text-[#8A7E76]">{ws.desc}</p>
                    </div>
                    {activeWorkspace === ws.name && <Check className="w-4 h-4 text-[#C77F2E] shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Dataset Selector Dropdown (Section 112) */}
        <div className="relative">
          <button
            onClick={() => {
              setDatasetMenuOpen(!datasetMenuOpen);
              setWorkspaceMenuOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-[rgba(199,127,46,0.3)] bg-[#FBEEDD]/60 px-3 py-1.5 text-xs font-bold text-[#2B2320] hover:bg-[#FBEEDD] transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#C77F2E]" />
            <span className="max-w-[160px] truncate">
              {activeDataset ? activeDataset.name : 'No Dataset Selected'}
            </span>
            {activeDataset && (
              <span className="rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#E8703A]">
                {activeDataset.row_count.toLocaleString()} SKUs
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-[#8A7E76]" />
          </button>

          {datasetMenuOpen && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl border border-[rgba(120,90,70,0.15)] bg-[#FFFBF7] p-2 shadow-xl backdrop-blur-lg z-50 animate-in fade-in-0">
              <div className="px-3 py-2 border-b border-[rgba(120,90,70,0.08)] flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7E76]">Active Dataset (Section 112)</p>
                <button
                  onClick={() => {
                    setDatasetMenuOpen(false);
                    if (onNavigate) onNavigate('datasets');
                  }}
                  className="text-[10px] font-bold text-[#E8703A] hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Upload New
                </button>
              </div>

              <div className="py-1 max-h-60 overflow-y-auto space-y-1">
                {datasets.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#8A7E76]">
                    <p className="font-semibold text-[#2B2320]">No datasets uploaded yet</p>
                    <button
                      onClick={() => {
                        setDatasetMenuOpen(false);
                        if (onNavigate) onNavigate('datasets');
                      }}
                      className="text-xs font-bold text-[#E8703A] hover:underline mt-1.5 block mx-auto"
                    >
                      + Upload First Dataset
                    </button>
                  </div>
                ) : (
                  datasets.map((d) => (
                    <div
                      key={d.id}
                      className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        d.id === activeDatasetId
                          ? 'bg-[#FBEEDD] text-[#2B2320] font-bold border border-[rgba(199,127,46,0.25)]'
                          : 'hover:bg-white/80 text-[#6B5E56]'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setActiveDatasetId(d.id);
                          setDatasetMenuOpen(false);
                        }}
                        className="min-w-0 pr-2 text-left flex-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-[#2B2320] truncate">{d.name}</p>
                          <span className="text-[9px] font-mono font-semibold text-[#8A7E76]">{d.version}</span>
                        </div>
                        <p className="text-[10px] text-[#8A7E76] truncate">{d.row_count.toLocaleString()} rows • {d.file_name}</p>
                      </button>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {d.id === activeDatasetId && <Check className="w-4 h-4 text-[#C77F2E]" />}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete dataset '${d.name}' and all associated records?`)) {
                              await deleteDataset(d.id);
                            }
                          }}
                          className="p-1 rounded-lg text-[#8A7E76] hover:text-[#B23B2E] hover:bg-[#FBE3DE] transition-colors"
                          title="Delete dataset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <span className="text-[#8A7E76] text-xs">/</span>
        <span className="text-xs font-bold text-[#2B2320]">{sectionDisplayTitle}</span>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/70 px-4 py-1.5 text-xs text-[#8A7E76] shadow-2xs hover:border-[#E8703A]/50 hover:bg-white hover:text-[#2B2320] transition-all min-w-[280px]"
        >
          <Search className="h-3.5 w-3.5 text-[#9C8F86]" />
          <span className="flex-1 text-left">Search catalog, rules, tools...</span>
          <kbd className="flex items-center gap-0.5 rounded-md border border-[rgba(120,90,70,0.15)] bg-[#FAF5EF] px-1.5 py-0.5 text-[10px] font-mono text-[#6B5E56]">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Actions & User Pill */}
      <div className="flex items-center gap-3">
        {tourTrigger && (
          <Button
            variant="ghost"
            size="sm"
            onClick={tourTrigger}
            className="text-xs text-[#6B5E56] hover:text-[#2B2320] hover:bg-white/60 rounded-xl gap-1.5 h-8 font-semibold"
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#E8703A]" />
            <span className="hidden sm:inline">Guided Tour</span>
          </Button>
        )}

        <div className="h-4 w-px bg-[rgba(120,90,70,0.15)]" />

        {/* User Role Pill */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD9A0] to-[#E8703A] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {userName.charAt(0)}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-[#2B2320] leading-none">{userName}</p>
            <p className="text-[10px] text-[#8A7E76] leading-none mt-1">{userEmail}</p>
          </div>
        </div>

        {onNavigate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('landing')}
            className="text-xs text-[#8A7E76] hover:text-[#B23B2E] hover:bg-[#FBE3DE] rounded-xl p-1.5 h-8 w-8"
            title="Sign Out to Landing Page"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
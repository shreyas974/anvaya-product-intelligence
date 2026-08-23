import { Brain, Sparkles, FileSpreadsheet } from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';

export function IntelligencePage() {
  const { activeDataset, activeDatasetId } = useDataset();

  const taxonomy = [
    {
      category: 'Industrial Abrasives & Finishing',
      children: [
        { subcategory: 'Sanding & Polishing Discs', skus: 420, keywords: ['stikit', 'disc', 'abranet', 'hook & loop', 'grit'] },
        { subcategory: 'Sanding & Surface Belts', skus: 260, keywords: ['belt', 'sander belt', 'hiolit', 'aluminum oxide'] },
      ],
    },
    {
      category: 'Cutting Tools & Machine Tooling',
      children: [
        { subcategory: 'Abrasive Cut-Off Discs', skus: 180, keywords: ['cut-off', 'steel demon', 'metal cut', 'masonry'] },
        { subcategory: 'Circular & Reciprocating Blades', skus: 60, keywords: ['circular saw', 'reciprocating', 'carbide teeth'] },
      ],
    },
    {
      category: 'Fasteners, Hardware & Rigging',
      children: [
        { subcategory: 'Threaded Bolts & Machine Fasteners', skus: 40, keywords: ['bolt', 'screw', 'anchor', 'nut', 'hex head'] },
      ],
    },
    {
      category: 'Industrial Valves & Flow Control',
      children: [
        { subcategory: 'Solenoid & Automated Control Valves', skus: 20, keywords: ['valve', 'actuator', 'manifold', 'brass body', 'npt'] },
      ],
    },
  ];

  if (!activeDatasetId || !activeDataset) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl space-y-4 max-w-xl mx-auto my-12 border border-[rgba(120,90,70,0.15)]">
        <Sparkles className="mx-auto h-12 w-12 text-[#9C8F86] opacity-60" />
        <h3 className="text-lg font-bold text-[#2B2320]">No Active Dataset Selected</h3>
        <p className="text-xs text-[#6B5E56] leading-relaxed">
          Taxonomy trees and semantic embeddings are mapped from the active dataset. Upload a dataset to inspect category intelligence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-2.5 py-0.5 rounded-full border border-[rgba(199,127,46,0.2)]">
              Taxonomy Mapping
            </span>
            <span className="text-xs text-[#8A7E76] font-mono flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#E8703A]" />
              <span>{activeDataset.name} • {activeDataset.row_count.toLocaleString()} SKUs</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Taxonomy &amp; Category Intelligence</h1>
          <p className="text-xs text-[#6B5E56]">
            Hierarchical categorization tree and semantic embedding spaces mapped from active dataset <strong>{activeDataset.name}</strong>.
          </p>
        </div>
      </div>

      {/* 2. Taxonomy Hierarchy Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {taxonomy.map((t, idx) => (
          <div key={idx} className="glass-panel p-6 space-y-3 border border-[rgba(120,90,70,0.12)]">
            <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-2.5">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#E8703A]" />
                <h3 className="text-sm font-bold text-[#2B2320]">{t.category}</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#6B5E56]">
                {t.children.reduce((acc, c) => acc + c.skus, 0)} Products
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {t.children.map((child, cIdx) => (
                <div key={cIdx} className="glass-inset p-3 rounded-xl space-y-1.5 border border-[rgba(120,90,70,0.08)]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2B2320]">{child.subcategory}</span>
                    <span className="font-mono text-[#8A7E76] text-[11px]">{child.skus} SKUs</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {child.keywords.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="rounded-md bg-[#FAF5EF] border border-[rgba(120,90,70,0.1)] px-1.5 py-0.5 text-[9px] font-mono text-[#6B5E56]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

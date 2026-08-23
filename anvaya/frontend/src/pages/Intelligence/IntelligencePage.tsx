import { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  Cpu,
  Database,
  Filter,
  ShieldCheck,
  Tag,
  Search,
} from 'lucide-react';
import { useDataset } from '@/context/DatasetContext';
import { request } from '@/services/api/apiClient';

interface CategoryGroup {
  category: string;
  count: number;
  subcategories: Array<{ name: string; count: number; samples: string[] }>;
}

export function IntelligencePage() {
  const { activeDataset, activeDatasetId } = useDataset();
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDatasetIntelligence() {
      if (!activeDatasetId) {
        setCategories([]);
        return;
      }
      try {
        setLoading(true);
        const res = await request<any>(`/products?dataset_id=${activeDatasetId}&page_size=100`);
        const items = res?.data?.items || [];
        if (items.length > 0) {
          const map: Record<string, { count: number; subs: Record<string, { count: number; samples: string[] }> }> = {};
          items.forEach((p: any) => {
            const rawCat = p.category_classpath || p.category || 'General Industrial Supplies';
            const parts = rawCat.split('>').map((s: string) => s.trim());
            const top = parts[0] || 'General';
            const sub = parts[1] || parts[0] || 'Standard';

            if (!map[top]) {
              map[top] = { count: 0, subs: {} };
            }
            map[top].count += 1;

            if (!map[top].subs[sub]) {
              map[top].subs[sub] = { count: 0, samples: [] };
            }
            map[top].subs[sub].count += 1;
            if (map[top].subs[sub].samples.length < 4 && (p.cleaned_product_name || p.title)) {
              map[top].subs[sub].samples.push((p.cleaned_product_name || p.title).slice(0, 30));
            }
          });

          const groups: CategoryGroup[] = Object.entries(map).map(([cat, data]) => ({
            category: cat,
            count: data.count,
            subcategories: Object.entries(data.subs).map(([subName, subData]) => ({
              name: subName,
              count: subData.count,
              samples: subData.samples,
            })),
          }));
          setCategories(groups);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.warn('[ANVAYA Intelligence] Category load note:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    loadDatasetIntelligence();
  }, [activeDatasetId]);

  const pipelineStages = [
    { name: '1. Ingestion & Dynamic Profiling', icon: Database, desc: 'Auto-detects column roles, null rates, and semantic schema from raw file' },
    { name: '2. Cleaning & Casing', icon: Filter, desc: 'Removes duplicate spaces, invalid placeholders, and normalizes casing' },
    { name: '3. Master UOM & Fractions', icon: Layers, desc: 'Enforces number-space-unit standard formatting and decimal/fraction conversions' },
    { name: '4. Brand & Mfr Resolution', icon: Tag, desc: 'Canonical entity resolution using UniCat master reference catalogs' },
    { name: '5. Classification & Classpath', icon: Brain, desc: 'Hierarchical taxonomy classification mapped to Unilog department/class/fine' },
    { name: '6. Attribute Extraction & LOVs', icon: Search, desc: 'Structured attribute extraction grounded in input text and controlled LOVs' },
    { name: '7. Multi-Provider AI Reasoning', icon: Cpu, desc: 'Evidence-backed description synthesis using Claude, Kimi, OpenAI & Gemini' },
    { name: '8. Governance & Review Gate', icon: ShieldCheck, desc: 'Real-time rule compliance verification and human-in-the-loop exception routing' },
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
              Intelligence Pipeline
            </span>
            <span className="text-xs text-[#8A7E76] font-mono flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#E8703A]" />
              <span>{activeDataset.name} • {activeDataset.row_count.toLocaleString()} SKUs</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Intelligence &amp; Taxonomy Architecture</h1>
          <p className="text-xs text-[#6B5E56]">
            8-Stage transformation pipeline and dynamic taxonomy spaces grounded in dataset <strong>{activeDataset.name}</strong>.
          </p>
        </div>
      </div>

      {/* 2. 8-Stage Pipeline Overview */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[#2B2320] uppercase tracking-wider text-xs text-[#8A7E76]">
          Transformation Stages
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pipelineStages.map((stage, sIdx) => {
            const Icon = stage.icon;
            const isProcessed = activeDataset.status === 'PROCESSED';
            return (
              <div key={sIdx} className="glass-panel p-4 rounded-2xl border border-[rgba(120,90,70,0.1)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[#FBEEDD] flex items-center justify-center text-[#E8703A]">
                    <Icon className="w-4 h-4" />
                  </div>
                  {isProcessed ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      Configured
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-[#2B2320]">{stage.name}</p>
                <p className="text-[11px] text-[#6B5E56] leading-relaxed">{stage.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Taxonomy Hierarchy Grid */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-bold text-[#2B2320] uppercase tracking-wider text-xs text-[#8A7E76]">
          Discovered Catalog Taxonomy
        </h2>
        {loading ? (
          <div className="glass-panel p-8 text-center text-xs text-[#8A7E76]">
            Extracting discovered categories from active dataset...
          </div>
        ) : categories.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-[rgba(120,90,70,0.1)] text-xs text-[#6B5E56]">
            Process this dataset through the transformation pipeline to discover hierarchical taxonomy trees.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {categories.map((t, idx) => (
              <div key={idx} className="glass-panel p-6 space-y-3 border border-[rgba(120,90,70,0.12)]">
                <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-[#E8703A]" />
                    <h3 className="text-sm font-bold text-[#2B2320]">{t.category}</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#6B5E56]">
                    {t.count} Products
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {t.subcategories.map((child, cIdx) => (
                    <div key={cIdx} className="glass-inset p-3 rounded-xl space-y-1.5 border border-[rgba(120,90,70,0.08)]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#2B2320]">{child.name}</span>
                        <span className="font-mono text-[#8A7E76] text-[11px]">{child.count} SKUs</span>
                      </div>
                      {child.samples.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {child.samples.map((kw, kIdx) => (
                            <span
                              key={kIdx}
                              className="rounded-md bg-[#FAF5EF] border border-[rgba(120,90,70,0.1)] px-1.5 py-0.5 text-[9px] font-mono text-[#6B5E56]"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

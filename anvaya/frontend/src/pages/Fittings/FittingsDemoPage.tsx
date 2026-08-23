import { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { request } from '@/services/api/apiClient';

export function FittingsDemoPage() {
  const [inputText, setInputText] = useState('3/8 CPLG BRS 150#');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    raw_description: '3/8 CPLG BRS 150#',
    size: '3/8 in',
    fitting_type: 'Coupling',
    material: 'Brass',
    connection_type: 'NPT / Threaded',
    pressure_rating: 'Class 150',
    evidence_trace: [
      { field: 'Size', raw_term: '3/8', normalized_value: '3/8 in', rule: 'Decimal_Fraction & UOM Standard', confidence: 0.98 },
      { field: 'Fitting Type', raw_term: 'CPLG', normalized_value: 'Coupling', rule: 'Fittings_LOV.xlsx > Fitting Types', confidence: 0.99 },
      { field: 'Material', raw_term: 'BRS', normalized_value: 'Brass', rule: 'Fittings_LOV.xlsx > Approved Materials', confidence: 0.99 },
      { field: 'Pressure Rating', raw_term: '150#', normalized_value: 'Class 150', rule: 'Fittings_LOV.xlsx > Pressure Ratings', confidence: 0.98 },
    ],
  });

  const sampleSupplierStrings = [
    '3/8 CPLG BRS 150#',
    '1/2 90 ELB SS 3000# NPT',
    '3/4 TEE BRS SWEAT',
    '1-1/2 HEX BUSH MI 150#',
    '2 CLOSE NIP CS SCH 80',
    '1/4 MPT X 1/4 FPT BALL VALVE BRS',
  ];

  const handleNormalize = async (textToRun?: string) => {
    const query = textToRun || inputText;
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await request<any>('/fittings/normalize', {
        method: 'POST',
        body: { raw_text: query.trim() },
      });
      if (res?.data) {
        setResult(res.data);
      }
    } catch (e) {
      console.error('Normalization error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-2.5 py-0.5 rounded-full border border-[rgba(199,127,46,0.2)]">
              Flagship Category Demo (Section 75)
            </span>
            <span className="text-xs text-[#8A7E76] font-mono">Fittings_LOV.xlsx &amp; UOM Standard Engine</span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Plumbing &amp; Industrial Fittings Lab</h1>
          <p className="text-xs text-[#6B5E56]">
            Demonstrating deep abbreviation normalization, fractional parsing, and controlled LOV resolution in real time.
          </p>
        </div>
      </div>

      {/* 2. Interactive Input Workbench */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(120,90,70,0.12)]">
        <div>
          <h3 className="text-base font-bold text-[#2B2320]">Test Raw Supplier Fitting Strings</h3>
          <p className="text-xs text-[#6B5E56]">Type any raw industrial distributor abbreviation or pick a benchmark sample below:</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNormalize()}
            placeholder="e.g. 3/8 CPLG BRS 150# or 1/2 90 ELB SS"
            className="flex-1 rounded-xl border border-[rgba(120,90,70,0.18)] bg-white px-4 py-2.5 text-xs text-[#2B2320] font-mono outline-none focus:ring-2 focus:ring-[#E8703A]/20"
          />
          <Button
            onClick={() => handleNormalize()}
            disabled={loading}
            className="btn-sunrise-primary gap-1.5 px-6 text-xs font-bold rounded-xl shadow-md"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{loading ? 'Normalizing...' : 'Normalize & Extract'}</span>
          </Button>
        </div>

        {/* Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-[#8A7E76] mr-1">Benchmark Samples:</span>
          {sampleSupplierStrings.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(sample);
                handleNormalize(sample);
              }}
              className="rounded-lg border border-[rgba(120,90,70,0.12)] bg-[#FAF5EF] px-2.5 py-1 text-[11px] font-mono text-[#2B2320] hover:border-[#E8703A] hover:bg-[#FBEEDD] transition-all"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Output Side-by-Side Progression */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resolved Technical Specs */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(120,90,70,0.12)]">
            <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#2B2320]">Resolved Specification Card</h3>
                <p className="text-xs text-[#6B5E56]">Standardized industrial attribute tokens</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#C77F2E]">
                <ShieldCheck className="w-4 h-4" />
                <span>LOV Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="glass-inset p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#8A7E76]">Nominal Size</span>
                <p className="text-base font-black text-[#2B2320] mt-0.5">{result.size || 'N/A'}</p>
              </div>
              <div className="glass-inset p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#8A7E76]">Fitting Type</span>
                <p className="text-base font-black text-[#E8703A] mt-0.5">{result.fitting_type || 'N/A'}</p>
              </div>
              <div className="glass-inset p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#8A7E76]">Material</span>
                <p className="text-base font-black text-[#C77F2E] mt-0.5">{result.material || 'N/A'}</p>
              </div>
              <div className="glass-inset p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#8A7E76]">Pressure Rating</span>
                <p className="text-base font-black text-[#2B2320] mt-0.5">{result.pressure_rating || 'N/A'}</p>
              </div>
            </div>

            <div className="glass-inset p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-[#8A7E76]">Connection Standard</span>
              <p className="text-sm font-bold text-[#2B2320] mt-0.5">{result.connection_type || 'Standard Threaded NPT'}</p>
            </div>
          </div>

          {/* Evidence Trail */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(120,90,70,0.12)]">
            <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#2B2320]">Decision Evidence Trail</h3>
                <p className="text-xs text-[#6B5E56]">Exact rule and dictionary justification for every term</p>
              </div>
              <span className="text-xs font-mono text-[#8A7E76]">Zero Hallucination</span>
            </div>

            <div className="space-y-2.5">
              {result.evidence_trace?.map((trace: any, idx: number) => (
                <div key={idx} className="glass-inset p-3 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2B2320]">{trace.field}</span>
                    <span className="font-mono font-bold text-[#C77F2E] text-[11px]">{Math.round(trace.confidence * 100)}% Confidence</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono text-[#8A7E76]">"{trace.raw_term}"</span>
                    <ArrowRight className="w-3 h-3 text-[#E8703A]" />
                    <span className="font-mono font-bold text-[#E8703A]">"{trace.normalized_value}"</span>
                  </div>
                  <p className="text-[10px] text-[#8A7E76] pt-0.5">Rule: {trace.rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

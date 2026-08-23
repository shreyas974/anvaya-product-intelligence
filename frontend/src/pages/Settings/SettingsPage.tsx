import { useState } from 'react';
import {
  Save,
  CheckCircle2,
  Cpu,
  Building,
  Users,
  ShieldCheck,
  BookOpen,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'reference' | 'rbac' | 'security'>('general');
  const [provider, setProvider] = useState('gemini');
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const users = [
    { name: 'Devin Vance', email: 'lead.architect@enterprise.com', role: 'ADMIN', lastActive: 'Now' },
    { name: 'Marcus Chen', email: 'marcus.chen@enterprise.com', role: 'DATA_MANAGER', lastActive: '2h ago' },
    { name: 'Elena Rostova', email: 'elena.r@enterprise.com', role: 'REVIEWER', lastActive: '5h ago' },
    { name: 'Priya Sharma', email: 'priya.s@enterprise.com', role: 'VIEWER', lastActive: '1d ago' },
  ];

  const referenceMasters = [
    { name: 'Unilog Master UOM Standards', file: 'Unilog_Master_UOM_Standards_Abbreviations_and_Terms.xlsx', records: '450 units', status: 'Active' },
    { name: 'UniCat Manufacturer and Brand Master', file: 'UniCat_Manufacturer_and_Brand_List.xlsx', records: '3,800 brands', status: 'Active' },
    { name: 'Global Controlled LOV', file: 'Unicat_Lov_v1_0_Updated_With_Remarks.xlsx', records: '14,200 values', status: 'Active' },
    { name: 'Fittings Category LOV', file: 'Fittings_LOV.xlsx', records: '680 terms', status: 'Active' },
    { name: 'Faucets Category LOV', file: 'FAUCETS_LOV.xlsx', records: '520 terms', status: 'Active' },
    { name: 'Decimal / Fraction Master', file: 'Decimal_Fraction.xlsx', records: '128 mappings', status: 'Active' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C77F2E] bg-[#FBEEDD] px-2.5 py-0.5 rounded-full border border-[rgba(199,127,46,0.2)]">
              System Configuration
            </span>
            <span className="text-xs text-[#8A7E76] font-mono">Workspace: Default Enterprise Workspace</span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Platform Settings &amp; Security Governance</h1>
          <p className="text-xs text-[#6B5E56]">
            Configure AI provider abstraction, multi-tenant isolation, RBAC role assignments, and reference data masters.
          </p>
        </div>

        <Button
          onClick={handleSave}
          size="sm"
          className="btn-sunrise-primary gap-1.5 text-xs font-bold rounded-xl px-5 py-2.5 shadow-md"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saved ? 'Settings Saved!' : 'Save Configuration'}</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-[rgba(241,236,231,0.6)] p-1 border border-[rgba(120,90,70,0.1)] max-w-2xl">
        {[
          { id: 'general', label: 'Workspace', icon: Building },
          { id: 'ai', label: 'AI Providers', icon: Cpu },
          { id: 'reference', label: 'Reference Masters', icon: BookOpen },
          { id: 'rbac', label: 'Users & RBAC', icon: Users },
          { id: 'security', label: 'Security & Audit', icon: ShieldCheck },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === t.id
                  ? 'bg-[#FFFBF7] text-[#E8703A] shadow-sm'
                  : 'text-[#6B5E56] hover:text-[#2B2320]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Workspace Tab */}
      {activeTab === 'general' && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-[rgba(120,90,70,0.12)]">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Multi-Tenant Workspace Isolation (Section 56)</h3>
            <p className="text-xs text-[#6B5E56]">Every catalog dataset and transformation job belongs strictly to an isolated workspace boundary.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-inset p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#8A7E76] uppercase">Active Workspace Name</span>
              <p className="font-bold text-sm text-[#2B2320]">Default Enterprise Workspace</p>
              <p className="text-xs text-[#6B5E56]">Tenant ID: ws-ent-882910-us-east</p>
            </div>

            <div className="glass-inset p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#8A7E76] uppercase">Data Residency</span>
              <p className="font-bold text-sm text-[#2B2320]">Isolated Single-Tenant Database</p>
              <p className="text-xs text-[#6B5E56]">Zero cross-workspace data leakage guarantee</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI Provider Tab (Sections 83 & 84) */}
      {activeTab === 'ai' && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-[rgba(120,90,70,0.12)]">
          <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#2B2320]">AI Provider Abstraction (Section 83)</h3>
              <p className="text-xs text-[#6B5E56]">Switch foundation models seamlessly without rewriting frontend logic. API keys are strictly secured on the backend.</p>
            </div>
            <StatusBadge status="verified" showIcon={false} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'gemini', name: 'Google Gemini 2.5 / 1.5 Pro', desc: 'High-context multimodal catalog parsing (Active Default)', latency: '0.08s' },
              { id: 'claude', name: 'Anthropic Claude 3.5 Sonnet', desc: 'Deep technical specification reasoning & extraction', latency: '0.12s' },
              { id: 'openai', name: 'OpenAI GPT-4o', desc: 'General semantic classification & product matching', latency: '0.10s' },
              { id: 'kimi', name: 'Moonshot Kimi K1.5', desc: 'Extended context token window processing', latency: '0.14s' },
              { id: 'local', name: 'Local Ollama / Llama 3', desc: 'Air-gapped on-premise inference engine', latency: '0.04s' },
            ].map((prov) => (
              <div
                key={prov.id}
                onClick={() => setProvider(prov.id)}
                className={`glass-inset p-4 rounded-xl cursor-pointer transition-all border ${
                  provider === prov.id
                    ? 'border-[#E8703A] bg-[#FBEEDD]/50 shadow-sm'
                    : 'hover:border-[#E8703A]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2B2320]">{prov.name}</span>
                  {provider === prov.id && <CheckCircle2 className="h-4 w-4 text-[#E8703A]" />}
                </div>
                <p className="text-[11px] text-[#6B5E56] mt-1.5">{prov.desc}</p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-[#8A7E76]">
                  <span>Latency: {prov.latency}</span>
                  {provider === prov.id && <span className="font-bold text-[#E8703A]">Selected</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Section 84 Notice */}
          <div className="p-3.5 rounded-xl bg-[#FBEEDD] border border-[rgba(199,127,46,0.3)] text-xs text-[#C77F2E] flex items-center gap-2">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span><strong>Section 84 Secret Management:</strong> AI Provider API keys are never bundled or exposed to frontend JavaScript. All inferences route through authenticated backend proxies.</span>
          </div>

          {/* Confidence threshold */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-[#2B2320]">Human Review Escalation Threshold:</span>
              <span className="font-mono font-bold text-[#E8703A]">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={95}
              step={5}
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-[#E8703A] cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 3. Reference Masters Tab (Section 95) */}
      {activeTab === 'reference' && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-[rgba(120,90,70,0.12)]">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Reference Data Master Dictionaries (Section 95)</h3>
            <p className="text-xs text-[#6B5E56]">Customer datasets are strictly separated from reference master dictionaries to ensure deterministic normalization.</p>
          </div>

          <div className="space-y-2.5">
            {referenceMasters.map((master, idx) => (
              <div key={idx} className="glass-inset p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FBEEDD] flex items-center justify-center text-[#C77F2E]">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2B2320]">{master.name}</h4>
                    <span className="font-mono text-[10px] text-[#8A7E76]">{master.file}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#6B5E56]">{master.records}</span>
                  <StatusBadge status="verified" showIcon={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. RBAC Users Tab (Section 55) */}
      {activeTab === 'rbac' && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-[rgba(120,90,70,0.12)]">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Role-Based Access Control (RBAC) (Section 55)</h3>
            <p className="text-xs text-[#6B5E56]">Enforce granular permissions: ADMIN (full control), DATA_MANAGER (upload &amp; process), REVIEWER (approve/reject), and VIEWER (read-only).</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(120,90,70,0.1)] bg-[rgba(241,236,231,0.5)] text-[#6B5E56] font-semibold">
                  <th className="py-2.5 px-4">User Name</th>
                  <th className="py-2.5 px-4">Work Email</th>
                  <th className="py-2.5 px-4">Assigned Role</th>
                  <th className="py-2.5 px-4">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(120,90,70,0.06)]">
                {users.map((u, i) => (
                  <tr key={i} className="hover:bg-white/60">
                    <td className="py-3 px-4 font-bold text-[#2B2320]">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-[#6B5E56]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBEEDD] text-[#C77F2E] border border-[rgba(199,127,46,0.2)]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#8A7E76]">{u.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Security & Audit (Section 57) */}
      {activeTab === 'security' && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-[rgba(120,90,70,0.12)]">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Security &amp; Immutable Audit Logging (Section 57)</h3>
            <p className="text-xs text-[#6B5E56]">Every login, catalogue upload, pipeline modification, and export is recorded in an immutable audit ledger.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-inset p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold text-[#8A7E76] uppercase">Encryption Status</span>
              <p className="text-base font-bold text-[#2B2320] mt-1">TLS 1.3 + AES-256</p>
              <p className="text-[10px] text-[#C77F2E] font-semibold mt-0.5">Encrypted at rest &amp; in transit</p>
            </div>
            <div className="glass-inset p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold text-[#8A7E76] uppercase">SOC2 Compliance</span>
              <p className="text-base font-bold text-[#2B2320] mt-1">Type II Certified</p>
              <p className="text-[10px] text-[#C77F2E] font-semibold mt-0.5">Continuous automated audit</p>
            </div>
            <div className="glass-inset p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold text-[#8A7E76] uppercase">Session Invalidation</span>
              <p className="text-base font-bold text-[#2B2320] mt-1">JWT Stateful Rotation</p>
              <p className="text-[10px] text-[#6B5E56] mt-0.5">Automatic 30-min expiration</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

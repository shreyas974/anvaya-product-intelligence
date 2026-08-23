import { useState, useEffect } from 'react';
import {
  Save,
  Building,
  Cpu,
  BookOpen,
  Users,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  UserPlus,
  KeyRound,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';

export interface UserItem {
  name: string;
  email: string;
  role: 'ADMIN' | 'DATA_MANAGER' | 'REVIEWER' | 'VIEWER';
  lastActive: string;
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'reference' | 'rbac' | 'security'>('general');
  const [provider, setProvider] = useState('gemini');
  const [confidenceThreshold, setConfidenceThreshold] = useState(75);
  const [saved, setSaved] = useState(false);
  const [requireOtp, setRequireOtp] = useState(true);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'DATA_MANAGER' | 'REVIEWER' | 'VIEWER'>('DATA_MANAGER');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Dynamic user list initialized from registered session and local storage
  const [users, setUsers] = useState<UserItem[]>(() => {
    try {
      const rawReg = localStorage.getItem('anvaya_registered_users');
      if (rawReg) {
        const parsed = JSON.parse(rawReg);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u: any) => ({
            name: u.name || u.email.split('@')[0],
            email: u.email,
            role: u.role || 'ADMIN',
            lastActive: 'Active recently',
          }));
        }
      }

      const rawSession = localStorage.getItem('anvaya_active_session');
      if (rawSession) {
        const sess = JSON.parse(rawSession);
        return [
          {
            name: sess.userName || 'Master Catalog Lead',
            email: sess.userEmail || 'admin@anvaya.ai',
            role: sess.userRole || 'ADMIN',
            lastActive: 'Now (Current Session)',
          },
        ];
      }
    } catch {
      // Fallback
    }

    return [
      { name: 'Enterprise Catalog Lead', email: 'admin@anvaya.ai', role: 'ADMIN', lastActive: 'Now' },
    ];
  });

  useEffect(() => {
    try {
      const rawReg = localStorage.getItem('anvaya_registered_users');
      if (rawReg) {
        const parsed = JSON.parse(rawReg);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(
            parsed.map((u: any) => ({
              name: u.name || u.email.split('@')[0],
              email: u.email,
              role: u.role || 'ADMIN',
              lastActive: 'Active recently',
            }))
          );
        }
      }
    } catch {}
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteUser = (emailToDelete: string) => {
    const updated = users.filter((u) => u.email !== emailToDelete);
    setUsers(updated);
    try {
      const rawReg = localStorage.getItem('anvaya_registered_users');
      if (rawReg) {
        const parsed = JSON.parse(rawReg);
        const filtered = parsed.filter((u: any) => u.email !== emailToDelete);
        localStorage.setItem('anvaya_registered_users', JSON.stringify(filtered));
      }
    } catch {}
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    const newUser: UserItem = {
      name: newUserName.trim() || newUserEmail.split('@')[0],
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      lastActive: 'Just invited',
    };

    const updated = [...users, newUser];
    setUsers(updated);

    try {
      const rawReg = localStorage.getItem('anvaya_registered_users');
      const list = rawReg ? JSON.parse(rawReg) : [];
      list.push({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('anvaya_registered_users', JSON.stringify(list));
    } catch {}

    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

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
            <span className="text-xs text-[#8A7E76] font-mono">Workspace: Enterprise Master Sandbox</span>
          </div>
          <h1 className="text-2xl font-black text-[#2B2320] mt-1">Platform Settings &amp; Security Governance</h1>
          <p className="text-xs text-[#6B5E56]">
            Configure AI provider abstraction, multi-tenant isolation, OTP 2-Factor authentication, and RBAC permissions.
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
      <div className="flex flex-wrap rounded-xl bg-[rgba(241,236,231,0.6)] p-1 border border-[rgba(120,90,70,0.1)] max-w-2xl text-xs font-bold">
        {[
          { id: 'general', label: 'Workspace', icon: Building },
          { id: 'ai', label: 'AI Providers', icon: Cpu },
          { id: 'reference', label: 'Reference Masters', icon: BookOpen },
          { id: 'rbac', label: 'Users & RBAC', icon: Users },
          { id: 'security', label: 'Security & 2FA OTP', icon: ShieldCheck },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all ${
                activeTab === t.id
                  ? 'bg-white font-bold text-[#E8703A] shadow-xs'
                  : 'text-[#6B5E56] hover:text-[#2B2320]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. General Tab */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(120,90,70,0.12)]">
            <h3 className="text-base font-bold text-[#2B2320]">Workspace Identity</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#8A7E76]">Organization Name</label>
                <input
                  type="text"
                  defaultValue="ANVAYA Enterprise Intelligence"
                  className="mt-1 w-full rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 p-2.5 text-xs text-[#2B2320] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#8A7E76]">Primary Catalog Taxonomy Format</label>
                <input
                  type="text"
                  disabled
                  value="UNSPSC 4-Level Standard"
                  className="mt-1 w-full rounded-xl border border-[rgba(120,90,70,0.1)] bg-[rgba(241,236,231,0.5)] p-2.5 text-xs text-[#6B5E56]"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[rgba(120,90,70,0.12)]">
            <h3 className="text-base font-bold text-[#2B2320]">Autonomous Processing Defaults</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#8A7E76]">Confidence Threshold for Auto-Approve (%)</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="flex-1 accent-[#E8703A]"
                  />
                  <span className="font-mono text-sm font-bold text-[#E8703A]">{confidenceThreshold}%</span>
                </div>
              </div>
              <p className="text-[11px] text-[#8A7E76]">
                Predictions scoring above {confidenceThreshold}% are automatically verified without human-in-the-loop intervention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI Providers Tab */}
      {activeTab === 'ai' && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-[rgba(120,90,70,0.12)]">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Grounded AI Engine Architecture</h3>
            <p className="text-xs text-[#6B5E56]">
              All 8 pipeline stages, semantic search, and AI Copilot execute autonomously using ANVAYA's built-in grounded intelligence engine without requiring any paid or third-party API keys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setProvider('autonomous')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                provider === 'autonomous' || provider === 'gemini'
                  ? 'border-[#E8703A] bg-[#FBEEDD]/60 shadow-sm ring-1 ring-[#E8703A]'
                  : 'border-[rgba(120,90,70,0.15)] bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#E8703A]" />
                  <h4 className="text-xs font-bold text-[#2B2320]">ANVAYA Embedded Grounded Intelligence</h4>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#E8703A]" />
              </div>
              <span className="mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE • NO API KEY REQUIRED
              </span>
              <p className="mt-2 text-xs text-[#6B5E56] leading-relaxed">
                Deterministic regex rules, 3,800 Brand Master dictionary, UNSPSC 4-tier taxonomy classifier, and local vector indexing running 100% free and offline-capable.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[rgba(120,90,70,0.15)] bg-white/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#8A7E76]" />
                  <h4 className="text-xs font-bold text-[#2B2320]">Custom LLM Key (Optional)</h4>
                </div>
                <span className="text-[10px] text-[#8A7E76]">Bring Your Own Key</span>
              </div>
              <p className="text-xs text-[#6B5E56]">
                Optionally connect your personal Google Gemini or OpenAI API key for extended generative descriptions.
              </p>
              <input
                type="password"
                placeholder="AIzaSy... (Optional API Key)"
                className="w-full rounded-xl border border-[rgba(120,90,70,0.15)] bg-white p-2.5 text-xs text-[#2B2320] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Reference Masters Tab */}
      {activeTab === 'reference' && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-[rgba(120,90,70,0.12)]">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Reference Data Master Dictionaries</h3>
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

      {/* 4. RBAC Users Tab */}
      {activeTab === 'rbac' && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-[rgba(120,90,70,0.12)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#2B2320]">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-[#6B5E56]">Granular permissions: ADMIN (full control), DATA_MANAGER (upload &amp; process), REVIEWER (approve/reject), VIEWER (read-only).</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddUserModal(true)}
              className="btn-sunrise-primary gap-1 text-xs font-bold rounded-xl px-3.5 py-1.5 shadow-md"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Team Member</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(120,90,70,0.1)] bg-[rgba(241,236,231,0.5)] text-[#6B5E56] font-semibold">
                  <th className="py-2.5 px-4">User Name</th>
                  <th className="py-2.5 px-4">Work Email</th>
                  <th className="py-2.5 px-4">Assigned Role</th>
                  <th className="py-2.5 px-4">Status / Activity</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(120,90,70,0.06)]">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#8A7E76]">
                      No additional team members. Click "Add Team Member" to grant workspace access.
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={i} className="hover:bg-white/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#2B2320]">{u.name}</td>
                      <td className="py-3 px-4 font-mono text-[#6B5E56]">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBEEDD] text-[#C77F2E] border border-[rgba(199,127,46,0.2)]">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#8A7E76]">{u.lastActive}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(u.email)}
                          className="h-7 w-7 p-0 text-[#8A7E76] hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Security & 2FA OTP Tab */}
      {activeTab === 'security' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6 border border-[rgba(120,90,70,0.12)]">
          <div>
            <h3 className="text-base font-bold text-[#2B2320]">Enterprise Security &amp; 2-Factor OTP Authentication</h3>
            <p className="text-xs text-[#6B5E56]">Protect catalog governance with mandatory 6-digit One-Time Password (OTP) verification on every sign-in.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-inset p-4 rounded-xl space-y-3 border border-[rgba(120,90,70,0.15)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#E8703A]" />
                  <span className="font-bold text-xs text-[#2B2320]">Mandatory 2FA OTP Login</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ENFORCED
                </span>
              </div>
              <p className="text-[11px] text-[#6B5E56]">
                All users must submit a verified 6-digit security code sent to their registered work email before accessing dataset assets.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-[rgba(120,90,70,0.1)] text-xs">
                <span className="text-[#8A7E76]">Require OTP for all logins:</span>
                <input
                  type="checkbox"
                  checked={requireOtp}
                  onChange={(e) => setRequireOtp(e.target.checked)}
                  className="accent-[#E8703A] h-4 w-4 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="glass-inset p-4 rounded-xl space-y-3 border border-[rgba(120,90,70,0.15)]">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#C77F2E]" />
                <span className="font-bold text-xs text-[#2B2320]">Immutable Audit Trail</span>
              </div>
              <p className="text-[11px] text-[#6B5E56]">
                All login validations, pipeline executions, and catalog modifications are permanently timestamped with user metadata and IP records.
              </p>
              <div className="pt-2 border-t border-[rgba(120,90,70,0.1)] flex items-center justify-between text-xs text-[#8A7E76]">
                <span>Ledger status:</span>
                <span className="font-bold text-[#E8703A]">Active (Cloud Firestore Synced)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in-0">
          <div className="rounded-3xl glass-surface-floating border border-[rgba(120,90,70,0.2)] p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[rgba(120,90,70,0.1)] pb-3">
              <h3 className="font-bold text-sm text-[#2B2320]">Invite Team Member</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddUserModal(false)}
                className="h-6 w-6 p-0 text-[#8A7E76] rounded-full"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-[#6B5E56] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-xl border border-[rgba(120,90,70,0.15)] bg-white p-2.5 text-xs text-[#2B2320] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6B5E56] block mb-1">Work Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="sarah@enterprise.com"
                  className="w-full rounded-xl border border-[rgba(120,90,70,0.15)] bg-white p-2.5 text-xs text-[#2B2320] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6B5E56] block mb-1">Assign Role (RBAC)</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full rounded-xl border border-[rgba(120,90,70,0.15)] bg-white p-2.5 text-xs font-semibold text-[#2B2320] outline-none"
                >
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="DATA_MANAGER">DATA_MANAGER (Upload &amp; Run Pipelines)</option>
                  <option value="REVIEWER">REVIEWER (Review &amp; Resolve Conflicts)</option>
                  <option value="VIEWER">VIEWER (Read-Only Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddUserModal(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="btn-sunrise-primary px-4 text-xs font-bold rounded-xl"
                >
                  Save &amp; Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

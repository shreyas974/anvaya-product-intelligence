import { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LoginPageProps {
  onLogin?: (userRole?: 'ADMIN' | 'DATA_MANAGER' | 'REVIEWER' | 'VIEWER') => void;
  onLoginSuccess?: (role: string, name: string, email: string) => void;
  onExploreLanding?: () => void;
  onBackToLanding?: () => void;
}

export function LoginPage({ onLogin, onLoginSuccess, onExploreLanding, onBackToLanding }: LoginPageProps) {
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('lead.architect@enterprise.com');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Devin Vance');
  const [company, setCompany] = useState('Industrial Supply Corp');
  const [confirmPassword, setConfirmPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'DATA_MANAGER' | 'REVIEWER' | 'VIEWER'>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      if (tab === 'forgot') {
        setMessage('Password reset instructions sent to your work email.');
      } else if (onLoginSuccess) {
        onLoginSuccess(selectedRole, name, email);
      } else if (onLogin) {
        onLogin(selectedRole);
      }
    }, 450);
  };

  const handleBack = onBackToLanding || onExploreLanding;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-sunrise-canvas text-[#2B2320] overflow-hidden">
      {/* Centered Floating Glass Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl glass-surface-floating border border-[rgba(120,90,70,0.18)] p-8 sm:p-10 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD9A0] to-[#E8703A] text-white shadow-md mb-3">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#2B2320]">ANVAYA</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#E8703A] mt-0.5">
            Enterprise Product Intelligence
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[rgba(241,236,231,0.7)] p-1 border border-[rgba(120,90,70,0.1)] mb-6">
          <button
            type="button"
            onClick={() => { setTab('login'); setMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-[#FFFBF7] text-[#E8703A] shadow-sm'
                : 'text-[#6B5E56] hover:text-[#2B2320]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'signup'
                ? 'bg-[#FFFBF7] text-[#E8703A] shadow-sm'
                : 'text-[#6B5E56] hover:text-[#2B2320]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setTab('forgot'); setMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'forgot'
                ? 'bg-[#FFFBF7] text-[#E8703A] shadow-sm'
                : 'text-[#6B5E56] hover:text-[#2B2320]'
            }`}
          >
            Reset
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-[#FBEEDD] border border-[rgba(199,127,46,0.3)] text-xs text-[#C77F2E] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B5E56]">Full Name</label>
                <div className="flex items-center rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-3 py-2.5">
                  <User className="h-4 w-4 text-[#9C8F86] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-transparent text-xs text-[#2B2320] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B5E56]">Company / Organization</label>
                <div className="flex items-center rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-3 py-2.5">
                  <Building2 className="h-4 w-4 text-[#9C8F86] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Industrial Inc."
                    className="w-full bg-transparent text-xs text-[#2B2320] outline-none"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6B5E56]">Work Email</label>
            <div className="flex items-center rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-3 py-2.5">
              <Mail className="h-4 w-4 text-[#9C8F86] mr-2 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@enterprise.com"
                className="w-full bg-transparent text-xs text-[#2B2320] outline-none"
                required
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#6B5E56]">Password</label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] font-semibold text-[#E8703A] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="flex items-center rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-3 py-2.5">
                <Lock className="h-4 w-4 text-[#9C8F86] mr-2 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-transparent text-xs text-[#2B2320] outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9C8F86] hover:text-[#2B2320]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {tab === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#6B5E56]">Confirm Password</label>
              <div className="flex items-center rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-3 py-2.5">
                <Lock className="h-4 w-4 text-[#9C8F86] mr-2 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-transparent text-xs text-[#2B2320] outline-none"
                  required
                />
              </div>
            </div>
          )}

          {/* Role selector for demo ease */}
          {tab === 'login' && (
            <div className="pt-1">
              <label className="text-[11px] font-semibold text-[#8A7E76] block mb-1.5">
                Sign in with Enterprise Role (RBAC):
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {(['ADMIN', 'DATA_MANAGER', 'REVIEWER', 'VIEWER'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-1 px-1 text-[10px] font-bold rounded-lg border transition-all ${
                      selectedRole === role
                        ? 'border-[#E8703A] bg-[#FBEEDD] text-[#E8703A]'
                        : 'border-[rgba(120,90,70,0.15)] text-[#6B5E56] hover:bg-white/60'
                    }`}
                  >
                    {role.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="btn-sunrise-primary w-full py-5 text-xs font-bold rounded-xl shadow-md mt-4"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : tab === 'login' ? (
              <span className="flex items-center justify-center gap-2">
                Sign In to Workspace <ArrowRight className="w-4 h-4" />
              </span>
            ) : tab === 'signup' ? (
              <span>Create Enterprise Workspace</span>
            ) : (
              <span>Send Reset Instructions</span>
            )}
          </Button>

          {/* SSO Buttons */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(120,90,70,0.12)]" />
            </div>
            <span className="relative bg-[#FFFBF7] px-3 text-[10px] uppercase tracking-wider text-[#9C8F86] font-semibold">
              Or Enterprise SSO
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoginSuccess ? onLoginSuccess(selectedRole, name, email) : onLogin?.(selectedRole)}
              className="border-[rgba(120,90,70,0.15)] bg-white/60 hover:bg-white/90 text-xs font-semibold text-[#2B2320] rounded-xl py-4"
            >
              Google Workspace
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onLoginSuccess ? onLoginSuccess(selectedRole, name, email) : onLogin?.(selectedRole)}
              className="border-[rgba(120,90,70,0.15)] bg-white/60 hover:bg-white/90 text-xs font-semibold text-[#2B2320] rounded-xl py-4"
            >
              Microsoft 365
            </Button>
          </div>
        </form>

        {/* Back to landing link */}
        {handleBack && (
          <div className="mt-6 text-center">
            <button
              onClick={handleBack}
              className="text-xs font-semibold text-[#6B5E56] hover:text-[#E8703A] transition-colors"
            >
              ← Back to Platform Overview
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[rgba(120,90,70,0.1)] flex items-center justify-center gap-2 text-[10px] text-[#8A7E76]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C77F2E]" />
          <span>Encrypted Session • Multi-Tenant Isolation • SOC2 Type II</span>
        </div>
      </div>
    </div>
  );
}
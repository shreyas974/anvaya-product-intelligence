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
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LoginPageProps {
  onLogin?: (userRole?: 'ADMIN' | 'DATA_MANAGER' | 'REVIEWER' | 'VIEWER') => void;
  onLoginSuccess?: (role: string, name: string, email: string) => void;
  onExploreLanding?: () => void;
  onBackToLanding?: () => void;
}

interface StoredUser {
  name: string;
  email: string;
  password: string;
  company: string;
  role: 'ADMIN' | 'DATA_MANAGER' | 'REVIEWER' | 'VIEWER';
  createdAt: string;
}

const STORAGE_USERS_KEY = 'anvaya_registered_users';
const STORAGE_SESSION_KEY = 'anvaya_active_session';

function getRegisteredUsers(): StoredUser[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUser(user: StoredUser): void {
  try {
    if (typeof window === 'undefined') return;
    const users = getRegisteredUsers();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch {
    // Ignore in restrictive contexts
  }
}

export function LoginPage({ onLogin, onLoginSuccess, onExploreLanding, onBackToLanding }: LoginPageProps) {
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'DATA_MANAGER' | 'REVIEWER' | 'VIEWER'>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        setErrorMessage('Please enter a valid work email address.');
        return;
      }

      if (tab === 'forgot') {
        const users = getRegisteredUsers();
        const userExists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
        if (!userExists) {
          setErrorMessage('No account found with this email. Please create an account.');
        } else {
          setSuccessMessage(`Password reset instructions sent to ${normalizedEmail}.`);
        }
        return;
      }

      if (tab === 'signup') {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          return;
        }
        if (!company.trim()) {
          setErrorMessage('Please enter your company or organization name.');
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please verify and re-type.');
          return;
        }

        const users = getRegisteredUsers();
        const alreadyExists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
        if (alreadyExists) {
          setErrorMessage('An account with this email already exists. Please switch to Sign In.');
          return;
        }

        const newUser: StoredUser = {
          name: name.trim(),
          email: normalizedEmail,
          password,
          company: company.trim(),
          role: selectedRole,
          createdAt: new Date().toISOString(),
        };

        saveRegisteredUser(newUser);

        try {
          localStorage.setItem(
            STORAGE_SESSION_KEY,
            JSON.stringify({ email: newUser.email, name: newUser.name, role: newUser.role, company: newUser.company })
          );
        } catch {}

        if (onLoginSuccess) {
          onLoginSuccess(newUser.role, newUser.name, newUser.email);
        } else if (onLogin) {
          onLogin(newUser.role);
        }
        return;
      }

      if (tab === 'login') {
        if (!password) {
          setErrorMessage('Please enter your password.');
          return;
        }

        const users = getRegisteredUsers();
        const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!user) {
          setErrorMessage('No account found with this email. Please switch to Create Account to register.');
          return;
        }

        if (user.password !== password) {
          setErrorMessage('Incorrect password. Please verify your credentials.');
          return;
        }

        try {
          localStorage.setItem(
            STORAGE_SESSION_KEY,
            JSON.stringify({ email: user.email, name: user.name, role: user.role, company: user.company })
          );
        } catch {}

        if (onLoginSuccess) {
          onLoginSuccess(user.role, user.name, user.email);
        } else if (onLogin) {
          onLogin(user.role);
        }
      }
    }, 350);
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
            onClick={() => {
              setTab('signup');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
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
            onClick={() => {
              setTab('login');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
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
            onClick={() => {
              setTab('forgot');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'forgot'
                ? 'bg-[#FFFBF7] text-[#E8703A] shadow-sm'
                : 'text-[#6B5E56] hover:text-[#2B2320]'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Feedback Banners */}
        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#FBEEDD] border border-[rgba(199,127,46,0.3)] text-xs text-[#C77F2E] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#FBE3DE] border border-[rgba(178,59,46,0.3)] text-xs text-[#B23B2E] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
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
                    placeholder="Enter your full name"
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
                    placeholder="Enter your enterprise name"
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
                    onClick={() => {
                      setTab('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
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
                  placeholder={tab === 'signup' ? 'Create a secure password (min 6 chars)' : 'Enter your password'}
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
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B5E56]">Confirm Password</label>
                <div className="flex items-center rounded-xl border border-[rgba(120,90,70,0.15)] bg-white/80 px-3 py-2.5">
                  <Lock className="h-4 w-4 text-[#9C8F86] mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your password"
                    className="w-full bg-transparent text-xs text-[#2B2320] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Role selection for account creation */}
              <div className="pt-1">
                <label className="text-[11px] font-semibold text-[#8A7E76] block mb-1.5">
                  Assign Account Role (RBAC):
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {(['ADMIN', 'DATA_MANAGER', 'REVIEWER', 'VIEWER'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all ${
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
            </>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="btn-sunrise-primary w-full py-5 text-xs font-bold rounded-xl shadow-md mt-4"
          >
            {isLoading ? (
              <span>Validating &amp; Creating Session...</span>
            ) : tab === 'login' ? (
              <span className="flex items-center justify-center gap-2">
                Sign In to Workspace <ArrowRight className="w-4 h-4" />
              </span>
            ) : tab === 'signup' ? (
              <span className="flex items-center justify-center gap-2">
                Create Account &amp; Enter Workspace <ArrowRight className="w-4 h-4" />
              </span>
            ) : (
              <span>Send Reset Instructions</span>
            )}
          </Button>
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
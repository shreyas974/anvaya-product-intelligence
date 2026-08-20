import { FormEvent, useState } from 'react';
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

interface LoginPageProps {
    onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onLogin();
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
            {/* Ambient intelligence glow */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />

            {/* Grid */}
            <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.35)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="relative z-10 grid min-h-screen lg:grid-cols-2">

                {/* Brand panel */}
                <div className="hidden lg:flex flex-col justify-between border-r border-border/60 p-10 xl:p-14">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                                <p className="text-lg font-black tracking-tight">
                                    ANVAYA
                                </p>
                                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                                    Product Intelligence
                                </p>
                            </div>
                        </div>

                        <div className="mt-24 max-w-xl">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                Autonomous intelligence
                            </p>

                            <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                                Turn catalog data into
                                <span className="block text-primary">
                                    intelligent decisions.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">
                                Cleanse, enrich, validate and understand your product
                                catalog with one intelligent operational workspace.
                            </p>
                        </div>
                    </div>

                    <div className="grid max-w-xl grid-cols-3 gap-3">
                        {[
                            ['90.7%', 'Enrichment'],
                            ['88.4', 'Quality score'],
                            ['24/7', 'AI monitoring'],
                        ].map(([value, label]) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur"
                            >
                                <p className="text-lg font-black text-foreground">
                                    {value}
                                </p>
                                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Login panel */}
                <div className="flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-md">

                        {/* Mobile logo */}
                        <div className="mb-10 flex items-center gap-3 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Sparkles className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="font-black">ANVAYA</p>
                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                    Product Intelligence
                                </p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border/70 bg-card/80 p-7 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">

                            <div className="mb-8">
                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <LockKeyhole className="h-5 w-5" />
                                </div>

                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                    Secure workspace
                                </p>

                                <h2 className="mt-2 text-2xl font-black tracking-tight">
                                    Welcome back
                                </h2>

                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                    Sign in to access your ANVAYA intelligence workspace.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Work email
                                    </label>

                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            placeholder="you@company.com"
                                            required
                                            className="h-11 w-full rounded-xl border border-border bg-background/60 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Password
                                        </label>

                                        <button
                                            type="button"
                                            className="text-[10px] font-semibold text-primary hover:text-primary/80"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            placeholder="Enter your password"
                                            required
                                            className="h-11 w-full rounded-xl border border-border bg-background/60 pl-10 pr-11 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((value) => !value)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
                                >
                                    Enter ANVAYA
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </form>

                            <div className="mt-7 flex items-center justify-center gap-2 border-t border-border/50 pt-5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-[10px] text-muted-foreground">
                                    Protected intelligence workspace
                                </span>
                            </div>
                        </div>

                        <p className="mt-5 text-center text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground/60">
                            ANVAYA • Product Intelligence Platform
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
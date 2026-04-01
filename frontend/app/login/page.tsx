"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail, User2, Calendar, GraduationCap, Camera } from "lucide-react";
import { loginUser, saveSession } from "@/lib/api";

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg className="absolute inset-0 w-full h-full animate-grid" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="login-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(139,92,246,0.35)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-grid)" />
      </svg>
      <div className="animate-orb-1 absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)" }} />
      <div className="animate-orb-2 absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)" }} />
      <div className="animate-orb-3 absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(217,70,239,0.12) 0%, transparent 70%)" }} />
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <line x1="10%" y1="20%" x2="35%" y2="50%" stroke="#8b5cf6" strokeWidth="1" />
        <line x1="35%" y1="50%" x2="65%" y2="30%" stroke="#8b5cf6" strokeWidth="1" />
        <line x1="65%" y1="30%" x2="90%" y2="60%" stroke="#8b5cf6" strokeWidth="1" />
        <line x1="35%" y1="50%" x2="55%" y2="80%" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="10%" cy="20%" r="4" fill="#8b5cf6" />
        <circle cx="35%" cy="50%" r="4" fill="#8b5cf6" />
        <circle cx="65%" cy="30%" r="4" fill="#8b5cf6" />
        <circle cx="90%" cy="60%" r="4" fill="#38bdf8" />
        <circle cx="55%" cy="80%" r="4" fill="#38bdf8" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const resp = await loginUser(email, password);
      saveSession(resp);
      router.push("/app");
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { detail?: string } } };
      setError(axErr?.response?.data?.detail ?? "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080812] flex items-center justify-center px-4">
      <AnimatedBackground />
      <div className="animate-fade-up relative z-10 w-full max-w-md" style={{ animationFillMode: "both" }}>
        <div className="rounded-3xl p-[1px]"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.6) 0%, rgba(56,189,248,0.3) 50%, rgba(217,70,239,0.4) 100%)" }}>
          <div className="rounded-3xl bg-[#0d0d1f]/95 backdrop-blur-2xl px-8 py-10 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/15 ring-1 ring-violet-500/30 mb-2">
                <Zap size={28} className="text-violet-400" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Welcome back</h1>
              <p className="text-sm text-white/40">
                Sign in to your <span className="text-violet-400 font-medium">AI-Adaptive Onboarding</span> account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-semibold text-white/50 uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-violet-400 transition-colors" />
                  <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required autoComplete="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20
                               focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold text-white/50 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-violet-400 transition-colors" />
                  <input id="login-password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder:text-white/20
                               focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}

              <button type="submit" disabled={loading}
                className="relative group w-full py-3.5 rounded-xl font-semibold text-sm text-white overflow-hidden
                           transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Signing in…</> : <>Sign In <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></>}
                </span>
              </button>
            </form>

            <p className="text-center text-xs text-white/30">
              New here?{" "}
              <a href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Create a free account</a>
            </p>
          </div>
        </div>
        <p className="text-center mt-6 text-xs text-white/20">
          <a href="/" className="hover:text-white/50 transition-colors">← Back to home</a>
        </p>
      </div>
    </main>
  );
}

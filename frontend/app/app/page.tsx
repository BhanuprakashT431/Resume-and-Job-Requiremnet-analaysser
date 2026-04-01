"use client";

import React, { useState, useCallback, useEffect } from "react";
import UploadZone from "@/components/UploadZone";
import { uploadResume, uploadJD, clearSession, getStoredUser, getPhotoUrl } from "@/lib/api";
import type { UserProfile } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Brain, GitBranch, BarChart3, LogOut, ChevronDown } from "lucide-react";

/* ── Small avatar component ──────────────────────────────────────────── */
function NavAvatar({ user }: { user: UserProfile | null }) {
  const photoUrl = getPhotoUrl(user);
  const initials = (user?.name ?? "")
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt={user?.name ?? ""} width={32} height={32}
        className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/40" />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-violet-500/40"
      style={{ background: "linear-gradient(135deg,#7c3aed,#0ea5e9)" }}>
      {initials}
    </div>
  );
}

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [resumeDone, setResumeDone] = useState(false);
  const [jdDone, setJdDone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  const handleResume = useCallback(async (file: File) => {
    await uploadResume(file);
    setResumeDone(true);
  }, []);

  const handleJD = useCallback(async (file: File) => {
    await uploadJD(file);
    setJdDone(true);
  }, []);

  const bothReady = resumeDone && jdDone;

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#080812] text-white flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="animate-orb-1 absolute -top-48 left-1/4 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
        <div className="animate-orb-2 absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)" }} />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <a href="/" className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors">
          <Zap size={16} className="text-violet-400" /> AI Onboarding Engine
        </a>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white bg-white/5 border border-white/10 rounded-xl px-3 py-2 transition-all hover:bg-white/10"
          >
            <NavAvatar user={user} />
            <span className="hidden sm:block max-w-[140px] truncate font-medium">
              {user?.name ?? "Loading…"}
            </span>
            <ChevronDown size={14} className={`transition-transform text-white/40 ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0d0d1f]/95 border border-white/10 backdrop-blur-xl shadow-2xl py-1 z-50 animate-in">
              {/* User info in dropdown */}
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/40 truncate mt-0.5">{user?.email}</p>
                {user?.graduation_type && (
                  <p className="text-xs text-violet-400 mt-1">{user.graduation_type}</p>
                )}
              </div>
              <a href="/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
                👤 View Profile
              </a>
              <a href="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
                📊 Dashboard
              </a>
              <div className="border-t border-white/8 mt-1">
                <button onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/8 transition-all">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-5xl mx-auto w-full">
        {/* Greeting */}
        <div className="text-center space-y-4 mb-14 animate-fade-up" style={{ animationFillMode: "both" }}>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-widest bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
            <Zap size={12} className="animate-pulse" /> AI-Powered Onboarding Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            {user ? (
              <>Welcome back, <span className="animate-shimmer">{user.name.split(" ")[0]}</span>!</>
            ) : (
              <>Close the <span className="animate-shimmer">Skill Gap</span></>
            )}
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
            Upload your resume and a job description. Our engine extracts skills via LLM,
            maps the gap, and generates a personalized learning roadmap — instantly.
          </p>
        </div>

        {/* Upload zones */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 animate-fade-up delay-200" style={{ animationFillMode: "both" }}>
          <UploadZone label="Your Resume" sublabel="PDF or TXT — we extract your current skill levels"
            onUpload={handleResume} accentColor="violet" />
          <UploadZone label="Job Description" sublabel="PDF or TXT — we extract the required skill set"
            onUpload={handleJD} accentColor="sky" />
        </div>

        {/* Analyze CTA */}
        <button
          onClick={() => router.push("/dashboard")}
          disabled={!bothReady}
          className={`animate-fade-up delay-400 flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 group
            ${bothReady ? "text-white cursor-pointer hover:scale-105" : "bg-white/5 text-white/20 cursor-not-allowed ring-1 ring-white/10"}`}
          style={bothReady ? {
            animationFillMode: "both",
            background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
            boxShadow: "0 0 30px rgba(124,58,237,0.35)",
          } : { animationFillMode: "both" }}
        >
          Analyze &amp; Build Roadmap
          <ArrowRight size={18} className={`transition-transform ${bothReady ? "group-hover:translate-x-1" : ""}`} />
        </button>

        {!bothReady && (
          <p className="text-xs text-white/25 mt-3">
            Upload {!resumeDone ? "resume" : ""}{!resumeDone && !jdDone ? " & " : ""}{!jdDone ? "job description" : ""} to continue
          </p>
        )}

        {/* Feature pills */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full animate-fade-up delay-700" style={{ animationFillMode: "both" }}>
          {[
            { icon: Brain, title: "LLM Extraction", desc: "Mistral parses skills from your documents", color: "violet" },
            { icon: BarChart3, title: "Gap Visualization", desc: "Radar & bar charts reveal what needs work", color: "sky" },
            { icon: GitBranch, title: "Graph Roadmap", desc: "Prerequisite-aware path built on a DAG engine", color: "emerald" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={`rounded-2xl bg-white/3 border border-${color}-500/15 p-5 hover:border-${color}-500/30 transition-colors`}>
              <div className={`w-9 h-9 rounded-lg bg-${color}-500/15 flex items-center justify-center mb-3`}>
                <Icon size={16} className={`text-${color}-400`} />
              </div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="relative text-center text-xs text-white/20 pb-6">
        AI-Adaptive Onboarding Engine · IISC Hackathon 2026
      </footer>
    </main>
  );
}

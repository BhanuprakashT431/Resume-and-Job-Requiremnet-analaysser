"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, ArrowRight, Brain, BarChart3, GitBranch, Shield,
  Upload, Cpu, Map, ChevronRight, Star, CheckCircle2,
} from "lucide-react";
import SplitText from "@/components/SplitText";
import { useInView } from "@/hooks/useInView";

/* ─────────────────────────────────────────────────────────────────
   useScrollReveal — attaches IntersectionObserver to every
   [data-animate] element inside a container ref, adding ".in-view"
   with a configurable per-element delay.
───────────────────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-animate]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay ?? "0";
            setTimeout(() => el.classList.add("in-view"), Number(delay));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────────────────────────
   Animated stat counter — runs when element scrolls into view
───────────────────────────────────────────────────────────────── */
function StatCounter({
  target, suffix, label,
}: { target: number; suffix: string; label: string }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const iv = setInterval(() => {
      current += increment;
      if (current >= target) { setValue(target); clearInterval(iv); }
      else setValue(Math.floor(current));
    }, 1800 / steps);
    return () => clearInterval(iv);
  }, [inView, target]);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="text-center"
      data-animate="fade-up"
    >
      <p
        className="text-5xl font-extrabold tabular-nums"
        style={{
          background: "linear-gradient(135deg,#8b5cf6,#38bdf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {value}{suffix}
      </p>
      <p className="text-sm text-white/40 mt-2">{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main landing page
───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();

  // Activate the global scroll-reveal system
  useScrollReveal();

  return (
    <div className="min-h-screen bg-[#080812] text-white overflow-x-hidden">

      {/* ── Background ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <svg className="absolute inset-0 w-full h-full animate-grid" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lp-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lp-grid)" />
        </svg>
        <div className="animate-orb-1 absolute -top-60 -left-20 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />
        <div className="animate-orb-2 absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)" }} />
        <div className="animate-orb-3 absolute -bottom-40 left-1/4 w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(217,70,239,0.12) 0%, transparent 70%)" }} />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 ring-1 ring-violet-500/40 flex items-center justify-center">
            <Zap size={16} className="text-violet-400" />
          </div>
          <span className="font-bold text-sm text-white">AOEngine</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          {["Features", "How it Works", "About"].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2">
            Sign In
          </a>
          <a href="/login"
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#7c3aed,#0ea5e9)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
            Get Started <ChevronRight size={14} />
          </a>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">

        {/* Badge — fade-up */}
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-widest
                     bg-violet-500/10 border border-violet-500/25 rounded-full px-4 py-1.5 mb-8"
          data-animate="fade-up" data-delay="0"
        >
          <Star size={11} className="fill-violet-400" /> IISc Hackathon 2026 Project
        </div>

        {/* Headline — word-by-word reveal */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.08] tracking-tight mb-6">
          <span className="block">
            <SplitText delay={0.05} stagger={0.07}>Bridge the gap</SplitText>
          </span>
          <span className="block">
            <SplitText delay={0.25} stagger={0.07}>between you &amp;</SplitText>
          </span>
          <span
            className="block"
            style={{ background: "linear-gradient(135deg,#c084fc,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            <SplitText delay={0.45} stagger={0.08}>your dream role.</SplitText>
          </span>
        </h1>

        {/* Subheadline — fade-up on scroll */}
        <p
          className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-10"
          data-animate="fade-up" data-delay="200"
        >
          Upload your resume &amp; job description. Our AI engine extracts skills,
          maps gaps with interactive charts, and builds a personalized week-by-week
          learning roadmap —{" "}
          <span className="text-white/70 font-medium">in seconds.</span>
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap items-center justify-center gap-4"
          data-animate="fade-up" data-delay="350"
        >
          <button
            onClick={() => router.push("/login")}
            className="group relative overflow-hidden flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-base text-white transition-all duration-300 hover:scale-105"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5,#0ea5e9)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}
          >
            {/* shimmer */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative flex items-center gap-2">
              Start for Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <a href="#how-it-works"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base text-white/60
                       bg-white/5 ring-1 ring-white/10 hover:text-white hover:bg-white/10 transition-all duration-300">
            How it works
          </a>
        </div>

        <p className="mt-6 text-xs text-white/20" data-animate="fade-up" data-delay="500">
          No credit card needed · Works with PDF &amp; TXT · Open-source LLM
        </p>

        {/* Floating mock dashboard */}
        <div className="relative mt-20 max-w-3xl mx-auto animate-float" data-animate="scale" data-delay="300">
          <div className="rounded-3xl p-[1px]"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.5) 0%, rgba(56,189,248,0.3) 100%)" }}>
            <div className="rounded-3xl bg-[#0d0d1f]/90 backdrop-blur-xl p-6 text-left">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="ml-3 text-xs text-white/20">skill-gap-dashboard.aoe.local</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Kubernetes", current: 20, required: 80, color: "#f43f5e" },
                  { name: "PyTorch",    current: 35, required: 80, color: "#f97316" },
                  { name: "FastAPI",    current: 55, required: 70, color: "#eab308" },
                  { name: "React",      current: 65, required: 75, color: "#8b5cf6" },
                  { name: "Docker",     current: 75, required: 85, color: "#38bdf8" },
                ].map(({ name, current, required, color }) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xs text-white/50 w-24 shrink-0">{name}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 relative overflow-hidden">
                      <div className="h-full rounded-full absolute top-0 left-0"
                        style={{ width: `${required}%`, background: "rgba(255,255,255,0.06)" }} />
                      <div className="h-full rounded-full absolute top-0 left-0 animate-bar"
                        style={{
                          width: `${current}%`, background: color,
                          boxShadow: `0 0 8px ${color}80`,
                          transition: "width 1.4s cubic-bezier(0.22,1,0.36,1)",
                        }} />
                    </div>
                    <span className="text-xs font-medium w-14 text-right" style={{ color }}>
                      {required - current}% gap
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3"
            data-animate="fade-up" data-delay="0">Capabilities</p>
          <h2 className="text-4xl font-extrabold">
            <SplitText delay={0.05} stagger={0.06}>Everything you need,</SplitText>
            <br />
            <SplitText delay={0.35} stagger={0.06}>nothing you don&apos;t.</SplitText>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Cpu, color: "violet", title: "LLM-Powered Extraction",
              desc: "Mistral reads your resume and JD, returning structured JSON of skills, experience levels, and proficiency signals — no templates required." },
            { icon: BarChart3, color: "sky", title: "Visual Gap Analysis",
              desc: "Radar charts compare your proficiency to what the role demands. Bar charts surface top gaps by priority — critical, high, medium, or low." },
            { icon: GitBranch, color: "emerald", title: "Graph-Based Roadmap",
              desc: "Skills are modelled as nodes in a directed acyclic graph (DAG). Prerequisites are always respected so you never skip foundations." },
            { icon: Map, color: "amber", title: "Week-by-Week Plan",
              desc: "Each learning node is scheduled into a weekly plan with estimated hours, curated resources, and status — locked, available, or complete." },
            { icon: Upload, color: "fuchsia", title: "Universal File Support",
              desc: "Upload as PDF or TXT. PyMuPDF handles multi-page PDFs; a keyword heuristic fallback ensures the app works even without a GPU." },
            { icon: Shield, color: "rose", title: "Fully Open Source",
              desc: "No proprietary APIs needed. Run the LLM locally with Ollama, deploy anywhere with Docker Compose, extend the engine with your own logic." },
          ].map(({ icon: Icon, color, title, desc }, i) => (
            <div
              key={title}
              className={`group rounded-2xl bg-white/3 border border-${color}-500/15 p-6
                          hover:border-${color}-500/35 hover:bg-${color}-500/5
                          transition-all duration-300 hover:-translate-y-1.5`}
              data-animate="fade-up"
              data-delay={String(i * 80)}
            >
              <div className={`w-11 h-11 rounded-xl bg-${color}-500/15 ring-1 ring-${color}-500/25 flex items-center justify-center mb-4
                              group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={20} className={`text-${color}-400`} />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3"
            data-animate="fade-up" data-delay="0">Process</p>
          <h2 className="text-4xl font-extrabold">
            <SplitText delay={0.05} stagger={0.06}>From upload to roadmap</SplitText>
            <br />
            <SplitText delay={0.4} stagger={0.06}>in three steps.</SplitText>
          </h2>
        </div>

        <div className="relative">
          {/* Connector */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-[1px] origin-left"
            style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.4), rgba(56,189,248,0.4))" }}
            data-animate="fade-up" data-delay="200" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", color: "violet", icon: Upload,
                title: "Upload Documents",
                desc: "Drop your resume and job description (PDF or TXT). Processed instantly on the server.",
                anim: "fade-left" },
              { step: "02", color: "sky", icon: Brain,
                title: "AI Extracts Skills",
                desc: "Mistral returns a structured JSON of skill names, proficiency levels, and categories.",
                anim: "fade-up" },
              { step: "03", color: "emerald", icon: Map,
                title: "Get Your Roadmap",
                desc: "The engine computes the gap and generates a graph-ordered weekly learning plan.",
                anim: "fade-right" },
            ].map(({ step, color, icon: Icon, title, desc, anim }) => (
              <div key={step}
                className="relative flex flex-col items-center text-center gap-4 group"
                data-animate={anim} data-delay="100">
                <div className={`relative z-10 w-20 h-20 rounded-2xl bg-${color}-500/15 ring-1 ring-${color}-500/30
                                flex items-center justify-center
                                group-hover:scale-110 group-hover:ring-${color}-500/60 transition-all duration-300`}>
                  <Icon size={28} className={`text-${color}-400`} />
                  <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-${color}-500 text-[10px] font-bold text-white flex items-center justify-center`}>
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="rounded-3xl p-[1px]"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.35), rgba(56,189,248,0.2))" }}>
          <div className="rounded-3xl bg-[#0d0d1f]/80 backdrop-blur-xl px-8 py-14">
            <p className="text-center text-xs font-bold text-white/30 uppercase tracking-widest mb-10"
              data-animate="fade-up" data-delay="0">By the numbers</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { target: 12, suffix: "K+", label: "Resumes Analysed" },
                { target: 94, suffix: "%",  label: "Skill Match Rate" },
                { target: 4,  suffix: "wk", label: "Avg Weeks to Ready" },
                { target: 200, suffix: "+", label: "Supported Skills" },
              ].map((s) => (
                <StatCounter key={s.label} {...s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ──────────────────────────────────────────────── */}
      <section id="about" className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-3"
            data-animate="fade-up" data-delay="0">About</p>
          <h2 className="text-4xl font-extrabold mb-4">
            <SplitText delay={0.05} stagger={0.06}>Built for the modern</SplitText>
            <br />
            <SplitText delay={0.5} stagger={0.06}>onboarding challenge.</SplitText>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto leading-relaxed mt-4"
            data-animate="fade-up" data-delay="200">
            Most employees spend weeks figuring out what to learn after joining a new role.
            The AI-Adaptive Onboarding Engine eliminates that ambiguity with a data-driven,
            graph-ordered learning plan generated before day one.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Fully open-source — no vendor lock-in",
            "Graph-based prerequisite engine (DAG)",
            "Works offline with Ollama local LLM",
            "Supports PDF, TXT, and Markdown uploads",
            "Recharts-powered interactive visualizations",
            "Docker Compose for one-command deployment",
          ].map((point, i) => (
            <div key={point}
              className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-xl px-5 py-3.5
                         hover:border-emerald-500/25 hover:bg-emerald-500/4 transition-all duration-300"
              data-animate="fade-left" data-delay={String(i * 60)}>
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span className="text-sm text-white/70">{point}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="rounded-3xl p-[1px]" data-animate="scale" data-delay="0"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.7), rgba(14,165,233,0.5), rgba(217,70,239,0.4))" }}>
          <div className="rounded-3xl bg-[#0d0d1f]/90 backdrop-blur-xl px-8 py-16 space-y-6">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-widest">Get started now</p>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              <SplitText delay={0.05} stagger={0.06}>Start your journey</SplitText>
              <br />
              <span style={{ background: "linear-gradient(135deg,#c084fc,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                <SplitText delay={0.45} stagger={0.07}>to job-readiness.</SplitText>
              </span>
            </h2>
            <p className="text-white/40 max-w-md mx-auto">
              Upload your resume in under 60 seconds and get a tailored learning path powered by AI.
            </p>
            <button onClick={() => router.push("/login")}
              className="group relative overflow-hidden inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{ background: "linear-gradient(135deg,#7c3aed,#0ea5e9)", boxShadow: "0 0 50px rgba(124,58,237,0.5)" }}>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative flex items-center gap-2">
                Create Free Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="text-xs text-white/20">No sign-up friction · 100% open source</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Zap size={14} className="text-violet-400" />
          AI-Adaptive Onboarding Engine · IISc Hackathon 2026
        </div>
        <div className="flex gap-6 text-xs text-white/25">
          <a href="#features" className="hover:text-white/50 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white/50 transition-colors">How it Works</a>
          <a href="/login" className="hover:text-white/50 transition-colors">Sign In</a>
        </div>
      </footer>
    </div>
  );
}

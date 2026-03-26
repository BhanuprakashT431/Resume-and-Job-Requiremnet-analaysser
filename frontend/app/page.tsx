"use client";

import React, { useState, useCallback } from "react";
import UploadZone from "@/components/UploadZone";
import { uploadResume, uploadJD } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Brain, GitBranch, BarChart3 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [resumeDone, setResumeDone] = useState(false);
  const [jdDone, setJdDone] = useState(false);

  const handleResume = useCallback(async (file: File) => {
    await uploadResume(file);
    setResumeDone(true);
  }, []);

  const handleJD = useCallback(async (file: File) => {
    await uploadJD(file);
    setJdDone(true);
  }, []);

  const bothReady = resumeDone && jdDone;

  return (
    <main className="min-h-screen bg-[#080812] text-white flex flex-col">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 left-1/4 w-[700px] h-[700px] rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-600/10 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[300px] h-[300px] rounded-full bg-fuchsia-600/8 blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-5xl mx-auto w-full">
        {/* Hero */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-widest bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
            <Zap size={12} className="animate-pulse" /> AI-Powered Onboarding Engine
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            Close the{" "}
            <span className="bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
              Skill Gap
            </span>
            <br />
            before day one.
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
            Upload your resume and a job description. Our engine extracts skills via LLM,
            maps the gap, and generates a personalized learning roadmap — instantly.
          </p>
        </div>

        {/* Upload zones */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <UploadZone
            label="Your Resume"
            sublabel="PDF or TXT — we extract your current skill levels"
            onUpload={handleResume}
            accentColor="violet"
          />
          <UploadZone
            label="Job Description"
            sublabel="PDF or TXT — we extract the required skill set"
            onUpload={handleJD}
            accentColor="sky"
          />
        </div>

        {/* Analyze button */}
        <button
          onClick={() => router.push("/dashboard")}
          disabled={!bothReady}
          className={`
            flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base
            transition-all duration-300 group
            ${bothReady
              ? "bg-gradient-to-r from-violet-600 to-sky-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 cursor-pointer"
              : "bg-white/5 text-white/20 cursor-not-allowed ring-1 ring-white/10"
            }
          `}
        >
          Analyze & Build Roadmap
          <ArrowRight size={18} className={`transition-transform duration-200 ${bothReady ? "group-hover:translate-x-1" : ""}`} />
        </button>

        {!bothReady && (
          <p className="text-xs text-white/25 mt-3">
            Upload {!resumeDone ? "resume" : ""}{!resumeDone && !jdDone ? " & " : ""}{!jdDone ? "job description" : ""} to continue
          </p>
        )}

        {/* Feature pills */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {[
            { icon: Brain, title: "LLM Extraction", desc: "Mistral parses skills & experience levels from your documents", color: "violet" },
            { icon: BarChart3, title: "Gap Visualization", desc: "Radar & bar charts show exactly what needs improvement", color: "sky" },
            { icon: GitBranch, title: "Graph Roadmap", desc: "Prerequisite-aware learning path built on a DAG engine", color: "emerald" },
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

      {/* Footer */}
      <footer className="relative text-center text-xs text-white/20 pb-6">
        AI-Adaptive Onboarding Engine · IISC Hackathon 2026
      </footer>
    </main>
  );
}

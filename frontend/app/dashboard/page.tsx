"use client";

import React, { useEffect, useState } from "react";
import SkillGapChart from "@/components/SkillGapChart";
import RoadmapView from "@/components/RoadmapView";
import { fetchGapAnalysis, type GapResponse } from "@/lib/api";
import { Loader2, AlertCircle, BarChart3, Map } from "lucide-react";

type Tab = "gap" | "roadmap";

export default function DashboardPage() {
  const [data, setData] = useState<GapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("gap");

  useEffect(() => {
    fetchGapAnalysis()
      .then(setData)
      .catch((e) => setError(e?.response?.data?.detail ?? "Could not load analysis."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#080812] text-white">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-64 -left-32 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-64 w-[500px] h-[500px] rounded-full bg-sky-500/8 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Skill Gap Dashboard</h1>
          <p className="text-white/40 mt-1">Your personalized analysis and learning pathway.</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={40} className="text-violet-400 animate-spin" />
            <p className="text-white/40">Running adaptive engine…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-5">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-red-300">Analysis failed</p>
              <p className="text-sm text-red-400/80 mt-1">{error}</p>
              <a href="/" className="text-sm text-violet-400 hover:underline mt-2 inline-block">
                ← Back to upload
              </a>
            </div>
          </div>
        )}

        {/* Data loaded */}
        {data && (
          <>
            {/* Tab switcher */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit border border-white/10">
              {([
                { id: "gap", label: "Skill Gap", Icon: BarChart3 },
                { id: "roadmap", label: "Learning Roadmap", Icon: Map },
              ] as { id: Tab; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${tab === id
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "text-white/40 hover:text-white/70"
                    }`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="animate-in fade-in duration-300">
              {tab === "gap" && <SkillGapChart gap={data.gap} />}
              {tab === "roadmap" && <RoadmapView roadmap={data.roadmap} />}
            </div>

            {/* Back link */}
            <a href="/app" className="inline-block text-sm text-white/30 hover:text-violet-400 transition-colors">
              ← Upload new documents
            </a>
          </>
        )}
      </div>
    </main>
  );
}

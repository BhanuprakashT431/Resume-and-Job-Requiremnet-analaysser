"use client";

import React from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell
} from "recharts";
import type { SkillGap } from "@/lib/api";

interface Props {
  gap: SkillGap;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#f43f5e",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export default function SkillGapChart({ gap }: Props) {
  // Radar data — top 8 skills by gap magnitude
  const radarData = gap.gaps
    .slice(0, 8)
    .map((g) => ({
      subject: g.skill_name,
      Current: Math.max(0, g.current_level),
      Required: g.required_level,
      fullMark: 10,
    }));

  // Bar data — only skills with positive gap, sorted descending
  const barData = [...gap.gaps]
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10);

  return (
    <div className="w-full space-y-8">
      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Skills Required", value: gap.total_skills_required, color: "violet" },
          { label: "Skills Matched", value: gap.total_skills_matched, color: "emerald" },
          { label: "Coverage", value: `${gap.coverage_percentage}%`, color: "sky" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl bg-white/5 border border-${color}-500/20 p-4 text-center`}>
            <p className={`text-3xl font-bold text-${color}-400`}>{value}</p>
            <p className="text-xs text-white/50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4">Skill Proficiency Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
              <Radar name="Current" dataKey="Current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Radar name="Required" dataKey="Required" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white/70 mb-4">Top Skill Gaps</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
              <YAxis dataKey="skill_name" type="category" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} width={90} />
              <Tooltip
                contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
              formatter={(v) => [`Gap: ${(Number(v) || 0).toFixed(1)}`, ""] as [string, string]}
              />
              <Bar dataKey="gap" radius={[0, 6, 6, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] ?? "#8b5cf6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {Object.entries(PRIORITY_COLORS).map(([p, c]) => (
              <span key={p} className="flex items-center gap-1 text-xs text-white/50">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import type { LearningRoadmap, RoadmapNode } from "@/lib/api";
import { Clock, Lock, CheckCircle2, PlayCircle, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  roadmap: LearningRoadmap;
}

const STATUS_CONFIG = {
  locked:      { icon: Lock,          color: "text-white/30",  bg: "bg-white/5",       ring: "ring-white/10",     label: "Locked"      },
  available:   { icon: PlayCircle,    color: "text-violet-400", bg: "bg-violet-500/10", ring: "ring-violet-500/30", label: "Start Now"  },
  in_progress: { icon: PlayCircle,    color: "text-sky-400",    bg: "bg-sky-500/10",    ring: "ring-sky-500/30",   label: "In Progress" },
  complete:    { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30", label: "Complete" },
} as const;

function NodeCard({ node, isExpanded, onToggle }: {
  node: RoadmapNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = STATUS_CONFIG[node.status];
  const Icon = config.icon;
  const isLocked = node.status === "locked";

  return (
    <div
      className={`
        relative rounded-xl border ${config.bg} ring-1 ${config.ring}
        transition-all duration-300 cursor-pointer
        ${isLocked ? "opacity-60" : "hover:scale-[1.01] hover:shadow-lg hover:shadow-violet-500/10"}
      `}
      onClick={onToggle}
    >
      {/* Top row */}
      <div className="flex items-start gap-4 p-4">
        <div className={`p-2 rounded-lg ${config.bg} ring-1 ${config.ring} shrink-0`}>
          <Icon size={18} className={config.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white truncate">{node.title}</h4>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ring-1 ${config.ring} ${config.color} shrink-0`}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">{node.skill_name}</p>
        </div>

        <div className="shrink-0 text-white/30">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expandable detail */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <p className="text-xs text-white/60 leading-relaxed">{node.description}</p>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <Clock size={12} /> <span>{node.estimated_hours} hours estimated</span>
          </div>

          {node.prerequisites.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Prerequisites</p>
              <div className="flex flex-wrap gap-1">
                {node.prerequisites.map((p) => (
                  <span key={p} className="text-[10px] bg-white/5 rounded px-2 py-0.5 text-white/40">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {node.resources.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Resources</p>
              <ul className="space-y-1">
                {node.resources.map((r) => (
                  <li key={r} className="flex items-center gap-1.5 text-[11px] text-violet-400">
                    <BookOpen size={10} /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RoadmapView({ roadmap }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group nodes by week
  const weeks = Array.from({ length: roadmap.total_weeks }, (_, i) => i + 1);
  const byWeek = (week: number) => roadmap.nodes.filter((n) => n.week === week);

  const weekColors = ["violet", "sky", "emerald", "amber"];

  return (
    <div className="w-full space-y-6">
      {/* Header stats */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Total Weeks", value: roadmap.total_weeks },
          { label: "Total Hours", value: roadmap.total_hours },
          { label: "Learning Nodes", value: roadmap.nodes.length },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className="text-white/40">{label}</span>
          </div>
        ))}
        {Boolean(roadmap.metadata?.mock) && (
          <span className="ml-auto text-[10px] bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 rounded-full px-3 py-1">
            Mock Data — Adaptive Engine Stub Active
          </span>
        )}
      </div>

      {/* Week-by-week columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {weeks.map((week, wi) => {
          const color = weekColors[wi % weekColors.length];
          const nodes = byWeek(week);
          return (
            <div key={week} className={`rounded-2xl border border-${color}-500/20 bg-${color}-500/5 p-4`}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-bold text-${color}-400 uppercase tracking-widest`}>
                  Week {week}
                </span>
                <span className="text-xs text-white/20">
                  {nodes.reduce((s, n) => s + n.estimated_hours, 0)}h
                </span>
              </div>

              {nodes.length === 0 ? (
                <p className="text-xs text-white/20 italic">No nodes assigned</p>
              ) : (
                <div className="space-y-2">
                  {nodes.map((node) => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      isExpanded={expandedId === node.id}
                      onToggle={() => setExpandedId(expandedId === node.id ? null : node.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

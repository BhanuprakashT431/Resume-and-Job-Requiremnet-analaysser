/**
 * lib/api.ts — Typed API wrappers for the FastAPI backend.
 */

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export const api = axios.create({ baseURL: BASE_URL });

// ── Types ──────────────────────────────────────────────────────────────────

export interface Skill {
  name: string;
  level: number;
  category: string;
  years_of_experience: number | null;
}

export interface SkillSet {
  source: string;
  skills: Skill[];
  raw_text_preview: string | null;
}

export interface SkillGapItem {
  skill_name: string;
  category: string;
  current_level: number;
  required_level: number;
  gap: number;
  priority: "critical" | "high" | "medium" | "low";
}

export interface SkillGap {
  total_skills_required: number;
  total_skills_matched: number;
  coverage_percentage: number;
  gaps: SkillGapItem[];
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  skill_name: string;
  estimated_hours: number;
  status: "locked" | "available" | "in_progress" | "complete";
  prerequisites: string[];
  resources: string[];
  week: number;
}

export interface LearningRoadmap {
  total_weeks: number;
  total_hours: number;
  nodes: RoadmapNode[];
  metadata: Record<string, unknown>;
}

export interface GapResponse {
  gap: SkillGap;
  roadmap: LearningRoadmap;
}

// ── API Functions ──────────────────────────────────────────────────────────
export async function uploadResume(file: File): Promise<SkillSet> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<SkillSet>("/api/upload/resume", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function uploadJD(file: File): Promise<SkillSet> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<SkillSet>("/api/upload/jd", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchGapAnalysis(): Promise<GapResponse> {
  const { data } = await api.get<GapResponse>("/api/gap");
  return data;
}

export async function resetState(): Promise<void> {
  await api.delete("/api/reset");
}

/**
 * lib/api.ts — Typed API wrappers for the FastAPI backend.
 */

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({ baseURL: BASE_URL });

// Inject Bearer token on every request if present
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("aoe_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  dob: string | null;
  graduation_type: string | null;
  photo_url: string | null;
  member_since: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// ── Auth API ──────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password });
  return data;
}

export async function registerUser(formData: FormData): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/auth/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/api/auth/me");
  return data;
}

export async function updateProfile(body: {
  name?: string;
  dob?: string;
  graduation_type?: string;
}): Promise<UserProfile> {
  const { data } = await api.put<UserProfile>("/api/auth/profile", body);
  return data;
}

export async function uploadProfilePhoto(file: File): Promise<UserProfile> {
  const form = new FormData();
  form.append("photo", file);
  const { data } = await api.post<UserProfile>("/api/auth/photo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ── Document API ──────────────────────────────────────────────────────────

export async function uploadResume(file: File): Promise<SkillSet> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<SkillSet>("/api/upload/resume", form);
  return data;
}

export async function uploadJD(file: File): Promise<SkillSet> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<SkillSet>("/api/upload/jd", form);
  return data;
}

export async function fetchGapAnalysis(): Promise<GapResponse> {
  const { data } = await api.get<GapResponse>("/api/gap");
  return data;
}

export async function resetState(): Promise<void> {
  await api.delete("/api/reset");
}

// ── Helpers ───────────────────────────────────────────────────────────────

export function saveSession(resp: AuthResponse): void {
  localStorage.setItem("aoe_token", resp.token);
  localStorage.setItem("aoe_user", JSON.stringify(resp.user));
}

export function clearSession(): void {
  localStorage.removeItem("aoe_token");
  localStorage.removeItem("aoe_user");
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("aoe_user");
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function getPhotoUrl(user: UserProfile | null): string {
  if (!user?.photo_url) return "";
  return `${BASE_URL}${user.photo_url}`;
}

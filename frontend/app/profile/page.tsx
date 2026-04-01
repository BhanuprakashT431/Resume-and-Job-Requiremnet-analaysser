"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Camera, CheckCircle2, Edit3, GraduationCap,
  Calendar, Mail, User2, Clock, Save, X, Loader2, Zap,
} from "lucide-react";
import { getProfile, updateProfile, uploadProfilePhoto, getPhotoUrl, saveSession, clearSession } from "@/lib/api";
import type { UserProfile } from "@/lib/api";

const GRADUATION_TYPES = [
  "B.Tech / B.E.", "M.Tech / M.E.", "B.Sc", "M.Sc",
  "MBA", "MCA", "BCA", "B.Com", "M.Com", "Ph.D", "Diploma", "Other",
];

function formatDOB(dob: string | null): string {
  if (!dob) return "—";
  try {
    const d = new Date(dob + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return dob;
  }
}

function getAge(dob: string | null): string {
  if (!dob) return "";
  try {
    const birth = new Date(dob);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear() -
      (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate()) ? 1 : 0);
    return `${age} years old`;
  } catch { return ""; }
}

function Avatar({ user, size = 96 }: { user: UserProfile | null; size?: number }) {
  const initials = (user?.name ?? "")
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const photoUrl = getPhotoUrl(user);

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt={user?.name ?? "Profile"} width={size} height={size}
        className="rounded-full object-cover ring-4 ring-violet-500/30"
        style={{ width: size, height: size }} />
    );
  }
  return (
    <div className="rounded-full ring-4 ring-violet-500/30 flex items-center justify-center font-bold text-white select-none"
      style={{
        width: size, height: size, fontSize: size * 0.35,
        background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
      }}>
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGrad, setEditGrad] = useState("");

  useEffect(() => {
    getProfile()
      .then((u) => {
        setUser(u);
        setEditName(u.name);
        setEditDob(u.dob ?? "");
        setEditGrad(u.graduation_type ?? "");
      })
      .catch(() => { clearSession(); router.push("/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function startEdit() {
    if (!user) return;
    setEditName(user.name);
    setEditDob(user.dob ?? "");
    setEditGrad(user.graduation_type ?? "");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateProfile({ name: editName, dob: editDob || undefined, graduation_type: editGrad || undefined });
      setUser(updated);
      localStorage.setItem("aoe_user", JSON.stringify(updated));
      showToast("Profile updated successfully!");
    } catch { showToast("Failed to save. Try again."); }
    finally { setSaving(false); setEditing(false); }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const updated = await uploadProfilePhoto(file);
      setUser(updated);
      localStorage.setItem("aoe_user", JSON.stringify(updated));
      showToast("Photo updated!");
    } catch { showToast("Photo upload failed."); }
    finally { setPhotoLoading(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080812] flex items-center justify-center">
        <Loader2 size={32} className="text-violet-400 animate-spin" />
      </div>
    );
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all";

  return (
    <main className="min-h-screen bg-[#080812] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="animate-orb-1 absolute -top-60 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
        <div className="animate-orb-2 absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)" }} />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-sm px-5 py-3 rounded-2xl shadow-lg animate-fade-up backdrop-blur-xl">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* Nav */}
      <nav className="relative z-10 max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <div className="flex items-center gap-2 text-sm font-semibold text-white/60">
          <Zap size={14} className="text-violet-400" /> AI Onboarding Engine
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20 space-y-6">

        {/* ── Profile header card ───────────────────────────────── */}
        <div className="rounded-3xl p-[1px]"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.5), rgba(56,189,248,0.3))" }}>
          <div className="rounded-3xl bg-[#0d0d1f]/90 backdrop-blur-xl overflow-hidden">
            {/* Banner */}
            <div className="h-36 relative"
              style={{ background: "linear-gradient(135deg, #1e0a4f 0%, #0a1a3f 50%, #0a2a4f 100%)" }}>
              {/* Grid overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="prof-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(139,92,246,0.5)" strokeWidth="0.5" />
                </pattern></defs>
                <rect width="100%" height="100%" fill="url(#prof-grid)" />
              </svg>
              {/* Graduate cap decoration */}
              <div className="absolute top-4 right-6 opacity-10">
                <GraduationCap size={64} className="text-violet-400" />
              </div>
            </div>

            {/* Avatar + actions (overlapping banner) */}
            <div className="px-8 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                {/* Avatar with photo change */}
                <div className="relative shrink-0">
                  <Avatar user={user} size={100} />
                  <button onClick={() => photoRef.current?.click()}
                    disabled={photoLoading}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-violet-600 ring-2 ring-[#0d0d1f]
                               flex items-center justify-center hover:bg-violet-500 transition-colors disabled:opacity-50">
                    {photoLoading
                      ? <Loader2 size={14} className="animate-spin text-white" />
                      : <Camera size={14} className="text-white" />}
                  </button>
                  <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>

                {/* Name + badge */}
                <div className="flex-1 min-w-0 mt-4 sm:mt-0 sm:mb-2">
                  <h1 className="text-2xl font-extrabold text-white truncate">{user?.name ?? "User"}</h1>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {user?.graduation_type && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 bg-violet-500/15 border border-violet-500/25 rounded-full px-3 py-1">
                        <GraduationCap size={11} /> {user.graduation_type}
                      </span>
                    )}
                    {user?.member_since && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 bg-sky-500/15 border border-sky-500/25 rounded-full px-3 py-1">
                        <Clock size={11} /> Member since {user.member_since}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit / Save / Cancel */}
                <div className="flex gap-2 shrink-0">
                  {editing ? (
                    <>
                      <button onClick={() => setEditing(false)}
                        className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white bg-white/5 border border-white/10 rounded-xl px-4 py-2 transition-all">
                        <X size={13} /> Cancel
                      </button>
                      <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white rounded-xl px-4 py-2 transition-all disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg,#7c3aed,#0ea5e9)" }}>
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        {saving ? "Saving…" : "Save Changes"}
                      </button>
                    </>
                  ) : (
                    <button onClick={startEdit}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/8 border border-white/15 rounded-xl px-4 py-2 hover:bg-white/15 transition-all">
                      <Edit3 size={13} /> Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Details grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Full Name */}
          <div className="rounded-2xl bg-white/3 border border-white/8 p-5 space-y-2 hover:border-violet-500/25 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
              <User2 size={13} className="text-violet-400" /> Full Name
            </div>
            {editing ? (
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                className={inputCls} placeholder="Your full name" />
            ) : (
              <p className="text-white font-semibold text-lg">{user?.name ?? "—"}</p>
            )}
          </div>

          {/* Email */}
          <div className="rounded-2xl bg-white/3 border border-white/8 p-5 space-y-2 hover:border-sky-500/25 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
              <Mail size={13} className="text-sky-400" /> Email Address
            </div>
            <p className="text-white font-semibold text-lg">{user?.email ?? "—"}</p>
            <p className="text-xs text-white/30">Email cannot be changed</p>
          </div>

          {/* Date of Birth */}
          <div className="rounded-2xl bg-white/3 border border-white/8 p-5 space-y-2 hover:border-emerald-500/25 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
              <Calendar size={13} className="text-emerald-400" /> Date of Birth
            </div>
            {editing ? (
              <input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className={`${inputCls} [color-scheme:dark]`} />
            ) : (
              <>
                <p className="text-white font-semibold text-lg">{formatDOB(user?.dob ?? null)}</p>
                {user?.dob && <p className="text-xs text-white/30">{getAge(user.dob)}</p>}
              </>
            )}
          </div>

          {/* Graduation Type */}
          <div className="rounded-2xl bg-white/3 border border-white/8 p-5 space-y-2 hover:border-amber-500/25 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
              <GraduationCap size={13} className="text-amber-400" /> Graduation Type
            </div>
            {editing ? (
              <select value={editGrad} onChange={(e) => setEditGrad(e.target.value)}
                className={`${inputCls} cursor-pointer`}>
                <option value="" className="bg-[#0d0d1f]">Select…</option>
                {GRADUATION_TYPES.map((g) => (
                  <option key={g} value={g} className="bg-[#0d0d1f]">{g}</option>
                ))}
              </select>
            ) : (
              <p className="text-white font-semibold text-lg">{user?.graduation_type ?? "—"}</p>
            )}
          </div>
        </div>

        {/* ── Account meta ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/3 border border-white/8 p-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle2 size={13} className="text-violet-400" /> Account Details
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-white/40 text-xs mb-1">User ID</p>
              <p className="text-white font-mono">#{user?.id}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Member Since</p>
              <p className="text-white">{user?.member_since ?? "—"}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Status</p>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            </div>
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => router.push("/app")}
            className="flex items-center gap-2 text-sm font-medium text-white/70 bg-white/5 border border-white/10 rounded-xl px-5 py-2.5 hover:text-white hover:bg-white/10 transition-all">
            ← Upload Documents
          </button>
          <button onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-white/70 bg-white/5 border border-white/10 rounded-xl px-5 py-2.5 hover:text-white hover:bg-white/10 transition-all">
            View Dashboard →
          </button>
        </div>
      </div>
    </main>
  );
}

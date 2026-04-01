"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, ArrowRight, Lock, Mail, User2, Calendar,
  GraduationCap, Camera, Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import { registerUser, saveSession } from "@/lib/api";

const GRADUATION_TYPES = [
  "B.Tech / B.E.", "M.Tech / M.E.", "B.Sc", "M.Sc",
  "MBA", "MCA", "BCA", "B.Com", "M.Com", "Ph.D", "Diploma", "Other",
];

function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg className="absolute inset-0 w-full h-full animate-grid" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="reg-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(56,189,248,0.25)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#reg-grid)" />
      </svg>
      <div className="animate-orb-2 absolute -top-48 right-0 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)" }} />
      <div className="animate-orb-1 absolute bottom-0 -left-20 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />
      <div className="animate-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(217,70,239,0.06) 0%, transparent 70%)" }} />
    </div>
  );
}

/* Field wrapper */
function Field({ id, label, icon: Icon, children }: {
  id?: string; label: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
        <Icon size={11} className="text-sky-400" />{label}
      </label>
      {children}
    </div>
  );
}

const inputCls = (extra = "") =>
  `w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-4 py-3 text-sm text-white
   placeholder:text-white/20 focus:outline-none focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 transition-all ${extra}`;

export default function RegisterPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [dob, setDob] = useState("");
  const [gradType, setGradType] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Full name is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim().toLowerCase());
      fd.append("password", password);
      if (dob) fd.append("dob", dob);
      if (gradType) fd.append("graduation_type", gradType);
      if (photo) fd.append("photo", photo);

      const resp = await registerUser(fd);
      saveSession(resp);
      router.push("/app");
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { detail?: string } } };
      setError(axErr?.response?.data?.detail ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* Initials avatar */
  const initials = name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

  return (
    <main className="min-h-screen bg-[#080812] flex items-center justify-center px-4 py-12">
      <Background />

      <div className="animate-fade-up relative z-10 w-full max-w-lg" style={{ animationFillMode: "both" }}>
        {/* Gradient border card */}
        <div className="rounded-3xl p-[1px]"
          style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.5) 0%, rgba(139,92,246,0.4) 60%, rgba(217,70,239,0.3) 100%)" }}>
          <div className="rounded-3xl bg-[#0d0d1f]/95 backdrop-blur-2xl px-8 py-10 space-y-7">

            {/* Brand */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/15 ring-1 ring-sky-500/30 mb-2">
                <Zap size={22} className="text-sky-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Create your account</h1>
              <p className="text-sm text-white/40">
                Join the <span className="text-sky-400 font-medium">AI-Adaptive Onboarding Engine</span>
              </p>
            </div>

            {/* Photo picker */}
            <div className="flex flex-col items-center gap-3">
              <button type="button" onClick={() => photoRef.current?.click()}
                className="relative group w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-sky-500/50 transition-all duration-300">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-sky-500/10 gap-1">
                    <Camera size={20} className="text-sky-400" />
                    <span className="text-[10px] text-sky-400 font-medium">{initials || "Photo"}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera size={18} className="text-white" />
                </div>
              </button>
              <p className="text-xs text-white/30">Click to upload a profile photo</p>
              <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1 — Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" icon={User2} id="reg-name">
                  <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name" required autoComplete="name"
                    className={inputCls()} />
                </Field>
                <Field label="Email" icon={Mail} id="reg-email">
                  <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required autoComplete="email"
                    className={inputCls()} />
                </Field>
              </div>

              {/* Password */}
              <Field label="Password" icon={Lock} id="reg-password">
                <div className="relative group">
                  <input id="reg-password" type={showPass ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters" required autoComplete="new-password"
                    className={inputCls("pr-12")} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Strength indicator */}
                <div className="flex gap-1 mt-1.5">
                  {[6, 9, 12].map((len, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      password.length >= len
                        ? i === 0 ? "bg-red-500" : i === 1 ? "bg-yellow-500" : "bg-emerald-500"
                        : "bg-white/10"
                    }`} />
                  ))}
                  <span className="text-[10px] text-white/30 ml-1 self-center">
                    {password.length < 6 ? "Weak" : password.length < 9 ? "Fair" : password.length < 12 ? "Good" : "Strong"}
                  </span>
                </div>
              </Field>

              {/* Row 2 — DOB + Graduation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Date of Birth" icon={Calendar} id="reg-dob">
                  <input id="reg-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className={`${inputCls()} [color-scheme:dark]`} />
                </Field>
                <Field label="Graduation Type" icon={GraduationCap} id="reg-grad">
                  <select id="reg-grad" value={gradType} onChange={(e) => setGradType(e.target.value)}
                    className={`${inputCls()} cursor-pointer`}>
                    <option value="" className="bg-[#0d0d1f]">Select…</option>
                    {GRADUATION_TYPES.map((g) => (
                      <option key={g} value={g} className="bg-[#0d0d1f]">{g}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="relative group w-full py-3.5 rounded-xl font-semibold text-sm text-white overflow-hidden
                           transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60
                           focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #7c3aed)", boxShadow: "0 0 30px rgba(14,165,233,0.35)" }}>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700
                                bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating account…</>
                  ) : (
                    <><CheckCircle2 size={15} />Create Account <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </span>
              </button>
            </form>

            <p className="text-center text-xs text-white/30">
              Already have an account?{" "}
              <a href="/login" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">Sign in</a>
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

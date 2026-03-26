"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle2, Loader2, FileText, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  label: string;
  sublabel: string;
  onUpload: (file: File) => Promise<void>;
  accentColor: string; // Tailwind color class e.g. "violet" | "emerald"
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function UploadZone({ label, sublabel, onUpload, accentColor }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFileName(file.name);
    setState("uploading");
    setErrorMsg(null);
    try {
      await onUpload(file);
      setState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setErrorMsg(msg);
      setState("error");
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxFiles: 1,
    disabled: state === "uploading",
  });

  const borderColor = isDragActive
    ? `border-${accentColor}-400`
    : state === "success"
    ? "border-emerald-500"
    : state === "error"
    ? "border-red-500"
    : `border-white/20 hover:border-${accentColor}-400`;

  const glowColor =
    state === "success"
      ? "shadow-emerald-500/20"
      : state === "error"
      ? "shadow-red-500/20"
      : isDragActive
      ? `shadow-${accentColor}-500/30`
      : "shadow-transparent";

  return (
    <div
      {...getRootProps()}
      className={`
        relative group cursor-pointer rounded-2xl border-2 border-dashed
        bg-white/5 backdrop-blur-sm p-8 transition-all duration-300
        shadow-lg ${glowColor} ${borderColor}
        flex flex-col items-center justify-center gap-4 min-h-[220px]
        ${state === "uploading" ? "pointer-events-none opacity-75" : ""}
      `}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <div className={`p-4 rounded-full bg-${accentColor}-500/10 transition-colors duration-300 group-hover:bg-${accentColor}-500/20`}>
        {state === "uploading" && <Loader2 size={32} className={`text-${accentColor}-400 animate-spin`} />}
        {state === "success" && <CheckCircle2 size={32} className="text-emerald-400" />}
        {state === "error" && <AlertCircle size={32} className="text-red-400" />}
        {state === "idle" && (
          isDragActive
            ? <UploadCloud size={32} className={`text-${accentColor}-400 animate-bounce`} />
            : <UploadCloud size={32} className={`text-${accentColor}-400`} />
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-lg font-semibold text-white">{label}</p>
        <p className="text-sm text-white/50 mt-1">{sublabel}</p>
      </div>

      {/* Status */}
      {state === "idle" && (
        <p className="text-xs text-white/30">Drop PDF or TXT here, or click to browse</p>
      )}
      {state === "uploading" && (
        <p className="text-xs text-white/50 flex items-center gap-2">
          <Loader2 size={12} className="animate-spin" /> Extracting skills…
        </p>
      )}
      {state === "success" && fileName && (
        <p className="text-xs text-emerald-400 flex items-center gap-1">
          <FileText size={12} /> {fileName} — Skills extracted!
        </p>
      )}
      {state === "error" && (
        <p className="text-xs text-red-400">{errorMsg ?? "Something went wrong. Try again."}</p>
      )}

      {/* Drag overlay */}
      {isDragActive && (
        <div className={`absolute inset-0 rounded-2xl bg-${accentColor}-500/10 border-2 border-${accentColor}-400 flex items-center justify-center`}>
          <p className={`text-${accentColor}-300 font-semibold`}>Drop it here!</p>
        </div>
      )}
    </div>
  );
}

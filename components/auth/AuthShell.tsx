"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Globe, Loader2 } from "lucide-react";

/** Page frame shared by login, register, verify and reset screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] -top-[20%] h-[70%] w-[70%] rounded-full bg-primary-900/10 blur-[120px]" />
        <div className="absolute -right-[10%] top-[40%] h-[60%] w-[60%] rounded-full bg-indigo-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="mb-8 space-y-2 text-center">
          <Link href="/" className="group inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 shadow-lg shadow-primary-500/20 transition-transform duration-300 group-hover:scale-110">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Travel Buddy</span>
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          {children}
          {footer && <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-slate-400">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function FormMessage({ error, notice }: { error?: string | null; notice?: string | null }) {
  if (!error && !notice) return null;
  const isError = Boolean(error);
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`animate-in flex items-start gap-3 rounded-xl border p-3 text-xs ${
        isError
          ? "border-rose-500/20 bg-rose-500/10 text-rose-200"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <p className="leading-relaxed">{error || notice}</p>
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
  loadingText,
  disabled,
  variant = "primary",
}: {
  loading: boolean;
  children: ReactNode;
  loadingText: string;
  disabled?: boolean;
  variant?: "primary" | "danger";
}) {
  const color =
    variant === "danger"
      ? "bg-rose-600 hover:bg-rose-500 shadow-rose-500/25"
      : "bg-primary-600 hover:bg-primary-500 shadow-primary-500/25";
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60 ${color}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

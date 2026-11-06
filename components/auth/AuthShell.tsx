"use client";

import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Brand from "@/components/Brand";
import ThemeToggle from "@/components/ThemeToggle";
import TripArt from "@/components/TripArt";

/** Two column auth layout: the form on the left, an illustration (or the test accounts) on the right. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  aside,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="frame flex min-h-[72px] items-center justify-between">
        <Brand />
        <ThemeToggle />
      </header>

      <div className="frame grid items-center gap-12 pb-16 pt-4 lg:min-h-[calc(100vh-150px)] lg:grid-cols-2 lg:gap-24">
        <div className="mx-auto w-full max-w-[420px]">
          <h1 className="display text-[clamp(38px,4.4vw,56px)]">
            {title}
            <span className="accent">.</span>
          </h1>
          {subtitle && <p className="mt-3 text-[15px] leading-relaxed text-muted">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
        </div>

        {/* A custom panel (the test accounts) shows on every screen size; the decorative art is desktop-only */}
        <aside className={`mx-auto w-full ${aside ? "max-w-[420px] lg:max-w-[560px]" : "hidden max-w-[560px] lg:block"}`}>{aside ?? <TripArt />}</aside>
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
      className={`animate-in flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
        isError
          ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
      }`}
    >
      {isError ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
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
  const color = variant === "danger" ? "bg-rose-600 text-on-brand hover:bg-rose-500" : "btn-primary";
  return (
    <button type="submit" disabled={loading || disabled} className={`btn w-full py-3.5 ${color}`}>
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

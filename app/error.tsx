"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center" role="alert">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-white">Something went wrong</h1>
      <p className="mt-3 max-w-md text-slate-400">
        An unexpected error stopped this page from loading. You can try again or head back home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-on-brand transition hover:bg-primary-500"
        >
          Try again
        </button>
        <Link href="/" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/15 transition hover:ring-white/30">
          Go home
        </Link>
      </div>
    </div>
  );
}

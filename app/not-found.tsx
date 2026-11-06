import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10 text-primary-400">
        <Compass className="h-8 w-8" />
      </div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-primary-400">404</p>
      <h1 className="mt-2 text-3xl font-bold text-white">This page took a wrong turn</h1>
      <p className="mt-3 max-w-md text-slate-400">
        The page you are looking for does not exist or has moved. Let&apos;s get you back on the trail.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-on-brand transition hover:bg-primary-500">
          Go home
        </Link>
        <Link href="/explore" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/15 transition hover:ring-white/30">
          Explore trips
        </Link>
      </div>
    </div>
  );
}

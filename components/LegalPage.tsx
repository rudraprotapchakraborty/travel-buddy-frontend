import Link from "next/link";
import { ReactNode } from "react";

export interface LegalSection {
  title: string;
  body: ReactNode;
}

/** Shared layout for the privacy policy and terms pages. */
export default function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-12 sm:px-6">
      <header className="border-b border-line pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {updated}</p>
        <p className="mt-6 leading-relaxed text-slate-300">{intro}</p>
      </header>

      <nav aria-label="On this page" className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Contents</p>
        <ol className="grid gap-1.5 text-sm sm:grid-cols-2">
          {sections.map((s, i) => (
            <li key={s.title}>
              <a href={`#section-${i + 1}`} className="text-slate-400 transition-colors hover:text-primary-400">
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map((s, i) => (
          <section key={s.title} id={`section-${i + 1}`} className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-slate-100">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-3 space-y-3 leading-relaxed text-slate-400 [&_a]:text-primary-400 [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-slate-200">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-slate-500">
        <Link href="/privacy" className="hover:text-primary-400">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-primary-400">Terms of Service</Link>
        <Link href="/contact" className="hover:text-primary-400">Contact us</Link>
      </footer>
    </div>
  );
}

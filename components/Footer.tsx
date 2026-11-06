import Link from "next/link";
import Brand from "./Brand";

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Travel",
    links: [
      { href: "/explore", label: "Explore trips" },
      { href: "/travel-plans/add", label: "Plan a trip" },
      { href: "/join-requests", label: "Join requests" },
      { href: "/blog", label: "Travel blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/privacy#section-8", label: "Security" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="frame grid gap-12 py-14 md:grid-cols-[1.4fr_2fr]">
        <div className="max-w-sm">
          <Brand />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Find people heading the same way, plan the journey together and make the trip about the company as much as the
            destination.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="eyeline">{col.title}</h2>
              <ul className="mt-5 space-y-3 text-sm font-medium">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-muted transition-colors hover:text-ink hover:underline hover:underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="frame flex flex-col items-start justify-between gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Travel Buddy. All rights reserved.</p>
          <p>Meet in public places and share your plans with someone you trust.</p>
        </div>
      </div>
    </footer>
  );
}

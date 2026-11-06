"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, CreditCard, LayoutDashboard, LogOut, Menu, Settings, User, X } from "lucide-react";
import { useAuth } from "./AuthContext";
import Avatar from "./Avatar";
import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";

type NavItem = { href: string; label: string; exact?: boolean };

const guestLinks: NavItem[] = [
  { href: "/explore", label: "Explore" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const memberLinks: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Explore" },
  { href: "/travel-plans", label: "My trips" },
  { href: "/join-requests", label: "Requests" },
  { href: "/blog", label: "Blog" },
];

const adminLinks: NavItem[] = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/users", label: "Members" },
  { href: "/admin/travel-plans", label: "Trips" },
  { href: "/explore", label: "Explore" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [mobileOpenAt, setMobileOpenAt] = useState<string | null>(null);
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menus close on navigation because they remember where they were opened
  const mobileOpen = mobileOpenAt === pathname;
  const menuOpen = menuOpenAt === pathname;

  const links = !user ? guestLinks : user.role === "ADMIN" ? adminLinks : memberLinks;
  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenAt(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpenAt(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const cta = user
    ? { href: user.role === "ADMIN" ? "/admin" : "/travel-plans/add", label: user.role === "ADMIN" ? "Admin" : "Plan a trip" }
    : { href: "/register", label: "Get started" };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-xl">
      <div className="frame flex min-h-[72px] items-center justify-between gap-6">
        <Brand />

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                isActive(item) ? "bg-brand-soft text-brand" : "text-muted hover:bg-line/60 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          {loading ? (
            <span className="h-10 w-24 animate-pulse rounded-full bg-line" aria-hidden />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpenAt(menuOpen ? null : pathname)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-line/60"
              >
                <Avatar name={user.fullName} url={user.profileImageUrl} size={36} />
                <ChevronDown className={`hidden h-4 w-4 text-muted transition-transform sm:block ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="animate-in absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/10"
                >
                  <div className="flex items-center gap-3 border-b border-line p-4">
                    <Avatar name={user.fullName} url={user.profileImageUrl} size={40} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-1.5 text-sm font-medium">
                    {[
                      { href: user.role === "ADMIN" ? "/admin" : "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
                      { href: "/profile", label: "My profile", Icon: User },
                      { href: "/settings", label: "Account settings", Icon: Settings },
                      ...(user.role === "ADMIN" ? [] : [{ href: "/payment", label: "Verified plan", Icon: CreditCard }]),
                    ].map(({ href, label, Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        role="menuitem"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-ink transition-colors hover:bg-line/60"
                      >
                        <Icon className="h-4 w-4 text-muted" />
                        {label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpenAt(null);
                        logout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-rose-500 transition-colors hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden px-3 text-sm font-semibold text-ink hover:underline hover:underline-offset-4 sm:block">
              Log in
            </Link>
          )}

          {!loading && (
            <Link href={cta.href} className="btn btn-primary btn-sm hidden sm:inline-flex">
              {cta.label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpenAt(mobileOpen ? null : pathname)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-line/60 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Mobile navigation" className="animate-in border-t border-line bg-paper lg:hidden">
          <div className="frame grid gap-1 py-4">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item) ? "page" : undefined}
                className={`rounded-xl px-4 py-3 text-base font-semibold ${
                  isActive(item) ? "bg-brand-soft text-brand" : "text-ink hover:bg-line/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!user && !loading && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link href="/login" className="btn btn-ghost">
                  Log in
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Get started
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

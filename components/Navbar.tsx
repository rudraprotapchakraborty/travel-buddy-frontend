// Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";

// --- Types ---
type LinkItem = { href: string; label: string; exact?: boolean };

type NavLinkProps = {
  href: string;
  label: string;
  onClick?: () => void;
  exact?: boolean;
};

// --- Components ---

const NavLink = ({ href, label, onClick, exact = false }: NavLinkProps) => {
  const pathname = usePathname();
  const search = useSearchParams();

  const viewingOtherProfile = pathname === "/profile" && Boolean(search?.get("user"));

  const active = exact
    ? pathname === href && !(href === "/profile" && viewingOtherProfile)
    : (pathname === href || pathname.startsWith(href + "/")) &&
      !(href === "/profile" && viewingOtherProfile);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ease-out
        ${
          active
            ? "text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }
      `}
    >
      {label}
    </Link>
  );
};

function getInitials(fullName?: string | null) {
  if (!fullName) return "U";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Avatar = ({ fullName, isAdmin }: { fullName?: string | null; isAdmin?: boolean }) => {
  const initials = getInitials(fullName);

  const baseClass = isAdmin
    ? "h-9 w-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 ring-2 ring-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-rose-500/20"
    : "h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 ring-2 ring-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20";

  return (
    <div className={baseClass} title={fullName ?? "User"} aria-hidden="true">
      {initials}
    </div>
  );
};

const VerifiedBadge = () => (
  <span
    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
    title="Verified"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const AdminPanelBadge = () => (
  <Link
    href="/admin"
    className="ml-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:bg-indigo-500/20 transition-colors"
  >
    <span>ADMIN</span>
  </Link>
);

// --- Icons ---

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Main Component ---

export default function Navbar() {
  const auth = useAuth() as any;
  const userFromAuth = auth?.user ?? null;
  const token = auth?.token ?? null;
  const logout = auth?.logout ?? (() => {});
  const refreshUser = auth?.refreshUser;

  const [profile, setProfile] = useState<any | null>(null);
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    if (!mountedRef.current) return;
    if (!token) {
      setProfile(null);
      return;
    }
    try {
      const res = await api.get("/users/me/self", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data ?? res.data ?? null;
      if (mountedRef.current) setProfile(data ?? null);
    } catch (err) {
      if (mountedRef.current) setProfile(null);
    }
  }, [token]);

  useEffect(() => {
    mountedRef.current = true;
    fetchProfile();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchProfile]);

  useEffect(() => {
    const onUserUpdated = async () => {
      if (typeof refreshUser === "function") {
        try {
          await refreshUser();
        } catch {}
      }
      try {
        await fetchProfile();
      } catch {}
    };
    window.addEventListener("user-updated", onUserUpdated);
    return () => window.removeEventListener("user-updated", onUserUpdated);
  }, [fetchProfile, refreshUser]);

  const source = profile ?? userFromAuth ?? null;
  const isLoggedIn = Boolean(source && typeof source === "object" && Object.keys(source).length > 0);

  const rawStatus = String((source as any)?.subscriptionStatus ?? "");
  const normalizedStatus = rawStatus
    .trim()
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")
    .toLowerCase();

  const isActiveSubscriber = isLoggedIn && normalizedStatus === "active";
  const isAdmin =
    typeof (source as any)?.role === "string" && String((source as any).role).toLowerCase() === "admin";
  const showVerifiedBadge = !isAdmin && (Boolean((source as any)?.isVerified) || isActiveSubscriber);

  const mainLinksLoggedOut: LinkItem[] = [
    { href: "/explore", label: "Explore" },
    { href: "/travel-plans", label: "Find Buddy" },
  ];

  const mainLinksUser: LinkItem[] = [
    { href: "/explore", label: "Explore" },
    { href: "/travel-plans", label: "My Plans" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  const mainLinksAdmin: LinkItem[] = [
    { href: "/admin/users", label: "Users" },
    { href: "/admin/travel-plans", label: "Plans" },
    { href: "/admin", label: "Dashboard", exact: true },
  ];

  const mainLinks: LinkItem[] = !isLoggedIn ? mainLinksLoggedOut : isAdmin ? mainLinksAdmin : mainLinksUser;

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleNavClick = () => {
    setOpen(false);
    setMenuOpen(false);
  };

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <nav className="fixed w-full top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* --- Left: Logo & Links --- */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="group flex items-center gap-2.5 select-none focus:outline-none"
              onClick={handleNavClick}
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-sky-500 shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-xl filter drop-shadow-md">🌍</span>
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  Travel Buddy
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold group-hover:text-primary-400 transition-colors">
                  Connect & Go
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {mainLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} exact={link.exact} />
              ))}
            </div>
          </div>

          {/* --- Right: Auth & Actions --- */}
          <div className="flex items-center gap-3">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="group relative inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white transition-all duration-200 bg-primary-600 rounded-full hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/30 active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shine" />
                    <span>Get Started</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Premium Button */}
                  {!isAdmin && !isActiveSubscriber && (
                    <Link
                      href="/payment"
                      className="group relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:border-amber-500/50 transition-all duration-300"
                    >
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-sm font-medium text-slate-300 group-hover:text-amber-400">
                        Go Premium
                      </span>
                    </Link>
                  )}

                  {/* User Menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setMenuOpen((s) => !s)}
                      className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200"
                      aria-expanded={menuOpen}
                    >
                      <div className="text-right hidden lg:block">
                        <div className="text-xs font-medium text-slate-200">
                          {(source as any)?.fullName ?? "Traveler"}
                        </div>
                        {isAdmin && (
                          <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider text-right">
                            Admin
                          </div>
                        )}
                      </div>
                      <Avatar fullName={(source as any)?.fullName} isAdmin={isAdmin} />
                    </button>

                    {/* Dropdown */}
                    {menuOpen && (
                      <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-black/5 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                          <p className="text-sm text-slate-100 font-medium truncate">
                            {(source as any)?.fullName ?? "User"}
                            {showVerifiedBadge && <VerifiedBadge />}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {(source as any)?.email ?? "user@example.com"}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setMenuOpen(false)}
                            className="group flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <svg className="mr-3 h-4 w-4 text-slate-500 group-hover:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                          </Link>
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={() => {
                              logout();
                              setMenuOpen(false);
                            }}
                            className="w-full group flex items-center px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                          >
                             <svg className="mr-3 h-4 w-4 text-rose-500/50 group-hover:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle navigation"
              >
                {open ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Mobile Menu --- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-white/5 bg-slate-950/95 backdrop-blur-xl ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                (link.exact
                  ? usePathname() === link.href
                  : usePathname().startsWith(link.href))
                  ? "bg-primary-500/10 text-primary-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="h-px bg-white/5 my-4" />

          {!isLoggedIn ? (
            <div className="grid gap-3">
              <Link
                href="/login"
                onClick={handleNavClick}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-slate-200 bg-white/5 rounded-xl hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={handleNavClick}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition"
              >
                Register Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
               {/* Mobile Profile Card */}
               <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-xl border border-white/5">
                <Avatar fullName={(source as any)?.fullName} isAdmin={isAdmin} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {(source as any)?.fullName ?? "You"}
                    </p>
                    {showVerifiedBadge && <VerifiedBadge />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{(source as any)?.email}</p>
                </div>
              </div>

              {!isAdmin && !isActiveSubscriber && (
                <Link
                  href="/payment"
                  onClick={handleNavClick}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition"
                >
                  Upgrade to Premium
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/profile"
                  onClick={handleNavClick}
                  className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-rose-400 bg-slate-900 rounded-lg border border-slate-800 hover:border-rose-900/50 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
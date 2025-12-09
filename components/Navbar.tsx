// Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";

type NavLinkProps = {
  href: string;
  label: string;
  onClick?: () => void;
  exact?: boolean;
};

const NavLink = ({ href, label, onClick, exact = false }: NavLinkProps) => {
  const pathname = usePathname();
  const search = useSearchParams();

  const viewingOtherProfile = pathname === "/profile" && Boolean(search?.get("user"));

  const active = exact
    ? pathname === href && !(href === "/profile" && viewingOtherProfile)
    : (pathname === href || pathname.startsWith(href + "/")) && !(href === "/profile" && viewingOtherProfile);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition
        ${active ? "text-slate-50" : "text-slate-300 hover:text-slate-50"}
      `}
    >
      {label}
      {active && <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary-500" />}
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

  // Different style for admins
  const baseClass =
    isAdmin
      ? "h-8 w-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-sm font-semibold text-white shadow-sm"
      : "h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-sky-400 flex items-center justify-center text-sm font-semibold text-white shadow-sm";

  return (
    <div
      className={baseClass}
      title={fullName ?? "User"}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};

const VerifiedBadge = () => (
  <span
    className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-white text-xs"
    title="Verified"
    aria-hidden="true"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 01.094 1.32l-6.5 8a1 1 0 01-1.53.09l-3.5-3.75a1 1 0 111.48-1.34l2.84 3.04 5.73-7.06a1 1 0 011.39-.34z" clipRule="evenodd" />
    </svg>
  </span>
);

const AdminPanelBadge = () => (
  <Link
    href="/admin"
    className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-700/90 text-xs font-semibold text-white hover:opacity-95"
    title="Admin Panel"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 3v6h8V3h-8zm0 8h8v10h-8V11z" />
    </svg>
    <span>Admin Panel</span>
  </Link>
);

export default function Navbar() {
  const auth = useAuth() as any;
  const userFromAuth = auth?.user ?? null;
  const token = auth?.token ?? null;
  const logout = auth?.logout ?? (() => {});
  const refreshUser = auth?.refreshUser;

  const [profile, setProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    if (!mountedRef.current) return;
    if (!token) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const res = await api.get("/users/me/self", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data ?? res.data ?? null;
      if (!mountedRef.current) return;
      setProfile(data ?? null);
    } catch (err) {
      if (!mountedRef.current) return;
      setProfile(null);
    } finally {
      if (mountedRef.current) setProfileLoading(false);
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

  // normalize role check (case-insensitive)
  const isAdmin =
    typeof (source as any)?.role === "string" &&
    String((source as any).role).toLowerCase() === "admin";

  // hide subscription/verified badge for admins
  const showVerifiedBadge = !isAdmin && (Boolean((source as any)?.isVerified) || isActiveSubscriber);

  const mainLinksLoggedOut = [
    { href: "/explore", label: "Explore Travelers" },
    { href: "/travel-plans", label: "Find Travel Buddy" },
  ];

  const mainLinksUser = [
    { href: "/explore", label: "Explore Travelers" },
    { href: "/travel-plans", label: "My Travel Plans" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  const mainLinksAdmin = [
    { href: "/admin/users", label: "Manage Users" },
    { href: "/admin/travel-plans", label: "Manage Travel Plans" },
    { href: "/admin", label: "Dashboard", exact: true },
  ];

  const mainLinks = !isLoggedIn ? mainLinksLoggedOut : isAdmin ? mainLinksAdmin : mainLinksUser;

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
    <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 select-none" onClick={handleNavClick}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary-500 to-sky-400 text-lg">
                🌍
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-50">Travel Buddy</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Trips • Meetups • Buddies</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 ml-4">
              {mainLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} exact={link.exact} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3">
              {!isLoggedIn && (
                <>
                  <NavLink href="/login" label="Login" />
                  <Link
                    href="/register"
                    className="inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-600/30 transition"
                  >
                    Register
                  </Link>
                </>
              )}

              {isLoggedIn && !isAdmin && !isActiveSubscriber && (
                <Link
                  href="/payment"
                  className="inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-600/30 transition"
                >
                  Go Premium
                </Link>
              )}

              {isLoggedIn && (
                <div className="relative flex items-center gap-2" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((s) => !s)}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    className="inline-flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-slate-900 transition"
                  >
                    <Avatar fullName={(source as any)?.fullName} isAdmin={isAdmin} />
                    <div className="flex items-center">
                      <span className="text-sm text-slate-100 font-medium">
                        {(source as any)?.fullName ? String((source as any).fullName).split(" ")[0] : "You"}
                      </span>
                      {showVerifiedBadge && <VerifiedBadge />}
                      {isAdmin && <AdminPanelBadge />}
                    </div>

                    <svg
                      className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : "rotate-0"}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-slate-900 border border-slate-800 shadow-lg py-1 z-30">
                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-100 hover:bg-slate-800">
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left block px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800 transition"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              <span className="space-y-1.5">
                <span className="block h-0.5 w-4 rounded-full bg-slate-200" />
                <span className="block h-0.5 w-4 rounded-full bg-slate-200" />
              </span>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-3 border-t border-slate-800/70">
            <div className="flex flex-col gap-1 pt-3">
              {mainLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} onClick={handleNavClick} exact={link.exact} />
              ))}

              <div className="h-px bg-slate-800 my-2" />

              {!isLoggedIn && (
                <>
                  <NavLink href="/login" label="Login" onClick={handleNavClick} />
                  <Link
                    href="/register"
                    onClick={handleNavClick}
                    className="mt-1 inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-600/30 transition"
                  >
                    Register
                  </Link>
                </>
              )}

              {isLoggedIn && (
                <>
                  {!isAdmin && !isActiveSubscriber && (
                    <Link
                      href="/payment"
                      onClick={handleNavClick}
                      className="mt-1 inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-600/30 transition"
                    >
                      Go Premium
                    </Link>
                  )}

                  <div className="px-3 py-2 flex items-center gap-3" onClick={() => setOpen(false)}>
                    <Avatar fullName={(source as any)?.fullName} isAdmin={isAdmin} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-100">{(source as any)?.fullName ?? "You"}</span>
                        {showVerifiedBadge && <VerifiedBadge />}
                        {isAdmin && <AdminPanelBadge />}
                      </div>
                      <span className="text-xs text-slate-400">View profile</span>
                    </div>
                  </div>

                  <NavLink href="/profile" label="Profile" onClick={handleNavClick} />
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="mt-1 px-3.5 py-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-left transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

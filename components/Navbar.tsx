"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthContext";

type NavLinkProps = {
  href: string;
  label: string;
  onClick?: () => void;
};

const NavLink = ({ href, label, onClick }: NavLinkProps) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition
        ${active ? "text-slate-50" : "text-slate-300 hover:text-slate-50"}
      `}
    >
      {label}
      {active && (
        <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary-500" />
      )}
    </Link>
  );
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleNavClick = () => setOpen(false);

  // Build nav items based on auth state / role
  const isAdmin = user?.role === "ADMIN";

  const mainLinksLoggedOut = [
    { href: "/explore", label: "Explore Travelers" },
    { href: "/travel-plans", label: "Find Travel Buddy" },
  ];

  const mainLinksUser = [
    { href: "/explore", label: "Explore Travelers" },
    { href: "/travel-plans", label: "My Travel Plans" },
    { href: "/dashboard", label: "Dashboard" }, // 🔥 Keep dashboard
  ];

  const mainLinksAdmin = [
    { href: "/admin/users", label: "Manage Users" },
    { href: "/admin/travel-plans", label: "Manage Travel Plans" },
    { href: "/admin", label: "Admin Dashboard" },
  ];

  const mainLinks = !user
    ? mainLinksLoggedOut
    : isAdmin
    ? mainLinksAdmin
    : mainLinksUser;

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between py-3 gap-3">
          {/* Left: Brand + desktop links */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 select-none"
              onClick={handleNavClick}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary-500 to-sky-400 text-lg">
                🌍
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-50">
                  Travel Buddy
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  Trips • Meetups • Buddies
                </span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 ml-4">
              {mainLinks.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} />
              ))}
            </div>
          </div>

          {/* Right: Auth actions + mobile toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {!user && (
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

              {user && (
                <>
                  <NavLink href="/profile" label="Profile" />
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
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

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-3 border-t border-slate-800/70">
            <div className="flex flex-col gap-1 pt-3">
              {mainLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  onClick={handleNavClick}
                />
              ))}

              <div className="h-px bg-slate-800 my-2" />

              {!user && (
                <>
                  <NavLink
                    href="/login"
                    label="Login"
                    onClick={handleNavClick}
                  />
                  <Link
                    href="/register"
                    onClick={handleNavClick}
                    className="mt-1 inline-flex items-center justify-center px-3.5 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-600/30 transition"
                  >
                    Register
                  </Link>
                </>
              )}

              {user && (
                <>
                  <NavLink
                    href="/profile"
                    label="Profile"
                    onClick={handleNavClick}
                  />
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

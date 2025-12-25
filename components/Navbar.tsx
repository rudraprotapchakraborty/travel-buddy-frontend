"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";

// --- Types ---
type LinkItem = { href: string; label: string; exact?: boolean; isMega?: boolean };

// --- Sub-Components ---

const NavLink = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
  <Link
    href={href}
    className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300
      ${active ? "text-white bg-white/10 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
  >
    {label}
  </Link>
);

const Avatar = ({ fullName, isAdmin }: { fullName?: string | null; isAdmin?: boolean }) => {
  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
  return (
    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-slate-950 ${isAdmin ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/20" : "bg-gradient-to-br from-indigo-500 to-sky-500 shadow-indigo-500/20"}`}>
      {initials}
    </div>
  );
};

// --- Main Navbar ---

export default function Navbar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const auth = useAuth() as any;
  const { user: userFromAuth, token, logout } = auth;

  const [open, setOpen] = useState(false); // Mobile menu
  const [menuOpen, setMenuOpen] = useState(false); // Profile menu
  const [megaMenuOpen, setMegaMenuOpen] = useState(false); // Explore Mega Menu
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Determine user state
  const isLoggedIn = !!token && !!userFromAuth;
  const isAdmin = userFromAuth?.role?.toLowerCase() === "admin";

  // Navigation Links Setup (Ensuring 6+ routes)
  const publicLinks: LinkItem[] = [
    { href: "/explore", label: "Explore", isMega: true },
    { href: "/travel-plans", label: "Find Buddy" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ];

  const adminLinks: LinkItem[] = [
    { href: "/admin", label: "Admin Dashboard", exact: true },
    { href: "/admin/users", label: "Manage Users" },
    { href: "/admin/travel-plans", label: "Manage Plans" },
  ];

  const navLinks = isAdmin ? [...adminLinks, ...publicLinks.slice(2)] : publicLinks;

  // Helpers
  const isActive = (href: string, exact = false) => {
    return exact ? pathname === href : pathname.startsWith(href);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <nav className="fixed w-full top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* --- Left: Logo & Desktop Links --- */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-xl">🌍</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-white leading-none">TravelBuddy</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Production v2.0</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div 
                  key={link.href} 
                  className="relative group"
                  onMouseEnter={() => link.isMega && setMegaMenuOpen(true)}
                >
                  <NavLink href={link.href} label={link.label} active={isActive(link.href, link.exact)} />
                  
                  {/* Mega Menu implementation */}
                  {/* {link.isMega && megaMenuOpen && (
                    <div 
                      onMouseLeave={() => setMegaMenuOpen(false)}
                      className="absolute top-full left-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="grid grid-cols-1 gap-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase px-2">Popular Categories</p>
                        <Link href="/explore/adventure" className="p-2 hover:bg-white/5 rounded-lg text-sm text-slate-300 hover:text-white transition">🔥 Adventure Trips</Link>
                        <Link href="/explore/solo" className="p-2 hover:bg-white/5 rounded-lg text-sm text-slate-300 hover:text-white transition">🧘 Solo Travelers</Link>
                        <Link href="/explore/budget" className="p-2 hover:bg-white/5 rounded-lg text-sm text-slate-300 hover:text-white transition">💰 Budget Friendly</Link>
                      </div>
                    </div>
                  )} */}
                </div>
              ))}
            </div>
          </div>

          {/* --- Right: Auth Actions --- */}
          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white">Login</Link>
                <Link href="/register" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                  Join Free
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Premium Badge */}
                {!isAdmin && (
                  <Link href="/payment" className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    PRO
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition">
                    <Avatar fullName={userFromAuth?.fullName} isAdmin={isAdmin} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <p className="text-sm font-medium text-white truncate">{userFromAuth?.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{userFromAuth?.email}</p>
                      </div>
                      <div className="p-1">
                        <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg">Dashboard</Link>
                        <Link href="/profile" className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg">My Profile</Link>
                        <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full flex items-center px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg">
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-slate-400 hover:text-white">
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Sidebar --- */}
      {open && (
        <div className="lg:hidden bg-slate-950 border-t border-white/5 px-4 pt-2 pb-6 space-y-1 animate-in slide-in-from-right">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={`block px-4 py-3 rounded-xl text-base font-medium ${isActive(link.href) ? "bg-blue-600/10 text-blue-400" : "text-slate-400"}`}>
              {link.label}
            </Link>
          ))}
          {!isLoggedIn && (
            <div className="pt-4 grid grid-cols-2 gap-3">
              <Link href="/login" className="flex items-center justify-center p-3 rounded-xl bg-white/5 text-white font-bold">Login</Link>
              <Link href="/register" className="flex items-center justify-center p-3 rounded-xl bg-blue-600 text-white font-bold">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
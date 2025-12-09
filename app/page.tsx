"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import {
  Users,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  MessageCircle,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import React from "react";

// A single-file, production-ready Next.js React component for the homepage.
// Design notes:
// - Tailwind-first design (expects Tailwind + Framer Motion in your project)
// - Accessible, responsive layout, subtle motion and glass-like accents
// - Small presentational subcomponents inside the same file for portability

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.05, ease: EASE_OUT },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

function CTA({
  href,
  children,
  primary = true,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-transform transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 disabled:opacity-60 ${
        primary
          ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30 hover:translate-y-[-2px]"
          : "border border-slate-700/70 bg-slate-900/60 text-slate-100 hover:bg-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

function StatAvatars() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        <span className="h-8 w-8 rounded-full border border-slate-900 bg-gradient-to-tr from-primary-500 to-primary-300 shadow-inner" />
        <span className="h-8 w-8 rounded-full border border-slate-900 bg-gradient-to-tr from-pink-500 to-orange-400" />
        <span className="h-8 w-8 rounded-full border border-slate-900 bg-gradient-to-tr from-emerald-500 to-teal-400" />
      </div>
      <div className="text-xs text-slate-400">
        <span className="font-semibold text-slate-100">24,000+</span> travelers
        matched
      </div>
    </div>
  );
}

function HowItWorksCard() {
  return (
    <motion.div
      variants={item}
      className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-2xl shadow-black/60 backdrop-blur"
    >
      <p className="text-xs text-primary-300 font-semibold uppercase tracking-[0.14em] mb-3">
        How it works
      </p>
      <ol className="space-y-2.5 text-slate-200 text-sm">
        {[
          ["Sign up", "Create a short travel profile."],
          ["Add plans", "Add dates, destination, budget and interests."],
          [
            "Match & connect",
            "Sync and coordinate your trip with compatible buddies.",
          ],
        ].map(([title, desc], i) => (
          <li className="flex gap-3" key={i}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/15 text-[11px] font-semibold text-primary-300">
              {i + 1}
            </span>
            <span>
              <span className="font-semibold">{title}</span> {desc}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        Premium members get a verified badge, advanced filters, and priority in
        search.
      </p>
    </motion.div>
  );
}

function MiniUIPreview() {
  return (
    <motion.div variants={item} className="grid gap-3 md:grid-cols-2">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Upcoming Trips
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
            3 matches
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 font-semibold text-xs">Bali, Indonesia</p>
              <p className="text-[11px] text-slate-400">12–18 Feb · Budget · Island hopping</p>
            </div>
          </div>
          <div className="flex -space-x-2 mt-1">
            <div className="h-7 w-7 rounded-full border border-slate-900 bg-sky-500/70" />
            <div className="h-7 w-7 rounded-full border border-slate-900 bg-emerald-500/70" />
            <div className="h-7 w-7 rounded-full border border-slate-900 bg-purple-500/70 flex items-center justify-center text-[10px] text-slate-100">
              +2
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Live Chat</span>
          <MessageCircle className="h-3.5 w-3.5 text-primary-300" />
        </div>
        <div className="space-y-1.5 text-[11px]">
          <p className="text-slate-300">
            “Landing in Paris at 10am, anyone up for a late brunch near Montmartre?”
          </p>
          <p className="text-slate-400">
            <span className="text-emerald-300 font-semibold">Aisha</span> · 3 mutual trips
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-[calc(100vh-4rem)] py-10 md:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-0 space-y-16">
        {/* HERO */}
        <section className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={container}
            className="space-y-6"
          >
            <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-3 py-1 text-[11px] font-medium text-primary-300">
              <Sparkles className="h-3 w-3" />
              <span>Find real travel companions, not random DMs</span>
            </motion.div>

            <motion.h1 variants={item} className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-50">
              Turn <span className="text-primary-400">solo trips</span> into
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-slate-100/90 to-primary-300">
                shared adventures.
              </span>
            </motion.h1>

            <motion.p variants={item} className="text-slate-300 text-sm md:text-base max-w-xl">
              Travel Buddy & Meetup connects you with like-minded travelers heading to the same destinations. Share itineraries, match by interests, and explore the world together—safely and effortlessly.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-3">
              <CTA href={user ? "/explore" : "/register"} primary>
                {user ? "Find Travel Buddies" : "Get Started"}
                <Users className="h-4 w-4" />
              </CTA>

              <CTA href="/travel-plans" primary={false}>
                Create a Travel Plan
                <MapPin className="h-4 w-4" />
              </CTA>
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <StatAvatars />
              </div>

              <div className="hidden sm:inline-flex items-center gap-1 border-l border-slate-700/60 pl-4">
                <Star className="h-3.5 w-3.5 fill-yellow-400/80 text-yellow-400" />
                <span className="font-semibold text-slate-100">4.8</span>
                <span className="text-slate-400">average trip rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: Visual card + preview */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary-500/15 via-slate-900 to-sky-500/10 blur-3xl opacity-80" aria-hidden />

            <div className="relative space-y-4">
              <HowItWorksCard />

              <MiniUIPreview />
            </div>
          </motion.div>
        </section>

        {/* FEATURES */}
        <section className="grid md:grid-cols-3 gap-5 text-sm">
          <motion.div variants={item} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-100">Popular Destinations</h2>
              <MapPin className="h-4 w-4 text-primary-300" />
            </div>
            <p className="text-xs text-slate-400">Bangkok • Bali • Paris • Goa • Dubai • Kathmandu</p>
            <p className="text-[11px] text-slate-500">See who's heading there during your dates and sync plans with a click.</p>
          </motion.div>

          <motion.div variants={item} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-100">Top Rated Travelers</h2>
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-xs text-slate-400">Filter by rating, travel style, languages, and verified status.</p>
            <p className="text-[11px] text-slate-500">Built-in reviews from previous trips help you pick trustworthy companions.</p>
          </motion.div>

          <motion.div variants={item} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-100">Why Choose Us</h2>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">Designed for safety, shared interests, and authentic experiences.</p>
            <ul className="text-[11px] text-slate-500 space-y-1">
              <li>• Profile verification & report system</li>
              <li>• Interest-based matching for better vibes</li>
              <li>• Transparent ratings and reviews</li>
            </ul>
          </motion.div>
        </section>

        {/* BOTTOM CTA */}
        <motion.section variants={item} className="rounded-2xl border border-slate-800 bg-gradient-to-r from-primary-600/15 via-slate-900 to-sky-500/10 px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-200">Ready for your next chapter?</p>
            <h2 className="text-lg md:text-xl font-semibold text-slate-50 mt-1">Start planning your next trip with someone who gets your travel style.</h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1.5">Create a trip, set your preferences, and we'll surface the best matches for you.</p>
          </div>

          <div className="flex gap-3">
            <CTA href="/travel-plans">Create a Travel Plan</CTA>
            {!user && (
              <Link href="/register" className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl border border-slate-700 bg-slate-950/60 text-slate-100 text-xs md:text-sm font-semibold hover:bg-slate-900 transition-all">
                Join the Community
              </Link>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
}

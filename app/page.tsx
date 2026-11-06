"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Compass,
  Lock,
  MailCheck,
  MapPinned,
  Search,
  Send,
  Star,
  UserPlus,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import TripArt from "@/components/TripArt";

const steps = [
  { Icon: MapPinned, tile: "tile-mint", title: "Post your plan", text: "Add where you are going, when and what you can spend. Keep it public or private." },
  { Icon: Search, tile: "tile-sky", title: "Find your match", text: "Search other trips by destination, dates and travel style to spot people heading your way." },
  { Icon: Send, tile: "tile-peach", title: "Send a request", text: "Introduce yourself with a short message. The host accepts or declines." },
  { Icon: Star, tile: "tile-lilac", title: "Travel and review", text: "After the trip, rate each other so the next traveller knows who to trust." },
];

const features = [
  { Icon: MailCheck, title: "Email-verified members", text: "Every account confirms its email address with a one-time code before it can join." },
  { Icon: Star, title: "Ratings and reviews", text: "Honest reviews from real trips build each traveller's reputation over time." },
  { Icon: BadgeCheck, title: "Verified badge", text: "Members on a paid plan get a badge on their profile and trips." },
  { Icon: Lock, title: "You control your plans", text: "Choose which trips are public, and keep drafts private until you are ready." },
];

const destinations = [
  { city: "Lisbon", country: "Portugal", emoji: "🚋", from: "#f6d9b8", to: "#f2a65a", ink: "#4a2a0c" },
  { city: "Kyoto", country: "Japan", emoji: "⛩️", from: "#f7cfd6", to: "#e98aa0", ink: "#5a1426" },
  { city: "Cox's Bazar", country: "Bangladesh", emoji: "🏖️", from: "#bfe8f4", to: "#58b7da", ink: "#0a3a50" },
  { city: "Tromsø", country: "Norway", emoji: "🌌", from: "#c9c6f5", to: "#7d77d9", ink: "#1f1b5c" },
  { city: "Marrakech", country: "Morocco", emoji: "🕌", from: "#f3d6bd", to: "#d9895a", ink: "#4a230d" },
  { city: "Patagonia", country: "Chile", emoji: "🏔️", from: "#cfe8d4", to: "#74b98a", ink: "#14402a" },
];

interface Stats {
  members: number;
  trips: number;
  reviews: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/public/stats")
      .then((res) => !cancelled && setStats(res.data.data))
      .catch(() => {
        /* the strip is optional; it simply stays hidden */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const primary = user
    ? { href: "/travel-plans/add", label: "Plan a trip" }
    : { href: "/register", label: "Get started free" };

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="frame grid items-center gap-12 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <span className="eyeline">Find travel companions</span>
          <h1 className="display mt-6 text-[clamp(46px,6.4vw,92px)]">
            Travel is better <span className="accent">shared</span>.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted">
            Post your plan, meet travellers heading the same way and set off together. Travel Buddy helps you find company you
            can trust, from the first message to the trip home.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href={primary.href} className="btn btn-primary">
              {primary.label}
              <ArrowUpRight className="h-[18px] w-[18px]" />
            </Link>
            <Link href="/explore" className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink hover:underline hover:underline-offset-4">
              Explore trips <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-muted">
            {["Free to join", "Email-verified members", "Reviews from real trips"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-brand" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <TripArt className="mx-auto w-full max-w-[600px]" />
      </section>

      {/* ---------- Live numbers ---------- */}
      {stats && (stats.members > 0 || stats.trips > 0) && (
        <section aria-label="Community numbers" className="border-y border-line">
          <dl className="frame grid grid-cols-3 divide-x divide-line py-8 text-center">
            {[
              ["Members", stats.members],
              ["Open trips", stats.trips],
              ["Reviews", stats.reviews],
            ].map(([label, value]) => (
              <div key={label as string} className="px-2">
                <dd className="display text-[clamp(30px,4vw,52px)]">{(value as number).toLocaleString()}</dd>
                <dt className="eyeline mt-2 before:hidden">{label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ---------- How it works ---------- */}
      <section className="frame py-20">
        <div className="max-w-xl">
          <span className="eyeline">How it works</span>
          <h2 className="display mt-4 text-[clamp(32px,4vw,52px)]">
            From idea to <span className="accent">itinerary</span> in four steps
          </h2>
        </div>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ Icon, tile, title, text }, i) => (
            <li key={title} className="card card-hover relative p-6">
              <span className="absolute right-5 top-5 font-mono text-xs font-semibold text-muted">0{i + 1}</span>
              <span className={`${tile} grid h-12 w-12 place-items-center rounded-2xl`}>
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Destinations ---------- */}
      <section className="frame pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="eyeline">Inspiration</span>
            <h2 className="display mt-4 text-[clamp(32px,4vw,52px)]">
              Where will you go <span className="accent">next</span>?
            </h2>
          </div>
          <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:underline hover:underline-offset-4">
            See all trips <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {destinations.map((d) => (
            <li key={d.city}>
              <Link
                href={`/explore?destination=${encodeURIComponent(d.city)}`}
                className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1"
                style={{ background: `linear-gradient(135deg, ${d.from}, ${d.to})`, color: d.ink }}
              >
                <span className="text-4xl transition-transform duration-300 group-hover:scale-110 sm:text-5xl" aria-hidden>
                  {d.emoji}
                </span>
                <span>
                  <span className="block text-xl font-bold tracking-tight sm:text-2xl">{d.city}</span>
                  <span className="flex items-center justify-between text-sm font-medium opacity-80">
                    {d.country}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Why us ---------- */}
      <section className="border-y border-line bg-surface">
        <div className="frame grid gap-12 py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <span className="eyeline">Why Travel Buddy</span>
            <h2 className="display mt-4 text-[clamp(32px,4vw,52px)]">
              Built for meeting people <span className="accent">safely</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted">
              Travelling with a stranger takes trust. We give you the tools to check who you are dealing with before you commit
              to anything.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
            {features.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="tile-sky grid h-11 w-11 shrink-0 place-items-center rounded-xl">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Call to action ---------- */}
      <section className="frame py-20">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0b5f84] to-[#0b7aa6] px-6 py-16 text-center text-on-brand sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[#f2a65a]/25 blur-3xl" />
          <Compass className="relative mx-auto h-10 w-10 opacity-90" />
          <h2 className="display relative mx-auto mt-6 max-w-2xl text-[clamp(32px,4.4vw,56px)]">
            Your next trip is better with <span className="accent !text-[#ffd9ae]">company</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-[#d3eef9]">
            Create a free account, post where you are heading and see who wants to come along.
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href={user ? "/travel-plans/add" : "/register"}
              className="btn bg-white !text-[#0b5f84] hover:bg-[#f1f9fd]"
            >
              {user ? "Plan a trip" : "Create free account"}
              <UserPlus className="h-[18px] w-[18px]" />
            </Link>
            <Link href="/explore" className="btn text-on-brand ring-1 ring-inset ring-white/40 hover:bg-white/10">
              Browse trips
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

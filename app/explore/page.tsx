"use client";

import { FormEvent, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import Link from "next/link";

interface MatchPlan {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelType: string;
  user: {
    _id: string;
    fullName: string;
    currentLocation?: string;
  };
}

export default function ExplorePage() {
  const { token } = useAuth();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelType, setTravelType] = useState("");
  const [results, setResults] = useState<MatchPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (destination) params.set("destination", destination);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (travelType) params.set("travelType", travelType);
      const res = await api.get(`/travel-plans/match?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
      <div className="space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-medium text-primary-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
            <span>Smart matching by dates, destination & style</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
                Find Travel Buddies
              </h1>
              <p className="text-sm text-slate-400">
                Filter by destination, dates and trip type to discover compatible plans.
              </p>
            </div>
            {results.length > 0 && !loading && (
              <p className="text-xs text-slate-400 md:text-right">
                Showing <span className="text-slate-100 font-semibold">{results.length}</span>{" "}
                matching trip{results.length > 1 ? "s" : ""}.
              </p>
            )}
          </div>
        </header>

        {/* Search card */}
        <form
          onSubmit={handleSearch}
          className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur shadow-xl shadow-black/40 p-4 md:p-5 grid md:grid-cols-5 gap-3 text-sm"
        >
          <div className="pointer-events-none absolute -inset-x-10 -top-20 h-32 bg-gradient-to-b from-primary-500/20 via-transparent to-transparent opacity-60" />

          <div className="relative space-y-1.5 md:col-span-2">
            <label className="text-slate-200 text-xs font-medium">Destination</label>
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="City or country (e.g. Bali, Paris)"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <div className="relative space-y-1.5">
            <label className="text-slate-200 text-xs font-medium">From</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <div className="relative space-y-1.5">
            <label className="text-slate-200 text-xs font-medium">To</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <div className="relative space-y-1.5 md:col-span-2">
            <label className="text-slate-200 text-xs font-medium">Travel type</label>
            <select
              value={travelType}
              onChange={e => setTravelType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40 appearance-none"
            >
              <option value="">Any</option>
              <option value="SOLO">Solo</option>
              <option value="FAMILY">Family</option>
              <option value="FRIENDS">Friends</option>
            </select>
          </div>

          <div className="relative flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold px-4 py-2.5 mt-1 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary-600/30"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Matches */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-50">Matches</h2>
            <p className="text-[11px] text-slate-500">
              Click a trip to see full details or send a join request.
            </p>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="animate-pulse bg-slate-900/70 border border-slate-800 rounded-xl p-3"
                >
                  <div className="h-3 w-32 bg-slate-700/70 rounded mb-2" />
                  <div className="h-3 w-48 bg-slate-800/80 rounded mb-1" />
                  <div className="h-3 w-40 bg-slate-800/80 rounded" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-sm text-slate-400">
              <p className="font-medium text-slate-200 mb-1">No matches yet</p>
              <p>
                Try broadening your dates, changing the travel type, or searching a nearby
                destination. New trips are added every day.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map(plan => (
                <Link
                  key={plan._id}
                  href={`/travel-plans/${plan._id}`}
                  className="block bg-slate-900/70 border border-slate-800 hover:border-primary-500/80 hover:bg-slate-900 rounded-xl p-3.5 transition text-sm"
                >
                  <div className="flex justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-100">
                          {plan.destination}
                        </p>
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                          {plan.travelType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(plan.startDate).toLocaleDateString()} –{" "}
                        {new Date(plan.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Host:{" "}
                        <span className="text-slate-100 font-medium">
                          {plan.user.fullName}
                        </span>
                        {plan.user.currentLocation && (
                          <span className="text-slate-500">
                            {" "}
                            • Based in {plan.user.currentLocation}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right text-xs text-slate-400 flex flex-col items-end justify-between">
                      <span className="mt-3 text-[11px] text-primary-300">
                        View details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Protected>
  );
}

"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import Link from "next/link";

interface TravelPlan {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
}

function getStatusClasses(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("open") || normalized.includes("active")) {
    return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40";
  }
  if (normalized.includes("closed") || normalized.includes("cancel")) {
    return "bg-red-500/10 text-red-300 border border-red-500/40";
  }
  if (normalized.includes("completed") || normalized.includes("past")) {
    return "bg-slate-500/10 text-slate-300 border border-slate-500/40";
  }
  return "bg-slate-800/80 text-slate-200 border border-slate-700/80";
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!token) return;
      try {
        const res = await api.get("/travel-plans/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlans(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [token]);

  const upcomingCount = plans.length;

  return (
    <Protected>
      <div className="space-y-8">
        {/* Top hero / greeting */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 px-5 py-5 md:px-6 md:py-6 shadow-xl shadow-black/40">
          <div className="pointer-events-none absolute -top-24 -right-10 h-40 w-40 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-sky-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-medium text-primary-200">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
                <span>Personalized travel dashboard</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
                  Welcome back,{" "}
                  <span className="text-primary-300">
                    {user?.fullName || "Traveler"}
                  </span>
                  .
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Manage your trips, discover new buddies, and keep everything in one place.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                <span>{upcomingCount} active plan{upcomingCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
                >
                  Find travel buddies
                </Link>
                <Link
                  href="/travel-plans/add"
                  className="inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-primary-600/30 transition"
                >
                  + Add plan
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming plans */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                Upcoming travel plans
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Quick overview of where you’re headed next.
              </p>
            </div>
            {plans.length > 0 && !loading && (
              <Link
                href="/travel-plans"
                className="text-[11px] text-primary-300 hover:text-primary-200"
              >
                View all →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 animate-pulse"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-40 rounded bg-slate-800" />
                    <div className="h-6 w-20 rounded-full bg-slate-800" />
                  </div>
                  <div className="h-3 w-56 rounded bg-slate-800/80" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-5 py-6 text-sm text-slate-400 space-y-2">
              <p className="text-slate-100 font-medium">
                You have no travel plans yet
              </p>
              <p>
                Create your first trip to start matching with other travelers. You can
                always edit or archive plans later from the travel plans page.
              </p>
              <Link
                href="/travel-plans/add"
                className="inline-flex items-center justify-center mt-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-3 py-1.5 transition"
              >
                Create a travel plan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.slice(0, 4).map(plan => (
                <Link
                  key={plan._id}
                  href={`/travel-plans/${plan._id}`}
                  className="block rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-primary-500/80 hover:bg-slate-900 transition p-4 text-sm shadow-sm shadow-black/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-100">
                        {plan.destination}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(plan.startDate).toLocaleDateString()} –{" "}
                        {new Date(plan.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(
                          plan.status
                        )}`}
                      >
                        {plan.status}
                      </span>
                      <span className="text-[11px] text-primary-300">
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

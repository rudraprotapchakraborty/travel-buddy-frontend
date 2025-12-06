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

export default function TravelPlansPage() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      if (!token) return;
      setLoading(true);
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

  return (
    <Protected>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-medium text-primary-200">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
              <span>Your upcoming & past trips</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
                My travel plans
              </h1>
              <p className="text-sm text-slate-400">
                Manage your trips and keep track of your adventures.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/join-requests"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs md:text-sm font-medium px-4 py-2 text-slate-100 transition"
            >
              View join requests
            </Link>
            <Link
              href="/travel-plans/add"
              className="inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs md:text-sm font-semibold px-4 py-2 shadow-md shadow-primary-600/30 transition"
            >
              <span className="mr-1 text-base leading-none">＋</span>
              <span>Add plan</span>
            </Link>
          </div>
        </div>

        {/* Owned plans */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-[0.16em]">
            Trips I&apos;m hosting
          </h2>

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
              <p className="text-slate-100 font-medium">No travel plans yet</p>
              <p>
                Create your first travel plan to start matching with other travelers.
                You can share dates, budget, and trip style to find the best buddies.
              </p>
              <Link
                href="/travel-plans/add"
                className="inline-flex items-center justify-center mt-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-3 py-1.5 transition"
              >
                Create a plan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map(plan => (
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

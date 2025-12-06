"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";

interface Overview {
  userCount: number;
  planCount: number;
  reviewCount: number;
  totalRevenue: number; // in cents
}

export default function AdminPage() {
  const { token } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      if (!token) return;
      try {
        const res = await api.get("/admin/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOverview(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [token]);

  const formatRevenue = (cents: number) => {
    const amount = cents / 100;
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Protected adminOnly>
      <div className="space-y-8">
        {/* Header */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 px-5 py-5 md:px-6 md:py-6 shadow-xl shadow-black/40">
          <div className="pointer-events-none absolute -top-20 -right-10 h-40 w-40 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-medium text-primary-200">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
                <span>Admin-only insights</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
                  Admin dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Monitor users, trips and monetization at a glance.
                </p>
              </div>
            </div>

            {overview && (
              <div className="flex flex-col items-start md:items-end gap-1">
                <p className="text-xs text-slate-400">
                  Total users:{" "}
                  <span className="text-slate-100 font-semibold">
                    {overview.userCount}
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  Total revenue:{" "}
                  <span className="text-emerald-300 font-semibold">
                    ${formatRevenue(overview.totalRevenue)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        {loading ? (
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-slate-950/80 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : !overview ? (
          <p className="text-sm text-slate-400">No data.</p>
        ) : (
          <section className="grid md:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-950/80 border border-slate-800 p-4 shadow-sm shadow-black/30">
              <div className="pointer-events-none absolute -top-10 -right-10 h-16 w-16 rounded-full bg-sky-500/20 blur-2xl" />
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Total users
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">
                {overview.userCount}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Registered on the platform
              </p>
            </div>

            {/* Travel Plans */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-950/80 border border-slate-800 p-4 shadow-sm shadow-black/30">
              <div className="pointer-events-none absolute -top-10 -right-10 h-16 w-16 rounded-full bg-purple-500/20 blur-2xl" />
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Travel plans
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">
                {overview.planCount}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Created by users
              </p>
            </div>

            {/* Reviews */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-950/80 border border-slate-800 p-4 shadow-sm shadow-black/30">
              <div className="pointer-events-none absolute -top-10 -right-10 h-16 w-16 rounded-full bg-amber-500/20 blur-2xl" />
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Reviews
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">
                {overview.reviewCount}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Feedback on trips & buddies
              </p>
            </div>

            {/* Revenue */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-950/80 border border-slate-800 p-4 md:col-span-1 shadow-sm shadow-black/30 flex flex-col justify-between">
              <div className="pointer-events-none absolute -top-10 -right-10 h-16 w-16 rounded-full bg-emerald-500/25 blur-2xl" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Total revenue
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">
                  ${formatRevenue(overview.totalRevenue)}
                </p>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Aggregated across all premium payments
              </p>
            </div>
          </section>
        )}
      </div>
    </Protected>
  );
}

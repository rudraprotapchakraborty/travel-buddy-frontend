"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import Link from "next/link";

type JoinStatus = "PENDING" | "ACCEPTED" | "REJECTED" | string;

interface TravelPlanLite {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
}

interface JoinRequest {
  _id: string;
  status: JoinStatus;
  message?: string;
  createdAt: string;
  travelPlan?: TravelPlanLite | string;
  requester?: {
    _id: string;
    fullName: string;
    currentLocation?: string;
  };
}

export default function JoinRequestsPage() {
  const { token } = useAuth();

  const [sent, setSent] = useState<JoinRequest[]>([]);
  const [hostRequests, setHostRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"SENT" | "HOST">("SENT");

  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [meRes, hostRes] = await Promise.all([
          api.get("/join-requests/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/join-requests/host", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSent(meRes.data.data || []);
        setHostRequests(hostRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  // NEW: helper to detect when the underlying trip is gone / unusable
  const isPlanDeleted = (travelPlan?: TravelPlanLite | string) => {
    if (!travelPlan) return true;
    if (typeof travelPlan === "string") return true;
    if (!travelPlan._id || !travelPlan.destination) return true;
    return false;
  };

  const statusClasses = (status: JoinStatus) => {
    const s = String(status).toLowerCase();
    if (s === "pending")
      return "bg-amber-500/10 text-amber-300 border border-amber-500/40";
    if (s === "accepted")
      return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40";
    if (s === "rejected")
      return "bg-red-500/10 text-red-300 border border-red-500/40";
    return "bg-slate-800/80 text-slate-200 border border-slate-700/80";
  };

  // UPDATED: takes the raw travelPlan, shows "Trip deleted" when missing
  const renderPlanInfo = (travelPlan?: TravelPlanLite | string) => {
    if (isPlanDeleted(travelPlan)) {
      return (
        <p className="text-xs text-slate-500 italic">
          Trip deleted
        </p>
      );
    }

    const tp = travelPlan as TravelPlanLite;
    return (
      <div>
        <p className="text-sm text-slate-100">{tp.destination}</p>
        <p className="text-[11px] text-slate-400">
          {new Date(tp.startDate).toLocaleDateString()} –{" "}
          {new Date(tp.endDate).toLocaleDateString()}
        </p>
      </div>
    );
  };

  return (
    <Protected>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <section className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-medium text-primary-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
            <span>Manage your join requests</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              Join requests
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              See trips you’ve requested to join and people who want to join your plans.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950/80 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("SENT")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "SENT"
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            Requests I sent
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("HOST")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "HOST"
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            Requests for my trips
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-slate-950/80 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : activeTab === "SENT" ? (
          // SENT TAB
          sent.length === 0 ? (
            <p className="text-sm text-slate-400">
              You haven’t requested to join any trips yet.
            </p>
          ) : (
            <div className="space-y-2">
              {sent.map(r => {
                const tp = r.travelPlan as any;
                const deleted = isPlanDeleted(r.travelPlan);
                const planId =
                  tp && typeof tp === "object" && tp._id ? tp._id : tp;

                const cardInner = (
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {renderPlanInfo(r.travelPlan)}
                      {r.message && (
                        <p className="text-xs text-slate-300 mt-1">
                          “{r.message}”
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        Sent on {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full ${
                        deleted
                          ? "bg-slate-800/80 text-slate-300 border border-slate-700/80"
                          : statusClasses(r.status)
                      }`}
                    >
                      {deleted ? "Trip deleted" : r.status}
                    </span>
                  </div>
                );

                // NEW: if trip is deleted / missing, render as a disabled card (no Link)
                const baseClasses =
                  "block rounded-2xl bg-slate-950/80 border border-slate-800 transition p-4 text-sm";
                const interactiveClasses =
                  "hover:border-primary-500/80 hover:bg-slate-900";
                const deletedClasses = "opacity-60 cursor-not-allowed";

                if (!deleted && planId) {
                  return (
                    <Link
                      key={r._id}
                      href={`/travel-plans/${planId}`}
                      className={`${baseClasses} ${interactiveClasses}`}
                    >
                      {cardInner}
                    </Link>
                  );
                }

                return (
                  <div
                    key={r._id}
                    className={`${baseClasses} ${deletedClasses}`}
                  >
                    {cardInner}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // HOST TAB
          hostRequests.length === 0 ? (
            <p className="text-sm text-slate-400">
              No one has requested to join your trips yet.
            </p>
          ) : (
            <div className="space-y-2">
              {hostRequests.map(r => {
                const tp = r.travelPlan as any;
                const deleted = isPlanDeleted(r.travelPlan);
                const planId =
                  tp && typeof tp === "object" && tp._id ? tp._id : tp;

                const cardInner = (
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {renderPlanInfo(r.travelPlan)}
                      {r.requester && (
                        <p className="text-xs text-slate-300">
                          From{" "}
                          <span className="font-medium">
                            {r.requester.fullName}
                          </span>
                          {r.requester.currentLocation && (
                            <span className="text-slate-500">
                              {" "}
                              • {r.requester.currentLocation}
                            </span>
                          )}
                        </p>
                      )}
                      {r.message && (
                        <p className="text-xs text-slate-300 mt-1">
                          “{r.message}”
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        Received on{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full ${
                        deleted
                          ? "bg-slate-800/80 text-slate-300 border border-slate-700/80"
                          : statusClasses(r.status)
                      }`}
                    >
                      {deleted ? "Trip deleted" : r.status}
                    </span>
                  </div>
                );

                const baseClasses =
                  "block rounded-2xl bg-slate-950/80 border border-slate-800 transition p-4 text-sm";
                const interactiveClasses =
                  "hover:border-primary-500/80 hover:bg-slate-900";
                const deletedClasses = "opacity-60 cursor-not-allowed";

                if (!deleted && planId) {
                  return (
                    <Link
                      key={r._id}
                      href={`/travel-plans/${planId}`}
                      className={`${baseClasses} ${interactiveClasses}`}
                    >
                      {cardInner}
                    </Link>
                  );
                }

                return (
                  <div
                    key={r._id}
                    className={`${baseClasses} ${deletedClasses}`}
                  >
                    {cardInner}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </Protected>
  );
}

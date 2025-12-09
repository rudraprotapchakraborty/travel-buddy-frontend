"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";

type TravelType = "SOLO" | "FAMILY" | "FRIENDS" | "COUPLE" | string;
type TravelPlanStatus = "ACTIVE" | "CANCELLED" | "COMPLETED" | "FLAGGED" | string;

interface HostLite {
  _id: string;
  fullName: string;
  email?: string;
}

interface AdminTravelPlan {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetRange?: string;
  travelType?: TravelType;
  status?: TravelPlanStatus;
  visibility?: "PUBLIC" | "PRIVATE" | string;
  createdAt?: string;
  host?: HostLite | string; // depending on backend
}

export default function ManageTravelPlansPage() {
  const { user, token } = useAuth();
  const [plans, setPlans] = useState<AdminTravelPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<AdminTravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [destinationFilter, setDestinationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TravelPlanStatus>("ALL");
  const [travelTypeFilter, setTravelTypeFilter] = useState<"ALL" | TravelType>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  if (user && user.role !== "ADMIN") {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-2xl font-semibold text-red-500 mb-2">Unauthorized</h1>
        <p className="text-slate-300">You do not have permission to view this page.</p>
      </div>
    );
  }

  const applyFilters = (list: AdminTravelPlan[], dest: string, statusF: typeof statusFilter, typeF: typeof travelTypeFilter) => {
    let result = Array.isArray(list) ? [...list] : [];

    if (dest.trim()) {
      const lower = dest.toLowerCase();
      result = result.filter((p) => p.destination.toLowerCase().includes(lower));
    }

    if (statusF !== "ALL") {
      result = result.filter((p) => (p.status || "ACTIVE") === statusF);
    }

    if (typeF !== "ALL") {
      result = result.filter((p) => (p.travelType || "").toUpperCase() === typeF);
    }

    return result;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        // admin endpoint
        const res = await api.get("/travel-plans/admin/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // backend returns { success: true, data: plans }
        const data: AdminTravelPlan[] = res.data?.data ?? [];
        setPlans(data);
        setFilteredPlans(applyFilters(data, destinationFilter, statusFilter, travelTypeFilter));
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load travel plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    setFilteredPlans(applyFilters(plans, destinationFilter, statusFilter, travelTypeFilter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationFilter, statusFilter, travelTypeFilter, plans]);

  const handleUpdateStatus = async (id: string, newStatus: TravelPlanStatus) => {
    if (!token) return;
    setActionLoadingId(id);
    setError(null);

    try {
      // call admin status endpoint
      const res = await api.patch(
        `/travel-plans/admin/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data?.data;
      setPlans((prev) => prev.map((p) => (p._id === id ? updated : p)));
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update plan status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to permanently delete this travel plan?")) {
      return;
    }

    setActionLoadingId(id);
    setError(null);

    try {
      await api.delete(`/travel-plans/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to delete travel plan");
    } finally {
      setActionLoadingId(null);
    }
  };

  const statusBadgeClasses = (status?: TravelPlanStatus) => {
    const s = (status || "ACTIVE").toUpperCase();
    if (s === "ACTIVE") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/40";
    if (s === "CANCELLED") return "bg-red-500/10 text-red-300 border-red-500/40";
    if (s === "COMPLETED") return "bg-sky-500/10 text-sky-300 border-sky-500/40";
    if (s === "FLAGGED") return "bg-amber-500/10 text-amber-300 border-amber-500/40";
    return "bg-slate-500/10 text-slate-300 border-slate-500/40";
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Manage Travel Plans</h1>
          <p className="text-slate-400 text-sm">Monitor and moderate all travel plans created by users.</p>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">Total Plans: {plans.length}</span>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Filter by destination..."
          value={destinationFilter}
          onChange={(e) => setDestinationFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="FLAGGED">Flagged</option>
        </select>

        <select value={travelTypeFilter} onChange={(e) => setTravelTypeFilter(e.target.value as any)} className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
          <option value="ALL">All Travel Types</option>
          <option value="SOLO">Solo</option>
          <option value="FAMILY">Family</option>
          <option value="FRIENDS">Friends</option>
          <option value="COUPLE">Couple</option>
        </select>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300">{error}</div>}

      {loading ? (
        <div className="py-10 text-center text-slate-400">Loading travel plans...</div>
      ) : filteredPlans.length === 0 ? (
        <div className="py-10 text-center text-slate-400">No travel plans found with current filters.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/70 text-slate-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Destination</th>
                <th className="px-4 py-3 text-left">Dates</th>
                <th className="px-4 py-3 text-left">Host</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Budget</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Visibility</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((p) => {
                const hostObj = typeof p.host === "string" ? null : (p.host as HostLite | undefined);

                return (
                  <tr key={p._id} className="border-t border-slate-800/80 hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <Link href={`/travel-plans/${p._id}`} className="font-medium text-slate-100 hover:text-primary-400">{p.destination}</Link>
                        <span className="text-[11px] text-slate-400">Created: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{new Date(p.startDate).toLocaleDateString()} – {new Date(p.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {hostObj ? (
                        <div className="flex flex-col">
                          <Link href={`/profile/${hostObj._id}`} className="text-xs font-medium text-slate-100 hover:text-primary-400">{hostObj.fullName}</Link>
                          {hostObj.email && <span className="text-[11px] text-slate-400">{hostObj.email}</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{p.travelType ? p.travelType.charAt(0).toUpperCase() + p.travelType.slice(1).toLowerCase() : "-"}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{p.budgetRange || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClasses(p.status)}`}>{p.status ? p.status : "ACTIVE"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{p.visibility || "PUBLIC"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <select disabled={actionLoadingId === p._id} value={(p.status || "ACTIVE").toUpperCase()} onChange={(e) => handleUpdateStatus(p._id, e.target.value as TravelPlanStatus)} className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs text-slate-100">
                          <option value="ACTIVE">Active</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="FLAGGED">Flagged</option>
                        </select>

                        <button onClick={() => handleDeletePlan(p._id)} disabled={actionLoadingId === p._id} className="rounded-lg border border-red-500/40 px-2 py-1 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-60">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

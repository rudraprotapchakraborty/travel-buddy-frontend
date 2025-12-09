"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import {
  MapPin,
  Calendar,
  Users,
  User,
  Heart,
  Briefcase,
  DollarSign,
  MoreHorizontal,
  Trash2,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plane,
  Search,
  Filter,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";

// --- Types ---
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
  budgetMin?: number;
  budgetMax?: number;
  budgetRange?: string;
  travelType?: TravelType;
  status?: TravelPlanStatus;
  visibility?: "PUBLIC" | "PRIVATE" | string;
  createdAt?: string;
  user?: any;
  host?: HostLite | string | null;
}

// --- Components ---

const StatusBadge = ({ status }: { status?: string }) => {
  const s = (status || "ACTIVE").toUpperCase();
  let colorClass = "bg-slate-500/10 text-slate-400 border-slate-500/20";
  let Icon = Plane;

  if (s === "ACTIVE") {
    colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    Icon = CheckCircle2;
  } else if (s === "CANCELLED") {
    colorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    Icon = XCircle;
  } else if (s === "COMPLETED") {
    colorClass = "bg-sky-500/10 text-sky-400 border-sky-500/20";
    Icon = CheckCircle2;
  } else if (s === "FLAGGED") {
    colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    Icon = Flag;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {s.charAt(0) + s.slice(1).toLowerCase()}
    </span>
  );
};

const TypeIcon = ({ type }: { type?: string }) => {
  const t = (type || "").toUpperCase();
  let Icon = Plane;
  let label = "Trip";

  if (t === "SOLO") { Icon = User; label = "Solo"; }
  else if (t === "COUPLE") { Icon = Heart; label = "Couple"; }
  else if (t === "FAMILY") { Icon = Users; label = "Family"; }
  else if (t === "FRIENDS") { Icon = Users; label = "Friends"; }
  else if (t === "BUSINESS") { Icon = Briefcase; label = "Business"; }

  return (
    <div className="flex items-center gap-2 text-slate-300" title={label}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
    <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 ${color}`} />
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-100">{value}</p>
      </div>
      <div className={`rounded-xl p-3 bg-white/5 ${color.replace("bg-", "text-")}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

// --- Main Component ---

export default function ManageTravelPlansPage() {
  const { user, token } = useAuth();
  const [plans, setPlans] = useState<AdminTravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [destinationFilter, setDestinationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TravelPlanStatus>("ALL");
  const [travelTypeFilter, setTravelTypeFilter] = useState<"ALL" | TravelType>("ALL");
  
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // --- Normalizer ---
  const normalizePlan = (p: any): AdminTravelPlan => {
    let budgetRange: string | undefined = undefined;
    const min = typeof p.budgetMin === "number" ? p.budgetMin : undefined;
    const max = typeof p.budgetMax === "number" ? p.budgetMax : undefined;
    
    if (min !== undefined && max !== undefined) budgetRange = `${min} - ${max}`;
    else if (min !== undefined) budgetRange = `${min}+`;
    else if (max !== undefined) budgetRange = `Up to ${max}`;
    else if (p.budgetRange) budgetRange = p.budgetRange;

    let host: HostLite | string | null = null;
    if (p.host) host = p.host;
    else if (p.user) {
      if (typeof p.user === "string") host = p.user;
      else if (typeof p.user === "object") {
        const fullName = p.user.fullName || p.user.name || "Unknown";
        host = { _id: p.user._id || "unknown", fullName, email: p.user.email } as HostLite;
      }
    }

    const visibility = p.visibility ?? (p.isPublic === false ? "PRIVATE" : "PUBLIC");

    return {
      _id: p._id,
      destination: p.destination,
      startDate: p.startDate,
      endDate: p.endDate,
      budgetMin: p.budgetMin,
      budgetMax: p.budgetMax,
      budgetRange,
      travelType: p.travelType,
      status: p.status,
      visibility,
      createdAt: p.createdAt,
      host,
      user: p.user,
    } as AdminTravelPlan;
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchPlans = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await api.get("/travel-plans/admin/all", { headers: { Authorization: `Bearer ${token}` } });
        const raw: any[] = res.data?.data ?? [];
        setPlans(raw.map(normalizePlan));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load travel plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [token]);

  // --- Filtering & Stats ---
  const filteredPlans = useMemo(() => {
    let result = [...plans];
    if (destinationFilter.trim()) {
      result = result.filter((p) => (p.destination || "").toLowerCase().includes(destinationFilter.toLowerCase()));
    }
    if (statusFilter !== "ALL") {
      result = result.filter((p) => ((p.status || "ACTIVE") === statusFilter));
    }
    if (travelTypeFilter !== "ALL") {
      result = result.filter((p) => ((p.travelType || "").toUpperCase() === travelTypeFilter));
    }
    return result;
  }, [plans, destinationFilter, statusFilter, travelTypeFilter]);

  const stats = useMemo(() => ({
    total: plans.length,
    active: plans.filter(p => (p.status || "ACTIVE") === "ACTIVE").length,
    flagged: plans.filter(p => p.status === "FLAGGED").length,
    completed: plans.filter(p => p.status === "COMPLETED").length,
  }), [plans]);

  // --- Actions ---
  const handleUpdateStatus = async (id: string, newStatus: TravelPlanStatus) => {
    if (!token) return;
    setActionLoadingId(id);
    try {
      await api.patch(`/travel-plans/admin/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setPlans((prev) => prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p)));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Permanently delete this travel plan? This cannot be undone.")) return;
    setActionLoadingId(id);
    try {
      await api.delete(`/travel-plans/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (user && (user as any).role !== "ADMIN") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <AlertTriangle className="h-16 w-16 text-rose-500 mb-4" />
        <h1 className="text-3xl font-bold text-white">Access Denied</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Travel Plans</h1>
          <p className="text-slate-400">Monitor trip activity, enforce guidelines, and manage statuses.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Trips" value={stats.total} icon={Plane} color="bg-blue-500 text-blue-500" />
          <StatCard label="Active Trips" value={stats.active} icon={CheckCircle2} color="bg-emerald-500 text-emerald-500" />
          <StatCard label="Flagged" value={stats.flagged} icon={Flag} color="bg-amber-500 text-amber-500" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="bg-slate-500 text-slate-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by destination..."
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-10 appearance-none rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-8 text-sm text-slate-300 focus:border-primary-500 focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="FLAGGED">Flagged</option>
                </select>
             </div>
             <div className="relative">
                <div className="absolute left-3 top-1/2 h-2 w-2 rounded-full bg-slate-500 -translate-y-1/2" />
                <select
                  value={travelTypeFilter}
                  onChange={(e) => setTravelTypeFilter(e.target.value as any)}
                  className="h-10 appearance-none rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-8 text-sm text-slate-300 focus:border-primary-500 focus:outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="SOLO">Solo</option>
                  <option value="COUPLE">Couple</option>
                  <option value="FAMILY">Family</option>
                  <option value="FRIENDS">Friends</option>
                </select>
             </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-inner backdrop-blur">
          {error && (
             <div className="m-4 flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
               <AlertTriangle className="h-4 w-4" /> {error}
             </div>
          )}

          {loading ? (
             <div className="flex h-64 flex-col items-center justify-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-2" />
                <p>Syncing travel plans...</p>
             </div>
          ) : filteredPlans.length === 0 ? (
             <div className="flex h-64 flex-col items-center justify-center text-slate-500">
                <Search className="h-12 w-12 text-slate-700 mb-4" />
                <p className="text-lg font-medium text-slate-300">No plans found</p>
                <p className="text-sm">Try adjusting your filters</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Destination & Host</th>
                    <th className="px-6 py-4 font-semibold">Timeline</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Budget</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPlans.map((p) => {
                    const hostObj = p.host && typeof p.host !== "string" ? (p.host as HostLite) : null;
                    const hostName = hostObj?.fullName || "Unknown User";
                    const hostInitial = hostName.charAt(0).toUpperCase();

                    return (
                      <tr key={p._id} className="group hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                              {hostInitial}
                            </div>
                            <div className="flex flex-col">
                              <Link href={`/travel-plans/${p._id}`} className="font-medium text-slate-100 hover:text-primary-400 hover:underline">
                                {p.destination}
                              </Link>
                              <Link href={`/profile?user=${hostObj?._id || ""}`} className="text-xs text-slate-500 hover:text-slate-300">
                                by {hostName}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-slate-300">
                                 <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                 <span>{p.startDate ? new Date(p.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "-"}</span>
                                 <span className="text-slate-600">to</span>
                                 <span>{p.endDate ? new Date(p.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "-"}</span>
                              </div>
                              <span className="text-[10px] text-slate-600">
                                Created {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <TypeIcon type={p.travelType} />
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5 text-slate-300">
                              <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                              {p.budgetRange ? p.budgetRange : "Flexible"}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 items-start">
                             <StatusBadge status={p.status} />
                             <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                {p.visibility === "PRIVATE" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                {p.visibility}
                             </div>
                          </div>
                        </td>
<td className="px-6 py-4 text-right">
  <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">

    <button
      onClick={() => handleDeletePlan(p._id)}
      disabled={actionLoadingId === p._id}
      className="rounded-lg bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition"
      title="Delete Plan"
    >
      {actionLoadingId === p._id ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>

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
        
        {/* Footer */}
        <div className="text-center text-xs text-slate-600">
           Showing {filteredPlans.length} results
        </div>
      </div>
    </div>
  );
}
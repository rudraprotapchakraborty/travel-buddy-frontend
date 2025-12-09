"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import {
  Users,
  Map,
  Star,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  MoreHorizontal,
  BarChart3,
  Globe,
} from "lucide-react";

// --- Types ---
interface Overview {
  userCount: number;
  planCount: number;
  reviewCount: number;
}

// --- Sub-Components ---

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorClass,
  href,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  trend?: string;
  colorClass: string;
  href: string;
}) => (
  <Link
    href={href}
    className="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-md transition-all duration-300 hover:bg-slate-800/50 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50"
  >
    <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20 ${colorClass}`} />
    
    <div className="flex items-start justify-between">
      <div className={`rounded-2xl p-3 bg-white/5 ${colorClass.replace("bg-", "text-")}`}>
        <Icon className="h-6 w-6" />
      </div>
      {trend && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </span>
      )}
    </div>

    <div className="mt-4">
      <h3 className="text-3xl font-bold text-white tracking-tight tabular-nums">{value}</h3>
      <p className="text-sm font-medium text-slate-400 mt-1">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
    </div>

    <div className="mt-6 flex items-center text-xs font-semibold text-primary-400 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
      Manage {title} <ArrowRight className="ml-1 h-3 w-3" />
    </div>
  </Link>
);

const ActivityItem = ({ title, time, type }: { title: string; time: string; type: "user" | "trip" | "review" }) => {
  let Icon = Users;
  let color = "text-blue-400 bg-blue-500/10";
  
  if (type === "trip") { Icon = Map; color = "text-emerald-400 bg-emerald-500/10"; }
  if (type === "review") { Icon = Star; color = "text-amber-400 bg-amber-500/10"; }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{title}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
      <button className="text-slate-600 hover:text-slate-300">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
};

const SimpleChart = () => (
  <div className="flex items-end justify-between gap-2 h-24 w-full mt-4 opacity-50">
    {[30, 45, 25, 60, 75, 50, 80, 55, 70, 90, 65, 85].map((h, i) => (
      <div 
        key={i} 
        style={{ height: `${h}%` }} 
        className={`w-full rounded-t-sm ${i % 2 === 0 ? "bg-primary-500/30" : "bg-primary-500/10"} hover:bg-primary-400/50 transition-colors`}
      />
    ))}
  </div>
);

// --- Main Page ---

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

  return (
    <Protected adminOnly>
      <div className="min-h-screen bg-slate-950 pb-20">
        {/* Background Ambience */}
        <div className="fixed inset-0 pointer-events-none">
           <div className="absolute top-0 left-1/4 h-[500px] w-[500px] bg-primary-900/10 blur-[120px] rounded-full" />
           <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] bg-indigo-900/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-600 mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin Portal</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
              <p className="text-slate-400 mt-1 text-sm">Welcome back. Here's what's happening on Travel Buddy today.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-sm font-medium text-emerald-400">System Operational</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-3xl bg-slate-900/50 border border-slate-800 animate-pulse" />
              ))
            ) : overview ? (
              <>
                <DashboardCard
                  title="Users"
                  value={overview.userCount}
                  subtitle="Total registered accounts"
                  icon={Users}
                  trend="+12% this week"
                  colorClass="bg-blue-500 text-blue-500"
                  href="/admin/users"
                />
                <DashboardCard
                  title="Travel Plans"
                  value={overview.planCount}
                  subtitle="Active trips being planned"
                  icon={Map}
                  trend="+5 new today"
                  colorClass="bg-emerald-500 text-emerald-500"
                  href="/admin/travel-plans"
                />
                <DashboardCard
                  title="Reviews"
                  value={overview.reviewCount}
                  subtitle="Community feedback"
                  icon={Star}
                  colorClass="bg-amber-500 text-amber-500"
                  href="/admin/travel-plans" // Redirecting here as review mgmt is usually inside plans or users
                />
              </>
            ) : (
              <div className="col-span-3 text-center py-10 text-slate-500">Failed to load data.</div>
            )}
          </div>
        </div>
      </div>
    </Protected>
  );
}
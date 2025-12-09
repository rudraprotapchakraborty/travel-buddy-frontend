"use client";

import { useEffect, useState, useMemo } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { 
  MapPin, 
  Calendar, 
  Plus, 
  Compass, 
  ArrowRight, 
  Clock, 
  Briefcase, 
  Loader2,
  Plane
} from "lucide-react";

// --- Types ---

interface TravelPlan {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
}

// --- Helpers ---

function getStatusConfig(status: string) {
  const s = status.toLowerCase();
  if (s.includes("open") || s.includes("active")) return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Active" };
  if (s.includes("closed") || s.includes("cancel")) return { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Cancelled" };
  if (s.includes("completed") || s.includes("past")) return { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", label: "Completed" };
  return { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", label: status };
}

function getDaysUntil(dateString: string) {
  const diff = new Date(dateString).getTime() - new Date().getTime();
  const days = Math.ceil(diff / (1000 * 3600 * 24));
  if (days < 0) return "Past";
  if (days === 0) return "Today";
  return `In ${days} days`;
}

// --- Components ---

const QuickActionCard = ({ href, icon: Icon, title, desc, primary = false }: any) => (
  <Link 
    href={href}
    className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      ${primary 
        ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/25" 
        : "bg-slate-900/50 border-white/5 text-slate-200 hover:bg-slate-800/50 hover:border-white/10"
      }`}
  >
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${primary ? "bg-white/10" : "bg-slate-800"}`}>
        <Icon className="w-6 h-6" />
      </div>
      <ArrowRight className={`w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${primary ? "text-white" : "text-slate-400"}`} />
    </div>
    <div className="mt-4">
      <h3 className="font-bold text-lg">{title}</h3>
      <p className={`text-xs mt-1 ${primary ? "text-primary-100" : "text-slate-500"}`}>{desc}</p>
    </div>
  </Link>
);

const PlanCard = ({ plan }: { plan: TravelPlan }) => {
  const status = getStatusConfig(plan.status);
  const timeStatus = getDaysUntil(plan.startDate);
  
  return (
    <Link 
      href={`/travel-plans/${plan._id}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/40 border border-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-white/10 hover:shadow-lg"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.bg} ${status.color} ${status.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.color.replace("text-", "bg-")}`} />
            {status.label}
          </div>
          <span className="text-xs font-mono text-slate-500">{timeStatus}</span>
        </div>

        <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors truncate">
          {plan.destination}
        </h3>
        
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>
            {new Date(plan.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            <span className="mx-1 text-slate-600">→</span>
            {new Date(plan.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
        <span>View Itinerary</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
};

// --- Main Page ---

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
        // Sort by start date (nearest first)
        const sorted = (res.data.data || []).sort((a: TravelPlan, b: TravelPlan) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        setPlans(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [token]);

  // Derived State
  const nextTrip = useMemo(() => {
    const now = new Date().getTime();
    return plans.find(p => new Date(p.startDate).getTime() > now);
  }, [plans]);

  const activeCount = plans.filter(p => p.status === 'ACTIVE' || p.status === 'OPEN').length;

  return (
    <Protected>
      <div className="min-h-screen pb-20 bg-slate-950 relative overflow-hidden">
        
        {/* Background Ambience */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-900/10 blur-[100px] rounded-full" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 blur-[100px] rounded-full" />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
          
          {/* --- Hero Section --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-600 mb-4">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                 </span>
                 <span>Dashboard & Overview</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-sky-300">{user?.fullName?.split(' ')[0] || "Traveler"}</span>.
              </h1>
              <p className="mt-2 text-slate-400 max-w-md">
                Ready for your next adventure? Manage your trips and connect with buddies here.
              </p>
            </div>

            {/* Next Trip Highlight Widget */}
            {nextTrip && (
               <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-md flex items-center gap-4 shadow-xl min-w-[260px]">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                     <Plane className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Next Trip</p>
                     <p className="text-white font-bold">{nextTrip.destination}</p>
                     <p className="text-xs text-primary-400 font-mono">{getDaysUntil(nextTrip.startDate)}</p>
                  </div>
               </div>
            )}
          </div>

          {/* --- Quick Actions Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <QuickActionCard 
                href="/explore"
                icon={Compass}
                title="Find Buddies"
                desc="Browse travelers heading to your destination."
                primary={true}
             />
             <QuickActionCard 
                href="/travel-plans/add"
                icon={Plus}
                title="Create Plan"
                desc="Post a new trip to get matched."
             />
             <QuickActionCard 
                href="/profile"
                icon={Briefcase}
                title="Your Profile"
                desc="Update your bio and travel interests."
             />
          </div>

          {/* --- Your Itineraries --- */}
          <div className="space-y-6">
             <div className="flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary-400" />
                      Your Itineraries
                   </h2>
                </div>
                {!loading && plans.length > 0 && (
                   <span className="text-xs text-slate-500 font-mono">
                      {activeCount} Active / {plans.length} Total
                   </span>
                )}
             </div>

             {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-white/5 animate-pulse" />
                   ))}
                </div>
             ) : plans.length === 0 ? (
                <div className="py-16 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
                   <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                      <MapPin className="w-8 h-8" />
                   </div>
                   <h3 className="text-lg font-medium text-white">No travel plans yet</h3>
                   <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 mb-6">
                      Start by creating a trip. It helps us match you with compatible travelers.
                   </p>
                   <Link 
                      href="/travel-plans/add"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 text-slate-900 text-sm font-bold hover:bg-white transition-colors"
                   >
                      <Plus className="w-4 h-4" />
                      Create First Plan
                   </Link>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {plans.map(plan => (
                      <PlanCard key={plan._id} plan={plan} />
                   ))}
                   
                   {/* "Add New" Ghost Card */}
                   <Link 
                      href="/travel-plans/add"
                      className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-transparent p-5 text-slate-600 transition-all hover:border-primary-500/50 hover:bg-primary-500/5 hover:text-primary-400 min-h-[180px]"
                   >
                      <div className="mb-3 rounded-full bg-slate-900 p-3 group-hover:bg-primary-500/20 transition-colors">
                         <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold">Plan new trip</span>
                   </Link>
                </div>
             )}
          </div>

        </div>
      </div>
    </Protected>
  );
}
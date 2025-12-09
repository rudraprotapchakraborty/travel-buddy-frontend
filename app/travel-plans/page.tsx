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
  ArrowRight, 
  Plane, 
  Clock, 
  Users, 
  MoreHorizontal,
  Filter
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
  if (s.includes("completed") || s.includes("past")) return { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", label: "Completed" };
  return { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20", label: status };
}

function getTripTiming(startDate: string, endDate: string) {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  if (now > end) return "Past Trip";
  if (now >= start && now <= end) return "Happening Now";
  
  const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
  return `In ${diff} days`;
}

// --- Components ---

const TripCard = ({ plan }: { plan: TravelPlan }) => {
  const status = getStatusConfig(plan.status);
  const timing = getTripTiming(plan.startDate, plan.endDate);
  
  return (
    <div className="group relative rounded-2xl bg-slate-900/60 border border-white/5 p-5 transition-all duration-300 hover:bg-slate-800/60 hover:border-white/10 hover:shadow-xl hover:shadow-black/20">
      
      {/* Top Row: Destination & Menu */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-primary-400 transition-colors">
              {plan.destination}
            </h3>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
               <Clock className="w-3 h-3" />
               <span className={timing === "Happening Now" ? "text-emerald-400" : ""}>{timing}</span>
            </div>
          </div>
        </div>
        
        <Link href={`/travel-plans/${plan._id}`} className="p-2 -mr-2 -mt-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
           <MoreHorizontal className="w-5 h-5" />
        </Link>
      </div>

      {/* Middle Row: Dates */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-white/5 mb-4">
         <Calendar className="w-4 h-4 text-slate-400" />
         <div className="flex items-center gap-1.5 text-sm text-slate-300 font-medium">
            <span>{new Date(plan.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span>{new Date(plan.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
         </div>
      </div>

      {/* Bottom Row: Status & Action */}
      <div className="flex items-center justify-between pt-2">
         <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.bg} ${status.color} ${status.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.color.replace("text-", "bg-")}`} />
            {status.label}
         </div>

         <Link 
            href={`/travel-plans/${plan._id}`}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 group/link transition-colors"
         >
            Manage Trip
            <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
         </Link>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function TravelPlansPage() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');

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

  const filteredPlans = useMemo(() => {
    const now = new Date().getTime();
    if (filter === 'ALL') return plans;
    if (filter === 'UPCOMING') return plans.filter(p => new Date(p.endDate).getTime() >= now);
    if (filter === 'PAST') return plans.filter(p => new Date(p.endDate).getTime() < now);
    return plans;
  }, [plans, filter]);

  return (
    <Protected>
      <div className="min-h-screen bg-slate-950 pb-20 relative overflow-hidden">
        
        {/* Ambient Background */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 blur-[100px] rounded-full" />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
          
          {/* --- Header --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-600 mb-4">
                  <MapPin className="w-3 h-3" />
                  <span>Itinerary Manager</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">My Travel Plans</h1>
               <p className="mt-2 text-slate-400">Organize your trips, manage requests, and track your history.</p>
            </div>
            
            <div className="flex gap-3">
               <Link 
                  href="/join-requests"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors border border-slate-700"
               >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Join Requests</span>
               </Link>
               <Link 
                  href="/travel-plans/add"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all hover:-translate-y-0.5"
               >
                  <Plus className="w-4 h-4" />
                  <span>New Trip</span>
               </Link>
            </div>
          </div>

          {/* --- Filters --- */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-xl border border-white/5 w-fit">
             {['ALL', 'UPCOMING', 'PAST'].map((f) => (
                <button
                   key={f}
                   onClick={() => setFilter(f as any)}
                   className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
                >
                   {f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
             ))}
          </div>

          {/* --- Content Grid --- */}
          <div className="relative min-h-[400px]">
             {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-white/5 animate-pulse" />
                   ))}
                </div>
             ) : filteredPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                   <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 mb-4">
                      <Plane className="w-8 h-8" />
                   </div>
                   <h3 className="text-lg font-bold text-white mb-1">No trips found</h3>
                   <p className="text-slate-500 text-sm max-w-xs mb-6">
                      {filter === 'ALL' ? "You haven't planned any trips yet. Start your journey today!" : `No ${filter.toLowerCase()} trips found.`}
                   </p>
                   {filter === 'ALL' && (
                      <Link 
                         href="/travel-plans/add"
                         className="px-6 py-2 rounded-full bg-slate-800 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors"
                      >
                         Create First Plan
                      </Link>
                   )}
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredPlans.map(plan => (
                      <TripCard key={plan._id} plan={plan} />
                   ))}
                   
                   {/* "Add New" Ghost Card */}
                   <Link 
                      href="/travel-plans/add"
                      className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-800 bg-transparent p-5 text-slate-600 transition-all hover:border-primary-500/50 hover:bg-primary-500/5 hover:text-primary-400 min-h-[200px]"
                   >
                      <div className="mb-3 rounded-full bg-slate-900 p-4 group-hover:bg-primary-500/20 transition-colors">
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
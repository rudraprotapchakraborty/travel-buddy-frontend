"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { 
  Plane, 
  MapPin, 
  Calendar, 
  User, 
  ArrowRight, 
  Inbox, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle
} from "lucide-react";

// --- Types ---

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

// --- Helpers ---

const getStatusConfig = (status: JoinStatus) => {
  const s = String(status).toLowerCase();
  if (s === "accepted") return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2, label: "Accepted" };
  if (s === "rejected") return { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: XCircle, label: "Rejected" };
  return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock, label: "Pending" };
};

const isPlanDeleted = (travelPlan?: TravelPlanLite | string) => {
  if (!travelPlan) return true;
  if (typeof travelPlan === "string") return true;
  if (!travelPlan._id || !travelPlan.destination) return true;
  return false;
};

// --- Components ---

const SentRequestCard = ({ request }: { request: JoinRequest }) => {
  const deleted = isPlanDeleted(request.travelPlan);
  const tp = request.travelPlan as TravelPlanLite;
  const status = getStatusConfig(request.status);
  const StatusIcon = status.icon;

  const content = (
    <div className={`relative flex flex-col justify-between h-full p-5 rounded-2xl border transition-all duration-300 
      ${deleted 
        ? "bg-slate-900/30 border-slate-800 opacity-60 cursor-not-allowed" 
        : "bg-slate-900/60 border-white/5 hover:border-white/10 hover:bg-slate-800/60 hover:shadow-xl"
      }`}
    >
      {/* Decorative Ticket Notch */}
      {!deleted && request.status === "ACCEPTED" && (
         <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-950 rounded-full border-l border-white/10" />
      )}

      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${deleted ? "bg-slate-800 text-slate-500" : "bg-gradient-to-br from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/20"}`}>
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg leading-tight">
                {deleted ? "Trip Unavailable" : tp.destination}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Calendar className="w-3 h-3" />
                {deleted ? "---" : `${new Date(tp.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}`}
              </div>
            </div>
          </div>
          
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.bg} ${status.color} ${status.border}`}>
             <StatusIcon className="w-3 h-3" />
             {status.label}
          </div>
        </div>

        {request.message && (
          <div className="relative pl-3 border-l-2 border-slate-800">
            <p className="text-xs text-slate-400 italic line-clamp-2">"{request.message}"</p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
         <span className="text-slate-500">Sent {new Date(request.createdAt).toLocaleDateString()}</span>
         {!deleted && (
            <span className="flex items-center gap-1 font-semibold text-primary-400 group-hover:text-primary-300 transition-colors">
               View Trip <ArrowRight className="w-3 h-3" />
            </span>
         )}
      </div>
    </div>
  );

  if (deleted) return <div>{content}</div>;
  return <Link href={`/travel-plans/${tp._id}`} className="group block h-full">{content}</Link>;
};

const HostRequestCard = ({ request }: { request: JoinRequest }) => {
  const deleted = isPlanDeleted(request.travelPlan);
  const tp = request.travelPlan as TravelPlanLite;
  const status = getStatusConfig(request.status);
  
  return (
    <div className="relative p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all">
       <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400 border border-slate-700">
                {request.requester?.fullName?.[0] || "?"}
             </div>
             <div>
                <h3 className="font-bold text-slate-100">{request.requester?.fullName || "Unknown User"}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                   <MapPin className="w-3 h-3" />
                   {request.requester?.currentLocation || "Location unknown"}
                </div>
             </div>
          </div>
          
          <Link 
            href={!deleted ? `/travel-plans/${tp._id}` : "#"} 
            className={`text-[10px] font-medium px-2 py-1 rounded-lg border transition-colors ${deleted ? "bg-slate-800 text-slate-500 border-transparent cursor-not-allowed" : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"}`}
          >
             {deleted ? "Trip Deleted" : tp.destination}
          </Link>
       </div>

       <div className="mt-4 bg-slate-950/50 p-3 rounded-xl border border-white/5">
          <p className="text-sm text-slate-300 leading-relaxed">
             "{request.message || "Hi, I'd love to join this trip!"}"
          </p>
       </div>

       <div className="mt-4 flex items-center justify-between">
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold ${status.color}`}>
             <status.icon className="w-3.5 h-3.5" />
             {status.label}
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
             {new Date(request.createdAt).toLocaleDateString()}
          </span>
       </div>
    </div>
  );
};

// --- Main Page ---

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
          api.get("/join-requests/me", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/join-requests/host", { headers: { Authorization: `Bearer ${token}` } }),
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

  return (
    <Protected>
      <div className="min-h-screen bg-slate-950 pb-20 relative overflow-hidden">
        
        {/* Ambient Background */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-900/10 blur-[120px] rounded-full" />
           <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary-900/10 blur-[120px] rounded-full" />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
          
          {/* --- Header --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-600">
                   <Inbox className="w-3 h-3" />
                   <span>Request Manager</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Join Requests</h1>
                <p className="text-slate-400 text-sm max-w-md">
                   Manage trips you want to join and review travelers who want to join you.
                </p>
             </div>

             {/* Tab Switcher */}
             <div className="p-1 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl inline-flex">
                <button
                   onClick={() => setActiveTab("SENT")}
                   className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === "SENT" ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" : "text-slate-400 hover:text-white"}`}
                >
                   <Send className="w-3.5 h-3.5" />
                   Sent <span className="opacity-60 ml-1">({sent.length})</span>
                </button>
                <button
                   onClick={() => setActiveTab("HOST")}
                   className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === "HOST" ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" : "text-slate-400 hover:text-white"}`}
                >
                   <Inbox className="w-3.5 h-3.5" />
                   Received <span className="opacity-60 ml-1">({hostRequests.length})</span>
                </button>
             </div>
          </div>

          {/* --- Content Grid --- */}
          <div className="min-h-[400px]">
             {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-40 rounded-2xl bg-slate-900/50 border border-white/5 animate-pulse" />
                   ))}
                </div>
             ) : (
                <>
                   {/* SENT TAB */}
                   {activeTab === "SENT" && (
                      sent.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-4">
                               <Send className="w-6 h-6" />
                            </div>
                            <p className="text-slate-300 font-medium">No outgoing requests</p>
                            <p className="text-slate-500 text-xs mt-1 mb-4">You haven't asked to join any trips yet.</p>
                            <Link href="/explore" className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 transition">Explore Trips</Link>
                         </div>
                      ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sent.map(r => <SentRequestCard key={r._id} request={r} />)}
                         </div>
                      )
                   )}

                   {/* HOST TAB */}
                   {activeTab === "HOST" && (
                      hostRequests.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-4">
                               <Inbox className="w-6 h-6" />
                            </div>
                            <p className="text-slate-300 font-medium">No incoming requests</p>
                            <p className="text-slate-500 text-xs mt-1">When people want to join your trips, they'll appear here.</p>
                         </div>
                      ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {hostRequests.map(r => <HostRequestCard key={r._id} request={r} />)}
                         </div>
                      )
                   )}
                </>
             )}
          </div>

        </div>
      </div>
    </Protected>
  );
}
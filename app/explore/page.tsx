"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api, { getErrorMessage } from "@/lib/api";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  Filter, 
  Loader2,
  Plane
} from "lucide-react";

// --- Types ---

interface MatchPlan {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelType: string;
  user: {
    _id: string;
    fullName: string;
    currentLocation?: string;
  };
}

// --- Components ---

const SearchField = ({ 
  icon: Icon, 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text" 
}: any) => (
  <div className="relative group">
    <label className="absolute -top-2 left-3 bg-slate-900 px-1 text-[10px] font-medium text-slate-400 group-focus-within:text-primary-400 transition-colors">
      {label}
    </label>
    <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 transition-all group-focus-within:border-primary-500/50 group-focus-within:ring-1 group-focus-within:ring-primary-500/50">
      <Icon className="w-4 h-4 text-slate-500 mr-2 group-focus-within:text-primary-400 transition-colors" />
      {type === 'select' ? (
         <select 
            value={value} 
            onChange={onChange}
            className="w-full bg-transparent text-sm text-slate-200 outline-none appearance-none"
         >
            <option value="">Any Type</option>
            <option value="SOLO">Solo Trip</option>
            <option value="COUPLE">Couple Trip</option>
            <option value="FRIENDS">Friends Trip</option>
            <option value="FAMILY">Family Trip</option>
         </select>
      ) : (
         <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
         />
      )}
    </div>
  </div>
);

const ResultCard = ({ plan }: { plan: MatchPlan }) => (
  <Link 
    href={`/travel-plans/${plan._id}`}
    className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-white/10 hover:shadow-xl hover:-translate-y-1"
  >
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
           <Plane className="w-3 h-3" />
           {plan.travelType}
        </div>
        <div className="text-slate-500 group-hover:text-primary-400 transition-colors">
           <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary-100 transition-colors">
        {plan.destination}
      </h3>
      
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <Calendar className="w-3 h-3" />
        <span>
           {new Date(plan.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})} 
           {" - "} 
           {new Date(plan.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
        </span>
      </div>
    </div>

    <div className="pt-4 border-t border-white/5 flex items-center gap-3">
       <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
          {plan.user.fullName?.[0] ?? "?"}
       </div>
       <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{plan.user.fullName}</p>
          {plan.user.currentLocation && (
             <p className="text-[10px] text-slate-500 truncate">From {plan.user.currentLocation}</p>
          )}
       </div>
    </div>
  </Link>
);

// --- Main Page ---

export default function ExplorePage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("travelType") ?? "";
  const [destination, setDestination] = useState(searchParams.get("destination") ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelType, setTravelType] = useState(
    ["SOLO", "COUPLE", "FAMILY", "FRIENDS"].includes(initialType) ? initialType : ""
  );
  const [results, setResults] = useState<MatchPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loads matches for the given filters. State is only set after the request
  // has started, so it is safe to call from an effect.
  const load = async (filters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    try {
      const res = await api.get(`/travel-plans/match?${params.toString()}`);
      // plans whose owner was removed come back without a user; skip them
      setResults((res.data.data || []).filter((p: MatchPlan) => p?.user));
      setError(null);
    } catch (err) {
      setResults([]);
      setError(getErrorMessage(err, "Could not load trips. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Show real trips straight away instead of an empty page
  useEffect(() => {
    if (!token) return;
    // Data fetch on mount: state is only set once the response arrives
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load({ destination, travelType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setHasSearched(true);
    await load({ destination, startDate, endDate, travelType });
  };

  return (
    <Protected>
      <div className="min-h-screen bg-slate-950 pb-20 relative overflow-hidden">
        
        {/* Ambient Background */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 blur-[100px] rounded-full" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-900/10 blur-[100px] rounded-full" />
           <div className="absolute inset-0 opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 space-y-10">
          
          {/* --- Header --- */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-600">
                <Users className="w-3 h-3" />
                <span>Connect & Travel</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Travel Buddy</span>
             </h1>
             <p className="text-slate-400 text-lg">
                Discover like-minded travelers heading to your dream destinations.
             </p>
          </div>

          {/* --- Search Bar --- */}
          <form 
            onSubmit={handleSearch}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50"
          >
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                   <SearchField icon={MapPin} label="Destination" value={destination} onChange={(e: any) => setDestination(e.target.value)} placeholder="Where do you want to go?" />
                </div>
                <div className="md:col-span-2">
                   <SearchField icon={Calendar} label="From" type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                   <SearchField icon={Calendar} label="To" type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                   <SearchField icon={Users} label="Type" type="select" value={travelType} onChange={(e: any) => setTravelType(e.target.value)} />
                </div>
                <div className="md:col-span-2 flex items-end">
                   <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-[42px] bg-primary-600 hover:bg-primary-500 text-on-brand font-bold rounded-xl transition-all shadow-lg shadow-primary-500/25 disabled:opacity-70 flex items-center justify-center gap-2"
                   >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Search
                   </button>
                </div>
             </div>
          </form>

          {/* --- Results --- */}
          <div className="space-y-6">
             <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <Filter className="w-5 h-5 text-primary-400" />
                   {hasSearched ? `Found ${results.length} Trip${results.length !== 1 ? 's' : ''}` : "Open trips"}
                </h2>
                {!hasSearched && !loading && results.length > 0 && (
                   <span className="text-xs text-slate-500">Upcoming public trips from other travelers</span>
                )}
             </div>

             {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-white/5 animate-pulse" />
                   ))}
                </div>
             ) : error ? (
                <div role="alert" className="py-16 text-center bg-rose-500/5 border border-rose-500/20 rounded-3xl text-rose-200 text-sm">
                   {error}
                </div>
             ) : results.length === 0 ? (
                <div className="py-20 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
                   <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                      <Search className="w-8 h-8" />
                   </div>
                   <h3 className="text-lg font-bold text-white mb-2">{hasSearched ? "No matches found" : "No open trips yet"}</h3>
                   <p className="text-slate-500 max-w-sm mx-auto">
                      Try adjusting your dates or destination. Or be the first to create a trip there!
                   </p>
                   <Link href="/travel-plans/add" className="inline-block mt-6 px-6 py-2 rounded-full bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors">
                      Create Trip Plan
                   </Link>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {/* If no search yet, show nothing or suggested. Here we assume results might be pre-filled or empty initially */}
                   {results.map(plan => (
                      <ResultCard key={plan._id} plan={plan} />
                   ))}
                </div>
             )}
          </div>

        </div>
      </div>
    </Protected>
  );
}
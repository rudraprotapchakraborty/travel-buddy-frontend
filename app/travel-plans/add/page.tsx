"use client";

import { FormEvent, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Users, 
  Heart, 
  Baby, 
  Plane, 
  Loader2, 
  AlignLeft,
  ArrowRight,
  Sparkles
} from "lucide-react";

// --- Components ---

const TravelTypeCard = ({ 
  id, 
  label, 
  icon: Icon, 
  selected, 
  onClick 
}: { 
  id: string; 
  label: string; 
  icon: any; 
  selected: boolean; 
  onClick: () => void; 
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
      selected 
        ? "bg-primary-600/10 border-primary-500 text-primary-400 ring-1 ring-primary-500/50" 
        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900"
    }`}
  >
    <Icon className={`w-6 h-6 ${selected ? "text-primary-400" : "text-slate-500"}`} />
    <span className="text-xs font-semibold">{label}</span>
    {selected && (
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
    )}
  </button>
);

// --- Main Page ---

export default function AddTravelPlanPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [travelType, setTravelType] = useState("SOLO");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);

    try {
      await api.post(
        "/travel-plans",
        {
          destination,
          startDate,
          endDate,
          budgetMin: budgetMin ? Number(budgetMin) : undefined,
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
          travelType,
          description,
          isPublic: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push("/travel-plans");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Protected>
      <div className="min-h-screen bg-slate-950 flex justify-center py-12 px-4 relative overflow-hidden">
        
        {/* Background Ambience */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 blur-[120px] rounded-full" />
           <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary-900/10 blur-[120px] rounded-full" />
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="w-full max-w-2xl relative z-10 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-300">
               <Sparkles className="w-3 h-3" />
               <span>New Adventure</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Plan a new trip</h1>
            <p className="text-slate-400 max-w-md mx-auto">
              Share your itinerary details to help us match you with the perfect travel companions.
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 space-y-8"
          >
            
            {/* 1. Destination */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <div className="bg-primary-500/10 p-1.5 rounded-lg text-primary-400">
                     <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Where to?</h3>
               </div>
               
               <div className="group relative">
                  <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                  <input
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    required
                    placeholder="e.g. Bali, Indonesia"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
               </div>
            </div>

            {/* 2. Type & Dates */}
            <div className="grid md:grid-cols-2 gap-8">
               
               {/* Travel Type */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                     <div className="bg-indigo-500/10 p-1.5 rounded-lg text-indigo-400">
                        <Users className="w-4 h-4" />
                     </div>
                     <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Who's going?</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <TravelTypeCard id="SOLO" label="Solo" icon={User} selected={travelType === "SOLO"} onClick={() => setTravelType("SOLO")} />
                     <TravelTypeCard id="COUPLE" label="Couple" icon={Heart} selected={travelType === "COUPLE"} onClick={() => setTravelType("COUPLE")} />
                     <TravelTypeCard id="FRIENDS" label="Friends" icon={Users} selected={travelType === "FRIENDS"} onClick={() => setTravelType("FRIENDS")} />
                     <TravelTypeCard id="FAMILY" label="Family" icon={Baby} selected={travelType === "FAMILY"} onClick={() => setTravelType("FAMILY")} />
                  </div>
               </div>

               {/* Dates */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                     <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400">
                        <Calendar className="w-4 h-4" />
                     </div>
                     <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">When?</h3>
                  </div>
                  <div className="space-y-3">
                     <div className="group relative">
                        <label className="absolute -top-2 left-3 bg-slate-900 px-1 text-[10px] font-medium text-slate-400">Start</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                        />
                     </div>
                     <div className="group relative">
                        <label className="absolute -top-2 left-3 bg-slate-900 px-1 text-[10px] font-medium text-slate-400">End</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={e => setEndDate(e.target.value)}
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* 3. Budget & Description */}
            <div className="grid md:grid-cols-3 gap-8">
               
               {/* Budget */}
               <div className="md:col-span-1 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                     <div className="bg-amber-500/10 p-1.5 rounded-lg text-amber-400">
                        <DollarSign className="w-4 h-4" />
                     </div>
                     <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Budget ($)</h3>
                  </div>
                  <div className="flex items-center gap-2">
                     <input
                       type="number"
                       value={budgetMin}
                       onChange={e => setBudgetMin(e.target.value)}
                       placeholder="Min"
                       className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                     />
                     <span className="text-slate-600">-</span>
                     <input
                       type="number"
                       value={budgetMax}
                       onChange={e => setBudgetMax(e.target.value)}
                       placeholder="Max"
                       className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                     />
                  </div>
               </div>

               {/* Description */}
               <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                     <div className="bg-sky-500/10 p-1.5 rounded-lg text-sky-400">
                        <AlignLeft className="w-4 h-4" />
                     </div>
                     <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">The Plan</h3>
                  </div>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe your vibe (e.g. 'Looking for foodies to explore night markets...')"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all resize-none"
                  />
               </div>
            </div>

            {/* Error Message */}
            {error && (
               <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
                  {error}
               </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-white/5">
               <p className="text-xs text-slate-500 hidden sm:block">
                  Your plan will be posted to the Explore feed.
               </p>
               <button
                  type="submit"
                  disabled={saving}
                  className="group relative w-full sm:w-auto overflow-hidden rounded-xl bg-primary-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-500 hover:shadow-primary-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
               >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                     {saving ? (
                        <>
                           <Loader2 className="w-4 h-4 animate-spin" />
                           <span>Publishing...</span>
                        </>
                     ) : (
                        <>
                           <span>Publish Trip</span>
                           <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                     )}
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
               </button>
            </div>

          </form>
        </div>
      </div>
    </Protected>
  );
}
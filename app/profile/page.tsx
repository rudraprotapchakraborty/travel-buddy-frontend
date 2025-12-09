"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Star, 
  User, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Edit3, 
  Save, 
  Loader2, 
  Plane,
  MessageSquare
} from "lucide-react";

// --- Types ---

interface Review {
  _id: string;
  reviewer: { _id: string; fullName?: string } | string;
  reviewee: string;
  rating: number;
  comment?: string;
  travelPlan?: string | { _id: string };
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

// --- Helper Components ---

const Tag = ({ label }: { label: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
    {label}
  </span>
);

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
    <Icon className="w-4 h-4 text-primary-400" />
    <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">{title}</h3>
  </div>
);

// --- Main Component ---

export default function ProfilePage() {
  const { token, user: me } = useAuth();
  const search = useSearchParams();
  const requestedUserId = search.get("user");
  const viewingOther = Boolean(
    requestedUserId && requestedUserId !== (me as any)?._id
  );

  // State
  const [bio, setBio] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [travelInterests, setTravelInterests] = useState("");
  const [visitedCountries, setVisitedCountries] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // --- Logic ---

  useEffect(() => {
    const profileId = requestedUserId ?? null;

    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        setFetchError("Not authenticated");
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        let data: any = null;
        if (profileId) {
          const res = await api.get(`/users/${profileId}`, { headers: { Authorization: `Bearer ${token}` } });
          data = res.data?.data ?? res.data ?? null;
          setProfile(data ?? null);
        } else {
          const res = await api.get("/users/me/self", { headers: { Authorization: `Bearer ${token}` } });
          data = res.data?.data ?? res.data ?? null;
          setProfile(data ?? null);

          setBio(data?.bio ?? "");
          setCurrentLocation(data?.currentLocation ?? "");
          setTravelInterests(Array.isArray(data?.travelInterests) ? data.travelInterests.join(", ") : data?.travelInterests ?? "");
          setVisitedCountries(Array.isArray(data?.visitedCountries) ? data.visitedCountries.join(", ") : data?.visitedCountries ?? "");
        }

        if (data) {
          setAvgRating(typeof data.avgRating === "number" ? data.avgRating : (prev => prev)(null));
          setReviewCount(typeof data.reviewCount === "number" ? data.reviewCount : 0);
        }

        const idForReviews = data?._id ?? data?.id ?? profileId;
        if (idForReviews) {
          fetchReviews(idForReviews as string);
        } else {
          setAvgRating(null);
          setReviewCount(0);
          setRecentReviews([]);
        }
      } catch (err: any) {
        console.error(err);
        setFetchError(err?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async (revieweeId: string) => {
      if (!token) return;
      setLoadingReviews(true);
      try {
        const res = await api.get(`/reviews?revieweeId=${revieweeId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data: Review[] = res.data?.data || [];

        if (!Array.isArray(data) || data.length === 0) {
          if (profile?.avgRating == null) setAvgRating(null);
          if (profile?.reviewCount == null) setReviewCount(0);
          setRecentReviews([]);
        } else {
          const count = data.length;
          const sum = data.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
          const avg = sum / count;
          setAvgRating(Number.isFinite(avg) ? Math.round(avg * 10) / 10 : null);
          setReviewCount(count);
          setRecentReviews(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
        }
      } catch (err: any) {
         // Silently fail for 404 on reviews
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchProfile();
  }, [token, requestedUserId, me]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.patch(
        "/users/me/self",
        {
          bio,
          currentLocation,
          travelInterests: travelInterests.split(",").map((s) => s.trim()).filter(Boolean),
          visitedCountries: visitedCountries.split(",").map((s) => s.trim()).filter(Boolean),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated successfully.");
      setTimeout(() => setMessage(null), 3000);
      
      // Refresh local profile data
      try {
        const res = await api.get("/users/me/self", { headers: { Authorization: `Bearer ${token}` } });
        setProfile(res.data?.data ?? res.data ?? null);
      } catch (e) {}
    } catch (err) {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Protected><div className="flex h-screen items-center justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div></Protected>;
  if (fetchError) return <Protected><div className="p-10 text-center text-rose-400 bg-rose-500/10 rounded-xl m-10 border border-rose-500/20">{fetchError}</div></Protected>;
  if (!profile) return <Protected><div className="p-10 text-center text-slate-400">Profile not found.</div></Protected>;

  const isAdmin = typeof profile?.role === "string" && profile.role.toLowerCase() === "admin";
  const isVerifiedSubscriber = profile?.subscriptionStatus === "ACTIVE";
  const initials = (profile.fullName || "U").substring(0, 2).toUpperCase();

  const travelPlanIdFromReview = (r: Review): string | null => {
    if (!r.travelPlan) return null;
    if (typeof r.travelPlan === "string") return r.travelPlan;
    return (r.travelPlan as any)?._id ?? null;
  };

  return (
    <Protected>
      <div className="min-h-screen bg-slate-950 pb-20">
        
        {/* --- Hero Banner --- */}
        <div className="relative h-48 md:h-64 w-full bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 opacity-80" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-20">
          
          {/* --- Profile Header Card --- */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
            
            {/* Avatar */}
            <div className="relative group">
               <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-slate-950 bg-gradient-to-br from-slate-700 to-slate-900 shadow-2xl flex items-center justify-center text-4xl md:text-5xl font-bold text-white relative overflow-hidden">
                  {initials}
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
               {isVerifiedSubscriber && (
                 <div className="absolute bottom-2 right-2 bg-slate-950 rounded-full p-1" title="Verified Subscriber">
                    <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg shadow-emerald-500/40">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                 </div>
               )}
            </div>

            {/* Name & Stats */}
            <div className="flex-1 pb-2">
               <div className="flex flex-col md:flex-row md:items-center gap-3">
                 <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                   {profile.fullName || profile.name || "Unknown User"}
                 </h1>
                 <div className="flex gap-2">
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                        Admin
                      </span>
                    )}
                 </div>
               </div>
               
               <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {profile.currentLocation || "Location unknown"}
                  </div>
                  <div className="hidden md:block w-1 h-1 rounded-full bg-slate-700" />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "-"}
                  </div>
               </div>
            </div>

            {/* Rating Stat (Top Right) */}
            <div className="flex items-center gap-4 bg-slate-900/80 border border-white/5 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl mb-2">
               <div className="text-right">
                  <div className="text-2xl font-bold text-white leading-none">
                    {avgRating ? avgRating.toFixed(1) : "—"}
                  </div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Rating</div>
               </div>
               <div className="h-10 w-px bg-white/10" />
               <div>
                  <div className="text-2xl font-bold text-white leading-none">
                    {reviewCount}
                  </div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Reviews</div>
               </div>
            </div>
          </div>

          {/* --- Content Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Vitals & Private Info */}
            <div className="space-y-6">
               {/* Contact / Private Details (Only visible to Admin or Self) */}
               {(!viewingOther || isAdmin) && (
                 <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                    <SectionHeader icon={User} title="Account Details" />
                    <div className="space-y-4">
                       <div className="group">
                          <label className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Email</label>
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                             <Mail className="w-4 h-4 text-slate-600" />
                             {profile.email}
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Status</label>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${profile.isBlocked ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                               {profile.isBlocked ? <ShieldAlert className="w-3 h-3"/> : <ShieldCheck className="w-3 h-3"/>}
                               {profile.isBlocked ? "Blocked" : "Active"}
                            </span>
                          </div>
                          <div>
                             <label className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Plan</label>
                             <span className="text-slate-300 text-sm">{profile.subscriptionPlan || "Free"}</span>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {/* Stats / Countries */}
               <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                  <SectionHeader icon={Globe} title="Travel Stats" />
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-2">Visited Countries</label>
                        {viewingOther ? (
                           <div className="flex flex-wrap gap-2">
                              {profile.visitedCountries?.length > 0 ? (
                                 (Array.isArray(profile.visitedCountries) ? profile.visitedCountries : profile.visitedCountries.split(',')).map((c: string, i: number) => (
                                    <Tag key={i} label={c.trim()} />
                                 ))
                              ) : (
                                 <span className="text-sm text-slate-500 italic">No countries listed yet.</span>
                              )}
                           </div>
                        ) : (
                           <input 
                              value={visitedCountries}
                              onChange={(e) => setVisitedCountries(e.target.value)}
                              placeholder="e.g. Japan, France, Brazil"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                           />
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Bio, Interests, Reviews */}
            <div className="lg:col-span-2 space-y-6">
               
               {/* Bio & Interests */}
               <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
                  
                  <div className="flex items-center justify-between mb-4">
                     <SectionHeader icon={Edit3} title="About" />
                     {!viewingOther && saving && <span className="text-xs text-primary-400 animate-pulse">Saving changes...</span>}
                     {!viewingOther && !saving && message && <span className="text-xs text-emerald-400">{message}</span>}
                  </div>

                  <div className="space-y-6 relative z-10">
                     <div>
                        <label className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-2">Bio</label>
                        {viewingOther ? (
                           <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {profile.bio || "This user hasn't written a bio yet."}
                           </p>
                        ) : (
                           <textarea 
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              rows={4}
                              placeholder="Tell the community about your travel style..."
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none"
                           />
                        )}
                     </div>

                     <div>
                        <label className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-2">Travel Interests</label>
                        {viewingOther ? (
                           <div className="flex flex-wrap gap-2">
                              {profile.travelInterests?.length > 0 ? (
                                 (Array.isArray(profile.travelInterests) ? profile.travelInterests : profile.travelInterests.split(',')).map((tag: string, i: number) => (
                                    <Tag key={i} label={tag.trim()} />
                                 ))
                              ) : (
                                 <span className="text-sm text-slate-500 italic">No interests listed.</span>
                              )}
                           </div>
                        ) : (
                           <div className="space-y-2">
                              <input 
                                 value={travelInterests}
                                 onChange={(e) => setTravelInterests(e.target.value)}
                                 placeholder="e.g. Hiking, Food, History"
                                 className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                              />
                              {!viewingOther && (
                                <div className="grid grid-cols-2 gap-4">
                                   <div>
                                     <label className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">Current Location</label>
                                     <input 
                                       value={currentLocation}
                                       onChange={(e) => setCurrentLocation(e.target.value)}
                                       placeholder="City, Country"
                                       className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                     />
                                   </div>
                                </div>
                              )}
                           </div>
                        )}
                     </div>

                     {!viewingOther && (
                        <div className="pt-2 flex justify-end">
                           <button 
                              onClick={handleSave}
                              disabled={saving}
                              className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              Save Changes
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               {/* Reviews Section */}
               <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                  <SectionHeader icon={Star} title="Community Reviews" />
                  
                  {loadingReviews ? (
                     <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-600" /></div>
                  ) : recentReviews.length === 0 ? (
                     <div className="text-center py-10 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                        <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No reviews received yet.</p>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {recentReviews.map((r) => {
                           const tpId = travelPlanIdFromReview(r);
                           const ReviewContent = (
                              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors">
                                 <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                       <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                          {(typeof r.reviewer === 'string' ? "T" : (r.reviewer as any).fullName?.[0]) || "U"}
                                       </div>
                                       <div>
                                          <p className="text-sm font-medium text-slate-200">
                                             {typeof r.reviewer === "string" ? "Traveler" : (r.reviewer as any).fullName ?? "Traveler"}
                                          </p>
                                          <p className="text-[10px] text-slate-500">
                                             {new Date(r.createdAt).toLocaleDateString()} {r.isEdited && "(edited)"}
                                          </p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                                       <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                       <span className="text-xs font-bold text-yellow-500">{r.rating}</span>
                                    </div>
                                 </div>
                                 {r.comment && (
                                    <p className="text-sm text-slate-400 leading-relaxed pl-10">
                                       "{r.comment}"
                                    </p>
                                 )}
                                 {tpId && (
                                    <div className="mt-3 pl-10">
                                       <span className="inline-flex items-center gap-1 text-[10px] text-primary-400 hover:text-primary-300 transition-colors">
                                          <Plane className="w-3 h-3" />
                                          View Related Trip
                                       </span>
                                    </div>
                                 )}
                              </div>
                           );

                           return tpId ? (
                              <Link key={r._id} href={`/travel-plans/${tpId}`} className="block">
                                 {ReviewContent}
                              </Link>
                           ) : (
                              <div key={r._id}>{ReviewContent}</div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>

          </div>
        </div>
      </div>
    </Protected>
  );
}
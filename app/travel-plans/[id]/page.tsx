"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  Users, 
  Flag, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Star, 
  Trash2, 
  StopCircle, 
  Send,
  User,
  Clock
} from "lucide-react";

// --- Types ---

interface Plan {
  _id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetMin?: number;
  budgetMax?: number;
  travelType: string;
  description?: string;
  status: string;
  user: {
    _id: string;
    fullName: string;
  };
}

type JoinStatus = "PENDING" | "ACCEPTED" | "REJECTED";

interface JoinRequest {
  _id: string;
  travelPlan: string | { _id: string };
  requester: {
    _id: string;
    fullName: string;
    currentLocation?: string;
  };
  host: string | { _id: string };
  status: JoinStatus;
  message?: string;
  createdAt: string;
}

interface Review {
  _id: string;
  reviewer: { _id: string; fullName: string; profileImage?: string } | string;
  reviewee: string;
  rating: number;
  comment?: string;
  travelPlan?: string | { _id: string };
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  let color = "bg-slate-800 text-slate-400 border-slate-700";
  let Icon = Flag;

  if (s === "completed") { color = "bg-sky-500/10 text-sky-400 border-sky-500/20"; Icon = CheckCircle; }
  else if (s === "active" || s === "open") { color = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"; Icon = Flag; }
  else if (s === "cancelled") { color = "bg-rose-500/10 text-rose-400 border-rose-500/20"; Icon = XCircle; }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </div>
  );
};

const RequestStatusBadge = ({ status }: { status: JoinStatus }) => {
  if (status === "ACCEPTED") return <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold"><CheckCircle className="w-3 h-3"/> Accepted</span>;
  if (status === "REJECTED") return <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-bold"><XCircle className="w-3 h-3"/> Rejected</span>;
  return <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-bold"><Clock className="w-3 h-3"/> Pending</span>;
};

// --- Main Page ---

export default function TravelPlanDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { token, user } = useAuth();
  const router = useRouter();

  // State
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Requests
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // My Request (Guest)
  const [myRequest, setMyRequest] = useState<JoinRequest | null>(null);
  const [loadingMyRequest, setLoadingMyRequest] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");

  // Logic Helpers
  const isHost = !!(user && plan && user.id === plan.user._id);
  const isCompleted = !!plan && String(plan.status || "").toLowerCase() === "completed";
  const isAdmin = !!user && (((user as any).role && (String((user as any).role).toUpperCase() === "ADMIN")) || false);

  // --- Data Fetching ---

  const fetchPlan = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const res = await api.get(`/travel-plans/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPlan(res.data.data);
    } catch (err) { setError("Failed to load travel plan"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlan(); }, [token, id]); // eslint-disable-line

  // Fetch Requests (Host)
  useEffect(() => {
    if (!token || !id || !isHost) return;
    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        const res = await api.get("/join-requests/host", { headers: { Authorization: `Bearer ${token}` } });
        const all: JoinRequest[] = res.data.data || [];
        // Filter manually for now as API returns all
        const filtered = all.filter((r) => {
           const tp = r.travelPlan as any;
           if (!tp) return false;
           return (typeof tp === "string" ? tp : tp._id) === id;
        });
        setRequests(filtered);
      } catch (err) { console.error(err); } 
      finally { setLoadingRequests(false); }
    };
    fetchRequests();
  }, [token, id, isHost]);

  // Fetch My Request (Guest)
  useEffect(() => {
    if (!token || !id || isHost || !plan) return;
    const fetchMyRequest = async () => {
      setLoadingMyRequest(true);
      try {
        const res = await api.get("/join-requests/me", { headers: { Authorization: `Bearer ${token}` } });
        const all: JoinRequest[] = res.data.data || [];
        const found = all.find((r) => {
           const tp = r.travelPlan as any;
           if (!tp) return false;
           return (typeof tp === "string" ? tp : tp._id) === id;
        });
        setMyRequest(found || null);
      } catch (err) { console.error(err); } 
      finally { setLoadingMyRequest(false); }
    };
    fetchMyRequest();
  }, [token, id, isHost, plan]);

  // Fetch Reviews
  useEffect(() => {
    if (!token || !plan) return;
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const res = await api.get(`/reviews?revieweeId=${plan.user._id}&travelPlanId=${plan._id}`, { headers: { Authorization: `Bearer ${token}` } });
        setReviews(res.data?.data || []);
      } catch (err: any) { 
         // 404 is fine (no reviews)
      } finally { setLoadingReviews(false); }
    };
    fetchReviews();
  }, [token, plan]);

  // --- Handlers ---

  const handleDelete = async () => {
    if (!token || !id) return;
    if (!confirm("Permanently delete this travel plan?")) return;
    try {
      await api.delete(`/travel-plans/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      router.push("/travel-plans");
    } catch (err) { alert("Failed to delete plan"); }
  };

  const handleEndTrip = async () => {
    if (!token || !id || !plan) return;
    if (!confirm("Mark trip as completed? This allows participants to leave reviews.")) return;
    try {
      await api.patch(`/travel-plans/${id}`, { status: "COMPLETED" }, { headers: { Authorization: `Bearer ${token}` } });
      fetchPlan();
    } catch (err) { alert("Failed to update status"); }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    setJoinSubmitting(true);
    try {
      const res = await api.post("/join-requests", { travelPlanId: id, message: joinMessage }, { headers: { Authorization: `Bearer ${token}` } });
      setMyRequest(res.data?.data || null);
      setJoinMessage("");
    } catch (err: any) { setError(err?.response?.data?.message || "Failed to join"); } 
    finally { setJoinSubmitting(false); }
  };

  const updateRequestStatus = async (requestId: string, status: JoinStatus) => {
    if (!token) return;
    try {
      await api.patch(`/join-requests/${requestId}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setRequests((prev) => prev.map((r) => (r._id === requestId ? { ...r, status } : r)));
    } catch (err) { alert("Action failed"); }
  };

  // Review Logic
  const canLeaveReview = () => {
    if (!user || !plan) return false;
    if (user.id === plan.user._id) return false;
    const ended = new Date(plan.endDate).getTime() < Date.now() || String(plan.status).toLowerCase() === "completed";
    return ended && myRequest?.status === "ACCEPTED";
  };

  const handleSubmitReview = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!token || !plan || !user) return;
    
    // Helper to mock response shape for UI update
    const mockReviewer = { _id: user.id, fullName: (user as any).fullName || "You" };

    try {
      if (editingReview) {
        await api.patch(`/reviews/${editingReview._id}`, { rating: reviewRating, comment: reviewComment }, { headers: { Authorization: `Bearer ${token}` } });
        setReviews(prev => prev.map(r => r._id === editingReview._id ? { ...r, rating: reviewRating, comment: reviewComment } : r));
      } else {
        const res = await api.post(`/reviews`, { revieweeId: plan.user._id, rating: reviewRating, comment: reviewComment, travelPlanId: plan._id }, { headers: { Authorization: `Bearer ${token}` } });
        const newReview = { ...res.data.data, reviewer: mockReviewer };
        setReviews(prev => [newReview, ...prev]);
      }
      setShowReviewForm(false);
      setEditingReview(null);
      setReviewRating(5);
      setReviewComment("");
    } catch (err: any) { alert(err?.response?.data?.message || "Failed"); }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!token || !confirm("Delete review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) { alert("Failed to delete"); }
  };

  if (loading) return <Protected><div className="flex h-96 items-center justify-center text-slate-500">Loading plan details...</div></Protected>;
  if (!plan) return <Protected><div className="p-8 text-center text-rose-400">Plan not found.</div></Protected>;

  return (
    <Protected>
      <div className="min-h-screen bg-slate-950 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
          
          {/* --- Hero Section --- */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-white/5 p-6 md:p-8 shadow-2xl">
             <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-900/20 blur-[100px] rounded-full pointer-events-none" />
             
             <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <StatusBadge status={plan.status} />
                         <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{plan.travelType} Trip</span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{plan.destination}</h1>
                   </div>
                   
                   <div className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="flex -space-x-2">
                         <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-slate-400">
                            {plan.user.fullName[0]}
                         </div>
                      </div>
                      <span className="text-slate-500">Hosted by</span>
                      <span className="font-semibold text-white">{plan.user.fullName}</span>
                   </div>
                </div>

                {/* Host Actions */}
                {isHost && (
                   <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={handleEndTrip} 
                        disabled={isCompleted}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isCompleted ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"}`}
                      >
                         <StopCircle className="w-4 h-4" />
                         {isCompleted ? "Trip Completed" : "End Trip"}
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                         Delete
                      </button>
                   </div>
                )}
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                <div>
                   <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Start Date</label>
                   <div className="flex items-center gap-2 text-slate-200 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-primary-400" />
                      {new Date(plan.startDate).toLocaleDateString()}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">End Date</label>
                   <div className="flex items-center gap-2 text-slate-200 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-primary-400" />
                      {new Date(plan.endDate).toLocaleDateString()}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Budget</label>
                   <div className="flex items-center gap-2 text-slate-200 text-sm font-medium">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      {plan.budgetMin ? `$${plan.budgetMin} - $${plan.budgetMax}` : "Flexible"}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Type</label>
                   <div className="flex items-center gap-2 text-slate-200 text-sm font-medium">
                      <Users className="w-4 h-4 text-indigo-400" />
                      {plan.travelType}
                   </div>
                </div>
             </div>

             {plan.description && (
                <div className="mt-6 pt-6 border-t border-white/5">
                   <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{plan.description}</p>
                </div>
             )}
          </div>

          {/* --- Main Content Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Left Col: Requests (Host) or Join Status (Guest) */}
             <div className="lg:col-span-1 space-y-6">
                
                {/* Host View: Requests */}
                {isHost && !isCompleted && (
                   <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Join Requests</h3>
                         <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{requests.length}</span>
                      </div>
                      
                      {loadingRequests ? <div className="text-xs text-slate-500">Loading...</div> : requests.length === 0 ? (
                         <div className="text-xs text-slate-500 italic">No requests yet.</div>
                      ) : (
                         <div className="space-y-3">
                            {requests.map(req => (
                               <div key={req._id} className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                  <div className="flex justify-between items-start mb-2">
                                     <span className="text-sm font-semibold text-slate-200">{req.requester.fullName}</span>
                                     <RequestStatusBadge status={req.status} />
                                  </div>
                                  {req.message && <p className="text-xs text-slate-400 mb-3 line-clamp-2">"{req.message}"</p>}
                                  
                                  {req.status === "PENDING" && (
                                     <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => updateRequestStatus(req._id, "ACCEPTED")} className="px-2 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-500/20">Accept</button>
                                        <button onClick={() => updateRequestStatus(req._id, "REJECTED")} className="px-2 py-1.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-rose-500/20">Reject</button>
                                     </div>
                                  )}
                               </div>
                            ))}
                         </div>
                      )}
                   </div>
                )}

                {/* Guest View: Join Form or Status */}
                {!isHost && (
                   <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Join this Trip</h3>
                      
                      {loadingMyRequest ? <div className="text-xs text-slate-500">Checking status...</div> : myRequest ? (
                         <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center">
                            <div className="mb-2 flex justify-center"><RequestStatusBadge status={myRequest.status} /></div>
                            <p className="text-xs text-slate-400">
                               {myRequest.status === "PENDING" && "Waiting for host response."}
                               {myRequest.status === "ACCEPTED" && "You're in! Coordinate with the host."}
                               {myRequest.status === "REJECTED" && "Request declined."}
                            </p>
                         </div>
                      ) : (
                         <form onSubmit={handleJoin} className="space-y-3">
                            <textarea 
                               value={joinMessage} 
                               onChange={e => setJoinMessage(e.target.value)}
                               placeholder="Why do you want to join? (Optional)"
                               className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none h-24"
                            />
                            <button 
                               type="submit" 
                               disabled={joinSubmitting}
                               className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                            >
                               {joinSubmitting ? "Sending..." : "Send Request"}
                            </button>
                         </form>
                      )}
                   </div>
                )}
             </div>

             {/* Right Col: Reviews */}
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                         <MessageSquare className="w-4 h-4 text-indigo-400" />
                         Trip Reviews
                      </h3>
                      {canLeaveReview() && !showReviewForm && (
                         <button onClick={() => setShowReviewForm(true)} className="text-xs font-bold text-primary-400 hover:text-primary-300">
                            + Write Review
                         </button>
                      )}
                   </div>

                   {/* Review Form */}
                   {showReviewForm && (
                      <div className="mb-6 p-4 bg-slate-950/50 rounded-xl border border-white/10 animate-in slide-in-from-top-2">
                         <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map(n => (
                               <button key={n} type="button" onClick={() => setReviewRating(n)} className="focus:outline-none">
                                  <Star className={`w-5 h-5 ${n <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`} />
                               </button>
                            ))}
                         </div>
                         <textarea 
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            placeholder="Share your experience..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500 mb-3"
                         />
                         <div className="flex justify-end gap-2">
                            <button onClick={() => setShowReviewForm(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={() => handleSubmitReview()} className="px-4 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-lg">Submit</button>
                         </div>
                      </div>
                   )}

                   {/* Reviews List */}
                   {loadingReviews ? <div className="text-xs text-slate-500">Loading reviews...</div> : reviews.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">No reviews yet.</div>
                   ) : (
                      <div className="space-y-4">
                         {reviews.map(r => (
                            <div key={r._id} className="p-4 bg-slate-950/30 rounded-xl border border-slate-800">
                               <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                        {(typeof r.reviewer === "string" ? "T" : (r.reviewer as any).fullName?.[0]) || "U"}
                                     </div>
                                     <span className="text-sm font-semibold text-slate-300">
                                        {typeof r.reviewer === "string" ? "Traveler" : (r.reviewer as any).fullName}
                                     </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                     <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                     <span className="text-xs font-bold text-yellow-500">{r.rating}</span>
                                  </div>
                               </div>
                               {r.comment && <p className="text-sm text-slate-400 leading-relaxed pl-8">"{r.comment}"</p>}
                               
                               {((user && (r.reviewer as any)._id === user.id) || isAdmin) && (
                                  <div className="flex justify-end gap-3 mt-2">
                                     {user && (r.reviewer as any)._id === user.id && (
                                        <button onClick={() => { setEditingReview(r); setReviewRating(r.rating); setReviewComment(r.comment || ""); setShowReviewForm(true); }} className="text-[10px] font-bold text-slate-500 hover:text-primary-400">EDIT</button>
                                     )}
                                     <button onClick={() => handleDeleteReview(r._id)} className="text-[10px] font-bold text-slate-500 hover:text-rose-400">DELETE</button>
                                  </div>
                               )}
                            </div>
                         ))}
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
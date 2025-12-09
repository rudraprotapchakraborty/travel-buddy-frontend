"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";

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

// ----- Review types -----
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

export default function TravelPlanDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { token, user } = useAuth();
  const router = useRouter();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const [joinMessage, setJoinMessage] = useState("");
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Host-side requests for this plan
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);

  // Guest-side: my own request for this plan
  const [myRequest, setMyRequest] = useState<JoinRequest | null>(null);
  const [loadingMyRequest, setLoadingMyRequest] = useState(false);

  const isHost = !!(user && plan && user.id === plan.user._id);
  const isCompleted =
    !!plan && String(plan.status || "").toLowerCase() === "completed";

  // --- Reviews state ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // Form / edit state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");

  // ----- fetchPlan: extracted so other handlers can call it -----
  const fetchPlan = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const res = await api.get(`/travel-plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlan(res.data.data);
    } catch (err) {
      console.error("fetchPlan failed", err);
      setError("Failed to load travel plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  // Fetch join requests for this host, then filter by this plan
  useEffect(() => {
    if (!token || !id || !isHost) return;

    const fetchRequests = async () => {
      setLoadingRequests(true);
      setReqError(null);
      try {
        const res = await api.get("/join-requests/host", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const all: JoinRequest[] = res.data.data || [];

        const filtered = all.filter((r) => {
          const tp = r.travelPlan as any;
          if (!tp) return false;
          if (typeof tp === "string") return tp === id;
          return tp._id === id;
        });

        setRequests(filtered);
      } catch (err) {
        console.error(err);
        setReqError("Failed to load join requests");
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequests();
  }, [token, id, isHost]);

  // Fetch *my* join request for this plan (guest view)
  useEffect(() => {
    if (!token || !id || isHost || !plan) return; // only non-hosts

    const fetchMyRequest = async () => {
      setLoadingMyRequest(true);
      try {
        const res = await api.get("/join-requests/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const all: JoinRequest[] = res.data.data || [];
        const found = all.find((r) => {
          const tp = r.travelPlan as any;
          if (!tp) return false;
          if (typeof tp === "string") return tp === id;
          return tp._id === id;
        });
        setMyRequest(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMyRequest(false);
      }
    };

    fetchMyRequest();
  }, [token, id, isHost, plan]);

  // --- Fetch reviews for the specific travel plan (reviewee + travelPlan filter) ---
  useEffect(() => {
    if (!token || !plan) return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      setReviewsError(null);
      try {
        // Now include travelPlanId so we only get reviews for this plan
        const res = await api.get(
          `/reviews?revieweeId=${plan.user._id}&travelPlanId=${plan._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = res.data?.data || [];
        setReviews(data);
      } catch (err: any) {
        const status = err?.response?.status;
        // Treat 404 as "no reviews yet"
        if (status === 404) {
          setReviews([]);
        } else {
          console.error("Failed to load reviews", err);
          setReviewsError("Failed to load reviews");
        }
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [token, plan]);

  const handleDelete = async () => {
    if (!token || !id) return;
    if (!confirm("Delete this travel plan?")) return;
    try {
      await api.delete(`/travel-plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/travel-plans");
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan");
    }
  };

  // ---- New: handleEndTrip ----
  const handleEndTrip = async () => {
    if (!token || !id || !plan) return;
    if (isCompleted) {
      // Should be unreachable because button will be disabled, but safe guard
      alert("Trip is already completed.");
      return;
    }
    if (
      !confirm(
        "Mark this trip as completed? This will end participation and allow post-trip actions."
      )
    )
      return;

    try {
      // Update the plan status to COMPLETED (change to the status your backend expects)
      await api.patch(
        `/travel-plans/${id}`,
        { status: "COMPLETED" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh plan & reviews (trip ended may allow reviews)
      await fetchPlan();
      // refresh reviews too (if you want reviews only after end)
      try {
        // include travelPlanId here as well
        const res = await api.get(
          `/reviews?revieweeId=${plan.user._id}&travelPlanId=${plan._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReviews(res.data?.data || []);
      } catch (err: any) {
        if (err?.response?.status === 404) setReviews([]);
      }

      alert("Trip marked as completed.");
    } catch (err) {
      console.error("Failed to end trip", err);
      alert("Failed to mark trip as completed");
    }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    setJoinSubmitting(true);
    setError(null);
    try {
      const res = await api.post(
        "/join-requests",
        { travelPlanId: id, message: joinMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const created: JoinRequest | undefined = res.data?.data;
      if (created) {
        setMyRequest(created);
      } else {
        setMyRequest((prev) => prev || null);
      }

      alert("Join request sent!");
      setJoinMessage("");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to send join request");
    } finally {
      setJoinSubmitting(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: JoinStatus) => {
    if (!token) return;
    try {
      await api.patch(
        `/join-requests/${requestId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update request status");
    }
  };

  const myStatusClasses = (status: JoinStatus) => {
    const s = status.toLowerCase();
    if (s === "pending")
      return "bg-amber-500/10 text-amber-300 border border-amber-500/40";
    if (s === "accepted")
      return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40";
    return "bg-red-500/10 text-red-300 border border-red-500/40";
  };

  // --- Review actions: create / update / delete ---
  const refreshReviews = async () => {
    if (!token || !plan) return;
    setLoadingReviews(true);
    try {
      const res = await api.get(
        `/reviews?revieweeId=${plan.user._id}&travelPlanId=${plan._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(res.data?.data || []);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setReviews([]);
      } else {
        console.error("Failed to refresh reviews", err);
      }
    } finally {
      setLoadingReviews(false);
    }
  };

  const canLeaveReview = () => {
    // Only allow leaving reviews for the host if:
    // - user is logged in
    // - user is not the host
    // - trip has ended
    // - and user had an ACCEPTED join request for this plan
    if (!user || !plan) return false;
    if (user.id === plan.user._id) return false;
    const ended =
      new Date(plan.endDate).getTime() < Date.now() ||
      String(plan.status || "").toLowerCase() === "completed";
    const participated = myRequest?.status === "ACCEPTED";
    return ended && participated;
  };

  const handleStartReview = () => {
    setEditingReview(null);
    setReviewRating(5);
    setReviewComment("");
    setShowReviewForm(true);
  };

  const handleEditReview = (r: Review) => {
    setEditingReview(r);
    setReviewRating(r.rating);
    setReviewComment(r.comment || "");
    setShowReviewForm(true);
  };

  const handleSubmitReview = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!token || !plan || !user) return;
    if (user.id === plan.user._id) {
      alert("You cannot review yourself.");
      return;
    }

    // helper to ensure reviewer is populated for immediate UI update
    const normalizeReview = (raw: any): Review => {
      const reviewer = raw.reviewer;
      // if reviewer is a string or missing, inject current user info
      const populatedReviewer =
        !reviewer || typeof reviewer === "string"
          ? {
              _id: user.id,
              fullName: (user as any).fullName || (user as any).name || "You",
            }
          : reviewer;
      return { ...(raw as any), reviewer: populatedReviewer } as Review;
    };

    try {
      if (editingReview) {
        // update existing
        const res = await api.patch(
          `/reviews/${editingReview._id}`,
          { rating: reviewRating, comment: reviewComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedRaw = res.data?.data;
        const normalized = normalizeReview(updatedRaw);

        setReviews((prev) =>
          prev.map((p) => (p._id === editingReview._id ? normalized : p))
        );
        setEditingReview(null);
        setShowReviewForm(false);
      } else {
        // Optional: optimistic update (uncomment to use)
        // const optimistic: Review = {
        //   _id: `tmp-${Date.now()}`, // temporary id until server returns real one
        //   reviewer: { _id: user.id, fullName: (user as any).fullName || (user as any).name || "You" },
        //   reviewee: plan.user._id,
        //   rating: reviewRating,
        //   comment: reviewComment,
        //   travelPlan: plan._id,
        //   createdAt: new Date().toISOString(),
        // };
        // setReviews(prev => [optimistic, ...prev]);

        const res = await api.post(
          `/reviews`,
          {
            revieweeId: plan.user._id,
            rating: reviewRating,
            comment: reviewComment,
            travelPlanId: plan._id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const createdRaw = res.data?.data;
        const normalized = normalizeReview(createdRaw);

        // If you used optimistic update above, you might want to replace the temp id instead.
        setReviews((prev) => [normalized, ...prev]);
        setShowReviewForm(false);
        setReviewRating(5);
        setReviewComment("");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;
    if (!confirm("Delete your review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete review");
    }
  };

  // Helper to check whether the review belongs to the current user
  const reviewIsMine = (r: Review) => {
    if (!user) return false;
    if (typeof r.reviewer === "string") return false;
    return (r.reviewer as any)._id === user.id;
  };

  return (
    <Protected>
      <div className="space-y-6 max-w-2xl">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : !plan ? (
          <p className="text-sm text-red-400">{error || "Plan not found"}</p>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
                  {plan.destination}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Hosted by{" "}
                  <span className="font-medium text-slate-100">
                    {plan.user.fullName}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                {isHost && (
                  <>
                    {/* End trip button: disabled when already completed */}
                    <button
                      onClick={handleEndTrip}
                      disabled={isCompleted}
                      aria-disabled={isCompleted}
                      className={`text-[11px] px-3 py-1.5 rounded-lg font-medium transition ${
                        isCompleted
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
                          : "bg-amber-600 hover:bg-amber-500 text-white"
                      }`}
                      title={
                        isCompleted
                          ? "Trip already completed"
                          : "Mark trip as completed"
                      }
                    >
                      End trip
                    </button>

                    {/* Delete plan */}
                    <button
                      onClick={handleDelete}
                      className="text-[11px] px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition"
                    >
                      Delete plan
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Plan details card */}
            <div className="relative overflow-hidden bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-sm shadow-xl shadow-black/40">
              <div className="pointer-events-none absolute -top-16 -right-10 h-32 w-32 rounded-full bg-primary-500/10 blur-2xl" />

              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-[0.16em]">
                    Dates
                  </p>
                  <p className="text-sm text-slate-100">
                    {new Date(plan.startDate).toLocaleDateString()} –{" "}
                    {new Date(plan.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-[0.16em]">
                    Travel type
                  </p>
                  <p className="text-sm text-slate-100">{plan.travelType}</p>
                </div>

                {(plan.budgetMin || plan.budgetMax) && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-[0.16em]">
                      Budget
                    </p>
                    <p className="text-sm text-slate-100">
                      {plan.budgetMin && `Min ${plan.budgetMin} `}
                      {plan.budgetMax && plan.budgetMin && "· "}
                      {plan.budgetMax && `Max ${plan.budgetMax}`}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-[0.16em]">
                    Status
                  </p>
                  <p className="text-sm text-slate-100 capitalize">
                    {plan.status.toLowerCase()}
                  </p>
                </div>
              </div>

              {plan.description && (
                <div className="pt-3 border-t border-slate-800/70">
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-[0.16em]">
                    Description
                  </p>
                  <p className="text-sm text-slate-100 whitespace-pre-line">
                    {plan.description}
                  </p>
                </div>
              )}
            </div>

            {/* Host view: join requests */}
            {isHost && plan.status.toLowerCase() !== "completed" && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-sm shadow-lg shadow-black/30">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-50">
                    Join requests
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    {requests.length} request{requests.length !== 1 && "s"}
                  </span>
                </div>

                {loadingRequests ? (
                  <p className="text-xs text-slate-400">Loading requests…</p>
                ) : reqError ? (
                  <p className="text-xs text-red-400">{reqError}</p>
                ) : requests.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No one has requested to join this trip yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {requests.map((req) => (
                      <div
                        key={req._id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2"
                      >
                        <div className="space-y-1">
                          <p className="text-sm text-slate-100">
                            {req.requester.fullName}
                          </p>
                          {req.requester.currentLocation && (
                            <p className="text-[11px] text-slate-500">
                              Based in {req.requester.currentLocation}
                            </p>
                          )}
                          {req.message && (
                            <p className="text-xs text-slate-300 mt-1">
                              “{req.message}”
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500">
                            Requested on{" "}
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full ${
                              req.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                                : req.status === "ACCEPTED"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                : "bg-red-500/10 text-red-300 border border-red-500/40"
                            }`}
                          >
                            {req.status}
                          </span>
                          {req.status === "PENDING" && (
                            <div className="flex gap-1 mt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateRequestStatus(req._id, "ACCEPTED")
                                }
                                className="text-[11px] px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateRequestStatus(req._id, "REJECTED")
                                }
                                className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Guest view: either status OR form */}
            {!isHost && (
              <>
                {loadingMyRequest ? (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-sm text-slate-400">
                    Checking your request status…
                  </div>
                ) : myRequest ? (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-2 text-sm shadow-lg shadow-black/30">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-semibold text-slate-50">
                        Your join request
                      </h2>
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full ${myStatusClasses(
                          myRequest.status
                        )}`}
                      >
                        {myRequest.status}
                      </span>
                    </div>
                    {myRequest.message && (
                      <p className="text-xs text-slate-300 mt-1">
                        “{myRequest.message}”
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Sent on{" "}
                      {new Date(myRequest.createdAt).toLocaleDateString()}
                    </p>
                    {myRequest.status === "PENDING" && (
                      <p className="text-[11px] text-slate-400 mt-2">
                        The host hasn't responded yet. You'll see the status
                        update here once they accept or reject.
                      </p>
                    )}
                    {myRequest.status === "ACCEPTED" && (
                      <p className="text-[11px] text-emerald-300 mt-2">
                        Your request was accepted! You can coordinate details
                        with the host through your preferred channel.
                      </p>
                    )}
                    {myRequest.status === "REJECTED" && (
                      <p className="text-[11px] text-slate-400 mt-2">
                        This request was rejected. You can still explore other
                        trips and send new requests.
                      </p>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={handleJoin}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-sm shadow-lg shadow-black/30"
                  >
                    <h2 className="text-lg font-semibold text-slate-50">
                      Request to join
                    </h2>
                    <div className="space-y-1.5">
                      <label className="text-slate-200 text-xs">
                        Message (optional)
                      </label>
                      <textarea
                        value={joinMessage}
                        onChange={(e) => setJoinMessage(e.target.value)}
                        rows={3}
                        placeholder="Introduce yourself and share why you’d be a good match for this trip."
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/30 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={joinSubmitting}
                      className="bg-primary-600 hover:bg-primary-500 text-white text-sm px-4 py-2.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary-600/30"
                    >
                      {joinSubmitting ? "Sending..." : "Send request"}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* ---------------- Reviews Section (for the host + plan) ---------------- */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-sm shadow-lg shadow-black/30">
              <div className="flex items-center justify-between">
<h2 className="text-lg font-semibold text-slate-50">
  Reviews for {plan.user.fullName}
  {plan.user.fullName.endsWith("s") ? "'" : "'s"} trip
</h2>

                <span className="text-xs text-slate-400">
                  {reviews.length} review{reviews.length !== 1 && "s"}
                </span>
              </div>

              {loadingReviews ? (
                <p className="text-xs text-slate-400">Loading reviews…</p>
              ) : reviewsError ? (
                <p className="text-xs text-red-400">{reviewsError}</p>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-slate-400">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div
                      key={r._id}
                      className="border rounded-lg p-3 bg-slate-900/70"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-slate-100">
                            {typeof r.reviewer === "string"
                              ? "Traveler"
                              : (r.reviewer as any).fullName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                            {r.isEdited && " • edited"}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-slate-100">
                          {r.rating} / 5 ★
                        </div>
                      </div>
                      {r.comment && (
                        <p className="mt-2 text-slate-200 text-sm whitespace-pre-wrap">
                          {r.comment}
                        </p>
                      )}

                      {/* Edit/delete controls if this review is mine */}
                      {reviewIsMine(r) && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleEditReview(r)}
                            className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(r._id)}
                            className="text-xs px-3 py-1 rounded bg-red-50 text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Show leave-review CTA if allowed */}
              <div>
                {canLeaveReview() ? (
                  <>
                    {!showReviewForm ? (
                      <button
                        onClick={handleStartReview}
                        className="mt-3 text-sm px-3 py-1 rounded bg-green-50 text-green-700"
                      >
                        Leave a review
                      </button>
                    ) : (
                      <form
                        onSubmit={handleSubmitReview}
                        className="mt-3 space-y-2"
                      >
                        <div className="text-sm">Your rating</div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setReviewRating(n)}
                              className={`px-3 py-1 rounded ${
                                reviewRating === n
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-slate-800"
                              }`}
                            >
                              {n} ★
                            </button>
                          ))}
                        </div>

                        <label className="block">
                          <div className="text-sm mt-2">Comment (optional)</div>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={4}
                            maxLength={1000}
                            className="w-full mt-1 p-2 border rounded bg-slate-900/70"
                          />
                        </label>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 rounded bg-primary-600 text-white"
                          >
                            {editingReview ? "Update review" : "Post review"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowReviewForm(false);
                              setEditingReview(null);
                            }}
                            className="px-4 py-2 rounded bg-slate-700 text-slate-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-slate-400 mt-2">
                    Reviews can be left by participants after the trip ends
                    (accepted guests only).
                  </div>
                )}
              </div>
            </div>
            {/* ---------------- end reviews ---------------- */}
          </>
        )}
      </div>
    </Protected>
  );
}

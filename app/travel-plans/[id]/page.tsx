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

  // Fetch the travel plan
  useEffect(() => {
    const fetchPlan = async () => {
      if (!token || !id) return;
      try {
        const res = await api.get(`/travel-plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlan(res.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load travel plan");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
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

        const filtered = all.filter(r => {
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
        const found = all.find(r => {
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

      // If backend returns the created request, store it; otherwise, fall back to a minimal object
      const created: JoinRequest | undefined = res.data?.data;
      if (created) {
        setMyRequest(created);
      } else {
        setMyRequest(prev => prev || null); // no-op fallback
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
      setRequests(prev =>
        prev.map(r => (r._id === requestId ? { ...r, status } : r))
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
              {isHost && (
                <button
                  onClick={handleDelete}
                  className="text-[11px] px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition"
                >
                  Delete plan
                </button>
              )}
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
            {isHost && (
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
                    {requests.map(req => (
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
                        The host hasn&apos;t responded yet. You&apos;ll see the
                        status update here once they accept or reject.
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
                        onChange={e => setJoinMessage(e.target.value)}
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
          </>
        )}
      </div>
    </Protected>
  );
}

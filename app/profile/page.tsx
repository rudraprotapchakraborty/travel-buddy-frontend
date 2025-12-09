"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Maybe<T> = T | null | undefined;

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

export default function ProfilePage() {
  const { token, user: me } = useAuth();
  const search = useSearchParams();
  const requestedUserId = search.get("user");
  const viewingOther = Boolean(
    requestedUserId && requestedUserId !== (me as any)?._id
  );

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
          const res = await api.get(`/users/${profileId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          data = res.data?.data ?? res.data ?? null;
          setProfile(data ?? null);
        } else {
          const res = await api.get("/users/me/self", {
            headers: { Authorization: `Bearer ${token}` },
          });
          data = res.data?.data ?? res.data ?? null;
          setProfile(data ?? null);

          setBio(data?.bio ?? "");
          setCurrentLocation(data?.currentLocation ?? "");
          setTravelInterests(
            Array.isArray(data?.travelInterests)
              ? data.travelInterests.join(", ")
              : data?.travelInterests ?? ""
          );
          setVisitedCountries(
            Array.isArray(data?.visitedCountries)
              ? data.visitedCountries.join(", ")
              : data?.visitedCountries ?? ""
          );
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
        setProfile(null);
        setAvgRating(null);
        setReviewCount(0);
        setRecentReviews([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async (revieweeId: string) => {
      if (!token) return;
      setLoadingReviews(true);
      try {
        const res = await api.get(`/reviews?revieweeId=${revieweeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: Review[] = res.data?.data || [];

        if (!Array.isArray(data) || data.length === 0) {
          setAvgRating(null);
          setReviewCount(0);
          setRecentReviews([]);
        } else {
          const count = data.length;
          const sum = data.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
          const avg = sum / count;
          const sorted = [...data].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAvgRating(Number.isFinite(avg) ? Math.round(avg * 10) / 10 : null);
          setReviewCount(count);
          setRecentReviews(sorted.slice(0, 5));
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setAvgRating(null);
          setReviewCount(0);
          setRecentReviews([]);
        } else {
          console.error("Failed to fetch reviews", err);
        }
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchProfile();
  }, [token, requestedUserId, me]);

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
          travelInterests: travelInterests
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          visitedCountries: visitedCountries
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated.");
      try {
        const res = await api.get("/users/me/self", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.data ?? res.data ?? null;
        setProfile(data ?? null);
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const isError = message?.toLowerCase().includes("failed");

  if (loading) {
    return (
      <Protected>
        <div className="p-6 text-slate-400">Loading profile...</div>
      </Protected>
    );
  }

  if (fetchError) {
    return (
      <Protected>
        <div className="p-6 text-red-400">{fetchError}</div>
      </Protected>
    );
  }

  if (!profile) {
    return (
      <Protected>
        <div className="p-6 text-slate-400">No profile available</div>
      </Protected>
    );
  }

  const arrToString = (val: any) => {
    if (!val) return "-";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "string") return val || "-";
    return String(val);
  };

  const travelPlanIdFromReview = (r: Review): string | null => {
    if (!r.travelPlan) return null;
    if (typeof r.travelPlan === "string") return r.travelPlan;
    return (r.travelPlan as any)?._id ?? null;
  };

  const isVerifiedSubscriber = profile?.subscriptionStatus === "ACTIVE";

  return (
    <Protected>
      <div className="max-w-2xl space-y-6">
        <section className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-medium text-primary-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
            <span>
              {viewingOther
                ? "Traveler profile (view only)"
                : "Your public traveler profile"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
                  {viewingOther
                    ? `${profile.fullName || profile.name || "User"}`
                    : "My profile"}
                </h1>

                {isVerifiedSubscriber && (
                  <span
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                    title="Verified subscriber"
                    aria-label="Verified subscriber"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2a1 1 0 0 1 .894.553l1.382 2.764 3.05.444a1 1 0 0 1 .553 1.705l-2.208 2.152.521 3.036a1 1 0 0 1-1.451 1.054L12 15.347l-2.731 1.961a1 1 0 0 1-1.451-1.054l.521-3.036L5.1 7.466a1 1 0 0 1 .553-1.705l3.05-.444L10.985 2.55A1 1 0 0 1 12 2zm1.47 7.03a1 1 0 0 0-1.94 0l-.2 1.05a.75.75 0 0 0 .22.63l.72.72a.75.75 0 0 0 1.06 0l1.07-1.07a.75.75 0 0 0 .22-.63l-.22-1.05z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-400 mt-1">
                {viewingOther
                  ? "Viewing this user's public profile. You cannot edit another user's profile from here."
                  : "Update your details so other travelers know who they’re exploring with."}
              </p>
            </div>

            <div>
              {loadingReviews ? (
                <div className="text-sm text-slate-400">Loading reviews…</div>
              ) : reviewCount > 0 && avgRating != null ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1 text-[13px] font-semibold text-yellow-300">
                  <span>★</span>
                  <span>{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({reviewCount})</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[13px] text-slate-300">
                  No reviews yet
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-slate-950/80 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-3 text-sm shadow-xl shadow-black/40">
          <div className="pointer-events-none absolute -top-20 -right-10 h-32 w-32 rounded-full bg-primary-500/15 blur-3xl" />

          <h2 className="text-sm font-semibold text-slate-200 mb-1">Account</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Name
              </span>
              <br />
              <span className="text-slate-100">
                {profile?.fullName ?? profile?.name ?? "—"}
              </span>
            </p>
            <p>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Email
              </span>
              <br />
              <span className="text-slate-100">{profile?.email ?? "—"}</span>
            </p>
            <p>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Role
              </span>
              <br />
              <span className="inline-flex items-center rounded-full bg-slate-900/80 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-200">
                {profile?.role ?? "USER"}
              </span>
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden bg-slate-950/80 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 text-sm shadow-xl shadow-black/40">
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-32 w-32 rounded-full bg-sky-500/15 blur-3xl" />

          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                About &amp; travel details
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {viewingOther ? "Public details" : "These details help others understand your style and experience."}
              </p>
            </div>
          </div>

          {viewingOther ? (
            <div className="space-y-3 text-sm text-slate-300">
              <div>
                <h3 className="text-sm font-medium text-slate-200">Bio</h3>
                <p className="mt-1 text-slate-400">{profile?.bio ?? "No bio provided."}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-200">Current location</h3>
                <p className="mt-1 text-slate-400">{profile?.currentLocation ?? "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-200">Travel interests</h3>
                <p className="mt-1 text-slate-400">{arrToString(profile?.travelInterests)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-200">Visited countries</h3>
                <p className="mt-1 text-slate-400">{arrToString(profile?.visitedCountries)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-200">Member since</h3>
                <p className="mt-1 text-slate-400">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-200 mt-2">Recent reviews</h3>
                {loadingReviews ? (
                  <p className="text-xs text-slate-400 mt-1">Loading reviews…</p>
                ) : recentReviews.length === 0 ? (
                  <p className="text-xs text-slate-400 mt-1">No reviews yet.</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {recentReviews.map((r) => {
                      const tpId = travelPlanIdFromReview(r);
                      const card = (
                        <div key={r._id} className="border rounded-lg p-3 bg-slate-900/70">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-slate-100">
                                {typeof r.reviewer === "string" ? "Traveler" : (r.reviewer as any).fullName ?? "Traveler"}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {new Date(r.createdAt).toLocaleDateString()}
                                {r.isEdited && " • edited"}
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-slate-100">{r.rating} / 5 ★</div>
                          </div>
                          {r.comment && (
                            <p className="mt-2 text-slate-200 text-sm whitespace-pre-wrap">{r.comment}</p>
                          )}
                        </div>
                      );

                      return tpId ? (
                        <Link key={r._id} href={`/travel-plans/${tpId}`} className="block hover:opacity-95 transition">
                          {card}
                        </Link>
                      ) : (
                        <div key={r._id}>{card}</div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-slate-200 text-xs font-medium">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell people how you like to travel, your vibe, and any must-do experiences."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-200 text-xs font-medium">Current location</label>
                <input
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="City, Country (e.g. Bangalore, India)"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-200 text-xs font-medium">Travel interests (comma separated)</label>
                <input
                  value={travelInterests}
                  onChange={(e) => setTravelInterests(e.target.value)}
                  placeholder="Beach, hiking, food tours, nightlife, road trips"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-200 text-xs font-medium">Visited countries (comma separated)</label>
                <input
                  value={visitedCountries}
                  onChange={(e) => setVisitedCountries(e.target.value)}
                  placeholder="India, Thailand, France, Japan"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
                />
              </div>

              {message && (
                <p className={`text-xs mt-2 px-3 py-2 rounded-lg border ${isError ? "text-red-300 bg-red-500/5 border-red-500/40" : "text-emerald-300 bg-emerald-500/5 border-emerald-500/40"}`}>
                  {message}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-slate-500">
                  Your profile may be visible to other users on trip requests and matches.
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary-600/30 transition"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-200 mt-2">Recent reviews</h3>
                {loadingReviews ? (
                  <p className="text-xs text-slate-400 mt-1">Loading reviews…</p>
                ) : recentReviews.length === 0 ? (
                  <p className="text-xs text-slate-400 mt-1">No reviews yet.</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {recentReviews.map((r) => {
                      const tpId = travelPlanIdFromReview(r);
                      const card = (
                        <div key={r._id} className="border rounded-lg p-3 bg-slate-900/70">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-slate-100">{typeof r.reviewer === "string" ? "Traveler" : (r.reviewer as any).fullName ?? "Traveler"}</div>
                              <div className="text-[11px] text-slate-400">
                                {new Date(r.createdAt).toLocaleDateString()}
                                {r.isEdited && " • edited"}
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-slate-100">{r.rating} / 5 ★</div>
                          </div>
                          {r.comment && <p className="mt-2 text-slate-200 text-sm whitespace-pre-wrap">{r.comment}</p>}
                        </div>
                      );

                      return tpId ? (
                        <Link key={r._id} href={`/travel-plans/${tpId}`} className="block hover:opacity-95 transition">
                          {card}
                        </Link>
                      ) : (
                        <div key={r._id}>{card}</div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </Protected>
  );
}

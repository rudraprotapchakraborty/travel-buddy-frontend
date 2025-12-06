"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";

export default function ProfilePage() {
  const { token, user } = useAuth();
  const [bio, setBio] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [travelInterests, setTravelInterests] = useState("");
  const [visitedCountries, setVisitedCountries] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await api.get("/users/me/self", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;
        setBio(data.bio || "");
        setCurrentLocation(data.currentLocation || "");
        setTravelInterests((data.travelInterests || []).join(", "));
        setVisitedCountries((data.visitedCountries || []).join(", "));
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [token]);

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
            .map(s => s.trim())
            .filter(Boolean),
          visitedCountries: visitedCountries
            .split(",")
            .map(s => s.trim())
            .filter(Boolean),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const isError = message?.toLowerCase().includes("failed");

  return (
    <Protected>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <section className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-medium text-primary-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
            <span>Your public traveler profile</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              My profile
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Update your details so other travelers know who they’re exploring with.
            </p>
          </div>
        </section>

        {/* Basic account info */}
        <section className="relative overflow-hidden bg-slate-950/80 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-3 text-sm shadow-xl shadow-black/40">
          <div className="pointer-events-none absolute -top-20 -right-10 h-32 w-32 rounded-full bg-primary-500/15 blur-3xl" />

          <h2 className="text-sm font-semibold text-slate-200 mb-1">
            Account
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Name
              </span>
              <br />
              <span className="text-slate-100">
                {user?.fullName || "—"}
              </span>
            </p>
            <p>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Email
              </span>
              <br />
              <span className="text-slate-100">
                {user?.email || "—"}
              </span>
            </p>
            <p>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Role
              </span>
              <br />
              <span className="inline-flex items-center rounded-full bg-slate-900/80 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-200">
                {user?.role || "USER"}
              </span>
            </p>
          </div>
        </section>

        {/* Editable profile section */}
        <section className="relative overflow-hidden bg-slate-950/80 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 text-sm shadow-xl shadow-black/40">
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-32 w-32 rounded-full bg-sky-500/15 blur-3xl" />

          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                About &amp; travel details
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                These details help others understand your style and experience.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-slate-200 text-xs font-medium">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder="Tell people how you like to travel, your vibe, and any must-do experiences."
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-200 text-xs font-medium">
                Current location
              </label>
              <input
                value={currentLocation}
                onChange={e => setCurrentLocation(e.target.value)}
                placeholder="City, Country (e.g. Bangalore, India)"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-200 text-xs font-medium">
                Travel interests (comma separated)
              </label>
              <input
                value={travelInterests}
                onChange={e => setTravelInterests(e.target.value)}
                placeholder="Beach, hiking, food tours, nightlife, road trips"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-200 text-xs font-medium">
                Visited countries (comma separated)
              </label>
              <input
                value={visitedCountries}
                onChange={e => setVisitedCountries(e.target.value)}
                placeholder="India, Thailand, France, Japan"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
              />
            </div>
          </div>

          {message && (
            <p
              className={`text-xs mt-2 px-3 py-2 rounded-lg border ${
                isError
                  ? "text-red-300 bg-red-500/5 border-red-500/40"
                  : "text-emerald-300 bg-emerald-500/5 border-emerald-500/40"
              }`}
            >
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
        </section>
      </div>
    </Protected>
  );
}

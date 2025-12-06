"use client";

import { FormEvent, useState } from "react";
import Protected from "@/components/Protected";
import { useAuth } from "@/components/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

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
      <div className="max-w-xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-medium text-primary-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
            <span>Share your upcoming adventure</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              Add a travel plan
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Set your dates, budget and style so compatible travelers can find you.
            </p>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden bg-slate-950/80 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 text-sm shadow-xl shadow-black/40"
        >
          {/* Glow */}
          <div className="pointer-events-none absolute -top-24 -right-16 h-40 w-40 rounded-full bg-primary-500/15 blur-3xl" />

          <div className="space-y-1.5">
            <label className="text-slate-200 text-xs font-medium">
              Destination
            </label>
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              required
              placeholder="Where are you going? (e.g. Bali, Paris, Goa)"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-200 text-xs font-medium">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-200 text-xs font-medium">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-200 text-xs font-medium">
                Budget min (optional)
              </label>
              <input
                type="number"
                value={budgetMin}
                onChange={e => setBudgetMin(e.target.value)}
                placeholder="e.g. 500"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-200 text-xs font-medium">
                Budget max (optional)
              </label>
              <input
                type="number"
                value={budgetMax}
                onChange={e => setBudgetMax(e.target.value)}
                placeholder="e.g. 1200"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-200 text-xs font-medium">
              Travel type
            </label>
            <select
              value={travelType}
              onChange={e => setTravelType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="SOLO">Solo</option>
              <option value="FAMILY">Family</option>
              <option value="FRIENDS">Friends</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-200 text-xs font-medium">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Share your rough itinerary, what you enjoy (food, nightlife, nature), and what kind of travel buddy you’re looking for."
              className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-500">
              Your plan will be visible to other travelers looking for similar trips.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary-600/30 transition"
            >
              {saving ? "Saving..." : "Save plan"}
            </button>
          </div>
        </form>
      </div>
    </Protected>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, user } = res.data.data;

    login(accessToken, user);

    // 🔥 Redirect based on role
    if (user.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }

  } catch (err: any) {
    console.error(err);
    setError(err?.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/40 backdrop-blur">
          {/* Glow */}
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-primary-500/30 via-transparent to-transparent opacity-70" />

          <div className="relative p-6 md:p-7 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-medium text-primary-200">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
                <span>Welcome back, traveler</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
                  Log in to Travel Buddy
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Access your trips, buddies, and upcoming adventures.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-slate-200 text-xs font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 text-xs font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="text-[11px] text-primary-300 hover:text-primary-200"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40 pr-20"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold py-2.5 mt-1 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary-600/30"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
              <p className="text-[11px] text-slate-400">
                By continuing, you agree to our{" "}
                <span className="text-slate-300 underline underline-offset-4 decoration-slate-600 cursor-pointer">
                  Terms
                </span>{" "}
                and{" "}
                <span className="text-slate-300 underline underline-offset-4 decoration-slate-600 cursor-pointer">
                  Privacy Policy
                </span>
                .
              </p>
              <p className="text-xs text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary-300 hover:text-primary-200 font-medium"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Small helper text */}
        <p className="mt-4 text-[11px] text-center text-slate-500">
          Trouble logging in?{" "}
          <span className="text-slate-300 hover:underline cursor-pointer">
            Contact support
          </span>
          .
        </p>
      </div>
    </div>
  );
}

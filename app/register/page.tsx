"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(id);
  }, [error]);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError(null);

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  setLoading(true);
  try {
    const res = await api.post("/auth/register", {
      email,
      password,
      fullName,
    });

    const { accessToken, user } = res.data.data;
    login(accessToken, user);
    router.push("/dashboard");
  } catch (err: any) {
    const data = err?.response?.data;
    console.error("REGISTER ERROR RAW:", data);

    let msg: string | null = null;

    if (Array.isArray(data?.message)) {
      msg = data.message.join(", ");
    } else if (typeof data?.message === "string") {
      msg = data.message;
    } else if (data?.details) {
      const { formErrors, fieldErrors } = data.details;
      const parts: string[] = [];

      if (formErrors) {
        if (Array.isArray(formErrors)) parts.push(formErrors.join(", "));
        else if (typeof formErrors === "string") parts.push(formErrors);
      }

      if (fieldErrors && typeof fieldErrors === "object") {
        for (const [field, value] of Object.entries(fieldErrors)) {
          if (Array.isArray(value)) {
            parts.push(`${field}: ${(value as any[]).join(", ")}`);
          } else if (typeof value === "string") {
            parts.push(`${field}: ${value}`);
          } else {
            parts.push(`${field}: ${JSON.stringify(value)}`);
          }
        }
      }

      if (parts.length) msg = parts.join(" | ");
    }

    setError(msg || "Registration failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      {/* Error popup / toast */}
      {error && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
          <div className="max-w-md w-full bg-red-500/95 text-white text-sm rounded-xl shadow-xl shadow-red-900/40 px-4 py-3 flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs">
              !
            </div>
            <div className="flex-1">
              <p className="font-medium">Something went wrong</p>
              <p className="text-xs mt-0.5 opacity-90">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-2 text-xs font-semibold text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/40 backdrop-blur">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-primary-500/30 via-transparent to-transparent opacity-70" />

            <div className="relative p-6 md:p-7 space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[11px] font-medium text-primary-200">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-400" />
                  <span>Join the Travel Buddy community</span>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
                    Create your account
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    Find travel buddies, share trips, and explore the world together.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <label className="text-slate-200 text-xs font-medium">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    placeholder="Rudra Protap"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
                  />
                </div>

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
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Create a strong password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
                  />
                  <p className="text-[11px] text-slate-500">
                    Use at least 8 characters, including a number and a symbol.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-200 text-xs font-medium">
                    Confirm password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat your password"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-primary-500/80 focus:ring-2 focus:ring-primary-500/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold py-2.5 mt-1 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary-600/30"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                <p className="text-[11px] text-slate-400">
                  By signing up, you agree to our{" "}
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
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary-300 hover:text-primary-200 font-medium"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-center text-slate-500">
            You can update your travel preferences anytime from your dashboard.
          </p>
        </div>
      </div>
    </>
  );
}

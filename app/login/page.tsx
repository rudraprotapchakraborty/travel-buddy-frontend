"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  AlertCircle,
  Globe 
} from "lucide-react";

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

      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);

      // Network / backend down
      if (err.code === "ERR_NETWORK" || !err.response) {
        setError("Unable to connect to the server. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // Blocked user (403 from backend)
      if (err.response.status === 403) {
        setError("Your account has been suspended. Please contact support.");
        setLoading(false);
        return;
      }

      // Other errors: invalid credentials etc.
      setError(err.response?.data?.message || "Invalid email or password.");
      setLoading(false);
    } finally {
      // Keep loading true if successful to prevent UI flash before redirect
      // Only set false if error occurred
      if (!error) {
         // let it stay loading until redirect happens
      } else {
         setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      
      {/* --- Ambient Background --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-900/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        
        {/* --- Brand Header --- */}
        <div className="text-center mb-8 space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-6 w-6 text-white" />
             </div>
             <span className="text-2xl font-bold text-white tracking-tight">Travel Buddy</span>
          </Link>
          <h1 className="text-2xl font-semibold text-slate-100 mt-4">Welcome back</h1>
          <p className="text-slate-400 text-sm">Enter your credentials to access your account.</p>
        </div>

        {/* --- Login Card --- */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/50 p-8">
          
          {/* Top Shine */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">Email Address</label>
              <div className="group relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-primary-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button type="button" className="text-xs text-primary-400 hover:text-primary-300 hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="group relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-primary-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-500 hover:shadow-primary-500/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{" "}
              <Link href="/register" className="text-primary-400 font-semibold hover:text-primary-300 hover:underline transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Terms */}
        <p className="text-center text-[10px] text-slate-600 mt-8">
          Protected by reCAPTCHA and subject to the <br />
          <a href="#" className="hover:text-slate-400 underline">Privacy Policy</a> and <a href="#" className="hover:text-slate-400 underline">Terms of Service</a>.
        </p>

      </div>
    </div>
  );
}
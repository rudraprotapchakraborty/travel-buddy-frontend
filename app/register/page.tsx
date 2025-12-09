"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  AlertCircle, 
  Globe,
  Sparkles
} from "lucide-react";

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
      setError("Passwords do not match.");
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

      setError(msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      
      {/* --- Ambient Background --- */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-[10%] right-[20%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[100px]" />
         <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary-900/10 blur-[100px]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-8 space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 to-sky-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-6 w-6 text-white" />
             </div>
             <span className="text-2xl font-bold text-white tracking-tight">Travel Buddy</span>
          </Link>
          <div className="inline-flex ml-4 items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-600">
             <Sparkles className="h-3 w-3" />
             <span>Join the community</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-100">Create your account</h1>
          <p className="text-slate-400 text-sm">Find buddies, share trips, and explore the world.</p>
        </div>

        {/* --- Main Card --- */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-black/50 p-8">
          
          {/* Top Shine */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Display */}
            {error && (
               <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
               </div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
               <label className="text-xs font-semibold text-slate-300 ml-1">Full Name</label>
               <div className="group relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-primary-400" />
                  <input
                     type="text"
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     required
                     placeholder="e.g. Rudra Protap"
                     className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
               </div>
            </div>

            {/* Email */}
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

            {/* Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Password */}
               <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 ml-1">Password</label>
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

               {/* Confirm Password */}
               <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 ml-1">Confirm</label>
                  <div className="group relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-primary-400" />
                     <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                     />
                  </div>
               </div>
            </div>
            
            <p className="text-[10px] text-slate-500 px-1">
               Use at least 8 characters. Mixing numbers and symbols makes it stronger.
            </p>

            {/* Submit Button */}
            <button
               type="submit"
               disabled={loading}
               className="group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-500 hover:shadow-primary-500/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
               {loading ? (
                  <>
                     <Loader2 className="h-4 w-4 animate-spin" />
                     <span>Creating Account...</span>
                  </>
               ) : (
                  <>
                     <span>Sign Up</span>
                     <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
               )}
               {/* Shine Effect */}
               <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-4">
             <p className="text-xs text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-primary-400 font-semibold hover:text-primary-300 hover:underline transition-colors">
                   Log in here
                </Link>
             </p>
             <p className="text-[10px] text-slate-600">
                By signing up, you agree to our <Link href="#" className="hover:text-slate-400 underline">Terms</Link> and <Link href="#" className="hover:text-slate-400 underline">Privacy Policy</Link>.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
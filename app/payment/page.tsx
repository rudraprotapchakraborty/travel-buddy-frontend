"use client";

import React, { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Loader2, 
  Sparkles, 
  Lock, 
  AlertTriangle 
} from "lucide-react";

// --- Config ---

if (typeof window !== "undefined") {
  const pk = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").trim();
  console.log("Stripe PK (masked):", pk ? `${pk.slice(0, 6)}...${pk.slice(-4)}` : "<missing>");
}

const PUBLISHABLE_KEY = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").trim();
const API_BASE_RAW = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const stripePromise: Promise<Stripe | null> | null = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

// --- Components ---

export default function PaymentPage() {
  const [envMissing, setEnvMissing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!PUBLISHABLE_KEY || !API_BASE_RAW) {
      setEnvMissing(true);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-slate-900 border border-slate-800">
            <Lock className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400">Please log in to subscribe.</p>
        </div>
      </div>
    );
  }

  if (envMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-200">
        <div className="max-w-xl text-center bg-slate-900/50 border border-red-500/20 p-8 rounded-2xl backdrop-blur-md">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-white">Configuration Error</h2>
          <p className="text-sm text-slate-400 mb-6">
            Stripe keys are missing from the environment variables.
          </p>
          <div className="text-left bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-500 overflow-x-auto">
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...<br/>
            NEXT_PUBLIC_API_BASE_URL=...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-slate-950 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-900/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10 grid lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Side: Value Prop */}
        <div className="lg:col-span-2 space-y-8 py-4 lg:py-12">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 mb-4">
                 <Sparkles className="w-3 h-3" />
                 <span>Premium Access</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                 Upgrade your journey.
              </h1>
              <p className="text-slate-400 leading-relaxed">
                 Unlock the full potential of Travel Buddy. Get verified, find matches faster, and travel with confidence.
              </p>
           </div>

           <ul className="space-y-4">
              {[
                 "Verified Badge on your profile",
                 "Unlimited travel plan creations",
                 "Priority matching algorithm",
                 "Ad-free experience"
              ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center">
                       <Check className="w-3 h-3 text-primary-400" />
                    </div>
                    <span className="text-sm">{item}</span>
                 </li>
              ))}
           </ul>
        </div>

        {/* Right Side: Checkout Form */}
        <div className="lg:col-span-3">
           {stripePromise ? (
             <Elements stripe={stripePromise}>
               <CheckoutForm apiBase={API_BASE_RAW} />
             </Elements>
           ) : (
             <div className="h-96 flex items-center justify-center text-slate-500 bg-slate-900/50 rounded-3xl border border-white/5">
                <div className="flex flex-col items-center gap-3">
                   <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                   <span className="text-sm">Secure connection...</span>
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}

// --- Checkout Form ---

function CheckoutForm({ apiBase }: { apiBase: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const auth = useAuth() as any;
  const token = auth?.token;
  const refreshUser = auth?.refreshUser;
  const router = useRouter();

  const [plan, setPlan] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // --- Logic Helpers ---

  async function safeJsonParse(res: Response) {
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { __rawText: text }; }
  }

  const navigateToProfileAndRefresh = async () => {
    try {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("user-updated"));
      await router.refresh();
      router.replace("/profile");
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    setLoading(true);

    try {
      // 1. Create Payment Intent
      const res = await fetch(`${apiBase}/payments/create-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });

      const json = await safeJsonParse(res);
      if (!res.ok) throw new Error(json?.message || "Server error");
      if (!json?.data?.clientSecret) throw new Error("Invalid server response");

      // 2. Confirm Card Payment
      const result = await stripe.confirmCardPayment(json.data.clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent?.status === "succeeded") {
        // 3. Confirm with Backend
        try {
           const confirmRes = await fetch(`${apiBase}/payments/confirm`, {
              method: "POST",
              headers: {
                 "Content-Type": "application/json",
                 ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ paymentIntentId: result.paymentIntent.id }),
           });
           
           if (typeof refreshUser === "function") await refreshUser();
           
           if (!confirmRes.ok) {
              setMessage("Payment successful (Confirmation pending)");
           } else {
              setMessage("Payment successful! Redirecting...");
           }
           
           setTimeout(() => navigateToProfileAndRefresh(), 1500);
        } catch (e) {
           // Payment worked, backend confirm failed (network?)
           setMessage("Payment successful! Redirecting...");
           setTimeout(() => navigateToProfileAndRefresh(), 1500);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Payment failed");
      setLoading(false);
    }
  };

  // --- Styles for Stripe Element ---
  const cardStyle = {
    style: {
      base: {
        color: "#f8fafc", // slate-50
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#64748b", // slate-500
        },
        iconColor: "#6366f1", // primary-500
      },
      invalid: {
        color: "#f43f5e", // rose-500
        iconColor: "#f43f5e",
      },
    },
  };

  return (
    <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
         <h2 className="text-xl font-semibold text-white">Select Plan</h2>
         <div className="flex items-center gap-1 text-xs text-slate-500">
            <Lock className="w-3 h-3" />
            Secure SSL
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Plan Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Monthly */}
           <div 
             onClick={() => setPlan("MONTHLY")}
             className={`cursor-pointer relative p-4 rounded-xl border transition-all duration-300 ${plan === "MONTHLY" ? "bg-primary-600/10 border-primary-500 ring-1 ring-primary-500/50" : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"}`}
           >
              <div className="flex justify-between items-start mb-2">
                 <span className={`text-sm font-medium ${plan === "MONTHLY" ? "text-primary-400" : "text-slate-300"}`}>Monthly</span>
                 <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${plan === "MONTHLY" ? "border-primary-500 bg-primary-500" : "border-slate-600"}`}>
                    {plan === "MONTHLY" && <Check className="w-3 h-3 text-white" />}
                 </div>
              </div>
              <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-bold text-white">$10</span>
                 <span className="text-xs text-slate-400">/mo</span>
              </div>
           </div>

           {/* Yearly */}
           <div 
             onClick={() => setPlan("YEARLY")}
             className={`cursor-pointer relative p-4 rounded-xl border transition-all duration-300 ${plan === "YEARLY" ? "bg-primary-600/10 border-primary-500 ring-1 ring-primary-500/50" : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"}`}
           >
              <div className="absolute -top-3 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/20">
                 BEST VALUE
              </div>
              <div className="flex justify-between items-start mb-2 mt-1">
                 <span className={`text-sm font-medium ${plan === "YEARLY" ? "text-primary-400" : "text-slate-300"}`}>Yearly</span>
                 <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${plan === "YEARLY" ? "border-primary-500 bg-primary-500" : "border-slate-600"}`}>
                    {plan === "YEARLY" && <Check className="w-3 h-3 text-white" />}
                 </div>
              </div>
              <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-bold text-white">$100</span>
                 <span className="text-xs text-slate-400">/yr</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-medium mt-1">
                 Save 17% vs monthly
              </div>
           </div>
        </div>

        {/* Card Input */}
        <div className="space-y-3">
           <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Card Details</label>
           <div className="p-4 rounded-xl bg-slate-950 border border-slate-700/50 focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/50 transition-all">
              <CardElement options={cardStyle} />
           </div>
        </div>

        {/* Feedback Messages */}
        {error && (
           <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
           </div>
        )}

        {message && (
           <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm">
              <Check className="w-5 h-5 shrink-0" />
              <p>{message}</p>
           </div>
        )}

        {/* Submit Button */}
        <button
           type="submit"
           disabled={loading || !stripe}
           className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 p-4 font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
           <div className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                 <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                 </>
              ) : (
                 <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay {plan === "MONTHLY" ? "$10.00" : "$100.00"}</span>
                 </>
              )}
           </div>
           {/* Shine effect */}
           <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
           <CreditCard className="w-3 h-3" />
           <span>Payments processed securely by Stripe</span>
        </div>

      </form>
    </div>
  );
}
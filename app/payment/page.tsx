"use client";

import React, { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

if (typeof window !== "undefined") {
  const pk = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").trim();
  console.log("Stripe PK (masked):", pk ? `${pk.slice(0, 6)}...${pk.slice(-4)}` : "<missing>");
}

const PUBLISHABLE_KEY = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").trim();
const API_BASE_RAW = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
const stripePromise: Promise<Stripe | null> | null = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-sm text-slate-500">Please log in to subscribe.</div>
      </div>
    );
  }

  if (envMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl text-center bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Stripe / API not configured</h2>
          <p className="text-sm text-slate-600 mb-4">
            Ensure <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> and <code>NEXT_PUBLIC_API_BASE_URL</code> are set in{" "}
            <code>.env.local</code> and restart the dev server.
          </p>
          <p className="text-xs text-slate-400">
            Example:
            <br />
            <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...</code>
            <br />
            <code>NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm apiBase={API_BASE_RAW} />
        </Elements>
      ) : (
        <div className="text-sm text-slate-500">Initializing payments…</div>
      )}
    </div>
  );
}

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

  async function safeJsonParse(res: Response) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { __rawText: text };
    }
  }

  const navigateToProfileAndRefresh = async () => {
    try {
      if (typeof window !== "undefined") {
        try {
          window.dispatchEvent(new Event("user-updated"));
        } catch {}
      }
      try {
        await router.refresh();
      } catch {}
      try {
        router.replace("/profile");
      } catch {}
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!stripe || !elements) {
      setError("Payment system not ready. Try again in a moment.");
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setError("Card input not found.");
      return;
    }

    setLoading(true);

    try {
      if (!apiBase) throw new Error("API base URL is not configured.");

      const endpoint = `${apiBase}/payments/create-intent`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });

      const json = await safeJsonParse(res);

      if (!res.ok) {
        const srvMsg =
          json?.message || json?.error || (json?.__rawText ? "Server returned non-JSON response" : `Status ${res.status}`);
        throw new Error(srvMsg);
      }

      if (!json || !json.success || !json.data?.clientSecret) {
        throw new Error("Unexpected response from payment API: " + JSON.stringify(json));
      }

      const clientSecret = String(json.data.clientSecret);

      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (confirmResult.error) {
        setError(confirmResult.error.message || "Payment failed.");
        setLoading(false);
        return;
      }

      if (confirmResult.paymentIntent && confirmResult.paymentIntent.status === "succeeded") {
        const paymentIntentId = confirmResult.paymentIntent.id;

        try {
          const r = await fetch(`${apiBase}/payments/confirm`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ paymentIntentId }),
          });

          const body = await safeJsonParse(r);

          if (!r.ok) {
            setError("Payment succeeded but server update failed. It will be reconciled via webhook.");
            setMessage("Payment succeeded — server update pending.");
            if (typeof refreshUser === "function") {
              try {
                await refreshUser();
              } catch {}
            }
            await navigateToProfileAndRefresh();
            setLoading(false);
            return;
          }

          if (typeof refreshUser === "function") {
            try {
              await refreshUser();
            } catch {}
          } else {
            try {
              await fetch(`${apiBase}/users/me/self`, {
                method: "GET",
                headers: { Authorization: token ? `Bearer ${token}` : "" },
              });
            } catch {}
          }

          setMessage("Payment succeeded! Subscription recorded.");
          await navigateToProfileAndRefresh();
          setLoading(false);
        } catch (err: any) {
          setError("Payment succeeded but server update failed due to network error.");
          setMessage("Payment succeeded — server update pending.");
          if (typeof refreshUser === "function") {
            try {
              await refreshUser();
            } catch {}
          }
          await navigateToProfileAndRefresh();
          setLoading(false);
          return;
        }
      } else {
        setError("Payment processing: unexpected status.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Choose subscription</h2>

      <div className="flex gap-4 mb-4">
        <label className={`flex-1 p-4 rounded-lg border ${plan === "MONTHLY" ? "border-indigo-500" : "border-gray-200"}`}>
          <input
            type="radio"
            name="plan"
            value="MONTHLY"
            checked={plan === "MONTHLY"}
            onChange={() => setPlan("MONTHLY")}
            className="mr-2"
          />
          <div>
            <div className="font-semibold">Monthly</div>
            <div className="text-sm text-gray-600">$10 / month</div>
          </div>
        </label>

        <label className={`flex-1 p-4 rounded-lg border ${plan === "YEARLY" ? "border-indigo-500" : "border-gray-200"}`}>
          <input
            type="radio"
            name="plan"
            value="YEARLY"
            checked={plan === "YEARLY"}
            onChange={() => setPlan("YEARLY")}
            className="mr-2"
          />
          <div>
            <div className="font-semibold">Yearly</div>
            <div className="text-sm text-gray-600">$100 / year (save 17%)</div>
          </div>
        </label>
      </div>

      <label className="block mb-3">
        <div className="mb-2 font-medium">Card details</div>
        <div className="p-3 border rounded">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </label>

      {error && <div className="mb-3 text-red-600">{error}</div>}
      {message && <div className="mb-3 text-green-600">{message}</div>}

      <button type="submit" disabled={loading || !stripe} className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60">
        {loading ? "Processing…" : `Pay & Subscribe — ${plan === "MONTHLY" ? "$10" : "$100"}`}
      </button>
    </form>
  );
}

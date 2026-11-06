"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import api, { getErrorMessage } from "@/lib/api";
import { AuthShell, FormMessage, SubmitButton } from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Field";
import { OtpInput } from "@/components/auth/OtpInput";

const RESEND_SECONDS = 60;

function ForgotForm() {
  const search = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState(search.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const sendCode = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep("reset");
      setCode("");
      setCooldown(RESEND_SECONDS);
      setNotice(`If an account exists for ${email.trim()}, a 6 digit code is on its way.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp: code,
        newPassword: password,
      });
      router.push("/login?reset=1");
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset your password."));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle={
        step === "email"
          ? "Enter your email and we will send you a code."
          : "Enter the code and choose a new password."
      }
      footer={
        <Link href="/login" className="font-semibold text-primary-400 hover:text-primary-300 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {step === "email" ? (
        <form onSubmit={sendCode} className="space-y-5">
          <FormMessage error={error} />
          <Field
            label="Email Address"
            icon={Mail}
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
            placeholder="name@example.com"
          />
          <SubmitButton loading={loading} loadingText="Sending code...">
            Send code
          </SubmitButton>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-5">
          <FormMessage error={error} notice={error ? null : notice} />
          <OtpInput value={code} onChange={setCode} disabled={loading} autoFocus />
          <Field
            label="New password"
            icon={Lock}
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            hint="At least 8 characters."
          />
          <Field
            label="Confirm new password"
            icon={Lock}
            type="password"
            value={confirm}
            onChange={setConfirm}
            required
            autoComplete="new-password"
            placeholder="••••••••"
          />
          <SubmitButton loading={loading} loadingText="Updating..." disabled={code.length < 6}>
            Update password
          </SubmitButton>
          <button
            type="button"
            onClick={() => sendCode()}
            disabled={cooldown > 0 || loading}
            className="block w-full text-center text-xs font-semibold text-slate-400 transition-colors hover:text-primary-400 disabled:cursor-default disabled:text-slate-600"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotForm />
    </Suspense>
  );
}

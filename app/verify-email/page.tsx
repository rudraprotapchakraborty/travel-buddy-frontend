"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import api, { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import { AuthShell, FormMessage, SubmitButton } from "@/components/auth/AuthShell";
import { OtpInput } from "@/components/auth/OtpInput";

const RESEND_SECONDS = 60;

function VerifyForm() {
  const search = useSearchParams();
  const email = (search.get("email") || "").trim().toLowerCase();
  const router = useRouter();
  const { login } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    email ? `We sent a 6 digit code to ${email}.` : null
  );
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const verify = async (e?: FormEvent, value: string = code) => {
    e?.preventDefault();
    if (value.length < 6 || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", { email, otp: value });
      const { accessToken, user } = res.data.data;
      login(accessToken, user);
      router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "That code did not work."));
      setCode("");
      setLoading(false);
    }
  };

  // Submit as soon as the sixth digit is in
  const onCodeChange = (value: string) => {
    setCode(value);
    if (value.length === 6) verify(undefined, value);
  };

  const resend = async () => {
    setError(null);
    try {
      await api.post("/auth/resend-otp", { email });
      setNotice(`A new code was sent to ${email}.`);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!email) {
    return (
      <AuthShell title="Verify your email" footer={<Link href="/login" className="text-primary-400 hover:underline">Back to sign in</Link>}>
        <p className="text-center text-sm text-slate-400">
          Start from the sign up or sign in page so we know which address to verify.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Check your email"
      subtitle="Enter the code to finish creating your account."
      footer={
        <Link href="/login" className="font-semibold text-primary-400 hover:text-primary-300 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={verify} className="space-y-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/10 text-primary-400">
          <MailCheck className="h-6 w-6" />
        </div>
        <FormMessage error={error} notice={error ? null : notice} />
        <OtpInput value={code} onChange={onCodeChange} disabled={loading} autoFocus />
        <SubmitButton loading={loading} loadingText="Verifying..." disabled={code.length < 6}>
          Verify email
        </SubmitButton>
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="block w-full text-center text-xs font-semibold text-slate-400 transition-colors hover:text-primary-400 disabled:cursor-default disabled:text-slate-600"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}

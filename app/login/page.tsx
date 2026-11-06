"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";
import api, { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import { AuthShell, FormMessage, SubmitButton } from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Field";
import { GoogleButton } from "@/components/auth/GoogleButton";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAuth();

  const notice = search.get("reset") ? "Password updated. You can sign in now." : null;

  const finish = (accessToken: string, user: any) => {
    login(accessToken, user);
    router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      finish(res.data.data.accessToken, res.data.data.user);
    } catch (err: any) {
      // Correct password but the email was never verified: continue with the code
      if (err?.response?.data?.details?.code === "EMAIL_NOT_VERIFIED") {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      }
      setError(getErrorMessage(err, "Invalid email or password."));
      setLoading(false);
    }
  };

  const handleGoogle = async (idToken: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/google", { idToken });
      finish(res.data.data.accessToken, res.data.data.user);
    } catch (err) {
      setError(getErrorMessage(err, "Google sign-in failed."));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your journey."
      footer={
        <>
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-semibold text-primary-400 hover:text-primary-300 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleButton onCredential={handleGoogle} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormMessage error={error} notice={notice} />

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

          <Field
            label="Password"
            icon={Lock}
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            labelAside={
              <Link
                href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-xs text-primary-400 hover:text-primary-300 hover:underline"
              >
                Forgot password?
              </Link>
            }
          />

          <SubmitButton loading={loading} loadingText="Signing in...">
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </SubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

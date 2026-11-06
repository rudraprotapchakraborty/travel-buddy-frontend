"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import api, { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import { AuthShell, FormMessage, SubmitButton } from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Field";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { email, password, fullName });
      // A 6 digit code was emailed; the account is usable once it is entered.
      router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
      setLoading(false);
    }
  };

  const handleGoogle = async (idToken: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/google", { idToken });
      login(res.data.data.accessToken, res.data.data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Google sign-in failed."));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Find buddies, share trips, and explore the world."
      footer={
        <div className="space-y-3">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary-400 hover:text-primary-300 hover:underline">
              Log in here
            </Link>
          </p>
          <p className="text-[11px] text-slate-500">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-300">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-slate-300">Privacy Policy</Link>.
          </p>
        </div>
      }
    >
      <div className="space-y-5">
        <GoogleButton onCredential={handleGoogle} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormMessage error={error} />

          <Field
            label="Full Name"
            icon={User}
            value={fullName}
            onChange={setFullName}
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            placeholder="e.g. Rudra Protap"
          />
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
            autoComplete="new-password"
            placeholder="••••••••"
            hint="At least 8 characters. Numbers and symbols make it stronger."
          />
          <Field
            label="Confirm password"
            icon={Lock}
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            autoComplete="new-password"
            placeholder="••••••••"
          />

          <SubmitButton loading={loading} loadingText="Creating account...">
            <span>Sign Up</span>
            <ArrowRight className="h-4 w-4" />
          </SubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}

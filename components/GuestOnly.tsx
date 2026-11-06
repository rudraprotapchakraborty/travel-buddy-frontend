"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { safeRedirectPath } from "@/lib/redirect";

/**
 * For pages that only make sense when signed out (login, register, reset
 * password, verify email). A signed-in visitor is sent to where they belong
 * instead of seeing the form.
 */
export default function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    if (loading || !user) return;
    const fallback = user.role === "ADMIN" ? "/admin" : "/dashboard";
    router.replace(safeRedirectPath(search.get("from"), fallback));
  }, [user, loading, router, search]);

  // While the saved session is being read, or while redirecting, show a spinner
  // rather than flashing the form.
  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" aria-label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}

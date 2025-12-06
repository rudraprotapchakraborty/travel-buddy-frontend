"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

export default function Protected({
  children,
  adminOnly = false
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (adminOnly && user.role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [user, loading, adminOnly, router]);

  if (loading || (!user && !loading)) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-slate-400 text-sm">Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}

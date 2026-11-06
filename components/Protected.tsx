"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function Protected({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // remember where they were headed so login can send them back
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    } else if (adminOnly && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, loading, adminOnly, router, pathname]);

  if (loading || !user || (adminOnly && user.role !== "ADMIN")) {
    return (
      <div className="flex items-center justify-center py-24" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        <span className="sr-only">Checking authentication...</span>
      </div>
    );
  }

  return <>{children}</>;
}

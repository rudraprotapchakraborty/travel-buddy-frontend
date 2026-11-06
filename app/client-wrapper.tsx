"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Pages that bring their own full-screen layout (no site header / footer)
const BARE_ROUTES = ["/login", "/register", "/forgot-password", "/verify-email"];

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.includes(pathname);

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        {!bare && <Navbar />}
        <main id="main" className="flex-1">
          {children}
        </main>
        {!bare && <Footer />}
      </div>
    </AuthProvider>
  );
}

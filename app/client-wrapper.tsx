// app/client-wrapper.tsx
"use client";

import React from "react";
import { AuthProvider } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * ClientWrapper
 * - This component is client-only ("use client") and will be dynamically loaded on the client.
 * - It composes global providers and shared UI (Navbar, Footer) and renders children.
 * - Keep this file small and client-only. It ensures every page under app/ runs as client-rendered.
 */
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      <Footer />
    </AuthProvider>
  );
}

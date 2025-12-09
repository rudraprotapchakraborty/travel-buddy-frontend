// app/client-wrapper.tsx
"use client";

import React from "react";
import { AuthProvider } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        {/* main should stretch to push footer down */}
        <main className="flex-1 mx-auto w-full pt-16">
          {children}
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

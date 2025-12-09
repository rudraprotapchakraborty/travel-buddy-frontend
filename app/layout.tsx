// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import React, { Suspense } from "react";

// Import the client-only wrapper (it begins with "use client")
import ClientWrapper from "./client-wrapper";

export const metadata: Metadata = {
  title: "Travel Buddy & Meetup",
  description: "Find travel companions and share adventures.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* Wrap the client component in a Suspense boundary so Next can do CSR bailout
            during prerender (this avoids "useSearchParams() should be wrapped" errors). */}
        <Suspense fallback={<div aria-hidden />}>
          <ClientWrapper>{children}</ClientWrapper>
        </Suspense>
      </body>
    </html>
  );
}

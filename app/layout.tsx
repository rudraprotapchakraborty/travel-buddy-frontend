import type { Metadata, Viewport } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Script from "next/script";
import ClientWrapper from "./client-wrapper";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://travel-buddy-frontend-qzgv.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Travel Buddy | Find travel companions",
    template: "%s | Travel Buddy",
  },
  description:
    "Travel Buddy connects travellers heading the same way. Share your trip plans, find companions you can trust and plan the journey together.",
  applicationName: "Travel Buddy",
  openGraph: {
    type: "website",
    siteName: "Travel Buddy",
    title: "Travel Buddy | Find travel companions",
    description: "Share your trip, find companions you can trust and travel together.",
  },
  twitter: { card: "summary", title: "Travel Buddy", description: "Find travel companions." },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#0d161c" },
  ],
};

// Runs before first paint so there is no flash of the wrong theme
const themeScript = `(function(){try{var t=localStorage.getItem('tb_theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Suspense so pages that read the URL can still be prerendered */}
        <Suspense fallback={<div aria-hidden />}>
          <ClientWrapper>{children}</ClientWrapper>
        </Suspense>
      </body>
    </html>
  );
}

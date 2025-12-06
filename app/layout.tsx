import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Travel Buddy & Meetup",
  description: "Find travel companions and share adventures."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

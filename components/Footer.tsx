"use client";

import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 mt-16 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Logo + About */}
        <div>
          <h2 className="text-2xl font-bold text-white">Travel Buddy</h2>
          <p className="mt-3 text-sm text-slate-400">
            Connecting travelers worldwide.  
            Find companions, share journeys, and explore the world together.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/explore" className="hover:text-white">Explore Travelers</Link></li>
            <li><Link href="/travel-plans" className="hover:text-white">My Travel Plans</Link></li>
            <li><Link href="/profile" className="hover:text-white">Profile</Link></li>
          </ul>
        </div>

        {/* Discover */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Discover</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/top-destinations" className="hover:text-white">Top Destinations</Link></li>
            <li><Link href="/reviews" className="hover:text-white">Traveler Reviews</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
            <li><Link href="/pricing" className="hover:text-white">Subscription Plans</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
          <div className="flex items-center gap-4 text-2xl">
            <a href="#" className="hover:text-white"><FaFacebook /></a>
            <a href="#" className="hover:text-white"><FaInstagram /></a>
            <a href="#" className="hover:text-white"><FaTwitter /></a>
            <a href="#" className="hover:text-white"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 py-4">
        <p className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Travel Buddy & Meetup. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

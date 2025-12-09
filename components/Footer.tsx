"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { Send, Globe, Shield, Heart } from "lucide-react";

const SocialLink = ({ href, icon: Icon }: { href: string; icon: any }) => (
  <a
    href={href}
    className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-primary-600 hover:border-primary-500 hover:scale-110 transition-all duration-300 shadow-lg shadow-black/20"
  >
    <Icon size={18} />
  </a>
);

const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <li>
    <Link
      href={href}
      className="group flex items-center text-sm text-slate-400 hover:text-primary-400 transition-colors duration-200"
    >
      <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 opacity-0 group-hover:opacity-100 text-primary-500 mr-0 group-hover:mr-2">
        &rarr;
      </span>
      {label}
    </Link>
  </li>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-slate-950 border-t border-white/5 pt-16 pb-8 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-900/10 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* 1. Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Travel Buddy
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Connect with travelers worldwide. Share itineraries, find verified companions, and turn solo trips into shared adventures.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={FaInstagram} />
              <SocialLink href="#" icon={FaTwitter} />
              <SocialLink href="#" icon={FaLinkedinIn} />
              <SocialLink href="#" icon={FaFacebookF} />
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-6">Explore</h3>
            <ul className="space-y-4">
              <FooterLink href="/explore" label="Find Travelers" />
              <FooterLink href="/travel-plans" label="Browse Trips" />
              <FooterLink href="/map" label="Interactive Map" />
              <FooterLink href="/stories" label="Community Stories" />
            </ul>
          </div>

          {/* 3. Company & Support */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-6">Support</h3>
            <ul className="space-y-4">
              <FooterLink href="/how-it-works" label="How it Works" />
              <FooterLink href="/pricing" label="Pricing & Plans" />
              <FooterLink href="/safety" label="Safety & Verification" />
              <FooterLink href="/help" label="Help Center" />
            </ul>
          </div>

          {/* 4. Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-6">Stay Updated</h3>
            <p className="text-xs text-slate-400 mb-4">
              Get the latest travel tips, destination guides, and community updates.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              />
              <button className="absolute right-1.5 top-1.5 p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors shadow-lg shadow-primary-500/20">
                <Send size={16} />
              </button>
            </div>
            <p className="mt-3 text-[10px] text-slate-500">
              By subscribing, you agree to our Policy. No spam, ever.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Travel Buddy Inc. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-slate-300 transition-colors">Cookie Settings</Link>
          </div>

          <div className="flex items-center gap-2 opacity-60">
             <span>Made with</span>
             <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
             <span>for travelers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
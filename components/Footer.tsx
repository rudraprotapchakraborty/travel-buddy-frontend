"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { Send, Globe, Shield, Heart, Mail, Phone, MapPin } from "lucide-react";

// --- Sub-Components ---

const SocialLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
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
    <footer className="relative w-full bg-slate-950 border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary-900/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* 1. Brand & Socials */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center text-xl">🌍</div>
              <span className="text-2xl font-black text-white tracking-tight">
                TravelBuddy
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              The world's most trusted community for finding verified travel companions. Don't just travel, travel together.
            </p>
            <div className="flex gap-3">
              <SocialLink href="https://instagram.com" icon={FaInstagram} label="Instagram" />
              <SocialLink href="https://twitter.com" icon={FaTwitter} label="Twitter" />
              <SocialLink href="https://linkedin.com" icon={FaLinkedinIn} label="LinkedIn" />
              <SocialLink href="https://facebook.com" icon={FaFacebookF} label="Facebook" />
            </div>
          </div>

          {/* 2. Important Links (Functional) */}
          <div className="lg:pl-8">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-7">Platform</h3>
            <ul className="space-y-4">
              <FooterLink href="/explore" label="Find Travel Buddies" />
              <FooterLink href="/travel-plans" label="Explore Trip Plans" />
              <FooterLink href="/about" label="Our Story" />
              <FooterLink href="/blog" label="Travel Guides & Stories" />
            </ul>
          </div>

          {/* 3. Contact Information (Mandatory Requirement) */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-7">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400 group cursor-default">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                <span>123 Adventure Way, <br />Global Nomad Valley, CA 90210</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary-400 transition-colors">
                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                <a href="mailto:support@travelbuddy.com">support@travelbuddy.com</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary-400 transition-colors">
                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </li>
            </ul>
          </div>

          {/* 4. Newsletter Section */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-4">Newsletter</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Subscribe to get exclusive travel deals and buddy alerts.
            </p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="email@example.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              />
              <button 
                type="submit"
                className="absolute right-1.5 top-1.5 p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-all active:scale-90"
              >
                <Send size={16} />
              </button>
            </form>
            <div className="mt-4 flex items-center gap-2">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] text-slate-500">Your data is secured with SSL.</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-slate-500 tracking-wide uppercase font-medium">
          <p>© {currentYear} Travel Buddy Inc. Proudly Made for Global Citizens.</p>
          
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary-400 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-primary-400 transition-colors">Security</Link>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-slate-400">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
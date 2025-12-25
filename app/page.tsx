"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import {
  Users, MapPin, ShieldCheck, Sparkles, Star, MessageCircle, ArrowRight,
  Globe, Plane, Calendar, CreditCard, Heart, Search, CheckCircle2, ChevronDown
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import React, { useState } from "react";

// --- Animation Config ---
const EASE_ELASTIC: [number, number, number, number] = [0.22, 1, 0.36, 1];
const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_ELASTIC } },
};

// --- Reusable Components ---

function SectionHeading({ title, subtitle, centered = false }: { title: string; subtitle: string; centered?: boolean }) {
  return (
    <div className={`mb-12 ${centered ? "text-center" : "text-left"}`}>
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{title}</h2>
      <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">{subtitle}</p>
    </div>
  );
}

// --- 1. Hero Section (Already built by you, polished) ---
// ... (Your HeroBadge, CTA, AppMockup logic remains same or slightly integrated)

export default function HomePage() {
  const { user } = useAuth() as any;
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-primary-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-sky-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* --- SECTION 1: HERO --- */}
        <section className="py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={container}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold mb-6">
              <Sparkles className="w-3 h-3" /> 24,000+ Verified Travelers
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Adventure is <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-sky-400">Better Shared.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-lg">
              Connect with like-minded travelers, split costs, and create unforgettable memories together. Your next best friend is a trip away.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/explore" className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold transition-all shadow-lg shadow-primary-600/20">Find a Buddy</Link>
              <Link href="/about" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold border border-white/10 transition-all">How it Works</Link>
            </div>
          </motion.div>
          <div className="relative lg:block hidden">
             <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full" />
             {/* Replace with your AppMockup component */}
             <div className="relative bg-slate-900 border-[8px] border-slate-800 rounded-[3rem] h-[500px] w-[300px] mx-auto overflow-hidden shadow-2xl">
                <div className="p-6">
                   <div className="h-4 w-20 bg-slate-800 rounded mb-4" />
                   <div className="aspect-video bg-slate-800 rounded-xl mb-4" />
                   <div className="space-y-2">
                      <div className="h-3 w-full bg-slate-800 rounded" />
                      <div className="h-3 w-2/3 bg-slate-800 rounded" />
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* --- SECTION 2: STATISTICS --- */}
        <section className="py-12 border-y border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
             {[
               { label: "Active Trips", val: "1.2k+" },
               { label: "Countries", val: "85+" },
               { label: "Happy Pairs", val: "10k+" },
               { label: "Safety Rating", val: "4.9/5" },
             ].map((s, i) => (
               <div key={i}>
                 <p className="text-3xl font-bold text-white mb-1">{s.val}</p>
                 <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{s.label}</p>
               </div>
             ))}
          </div>
        </section>

        {/* --- SECTION 3: FEATURES (Bento Grid) --- */}
        <section className="py-24">
          <SectionHeading title="Why Travel With Us?" subtitle="We provide the tools you need to find safe, compatible, and fun travel companions." />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-primary-600/20 to-transparent border border-white/10 p-8 rounded-3xl">
              <ShieldCheck className="w-12 h-12 text-primary-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Military-Grade Safety</h3>
              <p className="text-slate-400">Every profile goes through a 3-step verification process including ID check and social link confirmation.</p>
            </div>
            <div className="bg-slate-900/50 border border-white/10 p-8 rounded-3xl">
              <MessageCircle className="w-12 h-12 text-sky-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Real-time Chat</h3>
              <p className="text-slate-400">Discuss plans safely within our encrypted messaging system.</p>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: POPULAR DESTINATIONS --- */}
        <section className="py-24">
           <div className="flex justify-between items-end mb-12">
              <SectionHeading title="Trending Destinations" subtitle="Where everyone is heading this month." />
              <Link href="/explore" className="text-primary-400 flex items-center gap-2 hover:underline mb-12">View All <ArrowRight className="w-4 h-4" /></Link>
           </div>
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Bali, Indonesia", img: "🏝️", price: "$450" },
                { name: "Swiss Alps", img: "🏔️", price: "$890" },
                { name: "Kyoto, Japan", img: "⛩️", price: "$620" },
                { name: "Santorini, Greece", img: "🏛️", price: "$750" },
              ].map((dest, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-white/5 hover:border-primary-500/50 transition-all cursor-pointer">
                  <div className="h-48 bg-slate-800 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                    {dest.img}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-white mb-1">{dest.name}</h4>
                    <p className="text-sm text-slate-500">Starts from {dest.price}</p>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* --- SECTION 5: HOW IT WORKS --- */}
        <section className="py-24 bg-white/5 rounded-[3rem] px-8">
           <SectionHeading title="Get Started in 3 Steps" subtitle="Simple, fast, and secure process." centered />
           <div className="grid md:grid-cols-3 gap-12 relative">
              {[
                { step: "01", t: "Create Profile", d: "Add your travel style, interests, and past adventures." },
                { step: "02", t: "Find a Match", d: "Browse travelers heading to your destination." },
                { step: "03", t: "Go Together", d: "Chat, plan, and start your journey with a buddy." },
              ].map((step, i) => (
                <div key={i} className="text-center relative">
                  <span className="text-6xl font-black text-white/5 absolute -top-10 left-1/2 -translate-x-1/2">{step.step}</span>
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center mx-auto mb-6 relative z-10 font-bold">{i+1}</div>
                  <h4 className="text-xl font-bold mb-2">{step.t}</h4>
                  <p className="text-slate-400 text-sm">{step.d}</p>
                </div>
              ))}
           </div>
        </section>

        {/* --- SECTION 6: TESTIMONIALS --- */}
        <section className="py-24">
           <SectionHeading title="Traveler Stories" subtitle="Join thousands who have found their travel souls." centered />
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-white/5 italic text-slate-300">
                  <div className="flex gap-1 text-amber-500 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  "I was nervous about traveling alone to Iceland, but I found Sarah here. We had the most incredible road trip and saved $400 on car rentals!"
                  <div className="mt-6 flex items-center gap-3 not-italic">
                    <div className="w-10 h-10 rounded-full bg-slate-700" />
                    <div>
                      <p className="text-sm font-bold text-white">Alex Johnson</p>
                      <p className="text-xs text-slate-500">Traveled to Iceland</p>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* --- SECTION 7: CALL TO ACTION (CTA) --- */}
        <section className="py-24">
           <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary-600 to-indigo-600 p-12 text-center shadow-2xl">
              <div className="relative z-10">
                <h2 className="text-4xl font-black text-white mb-4">Ready to Explore?</h2>
                <p className="text-primary-100 mb-8 max-w-xl mx-auto">Don't let your dream destination remain just a dream. Join TravelBuddy today.</p>
                <Link href="/register" className="px-10 py-4 bg-white text-primary-600 rounded-full font-bold hover:scale-105 transition-transform inline-block">Join for Free</Link>
              </div>
              <Globe className="absolute -right-20 -bottom-20 w-80 h-80 text-white/10" />
           </div>
        </section>

        {/* --- SECTION 8: LATEST BLOGS --- */}
        <section className="py-24">
           <SectionHeading title="Travel Insights" subtitle="Tips and tricks from our community experts." />
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { t: "Budgeting for 2024", d: "How to travel more for less." },
                { t: "Safety Tips for Solo Women", d: "Expert advice for female travelers." },
                { t: "Hidden Gems in Bali", d: "Beyond the typical tourist spots." },
              ].map((blog, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="aspect-video bg-slate-800 rounded-2xl mb-4 group-hover:bg-slate-700 transition-colors" />
                  <h4 className="text-lg font-bold group-hover:text-primary-400 transition-colors">{blog.t}</h4>
                  <p className="text-slate-500 text-sm mt-1">{blog.d}</p>
                </div>
              ))}
           </div>
        </section>

        {/* --- SECTION 9: FAQ --- */}
        <section className="py-24 max-w-3xl mx-auto">
           <SectionHeading title="Common Questions" subtitle="Everything you need to know." centered />
           <div className="space-y-4">
              {[
                { q: "Is it safe to meet strangers?", a: "Yes, we use ID verification and community ratings to ensure safety." },
                { q: "How much does it cost?", a: "The basic platform is free! We have a premium tier for advanced filters." },
                { q: "Can I host a trip?", a: "Absolutely! Create an itinerary and let others apply to join you." },
              ].map((faq, i) => (
                <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                  <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex justify-between items-center p-5 text-left bg-white/5 hover:bg-white/10 transition">
                    <span className="font-bold text-white">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === i && <div className="p-5 text-slate-400 bg-white/5 border-t border-white/5 text-sm">{faq.a}</div>}
                </div>
              ))}
           </div>
        </section>

        {/* --- SECTION 10: NEWSLETTER --- */}
        <section className="py-24">
           <div className="p-12 border border-white/10 rounded-[3rem] text-center bg-gradient-to-b from-white/5 to-transparent">
              <h3 className="text-2xl font-bold mb-2">Get Weekly Travel Deals</h3>
              <p className="text-slate-500 mb-8">No spam, just the best travel buddies and deals directly to your inbox.</p>
              <div className="flex max-w-md mx-auto gap-2">
                 <input type="email" placeholder="Enter your email" className="flex-1 bg-slate-900 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-primary-500" />
                 <button className="px-6 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-500 transition">Subscribe</button>
              </div>
           </div>
        </section>

      </div>
    </main>
  );
}
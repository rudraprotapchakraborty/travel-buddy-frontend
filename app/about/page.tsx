"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Globe, 
  ShieldCheck, 
  Compass, 
  Heart, 
  Target,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// --- Components ---

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
    <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{label}</p>
  </div>
);

const ValueCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-primary-500/30 transition-all duration-300 group">
    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h4 className="text-xl font-bold text-white mb-3">{title}</h4>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary-500/30">
      
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest mb-6 inline-block">
              Our Story
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
              We connect the world's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-sky-400">
                Adventurers.
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Founded in 2024, TravelBuddy was born out of a simple realization: the best travel memories aren't just about the places you go, but the people you share them with.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Global Users" value="240K+" />
          <StatCard label="Trips Completed" value="15K+" />
          <StatCard label="Countries" value="85+" />
          <StatCard label="Safety Rating" value="4.9/5" />
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square bg-gradient-to-tr from-primary-600 to-sky-500 rounded-[3rem] rotate-3 opacity-20 absolute inset-0 blur-2xl" />
            <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center">
               <Globe className="w-40 h-40 text-primary-500/20 animate-pulse" />
               <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                  <p className="text-2xl font-bold text-white italic">"To make solo travel a thing of the past by building the world's safest travel community."</p>
               </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">Our Mission</h2>
            <p className="text-slate-400 leading-relaxed">
              We believe that everyone deserves to explore the world without fear or loneliness. Our platform provides the technology to find compatible companions based on interests, budget, and travel style.
            </p>
            <ul className="space-y-4">
              {[
                "Strict identity verification for all members",
                "Advanced AI-driven compatibility matching",
                "24/7 community support for travelers",
                "Sustainable and responsible travel initiatives"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="text-primary-500 shrink-0" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Core Values */}
      <section className="py-24 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What We Stand For</h2>
            <p className="text-slate-400">The principles that guide everything we do at TravelBuddy.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              icon={ShieldCheck} 
              title="Safety First" 
              desc="We don't compromise on security. From ID verification to manual profile reviews, your safety is our top priority."
            />
            <ValueCard 
              icon={Users} 
              title="Community" 
              desc="We are more than an app; we are a family. We foster real connections that last long after the trip ends."
            />
            <ValueCard 
              icon={Compass} 
              title="Inclusion" 
              desc="Travel is for everyone. We welcome travelers of all backgrounds, genders, and experience levels."
            />
          </div>
        </div>
      </section>

      {/* 5. Team Section (Placeholders) */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Meet the Dreamers</h2>
          <p className="text-slate-400">The passionate team making global exploration accessible.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "Arif Rahman", role: "Founder & CEO" },
            { name: "Sarah Jenkins", role: "Head of Community" },
            { name: "David Chen", role: "CTO" },
            { name: "Elena Rossi", role: "Lead Designer" }
          ].map((member, i) => (
            <div key={i} className="text-center group">
              <div className="aspect-square rounded-2xl bg-slate-900 border border-white/5 mb-4 group-hover:border-primary-500/50 transition-colors overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
                 <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-bold">Photo</div>
              </div>
              <h4 className="text-lg font-bold text-white">{member.name}</h4>
              <p className="text-sm text-slate-500">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary-600 to-indigo-600 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Globe size={200} />
           </div>
           <div className="relative z-10">
             <h2 className="text-4xl font-black text-white mb-6">Ready to write your next chapter?</h2>
             <div className="flex flex-wrap justify-center gap-4">
               <Link href="/register" className="px-8 py-4 bg-white text-primary-600 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
                 Join the Community <ArrowRight size={18} />
               </Link>
               <Link href="/contact" className="px-8 py-4 bg-black/20 text-white border border-white/20 rounded-full font-bold hover:bg-black/30 transition-all">
                 Contact Us
               </Link>
             </div>
           </div>
        </div>
      </section>

    </div>
  );
}
"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import {
  Users,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  MessageCircle,
  ArrowRight,
  Globe,
  Plane,
  Calendar,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import React from "react";

// --- Animation Config ---
const EASE_ELASTIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_ELASTIC } },
};

const itemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_ELASTIC } },
};

// --- Sub-Components ---

function HeroBadge() {
  return (
    <motion.div
      variants={itemScale}
      className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-600 shadow-[0_0_15px_rgba(99,102,241,0.3)] backdrop-blur-md"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
      </span>
      <span>Live: 24,000+ Active Travelers</span>
    </motion.div>
  );
}

function PrimaryCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/40 transition-all duration-300 hover:scale-[1.02] hover:bg-primary-500 hover:shadow-primary-500/60 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-slate-900"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shine" />
      <span className="relative flex items-center gap-2">{children}</span>
    </Link>
  );
}

function SecondaryCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

// --- Visual Components (Right Side) ---

function FloatingBadge({
  icon: Icon,
  text,
  className,
  delay = 0,
}: {
  icon: any;
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay: 0.5 + delay, duration: 0.6, ease: EASE_ELASTIC }}
      className={`absolute z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 p-3 shadow-xl backdrop-blur-md ${className}`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary-500 to-sky-500 text-white">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-xs font-medium text-slate-200">{text}</span>
    </motion.div>
  );
}

function AppMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      {/* Floating Elements around the phone */}
      <FloatingBadge
        icon={Plane}
        text="Bali Trip Matched!"
        className="-left-12 top-20 hidden md:flex"
        delay={0.2}
      />
      <FloatingBadge
        icon={MessageCircle}
        text="Sarah: Hey! I'll be there too 👋"
        className="-right-16 top-40 hidden md:flex"
        delay={0.4}
      />

      {/* Main Card/Phone Interface */}
      <motion.div
        variants={itemScale}
        className="relative z-10 overflow-hidden rounded-[2.5rem] border-[6px] border-slate-900 bg-slate-950 shadow-2xl shadow-black/50"
      >
        {/* Screen Content */}
        <div className="relative h-[480px] w-full bg-slate-900">
          {/* Header Image */}
          <div className="h-48 w-full bg-gradient-to-b from-primary-900/50 to-slate-900 relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/20 via-slate-900/0 to-transparent opacity-70"></div>
             <div className="absolute bottom-4 left-6">
                <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-[10px] font-bold text-white mb-2">UPCOMING</span>
                <h3 className="text-xl font-bold text-white leading-none">Bali, Indonesia</h3>
                <div className="flex items-center gap-1 mt-1 text-xs text-sky-200/80">
                    <Calendar className="w-3 h-3" />
                    12–18 Feb
                </div>
             </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {/* Match Section */}
            <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Travel Buddies</p>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white
                                ${i === 1 ? 'bg-gradient-to-br from-rose-400 to-orange-400' : 
                                  i === 2 ? 'bg-gradient-to-br from-emerald-400 to-teal-400' : 
                                  'bg-slate-700'}`}
                            >
                                {i === 3 && '+2'}
                            </div>
                        ))}
                    </div>
                    <button className="h-8 px-3 rounded-full bg-primary-600 text-[10px] font-bold text-white">
                        Chat
                    </button>
                </div>
            </div>

            {/* Plan Section */}
            <div>
                 <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">Itinerary</p>
                 <div className="space-y-2">
                    {[
                        { time: "10:00 AM", event: "Meet at Canggu Beach" },
                        { time: "01:00 PM", event: "Lunch at The Lawn" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary-500/50"></div>
                             <div className="flex-1">
                                <p className="text-xs font-medium text-slate-200">{item.event}</p>
                                <p className="text-[10px] text-slate-500">{item.time}</p>
                             </div>
                        </div>
                    ))}
                 </div>
            </div>
          </div>

          {/* Bottom Nav Mockup */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6">
               <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center"><Globe className="w-4 h-4" /></div>
               <div className="w-6 h-6 text-slate-600"><MessageCircle className="w-4 h-4" /></div>
               <div className="w-6 h-6 text-slate-600"><Users className="w-4 h-4" /></div>
          </div>
        </div>
      </motion.div>

      {/* Glow Effect behind phone */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-primary-600/30 to-sky-500/30 blur-3xl -z-10 rounded-[3rem] opacity-60" />
    </div>
  );
}

// --- Feature Card ---

function FeatureCard({
  icon: Icon,
  title,
  desc,
  delay,
  colorClass,
}: {
  icon: any;
  title: string;
  desc: string;
  delay: number;
  colorClass: string;
}) {
  return (
    <motion.div
      variants={itemUp}
      className="group relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 hover:border-white/10 transition-colors"
    >
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 shadow-lg ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-100">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
      
      {/* Hover glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-20" />
    </motion.div>
  );
}

// --- Main Page Component ---

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 selection:bg-primary-500/30 selection:text-white">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="absolute right-[0%] top-[20%] h-[400px] w-[400px] rounded-full bg-sky-600/10 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[20%] h-[300px] w-[600px] rounded-full bg-indigo-600/5 blur-[100px]" />
        {/* Grain overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        
        {/* --- Hero Section --- */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="flex flex-col items-start gap-8"
          >
            <HeroBadge />

            <motion.h1
              variants={itemUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Travel is better <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-sky-300 to-emerald-300 animate-gradient-x">
                together.
              </span>
            </motion.h1>

            <motion.p variants={itemUp} className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Stop solo scrolling. Start shared exploring. Connect with travelers heading to the same destination, sync itineraries, and experience the world with new friends.
            </motion.p>

            <motion.div variants={itemUp} className="flex flex-wrap items-center gap-4">
              <PrimaryCTA href={user ? "/explore" : "/register"}>
                 {user ? "Find Travel Buddies" : "Start Your Journey"}
                 <Users className="h-4 w-4" />
              </PrimaryCTA>
              
              <SecondaryCTA href="/travel-plans">
                Plan a Trip
              </SecondaryCTA>
            </motion.div>

            <motion.div variants={itemUp} className="flex items-center gap-4 pt-4 border-t border-white/5 w-full">
               <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-950 bg-slate-800 relative overflow-hidden">
                       {/* Placeholder avatar gradient */}
                       <div className={`absolute inset-0 bg-gradient-to-br ${i % 2 === 0 ? 'from-primary-400 to-indigo-600' : 'from-emerald-400 to-teal-600'} opacity-80`} />
                    </div>
                  ))}
               </div>
               <div className="text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-slate-400 mt-0.5"><span className="font-bold text-white">4.9/5</span> from verified travelers</p>
               </div>
            </motion.div>
          </motion.div>

          {/* Right Visual (3D Tilt) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative lg:h-[600px] flex items-center justify-center perspective-1000"
            style={{ perspective: "1000px" }}
          >
             <div className="relative transform transition-transform duration-700 hover:rotate-y-6 hover:scale-105" style={{ transformStyle: "preserve-3d" }}>
                <AppMockup />
             </div>
          </motion.div>

        </div>

        {/* --- Features Grid (Bento Style) --- */}
        <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={container}
            className="mt-32 grid md:grid-cols-3 gap-6"
        >
            <div className="md:col-span-2">
                 <FeatureCard 
                    icon={MapPin}
                    title="Smart Destination Matching"
                    desc="Don't just go anywhere. Go where your people are. Our algorithm highlights destinations buzzing with travelers who share your specific dates and interests."
                    delay={0}
                    colorClass="text-primary-400 shadow-primary-500/20"
                 />
            </div>
            
            <FeatureCard 
                icon={ShieldCheck}
                title="Verified & Safe"
                desc="Travel with peace of mind. We verify profiles with ID checks and social matching so you know exactly who you're meeting."
                delay={0.1}
                colorClass="text-emerald-400 shadow-emerald-500/20"
            />

            <FeatureCard 
                icon={Sparkles}
                title="Vibe Check"
                desc="Filter by travel style—Luxury, Budget, Adventure, or Chill. Find someone who travels at your pace."
                delay={0.2}
                colorClass="text-amber-400 shadow-amber-500/20"
            />

            <div className="md:col-span-2">
                <FeatureCard 
                    icon={MessageCircle}
                    title="Seamless Coordination"
                    desc="Built-in chat, itinerary builders, and expense splitting tools make moving from 'Nice to meet you' to 'Let's book it' effortless."
                    delay={0.3}
                    colorClass="text-sky-400 shadow-sky-500/20"
                />
            </div>
        </motion.div>

      </div>
    </main>
  );
}
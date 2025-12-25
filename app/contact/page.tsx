
"use client";

import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock, 
  Globe,
  CheckCircle2
} from "lucide-react";
import React, { useState } from "react";

// --- Components ---

const ContactMethod = ({ icon: Icon, title, detail, sub }: { icon: any, title: string, detail: string, sub: string }) => (
  <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-all group">
    <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 shrink-0 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <div>
      <h4 className="text-white font-bold mb-1">{title}</h4>
      <p className="text-slate-300 text-sm mb-1">{detail}</p>
      <p className="text-slate-500 text-xs">{sub}</p>
    </div>
  </div>
);

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      
      {/* 1. Header Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-bold uppercase tracking-widest mb-6 inline-block">
              Get in Touch
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-sky-400">help you?</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Have questions about finding a buddy or safety verification? Our team is here to help you 24/7.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Contact Grid */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 items-start">
          
          {/* Left: Contact Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-8">Contact Information</h3>
            
            <ContactMethod 
              icon={Mail} 
              title="Email Us" 
              detail="support@travelbuddy.com" 
              sub="Online support 24/7"
            />
            <ContactMethod 
              icon={Phone} 
              title="Call Us" 
              detail="+1 (234) 567-890" 
              sub="Mon-Fri, 9am - 6pm EST"
            />
            <ContactMethod 
              icon={MapPin} 
              title="Office" 
              detail="123 Adventure Way, San Francisco" 
              sub="CA 94103, United States"
            />
            
            <div className="p-8 rounded-3xl bg-gradient-to-br from-primary-600/20 to-transparent border border-primary-500/20 mt-12">
               <div className="flex items-center gap-3 mb-4 text-primary-400">
                  <Clock size={20} />
                  <span className="font-bold uppercase tracking-wider text-xs">Response Time</span>
               </div>
               <p className="text-slate-300 text-sm">
                  We typically respond to all inquiries within <strong>2–4 business hours</strong>. For urgent safety matters, please use the emergency report button in the app.
               </p>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-12">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Message Sent!</h3>
                <p className="text-slate-400 mb-8">Thank you for reaching out. We've received your message and will get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-primary-400 font-bold hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Subject</label>
                  <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-500 transition-all appearance-none">
                    <option>General Inquiry</option>
                    <option>Safety Reporting</option>
                    <option>Account Issues</option>
                    <option>Partnership</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Message</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="How can we help you?"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-500 transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Sending..." : (
                    <>
                      Send Message <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3. Global Reach Section */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400 mb-8">
              <Globe size={32} />
           </div>
           <h2 className="text-3xl font-bold text-white mb-4">Our Global Presence</h2>
           <p className="text-slate-400 max-w-2xl mx-auto mb-12">
             With moderators and support staff across 4 continents, we speak your language and understand your travel needs.
           </p>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {['San Francisco', 'London', 'Tokyo', 'Sydney'].map((city) => (
                <div key={city} className="space-y-2">
                  <p className="text-white font-bold">{city}</p>
                  <p className="text-xs text-slate-500 tracking-widest uppercase">Regional Hub</p>
                </div>
              ))}
           </div>
        </div>
      </section>

    </div>
  );
}
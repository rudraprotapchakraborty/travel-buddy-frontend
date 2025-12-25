"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Minus, 
  Search, 
  MessageCircle, 
  ShieldCheck, 
  UserPlus, 
  CreditCard, 
  Plane,
  HelpCircle,
  ArrowRight,
  Mail
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

// --- Data ---
const FAQ_DATA = [
  {
    category: "Getting Started",
    icon: UserPlus,
    questions: [
      { q: "How do I create a profile?", a: "Go to the Registration page, fill in your details, and verify your email. Make sure to add a clear profile picture and your travel interests to get better matches." },
      { q: "Is TravelBuddy free to use?", a: "Yes, basic features like browsing trips and creating a profile are free. We offer a Premium plan for unlimited messaging and advanced filters." },
    ]
  },
  {
    category: "Safety & Verification",
    icon: ShieldCheck,
    questions: [
      { q: "How does the identity verification work?", a: "We use a secure third-party service to verify your government-issued ID and cross-check it with your profile name and photo." },
      { q: "What should I do if I feel unsafe?", a: "Your safety is our priority. Use the 'Report' button on any profile or trip, or contact our 24/7 emergency support team immediately." },
    ]
  },
  {
    category: "Finding Buddies",
    icon: Plane,
    questions: [
      { q: "How can I find someone going to Bali?", a: "Use the 'Explore' page and use the destination filter. You can also search for specific dates to find travelers with matching itineraries." },
      { q: "Can I group chat with multiple travelers?", a: "Yes! Once you join a trip plan, you'll be added to a dedicated group chat with all other confirmed participants." },
    ]
  },
  {
    category: "Payments & Refunds",
    icon: CreditCard,
    questions: [
      { q: "How do I pay for the Premium plan?", a: "We accept all major credit cards, PayPal, and local mobile wallets through our secure SSL-encrypted payment gateway." },
      { q: "Are trip costs handled through the app?", a: "Currently, we only handle subscription payments. Trip expenses (hotels, flights) should be discussed and split between buddies directly." },
    ]
  }
];

// --- Sub-Components ---

const AccordionItem = ({ question, answer, isOpen, onClick }: any) => (
  <div className="border border-white/5 rounded-2xl mb-3 overflow-hidden transition-all duration-300">
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
        isOpen ? "bg-white/5" : "bg-transparent hover:bg-white/[0.02]"
      }`}
    >
      <span className={`font-semibold ${isOpen ? "text-primary-400" : "text-slate-200"}`}>
        {question}
      </span>
      <div className={`shrink-0 ml-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
        {isOpen ? <Minus size={18} className="text-primary-500" /> : <Plus size={18} className="text-slate-500" />}
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-3">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      
      {/* 1. Hero / Search Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary-900/10 blur-[100px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex p-3 rounded-2xl bg-primary-500/10 text-primary-400 mb-6">
              <HelpCircle size={32} />
            </div>
            <h1 className="text-5xl font-black text-white mb-6">
              Questions? <span className="text-primary-500">Answers.</span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto mb-10">
              Everything you need to know about TravelBuddy. Can't find what you're looking for? Reach out to our support team.
            </p>

            <div className="max-w-2xl mx-auto relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search for answers (e.g. security, payment, Bali)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FAQ Content */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[250px_1fr] gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block space-y-2 sticky top-24 h-fit">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Categories</p>
            {FAQ_DATA.map((cat, i) => (
              <button 
                key={i}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all text-sm font-medium"
              >
                <cat.icon size={16} className="text-primary-500" />
                {cat.category}
              </button>
            ))}
          </aside>

          {/* FAQ Accordions */}
          <div className="space-y-12">
            {FAQ_DATA.map((cat, catIdx) => {
              // Simple filtering logic
              const filteredQuestions = cat.questions.filter(q => 
                q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                q.a.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredQuestions.length === 0) return null;

              return (
                <div key={catIdx} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                      <cat.icon size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{cat.category}</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {filteredQuestions.map((item, qIdx) => {
                      const id = `${catIdx}-${qIdx}`;
                      return (
                        <AccordionItem 
                          key={id}
                          question={item.q}
                          answer={item.a}
                          isOpen={openIndex === id}
                          onClick={() => setOpenIndex(openIndex === id ? null : id)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* No Results Placeholder */}
            {searchQuery && !FAQ_DATA.some(cat => cat.questions.some(q => q.q.toLowerCase().includes(searchQuery.toLowerCase()))) && (
               <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-slate-500">No matching questions found for "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery("")} className="mt-2 text-primary-400 font-bold">Clear search</button>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Still Need Help Section */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
           <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary-600 to-indigo-600 shadow-2xl shadow-primary-900/20 group cursor-pointer">
              <MessageCircle className="w-10 h-10 text-white mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-2">Live Chat Support</h3>
              <p className="text-primary-100 text-sm mb-6">Talk to our friendly support team right now for instant help.</p>
              <button className="px-6 py-3 bg-white text-primary-600 rounded-xl font-bold text-sm flex items-center gap-2">
                 Start Chat <ArrowRight size={16} />
              </button>
           </div>
           
           <div className="p-8 rounded-[2rem] bg-slate-900 border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
              <Mail className="w-10 h-10 text-primary-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-2">Email Inquiry</h3>
              <p className="text-slate-400 text-sm mb-6">Send us a detailed message and we'll get back to you within 4 hours.</p>
              <Link href="/contact" className="px-6 py-3 bg-white/5 text-white rounded-xl font-bold text-sm flex items-center gap-2 border border-white/10 group-hover:bg-white/10 transition-colors">
                 Contact Page <ArrowRight size={16} />
              </Link>
           </div>
        </div>
      </section>

    </div>
  );
}
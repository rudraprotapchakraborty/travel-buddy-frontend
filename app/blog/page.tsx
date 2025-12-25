"use client";

import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Search, Tag, clock } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

// --- Mock Data ---
const BLOG_POSTS = [
  {
    id: 1,
    title: "10 Essential Tips for First-Time Solo Travelers",
    excerpt: "Solo travel is one of the most rewarding experiences, but it can be daunting. Here's what you need to know before you go...",
    author: "Sarah Jenkins",
    date: "Dec 15, 2024",
    category: "Solo Travel",
    readTime: "5 min read",
    image: "🏔️", // Replace with real images in production
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    id: 2,
    title: "How to Find the Perfect Travel Buddy Online",
    excerpt: "Safety, interests, and budget—finding a compatible companion is an art. Our guide helps you navigate the process...",
    author: "Arif Rahman",
    date: "Dec 12, 2024",
    category: "Community",
    readTime: "7 min read",
    image: "🤝",
    color: "from-purple-500/20 to-pink-500/20"
  },
  {
    id: 3,
    title: "Hidden Gems: Budget-Friendly Destinations in 2025",
    excerpt: "Explore stunning locations that won't break the bank. From Southeast Asia to Eastern Europe, discover where to go next...",
    author: "Elena Rossi",
    date: "Dec 10, 2024",
    category: "Budget",
    readTime: "6 min read",
    image: "🏝️",
    color: "from-emerald-500/20 to-teal-500/20"
  },
  {
    id: 4,
    title: "The Ultimate Packing List for Adventure Seekers",
    excerpt: "Don't forget the essentials. We've compiled a list of everything from gear to medical kits for your next mountain trek...",
    author: "David Chen",
    date: "Dec 08, 2024",
    category: "Adventure",
    readTime: "8 min read",
    image: "🎒",
    color: "from-orange-500/20 to-red-500/20"
  },
  {
    id: 5,
    title: "Staying Safe: Identity Verification in Travel Apps",
    excerpt: "Learn how we use advanced security protocols to ensure every traveler you meet is verified and trustworthy...",
    author: "Admin Team",
    date: "Dec 05, 2024",
    category: "Safety",
    readTime: "4 min read",
    image: "🛡️",
    color: "from-indigo-500/20 to-blue-500/20"
  },
  {
    id: 6,
    title: "Sustainable Travel: Leaving Only Footprints",
    excerpt: "How to be a responsible traveler. Discover eco-friendly stays and ways to support local communities on your journey...",
    author: "Sarah Jenkins",
    date: "Dec 01, 2024",
    category: "Eco-Travel",
    readTime: "10 min read",
    image: "🌿",
    color: "from-green-500/20 to-emerald-500/20"
  }
];

// --- Components ---

const BlogCard = ({ post }: { post: typeof BLOG_POSTS[0] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group flex flex-col h-full bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-primary-500/30 transition-all duration-300"
  >
    {/* Card Image Placeholder */}
    <div className={`aspect-video w-full bg-gradient-to-br ${post.color} flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500`}>
      {post.image}
    </div>

    {/* Content */}
    <div className="p-6 flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-[10px] font-bold uppercase tracking-wider">
          {post.category}
        </span>
        <span className="text-[10px] text-slate-500 font-medium uppercase">{post.readTime}</span>
      </div>

      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
        {post.title}
      </h3>
      
      <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-3">
        {post.excerpt}
      </p>

      {/* Meta Info */}
      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
            <User size={12} />
          </div>
          <span className="text-xs text-slate-500 font-medium">{post.author}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar size={12} />
          {post.date}
        </div>
      </div>

      <Link 
        href={`/blog/${post.id}`} 
        className="mt-6 inline-flex items-center justify-center w-full py-3 rounded-xl bg-white/5 text-white text-sm font-bold group-hover:bg-primary-600 transition-all"
      >
        Read Full Story <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </motion.div>
);

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = BLOG_POSTS.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      
      {/* 1. Header Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-sky-400">Insights.</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-10">
              Tips, guides, and stories from our global community to help you plan your next shared adventure.
            </p>

            {/* Search Bar (Mandatory Feature for Listing) */}
            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search articles or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Blog Grid Section */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No articles found matching your search.</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-4 text-primary-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* 3. Pagination (Mandatory Feature) */}
        <div className="mt-16 flex justify-center items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 transition disabled:opacity-50" disabled>Previous</button>
          <button className="w-10 h-10 rounded-lg bg-primary-600 text-white font-bold">1</button>
          <button className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 transition">2</button>
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 transition">Next</button>
        </div>
      </section>

      {/* 4. Newsletter Banner */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden">
           <div className="relative z-10">
              <Tag className="w-12 h-12 text-primary-500 mx-auto mb-6 opacity-50" />
              <h2 className="text-3xl font-bold text-white mb-4">Never miss a story.</h2>
              <p className="text-slate-400 mb-8">Join 15,000+ travelers who receive our weekly destination guides.</p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                />
                <button className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition shadow-lg shadow-primary-600/20">
                  Subscribe
                </button>
              </form>
           </div>
        </div>
      </section>

    </div>
  );
}
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Globe, Leaf, Droplets, ArrowRight } from 'lucide-react';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';

export default function GatewayPage() {
  const { isSignedIn } = useAuth();

  return (
    <main className="relative w-screen h-screen flex flex-col lg:flex-row overflow-hidden bg-slate-950 font-sans">
      
      {/* Dynamic CSS Gradient Animations */}
      <style jsx global>{`
        @keyframes meshTeal {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes meshGreen {
          0% { background-position: 100% 50%; }
          50% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .teal-gradient-mesh {
          background: radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.25) 0%, transparent 50%),
                      radial-gradient(circle at 90% 80%, rgba(13, 148, 136, 0.25) 0%, transparent 50%),
                      radial-gradient(circle at 50% 50%, rgba(8, 145, 178, 0.15) 0%, transparent 60%),
                      #0f172a;
          background-size: 200% 200%;
          animation: meshTeal 15s ease infinite;
        }
        .green-gradient-mesh {
          background: radial-gradient(circle at 90% 10%, rgba(16, 185, 129, 0.25) 0%, transparent 50%),
                      radial-gradient(circle at 10% 90%, rgba(4, 120, 87, 0.25) 0%, transparent 50%),
                      radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.15) 0%, transparent 60%),
                      #0f172a;
          background-size: 200% 200%;
          animation: meshGreen 15s ease infinite;
        }
      `}</style>

      {/* Top Global Header Overlay */}
      <header className="absolute top-0 left-0 right-0 z-30 h-20 px-6 sm:px-12 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-slate-950/40 to-transparent">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative bg-cyan-500/10 border border-cyan-500/30 p-1.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Droplets className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            JalRakshak
          </span>
        </div>

        {/* Auth Buttons */}
        <div>
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                Go to Dashboard
              </Link>
              <UserButton />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4.5 py-2.5 rounded-full border border-white/10 backdrop-blur-md cursor-pointer select-none">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* Left Card - Vertical 1 (Groundwater Map) */}
      <Link href="/map" className="relative flex-1 h-1/2 lg:h-full group flex flex-col justify-between p-8 sm:p-16 teal-gradient-mesh border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden transition-all duration-500 hover:brightness-[1.08] select-none">
        {/* Floating map visual vector illustration (bottom right) */}
        <div className="absolute bottom-6 right-6 w-48 h-48 opacity-25 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none hidden sm:block">
          <svg viewBox="0 0 150 150" className="w-full h-full">
            <path
              d="M 20 60 L 50 40 L 70 30 L 90 40 L 110 50 L 130 80 L 110 110 L 80 120 L 50 110 Z"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            {/* Animated map pulse points */}
            <circle cx="50" cy="50" r="4" fill="#06b6d4">
              <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="80" r="5" fill="#06b6d4">
              <animate attributeName="r" values="4;9;4" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="70" cy="100" r="3" fill="#06b6d4">
              <animate attributeName="r" values="2;5;2" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="h-full flex flex-col justify-between"
        >
          {/* Top category label */}
          <div className="flex items-center gap-3 mt-12">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-cyan-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 block">
                Regional Intelligence
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-none">
                Groundwater Map
              </h2>
            </div>
          </div>

          {/* Lower description + CTA */}
          <div className="space-y-4 max-w-md mt-auto">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Monitor and analyze groundwater depths, recharge indices, and aquifer health parameters across 700+ Indian districts with real-time AI mapping analytics.
            </p>
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-cyan-900 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/20 hover:scale-[1.04] transition-transform select-none">
              Explore the Map
              <ArrowRight className="w-4 h-4 text-cyan-800" />
            </span>
          </div>
        </motion.div>
      </Link>

      {/* Right Card - Vertical 2 (Sustainability Engine) */}
      <Link href="/onboarding" className="relative flex-1 h-1/2 lg:h-full group flex flex-col justify-between p-8 sm:p-16 green-gradient-mesh overflow-hidden transition-all duration-500 hover:brightness-[1.08] select-none">
        {/* Animated Circular Score Ring SVG (bottom right) */}
        <div className="absolute bottom-6 right-6 w-48 h-48 opacity-25 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none hidden sm:block">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
            <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="6" strokeDasharray="251.2" strokeDashoffset="55" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' }}>
              <animate attributeName="stroke-dashoffset" values="251.2;55;55" dur="3s" repeatCount="1" />
            </circle>
            <text x="50" y="55" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" transform="rotate(90 50 50)">78</text>
          </svg>
        </div>

        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
          className="h-full flex flex-col justify-between"
        >
          {/* Top category label */}
          <div className="flex items-center gap-3 mt-12">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 block">
                Personal Tracker
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-none">
                Sustainability Engine
              </h2>
            </div>
          </div>

          {/* Lower description + CTA */}
          <div className="space-y-4 max-w-md mt-auto">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Run a customized groundwater audit for your property, estimate water draw risk parameters, and simulate conservation impacts over decade-long timelines.
            </p>
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-emerald-900 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/20 hover:scale-[1.04] transition-transform select-none">
              Start My Assessment
              <ArrowRight className="w-4 h-4 text-emerald-800" />
            </span>
          </div>
        </motion.div>
      </Link>

    </main>
  );
}
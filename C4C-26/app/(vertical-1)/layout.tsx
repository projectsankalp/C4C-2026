"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Map, LineChart, Cpu, BrainCircuit } from 'lucide-react';

interface VerticalLayoutProps {
  children: React.ReactNode;
}

export default function VerticalLayout({ children }: VerticalLayoutProps) {
  const pathname = usePathname();

  const subLinks = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/map', label: 'Map Area', icon: Map },
    { href: '/analysis', label: 'Borewell Analysis', icon: BrainCircuit },
    { href: '/insights', label: 'AI Insights', icon: LineChart },
    { href: '/predict', label: 'Forecast Simulator', icon: Cpu },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 text-slate-800 flex flex-col justify-between overflow-x-hidden pt-16">
      
      {/* Secondary sub-navigation bar below the main Navbar */}
      <nav className="fixed top-16 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm h-12 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-center justify-between sm:justify-center sm:gap-10">
          {subLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative h-full flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider transition-colors select-none ${
                  isActive
                    ? 'text-cyan-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="vertical-subnav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-teal-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main vertical content area */}
      <main className="flex-1 w-full pt-16 pb-12 z-10">
        {children}
      </main>

      {/* Vertical Specific Footer */}
      <footer className="w-full py-6 border-t border-slate-200/40 bg-white/60 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500">
            JalRakshak AI Groundwater Mapping Platform — Secure Aquifers, Empower Futures.
          </p>
        </div>
      </footer>

    </div>
  );
}

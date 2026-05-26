"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/simulator', label: 'Simulator' },
    { href: '/recommendations', label: 'Recommendations' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ocean-950/70 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-aqua-500 rounded-full blur opacity-45 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-ocean-900 border border-white/20 p-1.5 rounded-full">
              <Droplet className="w-5 h-5 text-aqua-400 group-hover:text-aqua-300 transition-colors" />
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            JalRakshak
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className="relative py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-aqua-400 shadow-[0_0_8px_#22d3ee]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <Link href="/onboarding" className="ml-4 bg-gradient-to-r from-aqua-500 to-emerald-500 text-white rounded-full text-xs font-semibold px-4 py-2 hover:brightness-110 shadow-md shadow-aqua-500/10 hover:shadow-aqua-500/20 transition-all">
            Get Score
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-b border-white/10 bg-ocean-900 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-aqua-500/10 text-aqua-400 font-semibold border-l-4 border-aqua-500'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4">
                <Link
                  href="/onboarding"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-aqua-500 to-emerald-500 text-white rounded-full font-semibold py-2 hover:brightness-110 shadow-md transition-all"
                >
                  Get Score
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

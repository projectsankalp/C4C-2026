/**
 * @file HeroSection.jsx
 * @description Hero layout of the brand page with animated counters and CTA scroll bindings.
 */

import React, { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { HERO_TEXT } from "../utils/constants";
import { ArrowRight, ChevronRight, Activity, ArrowDown } from "lucide-react";

// Count-up helper component triggered on intersection
const CountUp = ({ target, suffix, prefix = "", duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const end = parseFloat(target);
          const totalFrames = 60 * duration;
          let frame = 0;

          const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            // Ease out quad formula
            const easeProgress = progress * (2 - progress);
            const currentCount = end * easeProgress;

            if (frame >= totalFrames) {
              setCount(end);
              clearInterval(counter);
            } else {
              setCount(parseFloat(currentCount.toFixed(1)));
            }
          }, 1000 / 60);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [target, duration]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {prefix}
      {count}
      {suffix}
    </span>
  );
};

export const HeroSection = ({ onNavigateToSection }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-[90vh] flex flex-col justify-center pt-24 pb-16">
      {/* Background Graphic Rings */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-teal-500/10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-teal-500/20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-teal-500/30 pointer-events-none" />

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex-grow flex flex-col justify-center items-center">
        {/* Banner Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-300 border border-teal-500/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-8 hover:bg-teal-500/20 transition-colors"
        >
          <Activity className="h-3.5 w-3.5 animate-pulse text-teal-400" />
          <span>Code4Change 2026 Winner</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6"
        >
          {HERO_TEXT.title}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-2xl text-slate-300 max-w-3xl font-light mb-10 leading-relaxed"
        >
          {HERO_TEXT.subtitle}
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto"
        >
          <button
            onClick={() => onNavigateToSection("#downloads")}
            className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 text-base"
          >
            <span>{HERO_TEXT.ctaDownload}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => onNavigateToSection("#problem")}
            className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-800 active:scale-95 text-slate-200 hover:text-white font-bold rounded-xl border border-slate-700/80 transition-all flex items-center justify-center gap-2 text-base"
          >
            <span>{HERO_TEXT.ctaLearnMore}</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </button>
        </motion.div>

        {/* Animated Counter Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-full border-t border-slate-800/80 pt-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {HERO_TEXT.stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center p-6 rounded-2xl bg-slate-800/30 border border-slate-800/50 backdrop-blur-sm"
              >
                <span className="text-4xl sm:text-5xl font-extrabold text-teal-400 mb-1">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">
                  {stat.label}
                </span>
                <span className="text-xs text-slate-400 text-center max-w-[200px]">
                  {stat.description}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;

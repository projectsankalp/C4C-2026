"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import Link from 'next/link';
import { GradientButton } from '@/components/ui/GradientButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { environmentalAlerts } from '@/lib/mockDataV1';
import { Map, BrainCircuit, BarChart3, AlertCircle, ArrowRight } from 'lucide-react';

// Reusable Counter helper component
const AnimatedCounter = ({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2.0,
        ease: 'easeOut',
        onUpdate: (latest) => setCount(Math.round(latest)),
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-extrabold text-3xl sm:text-4xl text-cyan-600">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default function HomeLandingPage() {

  // Stagger variants for word reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const }
    }
  };

  const topAlerts = environmentalAlerts.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-8 relative">
      
      {/* Inline styles for CSS Gradient Mesh and floating animations */}
      <style jsx global>{`
        @keyframes gradientMesh {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatOscillation {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .water-mesh-bg {
          background: radial-gradient(circle at 20% 30%, rgba(34, 211, 238, 0.1) 0%, transparent 40%),
                      radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 40%),
                      rgba(255, 255, 255, 0.8);
          background-size: 200% 200%;
          animation: gradientMesh 12s ease infinite;
        }
        .float-animation {
          animation: floatOscillation 6s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <div className="water-mesh-bg border border-white/60 rounded-3xl p-8 sm:p-12 md:p-16 shadow-xl flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
        <div className="flex-1 space-y-6 z-10 text-left">
          {/* Animated Header */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-800 leading-tight uppercase"
          >
            <motion.span variants={wordVariants} className="inline-block mr-2 sm:mr-3">India&apos;s</motion.span>
            <motion.span variants={wordVariants} className="inline-block mr-2 sm:mr-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-500">Groundwater</motion.span>
            <br className="hidden sm:inline" />
            <motion.span variants={wordVariants} className="inline-block mr-2 sm:mr-3">Crisis</motion.span>
            <motion.span variants={wordVariants} className="inline-block mr-2 sm:mr-3">Needs</motion.span>
            <motion.span variants={wordVariants} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Intelligence.</motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed"
          >
            JalRakshak&apos;s AI-powered mapping platform monitors 700+ districts in real-time, utilizing advanced hydro-spatial modeling and predictive algorithms to preserve and sustain sub-surface water reserves.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-2"
          >
            <GradientButton href="/map" className="w-full sm:w-auto flex items-center justify-center gap-2">
              Explore the Map
              <ArrowRight className="w-4 h-4" />
            </GradientButton>

            <GradientButton href="/analysis" variant="secondary" className="w-full sm:w-auto text-slate-700 bg-white/60 hover:bg-white/80 border-slate-200">
              Run Analysis
            </GradientButton>
          </motion.div>
        </div>

        {/* Hero Visual SVG Outline Map (Float Animation) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 max-w-md w-full float-animation z-10 hidden md:block select-none pointer-events-none"
        >
          <svg viewBox="0 0 400 450" className="w-full h-auto drop-shadow-2xl">
            <path
              d="M 120 90 L 160 70 L 170 50 L 180 40 L 190 50 L 210 60 L 220 70 L 240 60 L 260 80 L 230 100 L 260 120 L 280 130 L 300 120 L 310 140 L 340 150 L 360 140 L 380 150 L 390 170 L 360 190 L 370 200 L 350 210 L 310 200 L 290 220 L 260 210 L 240 230 L 230 250 L 200 270 L 190 300 L 165 330 L 155 370 L 145 400 L 135 410 L 135 390 L 125 365 L 110 355 L 90 345 L 85 330 L 90 315 L 80 300 L 80 280 L 60 255 L 40 240 L 20 225 L 30 215 L 45 200 L 50 175 L 70 155 L 75 130 L 95 115 L 105 90 Z"
              fill="url(#meshGrad)"
              stroke="#0891b2"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeDasharray="6 3"
              className="opacity-80"
            />
            {/* Visual Markers on Silhouette */}
            <circle cx="120" cy="180" r="7" fill="#ef4444" stroke="white" strokeWidth="1.5" />
            <circle cx="160" cy="240" r="5" fill="#eab308" stroke="white" strokeWidth="1" />
            <circle cx="210" cy="110" r="6" fill="#f97316" stroke="white" strokeWidth="1.2" />
            <circle cx="145" cy="350" r="6" fill="#22c55e" stroke="white" strokeWidth="1.2" />
            <circle cx="280" cy="190" r="5" fill="#06b6d4" stroke="white" strokeWidth="1" />

            <defs>
              <linearGradient id="meshGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.15} />
                <stop offset="50%" stopColor="#10b981" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.15} />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Statistics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Districts Monitored", value: 700, suffix: "+", sub: "District coordinates scaled" },
          { title: "Water Economy at Risk", value: 2.3, prefix: "₹", suffix: "T", sub: "Annual agricultural valuation" },
          { title: "Critical Stress Zones", value: 43, suffix: "%", sub: "High risk classification" },
          { title: "Depletion Target Year", value: 2047, sub: "Projected complete contraction" },
        ].map((item, idx) => (
          <GlassCard key={idx} className="bg-white/70 border-white/60 p-6 flex flex-col justify-between text-left shadow-lg">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {item.title}
            </span>
            <div className="my-2.5">
              <AnimatedCounter value={item.value} suffix={item.suffix} prefix={item.prefix} />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 leading-normal">
              {item.sub}
            </span>
          </GlassCard>
        ))}
      </div>

      {/* Feature Cards Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            System Modules
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            Aquifer Intelligence Suite
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Interactive Hydro-Spatial Map",
              desc: "Explore vector regional layers detailing groundwater depths, recharge capacities, stress rates, and AI recommendations.",
              href: "/map",
              icon: Map,
              color: "text-cyan-500 bg-cyan-50 border-cyan-100"
            },
            {
              title: "Location Drilling Analysis",
              desc: "Simulate single borewell targets and calculate extraction risks, lifespan timelines, and optimized conservation parameters.",
              href: "/analysis",
              icon: BrainCircuit,
              color: "text-emerald-500 bg-emerald-50 border-emerald-100"
            },
            {
              title: "Forecast & Scenario Simulator",
              desc: "Simulate groundwater futures based on population growths, rainwater harvesting methods, and irrigation efficiencies.",
              href: "/predict",
              icon: BarChart3,
              color: "text-teal-500 bg-teal-50 border-teal-100"
            }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <GlassCard key={idx} className="bg-white/70 border-white/60 p-6 flex flex-col justify-between text-left hover:border-cyan-300 transition-all duration-300 shadow-lg">
                <div>
                  <div className={`p-2.5 rounded-xl border w-fit mb-4 ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2 leading-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {feat.desc}
                  </p>
                </div>

                <Link href={feat.href} className="text-xs font-black text-cyan-600 flex items-center gap-1 hover:text-cyan-700 select-none group">
                  Explore Module
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Environmental Alerts Preview */}
      <div className="space-y-6 bg-white/60 backdrop-blur-2xl border border-white/50 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
              Critical Hydrological Alerts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Urgent regional anomalies reported across surveyed aquifers</p>
          </div>

          <Link href="/insights" className="text-xs font-black text-cyan-600 hover:text-cyan-700 flex items-center gap-1 select-none">
            View All Alerts
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {topAlerts.map(alert => (
            <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
              <div className="flex gap-3.5 items-start">
                <span className={`p-2 rounded-xl h-fit border shrink-0 text-rose-600 border-rose-100 bg-rose-50`}>
                  <AlertCircle className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {alert.timestamp}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight mb-0.5">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 self-end sm:self-auto shrink-0">
                <MapPinIcon className="w-3.5 h-3.5 text-slate-300" />
                {alert.region}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 border border-cyan-400/20 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
        {/* Floating background circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight max-w-xl mx-auto leading-tight">
          Start protecting your groundwater today.
        </h2>
        <p className="text-xs sm:text-sm text-cyan-50 max-w-md mx-auto leading-relaxed">
          Monitor your district aquifers, compute drilling limits, and construct high-impact water panchayat actions.
        </p>

        <div className="flex justify-center pt-2">
          <GradientButton href="/insights" variant="secondary" className="text-cyan-700 bg-white hover:bg-slate-50 border-none font-bold uppercase tracking-wider">
            Launch Full Dashboard
          </GradientButton>
        </div>
      </div>

    </div>
  );
}

// Compact custom icon helpers
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

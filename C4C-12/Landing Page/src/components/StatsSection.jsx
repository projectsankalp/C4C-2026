/**
 * @file StatsSection.jsx
 * @description Stats Section implementing count-up numbers triggered by IntersectionObserver when visible.
 */

import React, { useEffect, useState, useRef } from "react";
import { STATS_SECTION } from "../utils/constants";
import { Users, IndianRupee, Clock, Languages } from "lucide-react";

// Count-up helper component triggered on intersection
const StatCountUp = ({ target, suffix, prefix = "", duration = 1.5 }) => {
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

export const StatsSection = () => {
  const getStatIcon = (idx) => {
    switch (idx) {
      case 0: return <Users className="h-6 w-6 text-teal-600" />;
      case 1: return <IndianRupee className="h-6 w-6 text-teal-600" />;
      case 2: return <Clock className="h-6 w-6 text-teal-600" />;
      case 3: return <Languages className="h-6 w-6 text-teal-600" />;
      default: return null;
    }
  };

  return (
    <section id="stats" className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {STATS_SECTION.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-light leading-relaxed">
            {STATS_SECTION.subtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {STATS_SECTION.stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-800/40 border border-slate-800/60 backdrop-blur-sm shadow-xl"
            >
              {/* Stat Icon */}
              <div className="p-3.5 bg-teal-500/10 rounded-2xl border border-teal-500/20 mb-6">
                {getStatIcon(idx)}
              </div>

              {/* Stat Value */}
              <span className="text-4xl sm:text-5xl font-extrabold text-teal-400 mb-2">
                <StatCountUp
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                />
              </span>

              {/* Stat Label */}
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-3">
                {stat.label}
              </h3>

              {/* Stat Subtext */}
              <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                {stat.subtext}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default StatsSection;

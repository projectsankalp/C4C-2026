"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  size?: number;
  showLabel?: boolean;
  textColorClass?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 180,
  showLabel = true,
  textColorClass,
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000; // ms
    const startScore = displayScore;
    const endScore = score;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.round(progress * (endScore - startScore) + startScore);
      setDisplayScore(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  let color = '#ef4444'; // critical
  let glowColor = 'rgba(239, 68, 68, 0.4)';
  let riskText = 'Critical';
  
  if (score >= 65) {
    color = '#10b981'; // low
    glowColor = 'rgba(16, 185, 129, 0.4)';
    riskText = 'Low Risk';
  } else if (score >= 35) {
    color = '#f59e0b'; // medium
    glowColor = 'rgba(245, 158, 11, 0.4)';
    riskText = 'Medium Risk';
  }

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-white/10"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${glowColor})`
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl md:text-5xl font-black tracking-tight ${textColorClass || 'text-white'}`} style={{ textShadow: `0 0 10px ${glowColor}` }}>
            {displayScore}
          </span>
          <span className="text-xs uppercase font-semibold tracking-widest text-slate-400 mt-1">
            Score
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1.5" style={{ backgroundColor: `${color}20`, color }}>
            {riskText}
          </span>
        </div>
      )}
    </div>
  );
};

export default ScoreRing;

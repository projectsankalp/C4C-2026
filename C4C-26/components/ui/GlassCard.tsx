"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

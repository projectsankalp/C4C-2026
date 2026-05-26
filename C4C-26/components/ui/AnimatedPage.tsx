"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`min-h-screen pt-24 px-4 md:px-8 pb-12 bg-ocean-950 text-white ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;

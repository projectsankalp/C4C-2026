"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  href,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-full px-6 py-3 transition-all duration-200 outline-none select-none text-center cursor-pointer";
  const variants = {
    primary: "bg-gradient-to-r from-aqua-500 to-emerald-500 text-white shadow-lg shadow-aqua-500/20 hover:shadow-aqua-500/30 hover:brightness-110",
    secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/10 backdrop-blur-md"
  };

  const buttonStyle = `${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        <motion.a
          whileHover={disabled ? undefined : { scale: 1.05 }}
          whileTap={disabled ? undefined : { scale: 0.95 }}
          className={buttonStyle}
        >
          {children}
        </motion.a>
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={buttonStyle}
    >
      {children}
    </motion.button>
  );
};

export default GradientButton;

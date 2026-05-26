"use client";

import React from 'react';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50 select-none">
      <SignUp
        appearance={{
          elements: {
            card: 'bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl',
            headerTitle: 'text-slate-800 font-bold',
            headerSubtitle: 'text-slate-500',
            formButtonPrimary: 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 rounded-full',
            footerActionLink: 'text-cyan-600 hover:text-cyan-700',
          }
        }}
      />
    </div>
  );
}

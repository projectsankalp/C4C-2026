"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function Login() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "#0A0A0F" }}
    >
      {/* Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="pr-orb pr-orb-amber" style={{ width: 500, height: 500, top: -100, right: -100 }} />
        <div className="pr-orb pr-orb-blue" style={{ width: 400, height: 400, bottom: -80, left: -80 }} />
        <div className="pr-orb pr-orb-warm" style={{ width: 280, height: 280, top: "55%", left: "50%" }} />
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm flex flex-col items-center pr-card"
        style={{ padding: "40px 36px" }}
      >
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Post'r"
            width={100}
            height={40}
            style={{ filter: "invert(1)", objectFit: "contain" }}
          />
        </div>

        {/* Orange divider */}
        <div
          className="w-10 h-[2px] rounded-full mb-6"
          style={{ background: "linear-gradient(90deg, #FF6B35, #FFB347)" }}
        />

        <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: "#F0F0F5", letterSpacing: "-0.02em" }}>
          Welcome back
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "#9CA3AF", maxWidth: 260, lineHeight: 1.6 }}>
          Sign in to schedule and publish your LinkedIn content smarter.
        </p>

        {/* LinkedIn Button */}
        <button
          onClick={() => handleSignIn("linkedin")}
          disabled={isLoading !== null}
          className="w-full flex items-center justify-center gap-3 font-semibold py-3.5 rounded-2xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{
            background: "#0A66C2",
            color: "white",
            fontSize: 14,
            boxShadow: "0 4px 16px rgba(10,102,194,0.35)",
          }}
        >
          {isLoading === "linkedin" ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          )}
          Continue with LinkedIn
        </button>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 my-6">
          <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
          <span className="text-xs font-medium" style={{ color: "#4B5563" }}>Secure OAuth 2.0</span>
          <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
        </div>

        <p className="text-xs text-center leading-relaxed" style={{ color: "#4B5563" }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
          Your data is fully encrypted.
        </p>
      </div>
    </div>
  );
}

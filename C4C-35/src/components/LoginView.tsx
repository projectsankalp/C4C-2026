import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserSession } from "../types";
import { 
  Sparkles, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Mail, 
  ShoppingBag, 
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface LoginViewProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form states
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Demo credentials for users to try immediately
  const handleQuickLogin = (role: "default" | "laundry") => {
    if (role === "default") {
      onLoginSuccess({
        emailOrPhone: "pranjali@navyora.in",
        name: "Pranjali Sen",
        isGuest: false
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validation
    if (!emailOrPhone.trim()) {
      setError("Please provide an Email or Phone number to proceed.");
      return;
    }
    if (password.length < 5) {
      setError("Password must be at least 5 characters long for security.");
      return;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Please enter your full name so the coach can address you correctly.");
        return;
      }
      
      // Store credentials locally for persistence so registration actually works
      try {
        const storedUsersStr = localStorage.getItem("navyora_users") || "[]";
        const storedUsers = JSON.parse(storedUsersStr);
        
        const exists = storedUsers.some((u: any) => u.emailOrPhone === emailOrPhone);
        if (exists) {
          setError("An account with this email/phone is already registered on Navyora.");
          return;
        }

        const newUser = {
          emailOrPhone,
          password,
          name: fullName,
          shopName: shopName || `${fullName}'s Artisanal Crafts`
        };

        storedUsers.push(newUser);
        localStorage.setItem("navyora_users", JSON.stringify(storedUsers));
        
        setSuccessMsg("Account created successfully! Logging you in...");
        setTimeout(() => {
          onLoginSuccess({
            emailOrPhone: newUser.emailOrPhone,
            name: newUser.name,
            isGuest: false
          });
        }, 1500);

      } catch (err) {
        setError("Could not register account. Please try again.");
      }
    } else {
      // Login flow
      try {
        // Checking custom registered users first
        const storedUsersStr = localStorage.getItem("navyora_users") || "[]";
        const storedUsers = JSON.parse(storedUsersStr);
        
        const matched = storedUsers.find(
          (u: any) => u.emailOrPhone === emailOrPhone && u.password === password
        );

        if (matched) {
          onLoginSuccess({
            emailOrPhone: matched.emailOrPhone,
            name: matched.name,
            isGuest: false
          });
          return;
        }

        // Demo credentials check
        if (
          (emailOrPhone === "demo" || emailOrPhone === "owner@navyora.in" || emailOrPhone === "pranjali@navyora.in") && 
          password === "navyora"
        ) {
          onLoginSuccess({
            emailOrPhone: emailOrPhone,
            name: "Pranjali Sen",
            isGuest: false
          });
          return;
        }

        setError("Invalid email/phone or password combination. Try 'pranjali@navyora.in'/ 'navyora' or enter in Guest Mode.");
      } catch (err) {
        setError("Error validating credentials.");
      }
    }
  };

  const handleGuestEnter = () => {
    onLoginSuccess({
      emailOrPhone: "Guest",
      name: "Guest Creator",
      isGuest: true
    });
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#1A237E] font-sans flex flex-col md:flex-row shadow-sm">
      
      {/* LEFT COLUMN: HERO PANEL & MISSION WITH ACCENTS */}
      <div className="md:w-1/2 bg-[#1A237E] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract background graphics with soft rose/yellow glow */}
        <div className="absolute top-0 right-[-30%] w-96 h-96 bg-[#FF6B6B]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-[#FFD93D]/10 rounded-full blur-3xl"></div>

        {/* Branding header */}
        <div className="z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#FF6B6B] to-rose-400 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg transform rotate-3">
            N
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-[#FFD93D] flex items-center gap-1.5 leading-none">
              NAVYORA
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300 block mt-1">
              {t("app.login.hero.subtitle")}
            </span>
          </div>
        </div>

        {/* Motivational / Empowering message block */}
        <div className="z-10 my-12 md:my-auto space-y-6 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="inline-block bg-[#FF6B6B] px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xs">
              {t("app.login.hero.badge")}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {t("app.login.hero.title")}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {t("app.login.hero.desc")}
            </p>
          </motion.div>

          {/* Testimonial callout */}
          <div className="bg-white/5 border border-white/15 rounded-2xl p-5 space-y-3 backdrop-blur-xs">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-[#FFD93D] text-xs">★</span>
              ))}
            </div>
            <p className="text-xs italic text-slate-200 font-semibold leading-relaxed">
              "Navyora helped me calculate precise cost prices for my organic lavender soap bars. The copying instagram tags and first customer WhatsApp drafts generated ₹12,000 on my first weekend!"
            </p>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#FFD93D]">
              — Pranjali Sen, Mumbai
            </span>
          </div>
        </div>

        {/* Informative credentials footer */}
        <div className="z-10 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-rose-100 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>{t("app.login.footer.empower")}</span>
          </div>
          <span>{t("app.login.footer.active")}</span>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN OR REGISTRATION TABBED FORM CONTAINER */}
      <div className="md:w-1/2 bg-white flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Header instructions */}
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-[#1A237E] uppercase tracking-tight">
              {isSignUp ? t("app.login.title.signup") : t("app.login.title.signin")}
            </h3>
            <p className="text-slate-500 text-xs">
              {isSignUp 
                ? "Sign up your home enterprise and custom launch templates." 
                : "Enter credentials to load your active business journal drafts & statistics."
              }
            </p>
          </div>

          {/* Dual Toggle Option Tab for Register or Login */}
          <div className="grid grid-cols-2 p-1 bg-[#FDF8F5] border border-[#F1E4DF] rounded-2xl">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                !isSignUp 
                  ? "bg-white text-[#FF6B6B] shadow-2xs" 
                  : "text-slate-500 hover:text-[#1A237E]"
              }`}
            >
              {t("app.login.signin")}
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                isSignUp 
                  ? "bg-white text-[#FF6B6B] shadow-2xs" 
                  : "text-slate-500 hover:text-[#1A237E]"
              }`}
            >
              {t("app.login.register")}
            </button>
          </div>

          {/* Main Interactive Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-xl text-xs font-semibold leading-relaxed">
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-black leading-relaxed flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {isSignUp && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#1A237E]/75 mb-1">
                    {t("app.login.name")}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Pranjali Sen"
                      className="w-full bg-[#FDF8F5] border border-[#F1E4DF] focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#1A237E]/75 mb-1">
                    {t("app.login.shopname")}
                  </label>
                  <div className="relative">
                    <ShoppingBag className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Pranjali's Artisanal Soaps"
                      className="w-full bg-[#FDF8F5] border border-[#F1E4DF] focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#1A237E]/75 mb-1">
                {t("app.login.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. pranjali@navyora.in or 9876543210"
                  className="w-full bg-[#FDF8F5] border border-[#F1E4DF] focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#1A237E]/75 mb-1">
                {t("app.login.password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FDF8F5] border border-[#F1E4DF] focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1A237E] hover:bg-[#FF6B6B] text-white py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs group"
            >
              <span>{isSignUp ? t("app.login.submit.signup") : t("app.login.submit.signin")}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Assist Block */}
          {!isSignUp && (
            <div className="bg-[#FFF8F5] border border-[#F1E4DF] rounded-2xl p-4 space-y-2 text-left">
              <span className="text-[9px] font-black uppercase tracking-wider block text-[#FF6B6B]">
                💡 {t("app.login.demo")}
              </span>
              <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                {t("app.login.demo")}: Input <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[#1A237E]">pranjali@navyora.in</code> & password <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[#1A237E]">navyora</code> or tap the builder below.
              </p>
              <button
                type="button"
                onClick={() => handleQuickLogin("default")}
                className="text-xs text-[#FF6B6B] font-black uppercase tracking-wide underline hover:text-[#ff5252] block"
              >
                {t("app.login.demo.autofill")}
              </button>
            </div>
          )}

          {/* GUEST MODE OPTION SEPARATOR */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase">{t("app.login.guest.divider")}</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* GUEST MODE ACCESS ACTION BUTTON */}
          <div className="space-y-3 text-center">
            <button
              type="button"
              onClick={handleGuestEnter}
              className="w-full bg-white hover:bg-[#FDF8F5] border-2 border-[#1A237E] hover:border-[#FF6B6B] text-[#1A237E] hover:text-[#FF6B6B] py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-3xs"
            >
              <Compass className="w-4 h-4" />
              <span>{t("app.login.guest")}</span>
            </button>
            <p className="text-[10px] text-slate-400 leading-normal font-semibold max-w-xs mx-auto">
              Skip login details and load coach calculations. (Note: customized profile settings won't lock persistently after closing container)
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

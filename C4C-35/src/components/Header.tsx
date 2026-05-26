import React, { useState } from "react";
import { BookOpen, LogOut, User, ChevronDown, Globe } from "lucide-react";
import { UserSession } from "../types";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

interface HeaderProps {
  savedCount: number;
  onViewHistory: () => void;
  showHistory: boolean;
  session: UserSession | null;
  onLogout?: () => void;
}

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
};

export default function Header({ savedCount, onViewHistory, showHistory, session, onLogout }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <header className="border-b border-[#F1E4DF] bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navyora Logo & Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 bg-[#FF6B6B] rounded-xl flex items-center justify-center text-white shadow-md transform rotate-3 transition-transform hover:rotate-0 hover:scale-105 shrink-0">
            <span className="font-black text-xl">N</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1A237E] flex items-center gap-2">
              NAVYORA 
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B6B] bg-[#FFF0F0] px-2.5 py-0.5 rounded-full border border-[#FFF0F0]">
                {t("app.header.businessCoach")}
              </span>
            </h1>
              <p className="text-xs text-slate-500">
                {t("app.tagline")}
              </p>
          </div>
        </div>

        {/* Quick Actions, Session Info, & Navigation */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3.5 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3.5 md:pt-0">
          
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[#F1E4DF] bg-white hover:bg-[#FDF8F5] hover:text-[#1A237E] text-slate-700 transition-all cursor-pointer"
              title={t("app.language.select")}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{LANGUAGE_LABELS[language]}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showLangMenu ? "rotate-180" : ""}`} />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-[#F1E4DF] rounded-2xl shadow-lg p-1.5 z-50">
                {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      language === lang
                        ? "bg-[#FFF0F0] text-[#FF6B6B]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Clickable User Session Profile details */}
          {session && (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 bg-[#FDF8F5] hover:bg-[#FFF0F0] border border-[#F1E4DF] hover:border-[#FF6B6B] px-3.5 py-2 rounded-xl shrink-0 cursor-pointer text-left transition-all group"
                title={t("app.header.profileMenu")}
              >
                <div className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${
                  session.isGuest ? "bg-slate-400 group-hover:bg-slate-500" : "bg-[#FF6B6B]"
                }`}>
                  {session.isGuest ? "G" : session.name.charAt(0)}
                </div>
                <div className="text-left">
                  <span className="text-slate-400 group-hover:text-[#FF6B6B] block text-[9px] font-black uppercase tracking-wider leading-none transition-colors">
                    {session.isGuest ? "⚡ " + t("app.header.guest") : "👑 " + t("app.header.profile")}
                  </span>
                  <span className="text-xs font-black text-[#1A237E] block truncate max-w-[120px] leading-tight">
                    {session.name}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#F1E4DF] rounded-2xl shadow-lg p-2 z-50">
                  <div className="px-3 py-2 text-xs text-slate-500 border-b border-[#F1E4DF] mb-1">
                    {session.isGuest ? t("app.header.guestMode") : session.name}
                  </div>
                  {onLogout && (
                    <button
                      onClick={() => { setShowProfileMenu(false); onLogout(); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t("app.header.logout")}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={onViewHistory}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              showHistory
                ? "bg-[#FFF0F0] text-[#FF6B6B] border-[#FF6B6B]/40 shadow-xs"
                : "bg-white text-slate-700 border-[#F1E4DF] hover:bg-[#FDF8F5] hover:text-[#1A237E]"
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#FF6B6B]" />
            <span>{t("app.header.journal")} ({savedCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Language, TranslationKey, translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("navyora_language");
      if (saved === "hi" || saved === "kn") return saved;
    } catch {}
    return "en";
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem("navyora_language", lang);
    } catch {}
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] ?? translations.en[key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

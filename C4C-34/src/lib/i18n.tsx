import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import kn from "./locales/kn.json";

export type Lang = "en" | "kn" | "hi";

type LangContext = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
};

const LangCtx = createContext<LangContext | null>(null);

function initI18n() {
  const savedLang =
    typeof window !== "undefined" ? (localStorage.getItem("hastkala-lang") as Lang | null) : null;

  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      kn: { translation: kn },
    },
    lng: savedLang || "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

initI18n();

export function setLanguage(lang: string) {
  i18n.changeLanguage(lang);
  localStorage.setItem("hastkala-lang", lang);
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>((i18n.language as Lang) || "en");
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (lng: string) => setLangState(lng as Lang);
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLanguage(l);
  }, []);

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}

export default i18n;

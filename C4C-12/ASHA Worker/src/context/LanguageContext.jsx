/**
 * GraamSehat ASHA Worker App - Language Context Provider
 * Path: /src/context/LanguageContext.jsx
 * Manages active language state, saves settings to localStorage, and provides
 * a translation 't' helper function with placeholder replacement.
 */

import React, { createContext, useContext, useState } from "react";
import { en } from "../locales/en";
import { kn } from "../locales/kn";
import { hi } from "../locales/hi";
import { ta } from "../locales/ta";
import { te } from "../locales/te";

const LanguageContext = createContext(null);

const dictionaries = { en, kn, hi, ta, te };

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("graamsehat_language") || "en";
  });

  const setLanguage = (lang) => {
    if (dictionaries[lang]) {
      localStorage.setItem("graamsehat_language", lang);
      setLanguageState(lang);
    }
  };

  /**
   * Translate a key into the active language.
   * Replaces placeholders like "{count}" or "{name}" with variables values.
   * @param {string} key - Dictionary translation key
   * @param {object} params - Key-value pair replacements
   * @returns {string} Translated string
   */
  const t = (key, params = {}) => {
    const dict = dictionaries[language] || en;
    let translation = dict[key];

    // Fallback to English if key is missing in selected language
    if (translation === undefined) {
      translation = en[key] || key;
    }

    // Replace placeholders
    let result = String(translation);
    Object.entries(params).forEach(([paramKey, value]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), value);
    });

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

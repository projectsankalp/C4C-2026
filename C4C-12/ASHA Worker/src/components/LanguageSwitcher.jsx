/**
 * GraamSehat ASHA Worker App - Language Switcher Component
 * Path: /src/components/LanguageSwitcher.jsx
 * Select dropdown to swap UI language translation strings dynamically.
 */

import React from "react";
import { useLanguage } from "../context/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontSize: "16px" }}>🌐</span>
      <select
        value={language}
        onChange={handleLanguageChange}
        style={{
          background: "var(--color-surface)",
          color: "var(--color-text-primary)",
          border: "2px solid var(--color-border)",
          borderRadius: "8px",
          padding: "6px 8px",
          fontSize: "14px",
          fontWeight: "700",
          fontFamily: "var(--font-primary)",
          cursor: "pointer",
          outline: "none"
        }}
      >
        <option value="en">English</option>
        <option value="kn">ಕನ್ನಡ (KN)</option>
        <option value="hi">हिन्दी (HI)</option>
        <option value="ta">தமிழ் (TA)</option>
        <option value="te">తెలుగు (TE)</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;

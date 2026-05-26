/**
 * GraamSehat ASHA Worker App - Progress Bar Component
 * Path: /src/components/ProgressBar.jsx
 * Duolingo-style progress bar and step dots for wizard flows.
 */

import React from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * Custom progress tracker bar and dot steps.
 * @param {object} props - current (number), total (number)
 */
export function ProgressBar({ current, total }) {
  const { t } = useLanguage();
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Percentage Bar */}
      <div
        style={{
          height: "12px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: "6px",
          overflow: "hidden",
          position: "relative"
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: "linear-gradient(90deg, var(--color-primary-light), var(--color-secondary))",
            borderRadius: "6px",
            transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        />
      </div>

      {/* Step Info & Dots */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-gray)" }}>
          {t("screenStep", { current, total })}
        </span>
        
        {/* Step dots */}
        <div style={{ display: "flex", gap: "6px" }}>
          {Array.from({ length: total }).map((_, idx) => {
            const stepNum = idx + 1;
            let dotColor = "rgba(255, 255, 255, 0.15)";
            if (stepNum === current) {
              dotColor = "var(--color-primary-light)";
            } else if (stepNum < current) {
              dotColor = "var(--color-primary-dark)";
            }
            
            return (
              <div
                key={idx}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: dotColor,
                  transition: "var(--transition-smooth)"
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;

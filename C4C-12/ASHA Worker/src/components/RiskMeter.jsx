/**
 * GraamSehat ASHA Worker App - Risk Meter Component
 * Path: /src/components/RiskMeter.jsx
 * Visual animated gauge showing IDRS risk levels (Low, Moderate, High, Very High).
 */

import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * Animated linear gradient gauge for IDRS scores.
 * @param {object} props - score (number, 0-100)
 */
export function RiskMeter({ score }) {
  const { t } = useLanguage();
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate pin sliding to final score value
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  // Determine risk category label and color
  const getRiskDetails = (val) => {
    if (val < 30) return { label: t("riskLow"), color: "var(--color-green)", offset: val };
    if (val < 50) return { label: t("riskMod"), color: "var(--color-yellow)", offset: val };
    return { label: t("riskHigh"), color: "var(--color-red)", offset: val };
  };

  const risk = getRiskDetails(score);

  return (
    <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
      {/* Risk Level Title */}
      <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: risk.color, textAlign: "center" }}>
        {risk.label}
      </h3>

      {/* Numerical Score */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span style={{ fontSize: "42px", fontWeight: "800", color: "white" }}>
          {animatedScore}
        </span>
        <span style={{ fontSize: "16px", color: "var(--color-text-gray)", fontWeight: "500" }}>
          / 100
        </span>
      </div>

      {/* Meter Bar */}
      <div style={{ width: "100%", position: "relative", padding: "12px 0" }}>
        {/* Slider Track */}
        <div
          style={{
            height: "14px",
            width: "100%",
            borderRadius: "7px",
            background: "linear-gradient(90deg, var(--color-green) 0%, var(--color-yellow) 40%, var(--color-red) 70%, var(--color-red-dark) 100%)",
            position: "relative"
          }}
        />

        {/* Sliding Pointer Pin */}
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: `calc(${animatedScore}% - 10px)`,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "white",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            border: `3px solid ${risk.color}`,
            transition: "left 1s cubic-bezier(0.2, 0.8, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {/* Inner pulse */}
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: risk.color }} />
        </div>
      </div>

      {/* Boundaries Labels */}
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--color-text-gray)", fontWeight: "600" }}>
        <span>0 (Low)</span>
        <span>30 (Mod)</span>
        <span>50 (High)</span>
        <span>100</span>
      </div>
    </div>
  );
}

export default RiskMeter;

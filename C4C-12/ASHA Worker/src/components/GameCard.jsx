/**
 * GraamSehat ASHA Worker App - GameCard Component
 * Path: /src/components/GameCard.jsx
 * Duolingo-style tappable option card for wizard flows.
 */

import React from "react";

/**
 * Interactive choice card for screening and registration questions.
 * @param {object} props - icon (emoji/node), label (string), isSelected (bool), onClick (fn), index (number)
 */
export function GameCard({ icon, label, isSelected, onClick, index = 0 }) {
  return (
    <div
      onClick={onClick}
      className={`game-option-card ${isSelected ? "selected" : ""}`}
      style={{
        animationDelay: `${index * 0.08}s`,
        animationName: "fadeInUp",
        animationDuration: "0.4s",
        animationFillMode: "both"
      }}
    >
      {/* Icon Area */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: isSelected ? "var(--color-primary)" : "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          transition: "var(--transition-smooth)"
        }}
      >
        {icon}
      </div>

      {/* Label Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "16px", fontWeight: "600", color: isSelected ? "white" : "rgba(255,255,255,0.85)" }}>
          {label}
        </span>
      </div>

      {/* Selection Checkmark Indicator */}
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          border: `2px solid ${isSelected ? "var(--color-primary-light)" : "rgba(255,255,255,0.15)"}`,
          backgroundColor: isSelected ? "var(--color-primary-light)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "var(--transition-smooth)"
        }}
      >
        {isSelected && (
          <span style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>✓</span>
        )}
      </div>
    </div>
  );
}

export default GameCard;

/**
 * GraamSehat ASHA Worker App - Scan Option Component
 * Path: /src/components/ScanOption.jsx
 * Selectable cards displaying device input methods (NFC, QR, Manual).
 */

import React from "react";

/**
 * Option selector card for the card scanning portal.
 * @param {object} props - icon (element), title, description, onClick, disabled
 */
export function ScanOption({ icon, title, description, onClick, disabled = false }) {
  return (
    <div
      onClick={disabled ? null : onClick}
      className="glass-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid var(--color-border)",
        margin: "12px 0"
      }}
    >
      <div style={{ fontSize: "28px", display: "flex", alignItems: "center" }}>
        {icon}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{title}</h4>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-gray)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default ScanOption;

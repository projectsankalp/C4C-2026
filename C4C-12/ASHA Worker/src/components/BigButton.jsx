/**
 * GraamSehat ASHA Worker App - Big Button Component
 * Path: /src/components/BigButton.jsx
 * Interactive large home screen button with animations and color presets.
 */

import React from "react";
import { Link } from "react-router-dom";

/**
 * Large navigation button with custom icon, labels, and color presets.
 * @param {object} props - icon (element/string), label, description, color ('blue'|'teal'|'amber'), to (path)
 */
export function BigButton({ icon, label, description, color = "teal", to }) {
  const getButtonClass = () => {
    switch (color) {
      case "blue":
        return "big-btn-blue";
      case "amber":
        return "big-btn-amber";
      case "teal":
      default:
        return "big-btn-teal";
    }
  };

  return (
    <Link to={to} className={`big-btn ${getButtonClass()}`}>
      <div style={{ fontSize: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "0.5px" }}>
          {label}
        </span>
        <span style={{ fontSize: "14px", color: "var(--color-text-gray)" }}>
          {description}
        </span>
      </div>
    </Link>
  );
}

export default BigButton;

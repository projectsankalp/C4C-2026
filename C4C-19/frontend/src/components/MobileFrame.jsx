import React, { useState, useEffect } from "react";

export default function MobileFrame({ children, onBack, showBackButton }) {
  const [time, setTime] = useState("");

  // Update clock every minute
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="desktop-viewport-container">
      <div className="smartphone-frame">
        {/* Notch */}
        <div className="smartphone-notch"></div>

        {/* Status Bar */}
        <div className="smartphone-status-bar">
          <div className="status-bar-time">{time || "04:54 PM"}</div>
          <div className="status-bar-icons">
            {/* Signal Strength SVG */}
            <svg
              className="status-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 20h.01" />
              <path d="M7 20v-4" />
              <path d="M12 20v-8" />
              <path d="M17 20V8" />
              <path d="M22 20V4" />
            </svg>

            {/* Wifi Icon SVG */}
            <svg
              className="status-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h.01" />
              <path d="M8.5 16.5a5 5 0 0 1 7 0" />
              <path d="M5 13a10 10 0 0 1 14 0" />
              <path d="M1.5 9.5a15 15 0 0 1 21 0" />
            </svg>

            {/* Battery Indicator */}
            <span style={{ fontSize: "11px", fontWeight: "800", marginRight: "2px" }}>92%</span>
            <svg
              className="status-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
              <line x1="22" y1="11" x2="22" y2="13" />
              <rect x="4" y="9" width="10" height="6" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </div>

        {/* Action Header Button Overlay if in detailed screen */}
        {showBackButton && (
          <div style={{ position: "absolute", top: "48px", left: "20px", zIndex: 100 }}>
            <button className="back-button" onClick={onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
          </div>
        )}

        {/* Screen Content Wrapper */}
        <div className="app-screen-content">
          {children}
        </div>
      </div>
    </div>
  );
}

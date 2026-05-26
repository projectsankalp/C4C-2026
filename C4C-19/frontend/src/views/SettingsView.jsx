import React, { useState } from "react";

export default function SettingsView({ user, setActiveTab }) {
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [tipsEnabled, setTipsEnabled] = useState(true);

  return (
    <>
      {/* Settings Header Banner (Matches Image 3 Header Layout) */}
      <div className="action-banner" style={{ paddingBottom: "24px" }}>
        <button className="back-button" onClick={() => setActiveTab("home")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
          <span style={{ fontSize: "24px" }}>⚙️</span>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "800", margin: 0 }}>Settings</h1>
            <p style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "12px", marginTop: "4px" }}>
              Customize your Arogya app
            </p>
          </div>
        </div>
      </div>

      <div className="card-section" style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        
        {/* BLOCK 1: LANGUAGE */}
        <h3 style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "10px", textAlign: "left" }}>
          LANGUAGE
        </h3>
        
        <div className="premium-card" style={{ padding: 0, overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifySpace: "between", justifyContent: "space-between", padding: "16px", cursor: "pointer", backgroundColor: "white" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#eff6ff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px" }}>
                🌐
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Language</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>{user?.language || "English"} (Current)</p>
              </div>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>›</span>
          </div>
        </div>

        {/* BLOCK 2: STATUS */}
        <h3 style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "10px", textAlign: "left" }}>
          STATUS
        </h3>

        <div className="premium-card" style={{ padding: 0, overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "18px", marginBottom: "20px" }}>
          
          {/* Internet Status */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #f1f5f9", backgroundColor: "white" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#ecfdf5", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}>
                📶
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Internet Status</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Connected — 4G</p>
              </div>
            </div>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }}></div>
          </div>

          {/* Sync Status */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", backgroundColor: "white" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f0fdf4", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}>
                🔄
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Sync Status</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Last synced: just now</p>
              </div>
            </div>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }}></div>
          </div>

        </div>

        {/* BLOCK 3: NOTIFICATIONS */}
        <h3 style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "10px", textAlign: "left" }}>
          NOTIFICATIONS
        </h3>

        <div className="premium-card" style={{ padding: 0, overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "18px", marginBottom: "20px" }}>
          
          {/* Health Reminders */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #f1f5f9", backgroundColor: "white" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fef3c7", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}>
                🔔
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Health Reminders</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Daily medicine alerts</p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <div 
              onClick={() => setRemindersEnabled(!remindersEnabled)}
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                backgroundColor: remindersEnabled ? "#1a3bf5" : "#cbd5e1",
                padding: "2px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "background-color 0.2s ease"
              }}
            >
              <div 
                style={{ 
                  width: "20px", 
                  height: "20px", 
                  borderRadius: "50%", 
                  backgroundColor: "white", 
                  transform: remindersEnabled ? "translateX(20px)" : "translateX(0)", 
                  transition: "transform 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                }}
              ></div>
            </div>
          </div>

          {/* Health Tips */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", backgroundColor: "white" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#ffe4e6", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}>
                📢
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Health Tips</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Morning tip notifications</p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <div 
              onClick={() => setTipsEnabled(!tipsEnabled)}
              style={{
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                backgroundColor: tipsEnabled ? "#1a3bf5" : "#cbd5e1",
                padding: "2px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "background-color 0.2s ease"
              }}
            >
              <div 
                style={{ 
                  width: "20px", 
                  height: "20px", 
                  borderRadius: "50%", 
                  backgroundColor: "white", 
                  transform: tipsEnabled ? "translateX(20px)" : "translateX(0)", 
                  transition: "transform 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                }}
              ></div>
            </div>
          </div>

        </div>

        {/* BLOCK 4: AI & VOICE */}
        <h3 style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "10px", textAlign: "left" }}>
          AI & VOICE
        </h3>

        <div className="premium-card" style={{ padding: 0, overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "18px", marginBottom: "40px" }}>
          
          {/* Test AI Call */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #f1f5f9", backgroundColor: "white", cursor: "pointer" }} onClick={() => setActiveTab("home")}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f3e8ff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}>
                🎙️
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Test AI Call</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Try talking to Health AI</p>
              </div>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>›</span>
          </div>

          {/* Voice Language */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", backgroundColor: "white" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fef9c3", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}>
                🔊
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Voice Language</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>{user?.language || "English"}</p>
              </div>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>›</span>
          </div>

        </div>

      </div>
    </>
  );
}

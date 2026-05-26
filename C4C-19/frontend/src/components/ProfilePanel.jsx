import React from "react";

export default function ProfilePanel({ user, healthSummary, onClose, onOpenSettings, onOpenVoiceTest, onLogout }) {
  
  // Format dynamic Arogya ID
  const getArogyaId = () => {
    if (!user || user.isGuest) return "AR-2025-4892";
    // Generate simple stable hash from user id
    const hash = user._id ? user._id.slice(-4) : "4892";
    return `AR-2026-${hash}`;
  };

  return (
    <div className="auth-glass-overlay" onClick={onClose} style={{ zIndex: 15000 }}>
      
      {/* Sliding card bottom sheet */}
      <div 
        className="auth-sliding-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          borderTopLeftRadius: "30px", 
          borderTopRightRadius: "30px", 
          padding: "24px", 
          background: "white", 
          maxHeight: "85%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        
        {/* Grey Drag Indicator Bar */}
        <div style={{ width: "40px", height: "5px", backgroundColor: "#e2e8f0", borderRadius: "10px", marginBottom: "24px" }}></div>

        {/* Profile Card Header Row (Matches Image 2) */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center", width: "100%", maxWidth: "420px", marginBottom: "24px" }}>
          
          {/* Avatar Circle */}
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#2563eb", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "28px", color: "white", flexShrink: 0 }}>
            👤
          </div>

          <div style={{ textAlign: "left" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
              {user?.name || "Guest"}
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: "500" }}>
              Age {user?.age || 45} - {user?.gender || "Male"} - Bantwal, Karnataka
            </p>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#1a3bf5", marginTop: "4px" }}>
              Arogya ID: {getArogyaId()}
            </p>
          </div>
        </div>

        {/* Health Risk Horizontal Status Card (Matches Image 2) */}
        <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "28px", textAlign: "center" }}>
          
          {/* Diabetes status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "9px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Diabetes</span>
            <strong style={{ fontSize: "12px", color: healthSummary.diabetesRisk === "Medium" ? "#d97706" : "#10b981", fontWeight: "700" }}>
              {healthSummary.diabetesRisk === "Medium" ? "Medium Risk" : "Low Risk"}
            </strong>
          </div>

          {/* BP status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "9px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Blood Pressure</span>
            <strong style={{ fontSize: "12px", color: healthSummary.hypertensionRisk === "Medium" ? "#d97706" : "#10b981", fontWeight: "700" }}>
              {healthSummary.hypertensionRisk === "Medium" ? "Medium Risk" : "Low Risk"}
            </strong>
          </div>

          {/* Heart status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "9px", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Heart Rate</span>
            <strong style={{ fontSize: "12px", color: "#10b981", fontWeight: "700" }}>
              {healthSummary.heartRate || "72 bpm"}
            </strong>
          </div>

        </div>

        {/* Settings options list box (Matches Image 2) */}
        <h3 style={{ width: "100%", maxWidth: "420px", fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "12px", textAlign: "left" }}>
          ⚙️ Settings
        </h3>

        <div className="premium-card" style={{ width: "100%", maxWidth: "420px", padding: 0, overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "20px", display: "flex", flexDirection: "column" }}>
          
          {/* Row 1: Language */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #f1f5f9", backgroundColor: "white", cursor: "pointer" }} onClick={onClose}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#eff6ff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "18px" }}>
                🌐
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Language</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>{user?.language || "English"}</p>
              </div>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>›</span>
          </div>

          {/* Row 2: All Settings */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #f1f5f9", backgroundColor: "white", cursor: "pointer" }} onClick={onOpenSettings}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f8fafc", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}>
                🛠️
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>All Settings</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Notifications, sync & more</p>
              </div>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>›</span>
          </div>

          {/* Row 3: Test AI Voice */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #f1f5f9", backgroundColor: "white", cursor: "pointer" }} onClick={onOpenVoiceTest}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#f3e8ff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px" }}>
                🎙️
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Test AI Voice</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Talk to Health AI</p>
              </div>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>›</span>
          </div>

          {/* Row 4: Logout */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", backgroundColor: "white", cursor: "pointer" }} onClick={onLogout}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#ffe4e6", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px", color: "#ef4444" }}>
                🚪
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#ef4444", margin: 0 }}>Logout</h4>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>Sign out of session</p>
              </div>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>›</span>
          </div>

        </div>

        {/* Close Button link */}
        <button 
          onClick={onClose} 
          style={{ width: "100%", maxWidth: "420px", marginTop: "20px", background: "none", border: "none", color: "var(--text-muted)", fontSize: "14px", textDecoration: "underline", cursor: "pointer", fontWeight: "700" }}
        >
          Close Profile Panel
        </button>

      </div>
    </div>
  );
}

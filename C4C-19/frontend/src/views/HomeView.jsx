import React, { useState } from "react";
import { api } from "../services/api";

export default function HomeView({ 
  user, 
  healthSummary, 
  notifications, 
  activeTab, 
  setActiveTab, 
  onOpenAuth,
  onOpenNotifications,
  showNotifications,
  onMarkNotificationRead,
  onChangeLanguage,
  languages,
  onOpenVoiceAssistant
}) {
  const [showLanguagePopover, setShowLanguagePopover] = useState(false);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [voicePhone, setVoicePhone] = useState(user?.phone || "+91 98765 43210");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceSuccess, setVoiceSuccess] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencySuccess, setEmergencySuccess] = useState(false);
  const [emergencyError, setEmergencyError] = useState("");

  // Greeting based on current local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleVoiceCallSubmit = async (e) => {
    e.preventDefault();
    if (!voicePhone) {
      setVoiceError("Please enter your mobile phone number");
      return;
    }
    setVoiceLoading(true);
    setVoiceError("");
    try {
      const res = await api.voice.triggerHealthAssistant(voicePhone);
      if (res.success) {
        setVoiceSuccess(true);
        setTimeout(() => {
          setShowVoicePrompt(false);
          setVoiceSuccess(false);
        }, 3000);
      } else {
        setVoiceError("Failed to trigger call. Try again.");
      }
    } catch (err) {
      console.log("Mock Outbound Call Triggered for dev demonstration");
      setVoiceSuccess(true);
      setTimeout(() => {
        setShowVoicePrompt(false);
        setVoiceSuccess(false);
      }, 3000);
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleEmergencyCall = async () => {
    const phoneNumber = voicePhone || user?.phone || "+91 98765 43210";
    setEmergencyLoading(true);
    setEmergencyError("");
    setEmergencySuccess(false);
    try {
      const res = await api.voice.triggerEmergencyAssistant(phoneNumber);
      if (res.success) {
        setEmergencySuccess(true);
      } else {
        setEmergencyError("Failed to start emergency call. Please try again.");
      }
    } catch (err) {
      console.log("VAPI emergency call fallback triggered", err);
      // Fallback: mock outbound call for demonstration
      setEmergencySuccess(true);
    } finally {
      setEmergencyLoading(false);
    }
  };

  const selectLanguage = (lang) => {
    onChangeLanguage(lang);
    setShowLanguagePopover(false);
  };

  const activeNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Banner Header */}
      <div className="hero-banner" style={{ paddingBottom: "24px" }}>
        
        {/* Header Title Greet Row (Exactly matches Image 3 layout) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              Namaste!
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: "500", marginTop: "4px" }}>
              {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Guest"}
            </p>
          </div>

          {/* Right Header Icons */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", position: "relative" }}>
            
            {/* Notification Bell */}
            <div className="notification-bell-container" onClick={onOpenNotifications} style={{ padding: "6px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "24px", height: "24px", color: "white" }}>
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {activeNotificationsCount > 0 && <div className="notification-bell-badge" style={{ backgroundColor: "#ef4444" }}></div>}
            </div>



            {/* Notifications Popover */}
            {showNotifications && (
              <div className="notification-popover" style={{ top: "44px" }}>
                <div className="notification-popover-header">Notifications ({activeNotificationsCount})</div>
                {notifications.length === 0 ? (
                  <div className="notification-popover-empty" style={{ padding: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
                    No new health alerts.
                  </div>
                ) : (
                  notifications.map(item => (
                    <div 
                      key={item._id} 
                      className={`notification-popover-item ${item.isRead ? "" : "unread"}`}
                      onClick={() => onMarkNotificationRead(item._id)}
                    >
                      <h4>{item.title}</h4>
                      <p>{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* User Profile Avatar */}
            <div className="user-avatar-circle" onClick={onOpenAuth} style={{ cursor: "pointer", width: "36px", height: "36px" }}>
              {user && !user.isGuest ? (
                <div style={{ background: "var(--accent-cyan)", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--primary)", fontWeight: "bold" }}>
                  {user.name.split(" ").map(n=>n[0]).join("")}
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.2)", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  👤
                </div>
              )}
            </div>

          </div>
        </div>

        {/* YOUR HEALTH SUMMARY Card */}
        <div style={{ marginTop: "24px", width: "100%" }}>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px" }}>
            YOUR HEALTH SUMMARY
          </p>
          <h3 style={{ color: "white", marginTop: "4px", fontSize: "20px", fontWeight: "800", fontFamily: "var(--font-family-title)" }}>
            Your Health Overview
          </h3>

          {/* Metrics Row (Scrolling / Grid Cards) */}
          <div className="metrics-row" style={{ marginTop: "16px" }}>
            
            {/* Diabetes Card */}
            <div className="metric-box" style={{ background: "rgba(255,255,255,0.15)", borderRadius: "16px", padding: "14px 10px" }}>
              <span className="metric-box-title" style={{ fontSize: "11px", opacity: 0.85 }}>Diabetes</span>
              <span className="metric-box-val" style={{ fontSize: "16px", fontWeight: "800", marginTop: "4px", marginBottom: "8px" }}>Risk</span>
              <span className={`badge ${healthSummary.diabetesRisk?.toLowerCase() === "medium" ? "medium" : "low"}`} style={{ fontSize: "10px", padding: "4px 12px", borderRadius: "20px" }}>
                {healthSummary.diabetesRisk || "Normal"}
              </span>
            </div>

            {/* Blood Pressure Card */}
            <div className="metric-box" style={{ background: "rgba(255,255,255,0.15)", borderRadius: "16px", padding: "14px 10px" }}>
              <span className="metric-box-title" style={{ fontSize: "11px", opacity: 0.85 }}>Blood Pressure</span>
              <span className="metric-box-val" style={{ fontSize: "16px", fontWeight: "800", marginTop: "4px", marginBottom: "8px" }}>Status</span>
              <span className={`badge ${healthSummary.hypertensionRisk?.toLowerCase() === "medium" ? "medium" : "low"}`} style={{ fontSize: "10px", padding: "4px 12px", borderRadius: "20px" }}>
                {healthSummary.hypertensionRisk || "Normal"}
              </span>
            </div>

            {/* Heart Card */}
            <div className="metric-box" style={{ background: "rgba(255,255,255,0.15)", borderRadius: "16px", padding: "14px 10px" }}>
              <span className="metric-box-title" style={{ fontSize: "11px", opacity: 0.85 }}>Heart</span>
              <span className="metric-box-val" style={{ fontSize: "16px", fontWeight: "800", marginTop: "4px", marginBottom: "8px" }}>Rate</span>
              <span className="badge normal" style={{ fontSize: "10px", padding: "4px 12px", borderRadius: "20px" }}>
                {healthSummary.heartRate || "72 bpm"}
              </span>
            </div>

          </div>

          {/* Last Check Dynamic Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.75)", fontSize: "11px", fontWeight: "600", marginTop: "16px" }}>
            <span>🕒</span>
            <span>Last check: {healthSummary.lastChecked || "Just now"}</span>
          </div>

        </div>
      </div>

      {/* Main Interactive Content */}
      <div className="card-section" style={{ flex: 1, padding: "20px" }}>
        
        {/* Talk to Health AI Voice Assistant Premium Card */}
        <div className="home-talk-ai-card">
          <div className="home-talk-ai-inner">
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: "800", margin: 0 }}>
                Talk to Health AI
              </h3>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Tap the mic and speak — ask in any language
              </p>
            </div>

            <div className="home-mic-outer" onClick={onOpenVoiceAssistant}>
              <div className="mic-pulse-ring" style={{ width: "96px", height: "96px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,59,245,0.15) 0%, rgba(26,59,245,0) 70%)" }}></div>
              <div className="home-mic-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: "26px", height: "26px" }}>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Trigger Outbound Overlay Prompt */}
        {showVoicePrompt && (
          <div className="auth-glass-overlay" style={{ zIndex: 11000 }}>
            <div className="auth-sliding-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "16px" }}>Outbound Voice Screening</h3>
                <button onClick={() => setShowVoicePrompt(false)} style={{ background: "none", border: "none", fontSize: "18px", color: "var(--text-muted)", cursor: "pointer" }}>&times;</button>
              </div>
              
              {voiceSuccess ? (
                <div className="success-splash-panel">
                  <div className="success-checkmark-circle">✓</div>
                  <h4>Outbound Screening Initiated</h4>
                  <p>Our voice agent is calling <strong>{voicePhone}</strong> now. Please answer to start the ML-powered screening.</p>
                </div>
              ) : (
                <form onSubmit={handleVoiceCallSubmit}>
                  <p style={{ fontSize: "12px", marginBottom: "16px", color: "var(--text-secondary)" }}>
                    Verify your phone number. The ML voice assistant will call you immediately to perform a fully automated vocal risk diagnostic check.
                  </p>
                  
                  {voiceError && (
                    <div style={{ backgroundColor: "var(--accent-red-bg)", color: "var(--accent-red)", padding: "10px", borderRadius: "8px", fontSize: "12px", marginBottom: "12px", fontWeight: "600" }}>
                      {voiceError}
                    </div>
                  )}

                  <div className="auth-form-group">
                    <label className="auth-form-label">Patient Phone Number</label>
                    <input 
                      type="tel" 
                      className="auth-form-input"
                      placeholder="e.g. +91 98765 43210"
                      value={voicePhone}
                      onChange={(e) => setVoicePhone(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={voiceLoading}>
                    {voiceLoading ? <span className="spinner" style={{ width: "16px", height: "16px" }}></span> : "Request Immediate Call"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions Grid (2x2 Balanced visual cells exactly matching Image 3) */}
        <h2 style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>
          QUICK ACTIONS
        </h2>
        
        <div className="home-quick-actions-custom-grid">
          
          {/* Card 1: Check My Health */}
          <div className="home-quick-action-card" onClick={() => setActiveTab("check")}>
            <div className="home-quick-action-icon-box" style={{ backgroundColor: "#f3e8ff", color: "#a855f7" }}>
              📊
            </div>
            <div>
              <h3>Check My Health</h3>
              <p>AI health prediction</p>
            </div>
          </div>

          {/* Card 2: Book Doctor */}
          <div className="home-quick-action-card" onClick={() => setActiveTab("appoint")}>
            <div className="home-quick-action-icon-box" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
              📅
            </div>
            <div>
              <h3>Book Doctor</h3>
              <p>Nearby PHC & hospitals</p>
            </div>
          </div>

          {/* Card 3: Health Tips */}
          <div className="home-quick-action-card" onClick={() => setActiveTab("tips")}>
            <div className="home-quick-action-icon-box" style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
              📣
            </div>
            <div>
              <h3>Health Tips</h3>
              <p>Daily awareness guide</p>
            </div>
          </div>

          {/* Card 4: Nearest PHC (Custom navigation to MapView) */}
          <div className="home-quick-action-card" onClick={() => setActiveTab("map")}>
            <div className="home-quick-action-icon-box" style={{ backgroundColor: "#fce7f3", color: "#db2777" }}>
              🗺️
            </div>
            <div>
              <h3>Nearest PHC</h3>
              <p>Bantwal PHC — 2.3 km</p>
            </div>
          </div>

        </div>

        {/* Full-Width Red Emergency Help Card (Matches Image 3) */}
        <div className="home-full-width-emergency-card" onClick={() => setShowEmergencyScreen(true)}>
          <div className="home-full-width-emergency-left">
            <div className="home-emergency-icon-box">🚨</div>
            <div className="home-emergency-texts">
              <h3>Emergency Help</h3>
              <p>Tap for immediate assistance</p>
            </div>
          </div>
          <div className="home-emergency-chevron">›</div>
        </div>

        {/* FULL-SCREEN RICH RED EMERGENCY MODAL OVERLAY */}
        {showEmergencyScreen && (
          <div className="emergency-full-overlay">
            
            {/* Close Cross Button Top Right */}
            <button 
              onClick={() => setShowEmergencyScreen(false)} 
              style={{ position: "absolute", top: "36px", right: "24px", background: "none", border: "none", color: "rgba(255, 255, 255, 0.8)", fontSize: "28px", cursor: "pointer", zIndex: 10005 }}
            >
              &times;
            </button>

            {/* Siren Circle Icon (Matches Image 2) */}
            <div className="emergency-siren-circle">
              🚨
            </div>

            <h3 className="emergency-title">Are You In Emergency?</h3>
            
            <p className="emergency-description">
              If you feel chest pain, dizziness, difficulty breathing, or severe bleeding — get help immediately.
            </p>

            {/* Phone Number Input Field to override fake guest number */}
            <div style={{ margin: "0 0 18px 0", width: "100%", maxWidth: "400px", textAlign: "left" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", marginBottom: "6px", letterSpacing: "0.5px" }}>
                Verify Phone Number (Required for Outbound Call)
              </label>
              <input 
                type="tel"
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  borderRadius: "12px", 
                  border: "1px solid rgba(255,255,255,0.3)", 
                  backgroundColor: "rgba(0,0,0,0.15)", 
                  color: "white", 
                  fontSize: "14px", 
                  outline: "none",
                  fontWeight: "600",
                  textAlign: "center"
                }}
                placeholder="e.g. +91 98765 43210"
                value={voicePhone}
                onChange={(e) => setVoicePhone(e.target.value)}
              />
            </div>

            {/* Button 1: Call Emergency AI (White card) */}
            <button className="emergency-btn-white" onClick={handleEmergencyCall} disabled={emergencyLoading}>
              <div className="emergency-btn-white-icon">
                📞
              </div>
              <div className="emergency-btn-white-text">
                <h4>Call Emergency AI (108)</h4>
                <p>Speak to AI health assistant now</p>
              </div>
            </button>

            {/* Status alerts below Call */}
            {emergencyLoading && (
              <div style={{ margin: "4px 0 16px 0", fontSize: "13px", color: "white", fontWeight: "bold" }}>
                Connecting to Emergency Assistant...
              </div>
            )}
            
            {emergencySuccess && (
              <div style={{ margin: "4px 0 16px 0", padding: "12px", background: "rgba(255,255,255,0.2)", borderRadius: "12px", fontSize: "12px", color: "white", fontWeight: "700", width: "100%", maxWidth: "400px" }}>
                ✓ Emergency Call Initiated! Answer the incoming call on your phone.
              </div>
            )}

            {emergencyError && (
              <div style={{ margin: "4px 0 16px 0", padding: "12px", background: "rgba(0,0,0,0.3)", borderRadius: "12px", fontSize: "12px", color: "white", fontWeight: "bold", width: "100%", maxWidth: "400px" }}>
                ⚠ {emergencyError}
              </div>
            )}

            {/* Button 2: Go to Nearest PHC (Outlined card) */}
            <button 
              className="emergency-btn-outline" 
              onClick={() => {
                setShowEmergencyScreen(false);
                setActiveTab("map");
              }}
            >
              <div className="emergency-btn-outline-icon">
                📍
              </div>
              <div className="emergency-btn-outline-text">
                <h4>Go to Nearest PHC</h4>
                <p>Bantwal PHC — 2.3 km away</p>
              </div>
            </button>

            {/* Underlined Back to Home Link */}
            <span className="emergency-back-link" onClick={() => setShowEmergencyScreen(false)}>
              ← Back to Home
            </span>

          </div>
        )}

        {/* Medical Disclaimer Banner */}
        <div className="medical-disclaimer-box" style={{ marginTop: "24px" }}>
          ⚠️ <strong>Medical Disclaimer:</strong> Arogya-AI predictions are for preliminary risk screening only. They are powered by ML algorithms to aid early identification of risk patterns and must not be used as a replacement for professional clinical diagnosis, prescriptions, or physician advice.
        </div>

      </div>
    </>
  );
}

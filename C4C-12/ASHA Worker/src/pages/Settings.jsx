/**
 * GraamSehat ASHA Worker App - Settings Page
 * Path: /src/pages/Settings.jsx
 * Control configuration panel managing app locales, mock offline networks,
 * database cleanups, and session logouts.
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useSyncContext } from "../context/SyncContext";
import { db } from "../db/localDB";
import LanguageSwitcher from "../components/LanguageSwitcher";

export function Settings() {
  const { t } = useLanguage();
  const { ashaProfile, logout } = useAuth();
  const { mockOffline, setMockOffline, pendingCount } = useSyncContext();

  const [dbStatusMsg, setDbStatusMsg] = useState("");

  const handleResetDatabase = async () => {
    if (window.confirm("WARNING: This will delete all local patients, screenings, and medicine logs. Are you sure?")) {
      try {
        await Promise.all([
          db.patients.clear(),
          db.screenings.clear(),
          db.medicines.clear(),
          db.syncQueue.clear()
        ]);
        
        // Also reset counters
        localStorage.removeItem("graamsehat_serial_counter");
        
        setDbStatusMsg(t("dbResetSuccess"));
        setTimeout(() => setDbStatusMsg(""), 3000);
      } catch (err) {
        console.error("Database reset failed", err);
        setDbStatusMsg("Failed to reset database.");
      }
    }
  };

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ textAlign: "center", margin: "16px 0 8px 0" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800" }}>
          {t("settings")}
        </h2>
      </div>

      {dbStatusMsg && (
        <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--color-green)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "12px", borderRadius: "8px", fontSize: "14px", textAlign: "center", fontWeight: "600" }}>
          ✓ {dbStatusMsg}
        </div>
      )}

      {/* ASHA Profile Card Details */}
      <div className="glass-card text-center" style={{ margin: 0, padding: "20px" }}>
        <span style={{ fontSize: "40px" }}>👩‍⚕️</span>
        <h3 style={{ margin: "10px 0 4px 0", fontSize: "18px", color: "var(--color-primary)" }}>
          {ashaProfile?.name || "ASHA Worker"}
        </h3>
        <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "var(--color-text-secondary)" }}>
          {ashaProfile?.subcentre || "GraamSehat Sub-Centre"}
        </p>
        <span
          className="badge badge-green"
          style={{ textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}
        >
          ✓ {t("approvedStatus")}
        </span>
      </div>

      {/* Settings Options Grid */}
      <div className="glass-card" style={{ margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Language Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-primary)" }}>
            {t("language")}
          </span>
          <LanguageSwitcher />
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: 0 }} />

        {/* Mock Offline Mode Toggle Row */}
        <div>
          <div className="toggle-container" onClick={() => setMockOffline(!mockOffline)} style={{ margin: 0 }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-primary)" }}>
              {t("mockOffline")}
            </span>
            <div className={`toggle-switch ${mockOffline ? "toggle-active" : ""}`} />
          </div>
          <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: "1.4" }}>
            Forces the application into offline mode. Used to simulate and test local IndexedDB operations under field settings without internet.
          </p>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: 0 }} />

        {/* Database Cleanups Row */}
        <div>
          <span style={{ fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px", color: "var(--color-text-primary)" }}>
            Database Diagnostics Tools
          </span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
            <span>Unsynced Queue:</span>
            <strong style={{ color: "var(--color-text-primary)" }}>{pendingCount} records</strong>
          </div>
          <button
            onClick={handleResetDatabase}
            className="btn-secondary"
            style={{
              padding: "10px",
              borderColor: "rgba(198, 40, 40, 0.3)",
              color: "var(--color-red)",
              fontSize: "13px"
            }}
          >
            🗑️ {t("dbReset")}
          </button>
        </div>

      </div>

      {/* Logout Action Button */}
      <button
        onClick={logout}
        className="btn-primary"
        style={{
          backgroundColor: "var(--color-primary)",
          marginTop: "16px"
        }}
      >
        🚪 {t("logout")}
      </button>
    </div>
  );
}

export default Settings;

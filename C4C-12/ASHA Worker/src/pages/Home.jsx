/**
 * GraamSehat ASHA Worker App - Home Dashboard Page
 * Path: /src/pages/Home.jsx
 * Main navigation viewport with real-time stats panels and worker profile.
 */

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useSync } from "../hooks/useSync";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/localDB";
import BigButton from "../components/BigButton";

export function Home() {
  const { t } = useLanguage();
  const { ashaProfile } = useAuth();
  const { isOffline, pendingCount } = useSync();

  // Get current hourly period for localized greetings
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return t("goodMorning");
    if (hours >= 12 && hours < 17) return t("goodAfternoon");
    return t("goodEvening");
  };

  // Reactively calculate statistics from Dexie DB
  const stats = useLiveQuery(async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const startMillis = todayStart.getTime();

      // 1. Screenings conducted today
      const screenedTodayCount = await db.screenings
        .filter(s => s.date >= startMillis)
        .count();

      // 2. High risk patients count
      const highRiskPatientsCount = await db.screenings
        .filter(s => s.overallRisk === "RED")
        .count();

      return {
        screenedToday: screenedTodayCount,
        highRisk: highRiskPatientsCount
      };
    } catch (err) {
      console.error("Dexie stats queries failed", err);
      return { screenedToday: 0, highRisk: 0 };
    }
  }, [], { screenedToday: 0, highRisk: 0 });

  return (
    <div style={{ padding: "16px 0 32px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top Profile Header Info */}
      <div style={{ padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: "14px", color: "var(--color-text-secondary)", fontWeight: "600" }}>
            {getGreeting()},
          </span>
          <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", fontWeight: "800", color: "var(--color-primary)" }}>
            {ashaProfile?.name || "ASHA Worker"}
          </h2>
          <span style={{ fontSize: "12px", color: "var(--color-primary-light)", fontWeight: "700" }}>
            📍 {ashaProfile?.subcentre || "GraamSehat Sub-Centre"}
          </span>
        </div>
        
        {/* Connection status tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "var(--color-surface)",
            padding: "6px 12px",
            borderRadius: "20px",
            border: "1px solid var(--color-border)"
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isOffline ? "var(--color-accent)" : "var(--color-green)",
              boxShadow: `0 0 8px ${isOffline ? "var(--color-accent)" : "var(--color-green)"}`
            }}
          />
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-text-primary)" }}>
            {isOffline ? t("offline") : t("online")}
          </span>
        </div>
      </div>

      {/* Main HUGE Action Buttons (taking up most of viewport) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", margin: "8px 0" }}>
        <BigButton
          to="/scan"
          icon="🔍"
          label={t("btnScanCard")}
          description={t("descScanCard")}
          color="blue"
        />
        
        <BigButton
          to="/patients"
          icon="👥"
          label={t("btnMyPatients")}
          description={t("descMyPatients")}
          color="teal"
        />
        
        <BigButton
          to="/medicine-log"
          icon="💊"
          label={t("btnMedicineLog")}
          description={t("descMedicineLog")}
          color="amber"
        />
      </div>

      {/* Footer Stats Bar */}
      <div className="glass-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "16px 8px", gap: "8px", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderRight: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: "22px", fontWeight: "800", color: "var(--color-primary)" }}>
            {stats.screenedToday}
          </span>
          <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: "600" }}>
            {t("screenedToday")}
          </span>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderRight: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: "22px", fontWeight: "800", color: pendingCount > 0 ? "var(--color-accent)" : "var(--color-text-primary)" }}>
            {pendingCount}
          </span>
          <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: "600" }}>
            {t("pendingSync")}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "22px", fontWeight: "800", color: stats.highRisk > 0 ? "var(--color-red)" : "var(--color-text-primary)" }}>
            {stats.highRisk}
          </span>
          <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: "600" }}>
            {t("highRisk")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Home;

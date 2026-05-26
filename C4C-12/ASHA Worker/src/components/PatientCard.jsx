/**
 * GraamSehat ASHA Worker App - Patient Card Component
 * Path: /src/components/PatientCard.jsx
 * Displays summary details of a patient in directories with risk and sync status badges.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

/**
 * Clickable directory summary card for patients.
 * @param {object} props - patient (object), lastScreenedDate (string/Date), riskLevel ('GREEN'|'YELLOW'|'RED')
 */
export function PatientCard({ patient }) {
  const { t } = useLanguage();
  const { uid, name, village, overallRisk, syncStatus, lastScreened, nextMeetupDate } = patient;

  // Formatting date
  const getScreenedText = () => {
    if (!lastScreened) return t("neverScreened");
    const date = new Date(lastScreened);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const getMeetupTextAndStatus = () => {
    if (!nextMeetupDate) return null;
    const meetup = new Date(nextMeetupDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    meetup.setHours(0, 0, 0, 0);
    const isOverdue = meetup.getTime() < today.getTime();
    const formattedDate = meetup.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    return { formattedDate, isOverdue };
  };

  const getRiskBadge = () => {
    switch (overallRisk) {
      case "RED":
        return <span className="badge badge-red">{t("riskHigh")}</span>;
      case "YELLOW":
        return <span className="badge badge-yellow">{t("riskMod")}</span>;
      case "GREEN":
      default:
        return <span className="badge badge-green">{t("riskLow")}</span>;
    }
  };

  return (
    <Link
      to={`/patients/${uid}`}
      className="glass-card"
      style={{
        display: "block",
        textDecoration: "none",
        color: "var(--color-text-primary)",
        position: "relative",
        padding: "16px",
        marginBottom: "12px"
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "var(--color-primary)" }}>{name}</h4>
          <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: "600" }}>
            ID: {uid}
          </span>
        </div>
        
        {/* Sync status dot */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            title={syncStatus === "synced" ? "Synced to Cloud" : "Pending Sync"}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: syncStatus === "synced" ? "var(--color-green)" : "var(--color-accent)",
              boxShadow: `0 0 8px ${syncStatus === "synced" ? "var(--color-green)" : "var(--color-accent)"}`
            }}
          />
        </div>
      </div>

      {/* Middle row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
        <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
          📍 {village}
        </div>
        <div>
          {getRiskBadge()}
        </div>
      </div>

      {/* Footer row */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          marginTop: "12px",
          paddingTop: "8px",
          fontSize: "12px",
          color: "var(--color-text-secondary)",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>
            {t("lastScreenedLabel")} {getScreenedText()}
          </span>
        </div>
        {(() => {
          const meetupInfo = getMeetupTextAndStatus();
          if (!meetupInfo) return null;
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "4px",
                padding: "6px 10px",
                borderRadius: "8px",
                background: meetupInfo.isOverdue ? "var(--color-red-bg)" : "var(--color-primary-tint)",
                border: `1.5px solid ${meetupInfo.isOverdue ? "var(--color-red)" : "var(--color-primary-light)"}`,
                color: meetupInfo.isOverdue ? "var(--color-red)" : "var(--color-primary)",
                fontWeight: "700"
              }}
            >
              <span>📅 Next Meetup:</span>
              <span>
                {meetupInfo.formattedDate} {meetupInfo.isOverdue ? "(Overdue)" : ""}
              </span>
            </div>
          );
        })()}
      </div>
    </Link>
  );
}

export default PatientCard;

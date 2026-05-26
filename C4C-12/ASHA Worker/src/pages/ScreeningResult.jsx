/**
 * GraamSehat ASHA Worker App - Screening Result View
 * Path: /src/pages/ScreeningResult.jsx
 * Full-screen risk-coloured diagnostic feedback displaying medical advice,
 * logging database records, and formatting WhatsApp physician referrals.
 */

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { createLocalScreening } from "../db/screenings.local";
import { updateLocalPatient, getLocalPatientByUid } from "../db/patients.local";
import { getRiskAdvice } from "../utils/riskCalculator";
import { formatUID } from "../utils/uidGenerator";
import RiskMeter from "../components/RiskMeter";

export function ScreeningResult() {
  const { state } = useLocation();
  const { t, language } = useLanguage();
  const { ashaProfile } = useAuth();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  // Fallback in case state is null (e.g. direct URL access)
  const result = state?.result;
  
  if (!result) {
    return (
      <div className="glass-card text-center" style={{ margin: "40px 16px", padding: "20px" }}>
        <h3>No Screening Session Active</h3>
        <button onClick={() => navigate("/")} className="btn-primary" style={{ marginTop: "16px" }}>
          Go to Home
        </button>
      </div>
    );
  }

  const {
    uid,
    patientName,
    age,
    idrsScore,
    bpSystolic,
    bpDiastolic,
    bpClassification,
    glucoseLevel,
    glucoseClassification,
    riskLevel,
    overallRisk,
    symptoms
  } = result;

  const advice = getRiskAdvice(overallRisk, language);

  const [customNote, setCustomNote] = useState(advice.explanation);

  let days = 365;
  if (overallRisk === "RED") {
    days = 15;
  } else if (overallRisk === "YELLOW") {
    days = 90;
  }
  const nextMeetupDate = Date.now() + days * 24 * 60 * 60 * 1000;

  // Format background class based on risk color
  const getBackgroundClass = () => {
    if (overallRisk === "RED") return "result-screen result-red";
    if (overallRisk === "YELLOW") return "result-screen result-yellow";
    return "result-screen result-green";
  };

  // Helper to commit record to database
  const commitToDatabase = async () => {
    setSaving(true);
    try {
      // 1. Create local screening log (auto-enqueued)
      await createLocalScreening({
        ...result,
        doctorsNote: customNote,
        nextMeetupDate: nextMeetupDate
      });

      // 2. Update patient profile in IndexedDB with newest risk level, note, and meetup date
      const patientRecord = await getLocalPatientByUid(uid);
      if (patientRecord && patientRecord.id) {
        await updateLocalPatient(patientRecord.id, {
          overallRisk: overallRisk,
          lastScreened: Date.now(),
          doctorsNote: customNote,
          nextMeetupDate: nextMeetupDate
        });
      }
    } catch (error) {
      console.error("Failed to save screening result", error);
    } finally {
      setSaving(false);
    }
  };

  // Action 1: WhatsApp Referral builder
  const handleShareReferral = () => {
    const ashaName = ashaProfile?.name || "ASHA Worker";
    const subcentre = ashaProfile?.subcentre || "GraamSehat Sub-Centre";
    const bpReadingText = bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic}` : "N/A";
    
    const message = `Referral from ASHA ${ashaName}, Sub-Centre ${subcentre}.\nPatient: ${patientName}, ${age} Yrs, UID: ${formatUID(uid)}.\nDiabetes Risk: ${riskLevel.toUpperCase()} (IDRS: ${idrsScore}).\nBP: ${bpReadingText} (${bpClassification}).\nPlease review urgently.`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Action 2: Save and Continue (navigate back to patient profile)
  const handleSaveAndContinue = async () => {
    await commitToDatabase();
    navigate(`/patients/${uid.replace(/-/g, "")}`);
  };

  // Action 3: Save and New Screening
  const handleSaveAndNew = async () => {
    await commitToDatabase();
    navigate("/scan");
  };

  return (
    <div className={getBackgroundClass()}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "12px", letterSpacing: "1px", fontWeight: "700", textTransform: "uppercase", opacity: 0.8 }}>
          {t("resultTitle")}
        </span>
        <h2 style={{ margin: "4px 0 0 0", fontSize: "28px", fontWeight: "800" }}>
          {patientName}
        </h2>
        <span style={{ fontSize: "14px", opacity: 0.8 }}>
          ID: {formatUID(uid)}
        </span>
      </div>

      {/* Numerical score details */}
      <div className="glass-card" style={{ padding: "16px", marginBottom: "16px" }}>
        <RiskMeter score={idrsScore} />
      </div>

      {/* Grid details */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          margin: "0 16px 16px 16px"
        }}
      >
        {/* BP Details */}
        <div className="glass-card" style={{ margin: 0, padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>
            Blood Pressure
          </div>
          <div style={{ fontSize: "20px", fontWeight: "800", margin: "6px 0", color: "var(--color-text-primary)" }}>
            {bpSystolic && bpDiastolic ? `${bpSystolic}/${bpDiastolic}` : "N/A"}
          </div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary)" }}>
            {bpClassification}
          </span>
        </div>

        {/* Glucose Details */}
        <div className="glass-card" style={{ margin: 0, padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>
            Blood Glucose
          </div>
          <div style={{ fontSize: "20px", fontWeight: "800", margin: "6px 0", color: "var(--color-text-primary)" }}>
            {glucoseLevel ? `${glucoseLevel} mg/dL` : "N/A"}
          </div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary)" }}>
            {glucoseClassification}
          </span>
        </div>
      </div>

      {/* Doctor's advice scrollable box */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: "24px",
          padding: "16px",
          maxHeight: "340px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "var(--color-surface)",
          borderColor: "var(--color-border)"
        }}
      >
        <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--color-text-primary)" }}>📋 {t("doctorsNote")}</span>
          <span className={`badge ${overallRisk === "RED" ? "badge-red" : overallRisk === "YELLOW" ? "badge-yellow" : "badge-green"}`}>
            {advice.phcText}
          </span>
        </div>

        <textarea
          className="form-input"
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          placeholder="ASHA Worker / Doctor Advice Remarks..."
          rows={4}
          style={{
            width: "100%",
            borderRadius: "12px",
            padding: "10px",
            fontSize: "14px",
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-text-primary)",
            resize: "vertical",
            marginBottom: 0
          }}
        />

        {/* Actions checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
          {advice.actions.map((act, index) => (
            <div key={index} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "13px" }}>
              <span style={{ color: "var(--color-primary-light)" }}>•</span>
              <span style={{ color: "var(--color-text-secondary)", lineHeight: "1.4" }}>{act}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "8px",
            padding: "10px 12px",
            borderRadius: "12px",
            background: "var(--color-primary-tint)",
            border: "1px solid var(--color-primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "13px",
            fontWeight: "700",
            color: "var(--color-text-primary)"
          }}
        >
          <span>📅 Meetup Scheduled:</span>
          <span>
            {new Date(nextMeetupDate).toLocaleDateString(language === "kn" ? "kn-IN" : "en-IN", {
              year: "numeric", month: "short", day: "numeric"
            })} (in {days} days)
          </span>
        </div>
      </div>

      {/* Navigation Buttons Row */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "10px", width: "100%", boxSizing: "border-box" }}>
        {/* WhatsApp Referral (Only for Yellow/Red) */}
        {(overallRisk === "YELLOW" || overallRisk === "RED") && (
          <button
            onClick={handleShareReferral}
            className="btn-primary"
            style={{
              background: "linear-gradient(135deg, #22c55e, #15803d)",
              boxShadow: "0 4px 14px rgba(34, 197, 94, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            💬 {t("btnShareWhatsApp")}
          </button>
        )}

        <button onClick={handleSaveAndContinue} disabled={saving} className="btn-primary">
          {saving ? "Saving Record..." : t("btnSaveContinue")}
        </button>

        <button onClick={handleSaveAndNew} disabled={saving} className="btn-secondary">
          {t("btnNewScreening")}
        </button>
      </div>
    </div>
  );
}

export default ScreeningResult;

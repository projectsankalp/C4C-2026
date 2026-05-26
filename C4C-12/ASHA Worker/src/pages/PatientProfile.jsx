/**
 * GraamSehat ASHA Worker App - Patient Profile Page
 * Path: /src/pages/PatientProfile.jsx
 * Comprehensive folder details view showing timelines of previous screenings,
 * medicine distribution histories, and inline editing forms.
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getLocalPatientByUid, updateLocalPatient } from "../db/patients.local";
import { getLocalScreeningsForPatient } from "../db/screenings.local";
import { getLocalMedicineLogsForPatient } from "../db/medicines.local";
import { formatUID } from "../utils/uidGenerator";
import { KARNATAKA_DISTRICTS } from "../utils/constants";

export function PatientProfile() {
  const { uid } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal editor state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editVillage, setEditVillage] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editHousehold, setEditHousehold] = useState("");
  const [editNextMeetupDate, setEditNextMeetupDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Tab views: 'screenings' | 'medicines'
  const [activeTab, setActiveTab] = useState("screenings");

  // Load patient folder details
  const loadData = async () => {
    if (!uid) return;
    try {
      const cleanUid = uid.replace(/-/g, "").trim();
      const record = await getLocalPatientByUid(cleanUid);
      
      if (record) {
        setPatient(record);
        
        // Load screenings
        const screeningHistory = await getLocalScreeningsForPatient(cleanUid);
        setScreenings(screeningHistory);
        
        // Load medicines
        const medicineHistory = await getLocalMedicineLogsForPatient(cleanUid);
        setMedicines(medicineHistory);
        
        // Populate edit defaults
        setEditName(record.name);
        setEditPhone(record.phone);
        setEditVillage(record.village);
        setEditDistrict(record.district || "Bengaluru Urban");
        setEditHousehold(record.household || "");
        setEditNextMeetupDate(record.nextMeetupDate ? new Date(record.nextMeetupDate).toISOString().split('T')[0] : "");
      }
    } catch (error) {
      console.error("Failed to load patient folder", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uid]);

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await updateLocalPatient(patient.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        village: editVillage.trim(),
        district: editDistrict,
        household: editHousehold.trim(),
        nextMeetupDate: editNextMeetupDate ? new Date(editNextMeetupDate).getTime() : null
      });
      setShowEditModal(false);
      // Reload profile
      await loadData();
    } catch (err) {
      console.error("Failed to update patient", err);
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card text-center" style={{ padding: "40px" }}>
        <span style={{ fontSize: "36px" }} className="pulse-glow">⏳</span>
        <p style={{ margin: "16px 0 0 0", fontSize: "14px", fontWeight: "600" }}>Loading Patient Profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="glass-card text-center" style={{ margin: "40px 16px" }}>
        <span style={{ fontSize: "36px" }}>⚠️</span>
        <p style={{ margin: "16px 0 0 0", fontSize: "14px", fontWeight: "600" }}>Patient record not found locally.</p>
        <button onClick={() => navigate("/scan")} className="btn-primary" style={{ marginTop: "16px" }}>
          Go to Scan Portal
        </button>
      </div>
    );
  }

  // Calculate latest metrics from screenings
  const latestScreening = screenings[0] || null;

  const getRiskBadge = (risk) => {
    switch (risk) {
      case "RED":
        return <span className="badge badge-red" style={{ fontSize: "14px", padding: "6px 12px" }}>{t("riskHigh")}</span>;
      case "YELLOW":
        return <span className="badge badge-yellow" style={{ fontSize: "14px", padding: "6px 12px" }}>{t("riskMod")}</span>;
      case "GREEN":
      default:
        return <span className="badge badge-green" style={{ fontSize: "14px", padding: "6px 12px" }}>{t("riskLow")}</span>;
    }
  };

  const getMeetupStatus = (nextMeetupDate) => {
    if (!nextMeetupDate) return { text: "No meetup scheduled", colorClass: "badge-gray", daysLeft: 0, status: "none" };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const meetup = new Date(nextMeetupDate);
    meetup.setHours(0, 0, 0, 0);
    
    const diffTime = meetup.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { text: "Today", colorClass: "badge-yellow", daysLeft: 0, status: "today" };
    } else if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return { text: `Overdue by ${absDays} day${absDays > 1 ? "s" : ""}`, colorClass: "badge-red", daysLeft: diffDays, status: "overdue" };
    } else {
      return { text: `Upcoming (in ${diffDays} day${diffDays > 1 ? "s" : ""})`, colorClass: "badge-green", daysLeft: diffDays, status: "upcoming" };
    }
  };

  return (
    <div style={{ padding: "16px 0 32px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Patient Avatar & Profile Summary Header */}
      <div className="glass-card text-center" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            border: "3px solid var(--color-primary-light)",
            overflow: "hidden",
            backgroundColor: "var(--color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {patient.photo ? (
            <img src={patient.photo} alt={patient.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "40px" }}>👤</span>
          )}
        </div>

        <div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "var(--color-primary)" }}>{patient.name}</h2>
          <span style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: "600" }}>
            ID: {formatUID(patient.uid)} | {patient.age} Yrs / {patient.gender}
          </span>
          <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
            📍 {patient.household ? `${patient.household}, ` : ""}{patient.village}, {patient.district}
          </div>
        </div>

        <div style={{ marginTop: "4px" }}>
          {getRiskBadge(patient.overallRisk)}
        </div>
      </div>

      {/* Next Meetup Schedule Calendar Card */}
      {patient.nextMeetupDate ? (
        <div className="glass-card animate-fade-in" style={{ padding: "16px", background: "var(--color-surface)", border: "1.5px solid var(--color-primary-light)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "var(--color-primary)" }}>
              📅 Next Meetup Schedule
            </h3>
            {(() => {
              const status = getMeetupStatus(patient.nextMeetupDate);
              return (
                <span className={`badge ${status.colorClass}`} style={{ fontSize: "11px", padding: "4px 8px" }}>
                  {status.text}
                </span>
              );
            })()}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--color-text-primary)" }}>
              {new Date(patient.nextMeetupDate).toLocaleDateString(undefined, {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })}
            </span>
          </div>
          {patient.doctorsNote && (
            <div style={{ marginTop: "10px", padding: "10px", borderRadius: "12px", background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                ASHA / Doctor Remarks:
              </span>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-primary)", fontStyle: "italic", lineHeight: "1.4" }}>
                {patient.doctorsNote}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card text-center" style={{ padding: "16px", color: "var(--color-text-secondary)", fontSize: "13px", fontStyle: "italic" }}>
          📅 No meetup scheduled yet. Update screening or edit profile to schedule.
        </div>
      )}

      {/* Grid of Latest Readings */}
      <div className="glass-card" style={{ padding: "16px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "700", color: "var(--color-primary)" }}>
          {t("gridReadings")}
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", textAlign: "center" }}>
          <div style={{ background: "var(--color-surface)", padding: "10px 4px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", display: "block" }}>Blood Pressure</span>
            <span style={{ fontSize: "15px", fontWeight: "800", display: "block", marginTop: "4px", color: "var(--color-text-primary)" }}>
              {latestScreening?.bpSystolic && latestScreening?.bpDiastolic
                ? `${latestScreening.bpSystolic}/${latestScreening.bpDiastolic}`
                : "N/A"}
            </span>
          </div>

          <div style={{ background: "var(--color-surface)", padding: "10px 4px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", display: "block" }}>Blood Glucose</span>
            <span style={{ fontSize: "15px", fontWeight: "800", display: "block", marginTop: "4px", color: "var(--color-text-primary)" }}>
              {latestScreening?.glucoseLevel ? `${latestScreening.glucoseLevel}` : "N/A"}
            </span>
          </div>

          <div style={{ background: "var(--color-surface)", padding: "10px 4px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", display: "block" }}>IDRS Score</span>
            <span style={{ fontSize: "15px", fontWeight: "800", display: "block", marginTop: "4px", color: "var(--color-text-primary)" }}>
              {latestScreening?.idrsScore !== undefined ? latestScreening.idrsScore : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ padding: "0 16px", display: "flex", gap: "8px" }}>
        <button
          onClick={() => setActiveTab("screenings")}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border: "2px solid var(--color-primary)",
            backgroundColor: activeTab === "screenings" ? "var(--color-primary)" : "transparent",
            color: activeTab === "screenings" ? "var(--color-text-on-primary)" : "var(--color-primary)",
            fontWeight: "700",
            cursor: "pointer",
            transition: "var(--transition-smooth)"
          }}
        >
          Screenings ({screenings.length})
        </button>
        <button
          onClick={() => setActiveTab("medicines")}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border: "2px solid var(--color-primary)",
            backgroundColor: activeTab === "medicines" ? "var(--color-primary)" : "transparent",
            color: activeTab === "medicines" ? "var(--color-text-on-primary)" : "var(--color-primary)",
            fontWeight: "700",
            cursor: "pointer",
            transition: "var(--transition-smooth)"
          }}
        >
          Medicines ({medicines.length})
        </button>
      </div>

      {/* History Lists */}
      <div className="glass-card" style={{ padding: "16px", minHeight: "180px" }}>
        
        {/* TAB 1: SCREENINGS */}
        {activeTab === "screenings" && (
          <div>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700", color: "var(--color-text-secondary)" }}>
              {t("timeline")}
            </h4>
            
            {screenings.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {screenings.slice(0, 3).map((sc, idx) => {
                  const date = new Date(sc.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                  const itemColor = sc.overallRisk === "RED" ? "red" : sc.overallRisk === "YELLOW" ? "yellow" : "green";
                  return (
                    <div key={sc.id} className={`timeline-item ${itemColor}`}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-text-primary)" }}>
                          {date}
                        </span>
                        <span className={`badge ${sc.overallRisk === "RED" ? "badge-red" : sc.overallRisk === "YELLOW" ? "badge-yellow" : "badge-green"}`} style={{ fontSize: "10px", padding: "2px 6px" }}>
                          IDRS: {sc.idrsScore}
                        </span>
                      </div>
                      <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: "1.4" }}>
                        {sc.doctorsNote || "Routine health screening checkup completed."}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-secondary)", fontSize: "13px" }}>
                No screening logs recorded.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEDICINES */}
        {activeTab === "medicines" && (
          <div>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "700", color: "var(--color-text-secondary)" }}>
              Distribution Logs
            </h4>
            
            {medicines.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {medicines.map((med) => {
                  const date = new Date(med.distributedAt).toLocaleDateString();
                  const dueDate = med.nextDueDate ? new Date(med.nextDueDate).toLocaleDateString() : "As Needed";
                  return (
                    <div key={med.id} style={{ padding: "12px", borderRadius: "10px", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-primary)" }}>{med.medicineName}</div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>Qty: {med.quantity} | Dose: {med.dose}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "11px", color: "var(--color-text-primary)", fontWeight: "600" }}>Given: {date}</div>
                        <div style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: "700" }}>Next: {dueDate}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-secondary)", fontSize: "13px" }}>
                No medicine distribution recorded.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Profile Operations Action Panel */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          onClick={() => navigate(`/screening/${patient.uid}`)}
          className="btn-primary"
        >
          {t("btnUpdateScreening")}
        </button>

        <button
          onClick={() => navigate("/medicine-log", { state: { presetUid: patient.uid } })}
          className="btn-primary"
          style={{ background: "linear-gradient(135deg, var(--color-accent), #d97706)" }}
        >
          {t("btnMedHistory")}
        </button>

        <button onClick={() => setShowEditModal(true)} className="btn-secondary">
          {t("btnEditPatient")}
        </button>
      </div>

      {/* Edit Demographic Details Overlay Modal */}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(61, 79, 66, 0.4)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}
        >
          <form
            onSubmit={handleUpdatePatient}
            className="glass-card slide-in-right"
            style={{
              width: "100%",
              maxWidth: "400px",
              display: "flex",
              flexDirection: "column",
              padding: "24px",
              boxSizing: "border-box"
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800", textAlign: "center" }}>
              Edit Patient Information
            </h3>

            <label style={{ fontSize: "12px", color: "var(--color-text-gray)", fontWeight: "600", marginBottom: "4px" }}>
              Patient Name
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <label style={{ fontSize: "12px", color: "var(--color-text-gray)", fontWeight: "600", marginBottom: "4px" }}>
              Primary Phone
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              className="form-input"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />

            <label style={{ fontSize: "12px", color: "var(--color-text-gray)", fontWeight: "600", marginBottom: "4px" }}>
              Village
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={editVillage}
              onChange={(e) => setEditVillage(e.target.value)}
            />

            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", color: "var(--color-text-gray)", fontWeight: "600", marginBottom: "4px", display: "block" }}>
                  District
                </label>
                <select
                  className="form-input"
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                >
                  {KARNATAKA_DISTRICTS.map(d => (
                    <option key={d} value={d} style={{ color: "black" }}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "12px", color: "var(--color-text-gray)", fontWeight: "600", marginBottom: "4px", display: "block" }}>
                  Household #
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editHousehold}
                  onChange={(e) => setEditHousehold(e.target.value)}
                />
              </div>
            </div>

            <label style={{ fontSize: "12px", color: "var(--color-text-gray)", fontWeight: "600", marginBottom: "4px", marginTop: "8px" }}>
              Next Meetup Date (Reschedule)
            </label>
            <input
              type="date"
              className="form-input"
              value={editNextMeetupDate}
              onChange={(e) => setEditNextMeetupDate(e.target.value)}
              style={{ color: "var(--color-text-primary)" }}
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="btn-primary"
                style={{ flex: 2 }}
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default PatientProfile;

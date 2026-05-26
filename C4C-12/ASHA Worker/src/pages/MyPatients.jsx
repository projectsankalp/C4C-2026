/**
 * GraamSehat ASHA Worker App - Patient Directory Page
 * Path: /src/pages/MyPatients.jsx
 * Local directory view displaying searchable, sortable, and filterable patient folders.
 */

import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useLanguage } from "../context/LanguageContext";
import { listAllPatients } from "../db/patients.local";
import PatientCard from "../components/PatientCard";

export function MyPatients() {
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL"); // 'ALL' | 'GREEN' | 'YELLOW' | 'RED'
  const [sortBy, setSortBy] = useState("lastScreened"); // 'lastScreened' | 'risk' | 'name'

  // Fetch patients reactively from Dexie
  const patientsList = useLiveQuery(async () => {
    try {
      return await listAllPatients();
    } catch (err) {
      console.error("Failed to query patients list", err);
      return [];
    }
  }, [], []);

  // Filter and sort patient records locally
  const getProcessedPatients = () => {
    let result = [...patientsList];

    // 1. Search Query Filter (Name or UID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanUid = q.replace(/-/g, "");
      result = result.filter(p => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.uid.replace(/-/g, "").includes(cleanUid)
        );
      });
    }

    // 2. Risk Level Filter
    if (riskFilter !== "ALL") {
      result = result.filter(p => p.overallRisk === riskFilter);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      
      if (sortBy === "risk") {
        const riskRank = { RED: 3, YELLOW: 2, GREEN: 1, undefined: 0, null: 0 };
        const rankA = riskRank[a.overallRisk] || 0;
        const rankB = riskRank[b.overallRisk] || 0;
        return rankB - rankA; // Higher risk first
      }

      if (sortBy === "lastScreened") {
        const timeA = a.lastScreened || 0;
        const timeB = b.lastScreened || 0;
        return timeB - timeA; // Newest screening first
      }

      if (sortBy === "meetup") {
        const hasMeetupA = a.nextMeetupDate ? 1 : 0;
        const hasMeetupB = b.nextMeetupDate ? 1 : 0;
        if (hasMeetupA !== hasMeetupB) {
          return hasMeetupB - hasMeetupA; // Scheduled meetups first
        }
        if (a.nextMeetupDate && b.nextMeetupDate) {
          return a.nextMeetupDate - b.nextMeetupDate; // Earlier date first (overdue/upcoming soonest)
        }
        return 0;
      }

      return 0;
    });

    return result;
  };

  const processedPatients = getProcessedPatients();

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ textAlign: "center", margin: "16px 0 8px 0" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800" }}>
          {t("patientsTitle")}
        </h2>
      </div>

      {/* Search Input Box */}
      <input
        type="text"
        className="form-input"
        placeholder={t("searchPlaceholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "8px" }}
      />

      {/* Filter and Sort Toggles Grid */}
      <div className="glass-card" style={{ margin: 0, padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Risk Filter Row */}
        <div>
          <div style={{ fontSize: "12px", color: "var(--color-text-gray)", fontWeight: "600", marginBottom: "6px" }}>
            {t("filterBy")}
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["ALL", "GREEN", "YELLOW", "RED"].map(risk => (
              <button
                key={risk}
                onClick={() => setRiskFilter(risk)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "1px solid var(--color-border)",
                  backgroundColor: riskFilter === risk ? "var(--color-primary)" : "var(--color-surface)",
                  color: riskFilter === risk ? "var(--color-text-on-primary)" : "var(--color-text-primary)"
                }}
              >
                {risk === "ALL" ? t("allRisks") : risk}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Row */}
        <div>
          <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: "600", marginBottom: "6px" }}>
            {t("sortBy")}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { id: "lastScreened", label: t("sortLastScreened") },
              { id: "risk", label: t("sortRisk") },
              { id: "name", label: t("sortName") },
              { id: "meetup", label: "Meetup" }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                style={{
                  flex: 1,
                  padding: "6px 4px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "1px solid var(--color-border)",
                  backgroundColor: sortBy === opt.id ? "var(--color-primary-tint)" : "var(--color-surface)",
                  color: "var(--color-text-primary)"
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Patient List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {processedPatients.length > 0 ? (
          processedPatients.map(pat => (
            <PatientCard key={pat.id} patient={pat} />
          ))
        ) : (
          <div className="glass-card text-center" style={{ padding: "40px 16px" }}>
            <span style={{ fontSize: "36px" }}>👥</span>
            <p style={{ margin: "16px 0 0 0", color: "var(--color-text-gray)", fontSize: "14px" }}>
              {t("noPatientsFound")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPatients;

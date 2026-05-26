/**
 * GraamSehat ASHA Worker App - Medicine Distribution Log
 * Path: /src/pages/MedicineLog.jsx
 * Distribution portal recording medicines given to patients, updating inventory,
 * and warning on low stock items.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { MEDICINES_LIST } from "../utils/constants";
import { searchLocalPatients, getLocalPatientByUid } from "../db/patients.local";
import { createLocalMedicineLog, getLocalMedicineStock } from "../db/medicines.local";
import { formatUID } from "../utils/uidGenerator";
import GameCard from "../components/GameCard";
import QRScanner from "../components/QRScanner";
import NFCReader from "../components/NFCReader";

export function MedicineLog() {
  const { t } = useLanguage();
  const { ashaWorkerId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected Patient
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeScanner, setActiveScanner] = useState(null); // 'qr' | 'nfc' | null

  // Medicine Selection State
  const [selectedMedId, setSelectedMedId] = useState("");
  const [quantity, setQuantity] = useState("");
  
  // Form Status
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [stockAlert, setStockAlert] = useState("");
  const [saving, setSaving] = useState(false);

  // If patient UID passed in state/location
  useEffect(() => {
    async function loadPreselected() {
      const presetUid = location.state?.presetUid;
      if (presetUid) {
        try {
          const patientRecord = await getLocalPatientByUid(presetUid);
          if (patientRecord) {
            setSelectedPatient(patientRecord);
          }
        } catch (err) {
          console.error("Failed to load preselected patient", err);
        }
      }
    }
    loadPreselected();
  }, [location]);

  // Autocomplete patient search
  useEffect(() => {
    async function performSearch() {
      if (searchQuery.trim().length >= 2) {
        const matches = await searchLocalPatients(searchQuery);
        setSearchResults(matches);
      } else {
        setSearchResults([]);
      }
    }
    performSearch();
  }, [searchQuery]);

  const handlePatientSelect = (pat) => {
    setSelectedPatient(pat);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleScanSuccess = async (uid) => {
    setActiveScanner(null);
    const cleanUid = uid.replace(/-/g, "").trim();
    const patientRecord = await getLocalPatientByUid(cleanUid);
    if (patientRecord) {
      setSelectedPatient(patientRecord);
    } else {
      setErrorMsg(`Patient ID ${formatUID(cleanUid)} not found locally. Please register first.`);
    }
  };

  const handleLogDistribution = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setStockAlert("");

    if (!selectedPatient) {
      setErrorMsg("Please select a patient first.");
      return;
    }
    if (!selectedMedId) {
      setErrorMsg("Please select a medicine.");
      return;
    }
    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg("Please enter a valid quantity.");
      return;
    }

    const selectedMed = MEDICINES_LIST.find(m => m.id === selectedMedId);
    const currentStock = getLocalMedicineStock(selectedMedId);

    if (qtyNum > currentStock) {
      setErrorMsg(`Insufficient stock: Only ${currentStock} units of ${selectedMed.name} left.`);
      return;
    }

    setSaving(true);

    try {
      const result = await createLocalMedicineLog({
        uid: selectedPatient.uid,
        medicineId: selectedMedId,
        medicineName: selectedMed.name,
        dose: selectedMed.defaultDose,
        quantity: qtyNum,
        ashaWorkerId
      });

      // Show success results
      setSuccessMsg(t("medSuccess"));
      
      if (result.isLowStock) {
        setStockAlert(t("stockWarning", { name: selectedMed.name, qty: result.remainingStock }));
      } else {
        // Simple notice
        setStockAlert(t("stockOk", { qty: result.remainingStock }));
      }

      // Reset selection state
      setSelectedMedId("");
      setQuantity("");
    } catch (err) {
      console.error("Failed to log medicine", err);
      setErrorMsg("Failed to save distribution record.");
    } finally {
      setSaving(false);
    }
  };

  const activeMedPreset = MEDICINES_LIST.find(m => m.id === selectedMedId);

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ textAlign: "center", margin: "16px 0 8px 0" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800" }}>
          {t("medTitle")}
        </h2>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "var(--color-red)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "12px", borderRadius: "8px", fontSize: "14px", textAlign: "center", fontWeight: "600" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--color-green)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "12px", borderRadius: "8px", fontSize: "14px", textAlign: "center", fontWeight: "600" }}>
          ✓ {successMsg}
        </div>
      )}

      {stockAlert && (
        <div
          style={{
            backgroundColor: stockAlert.includes("Low stock") ? "var(--color-red-bg)" : "var(--color-primary-tint)",
            color: stockAlert.includes("Low stock") ? "var(--color-red)" : "var(--color-primary)",
            border: `1px solid ${stockAlert.includes("Low stock") ? "rgba(198, 40, 40, 0.2)" : "var(--color-border)"}`,
            padding: "12px",
            borderRadius: "8px",
            fontSize: "14px",
            textAlign: "center",
            fontWeight: "700"
          }}
        >
          {stockAlert}
        </div>
      )}

      {/* SECTION 1: SELECT PATIENT */}
      <div className="glass-card" style={{ margin: 0, padding: "16px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "700", color: "var(--color-primary)" }}>
          1. {t("selectPatient")}
        </h3>

        {selectedPatient ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "12px", borderRadius: "12px" }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-text-primary)" }}>{selectedPatient.name}</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>ID: {formatUID(selectedPatient.uid)}</div>
            </div>
            <button onClick={() => setSelectedPatient(null)} className="btn-secondary" style={{ width: "80px", padding: "6px", fontSize: "12px" }}>
              Change
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Search Input */}
            <input
              type="text"
              className="form-input"
              style={{ marginBottom: 0 }}
              placeholder={t("searchPatientPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Autocomplete suggestions */}
            {searchResults.length > 0 && (
              <div style={{ maxHeight: "150px", overflowY: "auto", border: "2px solid var(--color-border)", borderRadius: "12px", background: "var(--color-card)" }}>
                {searchResults.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handlePatientSelect(p)}
                    style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-border)", cursor: "pointer", fontSize: "14px", color: "var(--color-text-primary)" }}
                  >
                    🔍 {p.name} ({formatUID(p.uid)}) - <span style={{ color: "var(--color-text-secondary)" }}>{p.village}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Scan Buttons */}
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button onClick={() => setActiveScanner("nfc")} className="btn-secondary" style={{ flex: 1, padding: "8px" }}>
                📳 Scan NFC
              </button>
              <button onClick={() => setActiveScanner("qr")} className="btn-secondary" style={{ flex: 1, padding: "8px" }}>
                📷 Scan QR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: MEDICINE & QUANTITY FORM */}
      {selectedPatient && (
        <form onSubmit={handleLogDistribution} className="glass-card slide-in-right" style={{ margin: 0, padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--color-primary)" }}>
            2. {t("selectMed")}
          </h3>

          {/* List of Medicines */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
            {MEDICINES_LIST.map((med, idx) => {
              const stock = getLocalMedicineStock(med.id);
              const isLow = stock < 10;
              return (
                <div
                  key={med.id}
                  onClick={() => setSelectedMedId(med.id)}
                  className={`game-option-card ${selectedMedId === med.id ? "selected" : ""}`}
                  style={{
                    minHeight: "60px",
                    padding: "10px 14px",
                    margin: 0,
                    border: `2px solid ${selectedMedId === med.id ? "var(--color-primary)" : isLow ? "rgba(198, 40, 40, 0.2)" : "var(--color-border)"}`
                  }}
                >
                  <span style={{ fontSize: "22px" }}>💊</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-primary)" }}>{med.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>{med.defaultDose}</div>
                  </div>
                  
                  {/* Stock tag */}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      backgroundColor: isLow ? "var(--color-red-bg)" : "var(--color-surface)",
                      color: isLow ? "var(--color-red)" : "var(--color-primary)"
                    }}
                  >
                    Stock: {stock}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quantity Input */}
          {selectedMedId && (
            <div className="slide-in-right" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-text-secondary)" }}>
                {t("labelQty")} (Left: {getLocalMedicineStock(selectedMedId)} units)
              </label>
              
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="number"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className="form-input"
                  style={{ flex: 1, marginBottom: 0, fontSize: "18px", fontWeight: "700", textAlign: "center" }}
                  placeholder="e.g. 30"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  autoFocus
                />
                
                {/* Autocomplete preset keys */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {[10, 30, 60].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setQuantity(String(qty))}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "2px solid var(--color-border)",
                        background: "var(--color-surface)",
                        color: "var(--color-text-primary)",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              {activeMedPreset && activeMedPreset.nextDueDays > 0 && (
                <div style={{ fontSize: "12px", color: "var(--color-text-gray)", fontStyle: "italic", marginTop: "4px" }}>
                  💡 Next checkup auto-scheduled for +{activeMedPreset.nextDueDays} days.
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !selectedMedId || !quantity}
            className="btn-primary"
            style={{ marginTop: "12px" }}
          >
            {saving ? "Logging Distribution..." : t("btnLogMed")}
          </button>
        </form>
      )}

      {/* Scanners Overlay */}
      {activeScanner === "qr" && (
        <QRScanner onUidRead={handleScanSuccess} onClose={() => setActiveScanner(null)} />
      )}

      {activeScanner === "nfc" && (
        <NFCReader onUidRead={handleScanSuccess} onClose={() => setActiveScanner(null)} />
      )}
    </div>
  );
}

export default MedicineLog;

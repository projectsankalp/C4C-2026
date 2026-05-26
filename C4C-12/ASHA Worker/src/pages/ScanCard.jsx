/**
 * GraamSehat ASHA Worker App - Card Scanning Portal
 * Path: /src/pages/ScanCard.jsx
 * Allows ASHA workers to scan cards (NFC/QR) or enter UIDs manually.
 * Resolves local and remote records with local DB updating.
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useSync } from "../hooks/useSync";
import { validateUID, formatUID } from "../utils/uidGenerator";
import { getLocalPatientByUid } from "../db/patients.local";
import { getRemotePatientByUid } from "../firebase/patients";
import { db } from "../db/localDB";
import ScanOption from "../components/ScanOption";
import QRScanner from "../components/QRScanner";
import NFCReader from "../components/NFCReader";

export function ScanCard() {
  const { t } = useLanguage();
  const { isOffline } = useSync();
  const navigate = useNavigate();

  const [activeScanner, setActiveScanner] = useState(null); // 'nfc' | 'qr' | null
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualDigits, setManualDigits] = useState(Array(6).fill(""));
  const [errorMsg, setErrorMsg] = useState("");
  const [showNewPatientPrompt, setShowNewPatientPrompt] = useState(null); // stores cleanUid if not found
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  // Clear errors when state changes
  useEffect(() => {
    setErrorMsg("");
  }, [activeScanner, showManualForm]);

  // Handle digit inputs for manual entry
  const handleDigitChange = (index, value) => {
    const val = value.replace(/\D/g, ""); // Keep numeric only
    const newDigits = [...manualDigits];
    
    if (val.length > 0) {
      newDigits[index] = val[val.length - 1]; // Only keep last digit
      setManualDigits(newDigits);
      
      // Auto focus next input
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      }
    } else {
      newDigits[index] = "";
      setManualDigits(newDigits);
    }
  };

  // Handle backspaces in digit inputs
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !manualDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    const uid = manualDigits.join("");
    if (uid.length === 6) {
      handleUIDResolved(uid);
    }
  };

  // Watch manual digits to trigger auto-validate on completion
  useEffect(() => {
    const uid = manualDigits.join("");
    if (uid.length === 6) {
      handleUIDResolved(uid);
    }
  }, [manualDigits]);

  // Process resolved UID
  const handleUIDResolved = async (rawUid) => {
    setLoading(true);
    setErrorMsg("");
    setShowNewPatientPrompt(null);
    
    // Clean and validate UID
    const cleanUid = rawUid.replace(/-/g, "").trim();
    
    if (!validateUID(cleanUid)) {
      setErrorMsg(t("invalidUid"));
      setLoading(false);
      return;
    }

    try {
      // 1. Check local Dexie DB first
      const localPatient = await getLocalPatientByUid(cleanUid);
      
      // 2. Check remote Firestore if online
      let remotePatient = null;
      if (!isOffline) {
        remotePatient = await getRemotePatientByUid(cleanUid);
      }

      if (localPatient || remotePatient) {
        // Discrepancy checks: remote Firestore wins
        if (remotePatient) {
          if (localPatient) {
            // Update local DB
            await db.patients.update(localPatient.id, {
              ...remotePatient,
              syncStatus: "synced"
            });
          } else {
            // Write to local DB
            await db.patients.add({
              ...remotePatient,
              syncStatus: "synced"
            });
          }
        }
        
        // Success: route to patient profile page
        navigate(`/patients/${cleanUid}`);
      } else {
        // Patient not found anywhere
        setShowNewPatientPrompt(cleanUid);
      }
    } catch (err) {
      console.error("Error resolving UID", err);
      setErrorMsg("An error occurred while looking up health ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/new-registration", { state: { presetUid: showNewPatientPrompt } });
  };

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ textAlign: "center", margin: "16px 0 8px 0" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800" }}>
          {t("scanTitle")}
        </h2>
      </div>

      {errorMsg && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "var(--color-red)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "14px",
            textAlign: "center",
            fontWeight: "600"
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Lookup / Loader overlay */}
      {loading && (
        <div className="glass-card text-center" style={{ padding: "24px" }}>
          <span style={{ fontSize: "28px" }} className="pulse-glow">⏳</span>
          <p style={{ margin: "12px 0 0 0", fontSize: "14px", fontWeight: "600" }}>
            Searching database for Health ID...
          </p>
        </div>
      )}

      {/* Patient Not Found Prompt */}
      {showNewPatientPrompt && !loading && (
        <div
          className="glass-card text-center slide-in-right"
          style={{
            borderLeft: "5px solid var(--color-accent)",
            backgroundColor: "rgba(245, 158, 11, 0.05)"
          }}
        >
          <span style={{ fontSize: "36px" }}>👤</span>
          <h3 style={{ margin: "12px 0 6px 0", color: "var(--color-accent)" }}>
            New Patient Detected
          </h3>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: "0 0 16px 0", lineHeight: "1.5" }}>
            Health ID <strong style={{ color: "var(--color-primary)" }}>{formatUID(showNewPatientPrompt)}</strong> is not registered.
            Would you like to register them now?
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setShowNewPatientPrompt(null)}
              className="btn-secondary"
              style={{ flex: 1, padding: "10px" }}
            >
              Cancel
            </button>
            <button
              onClick={handleRegisterRedirect}
              className="btn-primary"
              style={{ flex: 2, padding: "10px" }}
            >
              Register
            </button>
          </div>
        </div>
      )}

      {/* Main Options Menu */}
      {!loading && !showNewPatientPrompt && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <ScanOption
            icon="📳"
            title={t("nfcTitle")}
            description={t("nfcDesc")}
            onClick={() => setActiveScanner("nfc")}
          />
          
          <ScanOption
            icon="📷"
            title={t("qrTitle")}
            description={t("qrDesc")}
            onClick={() => setActiveScanner("qr")}
          />

          <ScanOption
            icon="⌨️"
            title={t("manualTitle")}
            description={t("manualDesc")}
            onClick={() => setShowManualForm(!showManualForm)}
          />

          {/* Manual Form Toggle Overlay */}
          {showManualForm && (
            <div className="glass-card slide-in-right" style={{ marginTop: "8px", padding: "16px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "700", textAlign: "center" }}>
                Enter Health ID (Digits)
              </h4>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "4px" }}>
                {manualDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    style={{
                      width: "36px",
                      height: "44px",
                      borderRadius: "8px",
                      border: "2px solid var(--color-border)",
                      background: "var(--color-card)",
                      color: "var(--color-text-primary)",
                      fontSize: "20px",
                      fontWeight: "700",
                      textAlign: "center",
                      fontFamily: "monospace",
                      outline: "none"
                    }}
                  />
                ))}
              </div>
              <button
                onClick={handleManualSubmit}
                className="btn-primary"
                style={{ marginTop: "16px", padding: "10px" }}
                disabled={manualDigits.join("").length < 6}
              >
                {t("btnSubmit")}
              </button>
            </div>
          )}

          {/* Fallback Option */}
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "14px", color: "var(--color-text-gray)" }}>
              {t("noCardOption")}
            </span>
            <button
              onClick={() => navigate("/new-registration")}
              className="btn-secondary"
              style={{ marginTop: "12px" }}
            >
              {t("noCardBtn")}
            </button>
          </div>
        </div>
      )}

      {/* Scanner Modal Popups */}
      {activeScanner === "qr" && (
        <QRScanner
          onUidRead={(uid) => {
            setActiveScanner(null);
            handleUIDResolved(uid);
          }}
          onClose={() => setActiveScanner(null)}
        />
      )}

      {activeScanner === "nfc" && (
        <NFCReader
          onUidRead={(uid) => {
            setActiveScanner(null);
            handleUIDResolved(uid);
          }}
          onClose={() => setActiveScanner(null)}
        />
      )}
    </div>
  );
}

export default ScanCard;

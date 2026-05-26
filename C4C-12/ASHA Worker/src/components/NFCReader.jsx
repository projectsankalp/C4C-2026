/**
 * GraamSehat ASHA Worker App - NFC Card Reader Component
 * Path: /src/components/NFCReader.jsx
 * Screen overlay to listen to Web NFC card taps and provide desktop simulators.
 */

import React, { useEffect, useState } from "react";
import { useNFC } from "../hooks/useNFC";
import { useLanguage } from "../context/LanguageContext";

/**
 * NFC scan listener and simulator modal.
 * @param {object} props - onUidRead (fn), onClose (fn)
 */
export function NFCReader({ onUidRead, onClose }) {
  const { t } = useLanguage();
  const { isSupported, isScanning, nfcError, startNFCScan, stopNFCScan, triggerMockScan } = useNFC();
  
  // Custom mock UID input for sandboxed desktop verification
  const [mockUidInput, setMockUidInput] = useState("685586");

  useEffect(() => {
    // Start listening on mount
    if (isSupported) {
      startNFCScan(onUidRead);
    }
    return () => {
      stopNFCScan();
    };
  }, [isSupported]);

  const handleMockTap = () => {
    triggerMockScan(mockUidInput, onUidRead);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(253, 251, 247, 0.96)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box"
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px", display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button
          onClick={onClose}
          style={{
            background: "var(--color-border)",
            border: "none",
            color: "var(--color-text-primary)",
            fontSize: "20px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            cursor: "pointer"
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "32px", padding: "0 24px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "22px", fontWeight: "800", color: "var(--color-primary)" }}>
          {t("nfcTitle")}
        </h3>
        <p style={{ margin: 0, fontSize: "15px", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
          {t("nfcDesc")}
        </p>
      </div>

      {/* Visual Animation Container */}
      <div
        style={{
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          backgroundColor: isScanning ? "var(--color-primary-tint)" : "var(--color-surface)",
          border: `2px dashed ${isScanning ? "var(--color-primary)" : "var(--color-border)"}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          position: "relative",
          marginBottom: "32px",
          boxShadow: isScanning ? "0 0 30px rgba(61, 79, 66, 0.15)" : "none"
        }}
      >
        <span style={{ fontSize: "54px" }} className={isScanning ? "pulse-glow" : ""}>
          📳
        </span>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-secondary)" }}>
          {isScanning ? "Listening..." : "Idle"}
        </span>
      </div>

      {/* NFC Support Warning */}
      {!isSupported && (
        <div className="glass-card" style={{ maxWidth: "350px", border: "1px solid rgba(198, 40, 40, 0.2)", backgroundColor: "var(--color-red-bg)", margin: "0 0 24px 0" }}>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--color-red)", textAlign: "center", fontWeight: "700" }}>
            ⚠️ {t("nfcNotSupported")}
          </p>
        </div>
      )}

      {nfcError && isSupported && (
        <div style={{ color: "var(--color-red)", textAlign: "center", marginBottom: "20px", fontSize: "14px", padding: "0 24px", fontWeight: "700" }}>
          ⚠️ {nfcError}
        </div>
      )}

      {/* NFC Desktop Simulator (Essential Sandbox Utility) */}
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "350px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "var(--color-surface)",
          borderColor: "var(--color-border)"
        }}
      >
        <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: "700", textTransform: "uppercase" }}>
          💻 NFC Card Simulator (Testing)
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={mockUidInput}
            onChange={(e) => setMockUidInput(e.target.value)}
            placeholder="Mock UID (e.g. 685586)"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "2px solid var(--color-border)",
              background: "var(--color-card)",
              color: "var(--color-text-primary)",
              fontSize: "14px",
              fontFamily: "monospace",
              outline: "none"
            }}
          />
          <button
            onClick={handleMockTap}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "var(--color-primary)",
              color: "white",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Mock Tap
          </button>
        </div>
      </div>
    </div>
  );
}

export default NFCReader;

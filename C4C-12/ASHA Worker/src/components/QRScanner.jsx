/**
 * GraamSehat ASHA Worker App - QR Code Scanner Component
 * Path: /src/components/QRScanner.jsx
 * HTML5 camera viewfinder overlay wrapper to capture health card UIDs.
 */

import React, { useEffect } from "react";
import { useQR } from "../hooks/useQR";
import { useLanguage } from "../context/LanguageContext";

/**
 * QR viewfinder component.
 * @param {object} props - onUidRead (function), onClose (function)
 */
export function QRScanner({ onUidRead, onClose }) {
  const { t } = useLanguage();
  const { isScanning, qrError, startQRScan, stopQRScan } = useQR();

  const readerElementId = "graamsehat-qr-reader";

  useEffect(() => {
    // Start camera stream on mount
    startQRScan(readerElementId, (decodedText) => {
      onUidRead(decodedText);
    });

    // Cleanup camera stream on unmount
    return () => {
      stopQRScan();
    };
  }, []);

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

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "800", color: "var(--color-primary)" }}>
          {t("qrTitle")}
        </h3>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--color-text-secondary)" }}>
          {t("qrDesc")}
        </p>
      </div>

      {/* QR Camera Viewport Frame */}
      <div
        style={{
          width: "100%",
          maxWidth: "300px",
          height: "300px",
          borderRadius: "16px",
          overflow: "hidden",
          border: "2px solid var(--color-primary-light)",
          backgroundColor: "#000",
          position: "relative",
          boxShadow: "0 0 30px rgba(13, 148, 136, 0.4)"
        }}
      >
        <div id={readerElementId} style={{ width: "100%", height: "100%" }} />
        
        {/* Scanning Target Box Overlays */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "200px",
            height: "200px",
            border: "2px dashed rgba(255, 255, 255, 0.5)",
            borderRadius: "8px",
            pointerEvents: "none"
          }}
        />
      </div>

      {qrError && (
        <div style={{ marginTop: "20px", color: "var(--color-red)", textAlign: "center", fontSize: "14px" }}>
          ⚠️ {qrError}
        </div>
      )}

      {isScanning && (
        <div style={{ marginTop: "24px", color: "var(--color-primary-light)", fontSize: "14px", fontWeight: "600" }}>
          Camera Active... Align code inside frame
        </div>
      )}
    </div>
  );
}

export default QRScanner;

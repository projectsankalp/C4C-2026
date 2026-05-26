/**
 * GraamSehat ASHA Worker App - Sync Status Banner
 * Path: /src/components/SyncBanner.jsx
 * Orange warning banner for offline status and green pop-up toast on successful uploads.
 */

import React from "react";
import { useSync } from "../hooks/useSync";
import { useLanguage } from "../context/LanguageContext";

export function SyncBanner() {
  const { isOffline, pendingCount, showSuccessToast, lastSyncCount } = useSync();
  const { t } = useLanguage();

  if (isOffline) {
    return (
      <div className="sync-banner" id="sync-banner-offline">
        <span>⚠️</span>
        <span>
          {t("offline")} — {t("pendingSyncCount", { count: pendingCount })}
        </span>
      </div>
    );
  }

  if (showSuccessToast && lastSyncCount > 0) {
    return (
      <div
        className="sync-banner"
        id="sync-banner-success"
        style={{
          backgroundColor: "var(--color-green)",
          color: "white",
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
          position: "fixed",
          top: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          borderRadius: "8px",
          padding: "10px 20px",
          width: "calc(100% - 48px)",
          maxWidth: "450px"
        }}
      >
        <span>✓</span>
        <span>
          {t("syncSuccess", { count: lastSyncCount })}
        </span>
      </div>
    );
  }

  return null;
}

export default SyncBanner;

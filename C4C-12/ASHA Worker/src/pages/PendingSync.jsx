/**
 * GraamSehat ASHA Worker App - Pending Sync Queue Page
 * Path: /src/pages/PendingSync.jsx
 * Displays a diagnostic view of unsynced local database records,
 * and allows triggering manual uploads when online.
 */

import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useLanguage } from "../context/LanguageContext";
import { useSync } from "../hooks/useSync";
import { db } from "../db/localDB";
import { formatUID } from "../utils/uidGenerator";

export function PendingSync() {
  const { t } = useLanguage();
  const { isOffline, syncing, pendingCount, triggerSync } = useSync();

  // Fetch the full syncQueue from Dexie
  const syncQueueList = useLiveQuery(async () => {
    try {
      return await db.syncQueue.orderBy("addedAt").toArray();
    } catch (err) {
      console.error("Failed to query syncQueue", err);
      return [];
    }
  }, [], []);

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ textAlign: "center", margin: "16px 0 8px 0" }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800" }}>
          Unsynced Records
        </h2>
      </div>

      {/* Manual Sync Trigger Card */}
      <div className="glass-card text-center" style={{ margin: 0, padding: "20px" }}>
        <span style={{ fontSize: "36px" }}>📡</span>
        <h3 style={{ margin: "10px 0 4px 0", fontSize: "18px" }}>
          {pendingCount} Records Pending
        </h3>
        <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "var(--color-text-gray)" }}>
          {isOffline
            ? "Reconnect to the internet to upload these records."
            : "Internet connection active. Click below to upload pending records and refresh your patient registry."}
        </p>
        <button
          onClick={triggerSync}
          disabled={isOffline || syncing}
          className="btn-primary"
        >
          {syncing ? "Synchronising..." : "Sync & Refresh Registry"}
        </button>
      </div>

      {/* Sync Queue List details */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "var(--color-text-gray)" }}>
          Queue Diagnostics Log
        </h4>

        {syncQueueList.length > 0 ? (
          syncQueueList.map((item) => {
            const date = new Date(item.addedAt).toLocaleTimeString();
            const payload = item.data;
            return (
              <div
                key={item.id}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  fontSize: "13px"
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span
                    style={{
                      fontWeight: "700",
                      color: "var(--color-primary-light)",
                      textTransform: "uppercase",
                      fontSize: "12px"
                    }}
                  >
                    📂 {item.table} ({item.operation})
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-gray)" }}>
                    Added: {date}
                  </span>
                </div>

                {/* Details row */}
                <div style={{ color: "var(--color-text-primary)", marginBottom: "6px" }}>
                  {item.table === "patients" && (
                    <span>Patient: <strong>{payload.name}</strong> (ID: {formatUID(payload.uid)})</span>
                  )}
                  {item.table === "screenings" && (
                    <span>Screening IDRS: <strong>{payload.idrsScore}</strong> (Risk: {payload.overallRisk}) for Patient: {formatUID(payload.uid)}</span>
                  )}
                  {item.table === "medicines" && (
                    <span>Meds: <strong>{payload.medicineName}</strong> (Qty: {payload.quantity}) for Patient: {formatUID(payload.uid)}</span>
                  )}
                </div>

                {/* Attempts details */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--color-text-gray)" }}>
                  <span>Queue ID: #{item.id}</span>
                  <span style={{ color: item.attempts > 3 ? "var(--color-red)" : "var(--color-text-gray)", fontWeight: "600" }}>
                    Sync Attempts: {item.attempts}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-card text-center" style={{ padding: "30px 16px" }}>
            <span style={{ fontSize: "28px" }}>✓</span>
            <p style={{ margin: "12px 0 0 0", color: "var(--color-text-gray)", fontSize: "13px" }}>
              All records synchronized! No pending updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingSync;

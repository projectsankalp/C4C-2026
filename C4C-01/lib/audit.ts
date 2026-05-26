"use client";

export interface AuditEntry {
  id: string;
  ts: number;
  endpoint: string;
  ok: boolean;
  status?: number;
  latency_ms: number;
  request_id?: string;
  model_versions?: Record<string, string>;
  hallucination_passed?: boolean;
  hallucination_blocked?: string[];
  error?: string;
}

const KEY = "pulsepoint.audit.v1";
const MAX = 200;

function isBrowser() {
  return typeof window !== "undefined";
}

export function readAuditLog(): AuditEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEntry[];
  } catch {
    return [];
  }
}

export function clearAuditLog() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("pulsepoint:audit-changed"));
}

export function logAuditEntry(partial: Omit<AuditEntry, "id" | "ts">) {
  if (!isBrowser()) return;
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    ...partial,
  };
  const list = readAuditLog();
  list.unshift(entry);
  while (list.length > MAX) list.pop();
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("pulsepoint:audit-changed"));
}

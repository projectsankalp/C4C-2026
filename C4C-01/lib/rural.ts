"use client";

import { useEffect, useState } from "react";

const KEY = "pulsepoint.ruralmode.v1";
const EVT = "pulsepoint:rural-changed";

type RuralReason = "manual" | "auto-2g" | "auto-savedata" | "off";

export interface RuralState {
  on: boolean;
  reason: RuralReason;
  effectiveType?: string;
}

function read(): { manual: boolean | null } {
  if (typeof window === "undefined") return { manual: null };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { manual: null };
    return JSON.parse(raw) as { manual: boolean | null };
  } catch {
    return { manual: null };
  }
}

function write(manual: boolean | null) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify({ manual }));
  window.dispatchEvent(new Event(EVT));
}

function detectNetwork(): { effectiveType?: string; saveData?: boolean } {
  if (typeof navigator === "undefined") return {};
  const c = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } })
    .connection;
  return {
    effectiveType: c?.effectiveType,
    saveData: c?.saveData,
  };
}

export function useRuralMode(): RuralState & {
  setManual: (v: boolean | null) => void;
} {
  const [state, setState] = useState<RuralState>({ on: false, reason: "off" });

  useEffect(() => {
    function compute() {
      const { manual } = read();
      const net = detectNetwork();
      if (manual === true) {
        setState({ on: true, reason: "manual", effectiveType: net.effectiveType });
        return;
      }
      if (manual === false) {
        setState({ on: false, reason: "off", effectiveType: net.effectiveType });
        return;
      }
      if (net.saveData) {
        setState({
          on: true,
          reason: "auto-savedata",
          effectiveType: net.effectiveType,
        });
        return;
      }
      if (net.effectiveType === "slow-2g" || net.effectiveType === "2g") {
        setState({ on: true, reason: "auto-2g", effectiveType: net.effectiveType });
        return;
      }
      setState({ on: false, reason: "off", effectiveType: net.effectiveType });
    }
    compute();
    const onChange = () => compute();
    window.addEventListener(EVT, onChange);
    const c = (navigator as unknown as { connection?: { addEventListener?: (n: string, f: () => void) => void; removeEventListener?: (n: string, f: () => void) => void } })
      .connection;
    c?.addEventListener?.("change", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      c?.removeEventListener?.("change", onChange);
    };
  }, []);

  return {
    ...state,
    setManual: (v) => write(v),
  };
}

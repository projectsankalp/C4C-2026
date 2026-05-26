import type { SeverityTier } from "./types";

/** Covers live API tiers (LOW, MODERATE, URGENT, EMERGENCY) plus legacy DB
 *  values (MEDIUM, HIGH) so old stored records still render gracefully. */
export const SEVERITY_META: Record<
  SeverityTier | "MEDIUM" | "HIGH",
  { label: string; bg: string; ring: string; text: string; tagline: string }
> = {
  LOW: {
    label: "Low",
    bg: "bg-green-50",
    ring: "ring-green-300",
    text: "text-green-800",
    tagline: "Self-care reasonable. Monitor and follow up if it worsens.",
  },
  MODERATE: {
    label: "Moderate",
    bg: "bg-yellow-50",
    ring: "ring-yellow-300",
    text: "text-yellow-800",
    tagline: "Book a clinic visit within 24–48 hours.",
  },
  // Legacy values — kept so old DB records still display correctly
  MEDIUM: {
    label: "Moderate",
    bg: "bg-yellow-50",
    ring: "ring-yellow-300",
    text: "text-yellow-800",
    tagline: "Book a clinic visit within 24–48 hours.",
  },
  HIGH: {
    label: "Moderate",
    bg: "bg-orange-50",
    ring: "ring-orange-300",
    text: "text-orange-800",
    tagline: "See a doctor today.",
  },
  URGENT: {
    label: "Urgent",
    bg: "bg-red-50",
    ring: "ring-red-400",
    text: "text-red-800",
    tagline: "Go to the nearest hospital now.",
  },
  EMERGENCY: {
    label: "Emergency",
    bg: "bg-red-100",
    ring: "ring-red-700",
    text: "text-red-900",
    tagline: "Call 108 immediately.",
  },
};


export function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleString();
}

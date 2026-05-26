import type { PatientProfile, SeverityTier } from "./types";

export interface RiskBreakdown {
  lab_trends: number;
  triage_history: number;
  vitals_pattern: number;
  medication_adherence: number;
  condition_flags: number;
}

export interface TrendPoint {
  label: string;
  unit: string;
  values: number[];
  goodIsHigh?: boolean;
}

export interface LinkedPatient {
  id: string;
  name: string;
  relation: string;
  location: string;
  permission?: "VIEW_ONLY" | "TRIAGE" | "FULL";
  profile: PatientProfile;
  last_severity?: SeverityTier;
  last_seen_iso?: string;
  health_score: number;
  risk_breakdown?: RiskBreakdown;
  trends?: TrendPoint[];
  reports_count?: number;
  latest_report?: {
    id: string;
    kind: "PDF" | "VOICE";
    created_at: string;
    symptoms: string[];
  } | null;
}

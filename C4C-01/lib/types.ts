export type Gender = "male" | "female" | "other";
/** Aligned to live HF Space API — MODERATE replaces the old MEDIUM/HIGH tiers */
export type SeverityTier = "LOW" | "MODERATE" | "URGENT" | "EMERGENCY";
export type AnswerType = "yes_no" | "free_text" | "choice";
export type LabStatus = "low" | "normal" | "high" | "critical";

export interface Vitals {
  spo2?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  blood_sugar_mg_dl?: number | null;
  pulse_bpm?: number | null;
  temp_c?: number | null;
  respiratory_rate?: number | null;
  waist_size_inches?: number | null;
}

export interface PatientProfile {
  age: number;
  gender: Gender;
  known_conditions?: string[];
  medications?: string[];
  allergies?: string[];
}

export interface AnsweredQuestion {
  question: string;
  answer: string;
}

export interface Source {
  id: string;
  title: string;
  url: string;
}

export interface FeatureImportance {
  feature: string;
  shap: number;
}

export interface TopCondition {
  name: string;
  icd10: string;
  prob: number;
}

export interface HallucinationCheck {
  blocked: string[];
  passed: boolean;
}

export interface TriageAssessRequest {
  patient_id: string;
  symptoms: string[];
  vitals?: Vitals;
  patient_profile: PatientProfile;
  language?: string;
}

export interface TriageAssessResponse {
  request_id: string;
  severity: SeverityTier;
  tier_probabilities: Record<string, number>;
  rules_fired: string[];
  top_conditions: TopCondition[];
  reasoning_steps: string[];
  red_flags: string[];
  doctor_briefing: string;
  feature_importance: FeatureImportance[];
  sources: Source[];
  confidence: number;
  hallucination_check: HallucinationCheck;
  next_action: string;
  model_versions: Record<string, string>;
}

export interface InterviewerRequest {
  symptoms: string[];
  answered?: AnsweredQuestion[];
  patient_profile: PatientProfile;
  relay_mode?: boolean;
}

export interface InterviewerResponse {
  request_id: string;
  question: string;
  rationale: string;
  expected_answer_type: AnswerType;
  model_version: string;
}

export interface DiseasePredictRequest {
  symptoms: string[];
  age: number;
  gender: Gender;
  top_k?: number;
}

export interface DiseasePrediction {
  icd10: string;
  name: string;
  prob: number;
  top_features: FeatureImportance[];
}

export interface DiseasePredictResponse {
  request_id: string;
  predictions: DiseasePrediction[];
  model_version: string;
}

export interface LabAnalyzeRequest {
  ocr_text: string;
  age: number;
  gender: Gender;
}

export interface LabFlag {
  name: string;
  canonical: string;
  value: number;
  unit: string;
  range_low: number | null;
  range_high: number | null;
  status: LabStatus;
  explanation?: string | null;
}

export interface LabAnalyzeResponse {
  request_id: string;
  flags: LabFlag[];
  unflagged_count: number;
  hallucination_check: HallucinationCheck;
}

export interface ConditionCardRequest {
  icd10: string;
  name?: string | null;
  language?: string;
  reading_level?: "grade6" | "layman" | "professional";
}

export interface ConditionCardResponse {
  request_id: string;
  name: string;
  plain_summary: string;
  action_steps: string[];
  sources: Source[];
  unsupported: boolean;
}

export interface TranslationRequest {
  text: string;
  target_language: string;
}

export interface TranslationResponse {
  translated_text?: string;
  [k: string]: unknown;
}

export interface MedReachRequest {
  patient_data: Record<string, unknown>;
  triage_history: Record<string, unknown>[];
}

export interface MedReachResponse {
  request_id?: string;
  summary?: string;
  chief_complaint?: string;
  recommended_specialty?: string;
  urgency?: string;
  [k: string]: unknown;
}

export interface HealthCheckResponse {
  status?: string;
  [k: string]: unknown;
}

export interface CareLocatorRequest {
  icd10_codes: string[];
  severity_tier: SeverityTier;
  patient_lat: number;
  patient_lon: number;
  radius_km?: number | null;
  max_results?: number | null;
}

export interface DoctorMatch {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  phone: string;
  lat: number;
  lon: number;
  available_today: boolean;
  rating: number;
  languages: string[];
  fee_inr: number | null;
  distance_km: number;
  score: number;
  relevance_tier: number;
  score_breakdown: Record<string, number>;
}

export interface CareLocatorResponse {
  request_id: string;
  required_specialties: string[];
  severity_tier: SeverityTier;
  sort_policy: "distance" | "score";
  radius_km: number;
  doctors: DoctorMatch[];
  total_found: number;
  total_in_catalog: number;
  model_version: string;
}

// ─── New endpoint: POST /api/v1/predict/symptoms-from-text ───────────────────

export interface SymptomsFromTextRequest {
  text: string;
}

export interface SymptomMatch {
  canonical: string;
  phrase: string;
  negated: boolean;
  sentence: string;
}

export interface SymptomsFromTextResponse {
  request_id: string;
  /** Positively identified symptoms */
  symptoms: string[];
  /** Symptoms explicitly denied by the patient */
  negated: string[];
  matches: SymptomMatch[];
}

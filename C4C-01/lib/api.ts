import type {
  CareLocatorRequest,
  CareLocatorResponse,
  ConditionCardRequest,
  ConditionCardResponse,
  DiseasePredictRequest,
  DiseasePredictResponse,
  HealthCheckResponse,
  InterviewerRequest,
  InterviewerResponse,
  LabAnalyzeRequest,
  LabAnalyzeResponse,
  MedReachRequest,
  MedReachResponse,
  SymptomsFromTextRequest,
  SymptomsFromTextResponse,
  TranslationRequest,
  TranslationResponse,
  TriageAssessRequest,
  TriageAssessResponse,
} from "./types";
import type { AuditEntry } from "./audit";

async function logAudit(partial: Omit<AuditEntry, "id" | "ts">) {
  if (typeof window !== "undefined") {
    try {
      const { logAuditEntry } = await import("./audit");
      logAuditEntry(partial);
    } catch (e) {
      console.error("Failed to log audit entry client-side:", e);
    }
  }
}

export const API_BASE =
  process.env.NEXT_PUBLIC_PULSEPOINT_API?.replace(/\/$/, "") ||
  "https://aviraltrip-pulsepoint-ai.hf.space";

class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function postJSON<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const t0 = performance.now();
  if (typeof window !== "undefined") {
    console.log(`[PulsePoint] → POST ${path}`, body);
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error(`[PulsePoint] network error on ${path}`, e);
    logAudit({
      endpoint: path,
      ok: false,
      latency_ms: Math.round(performance.now() - t0),
      error: e instanceof Error ? e.message : "network error",
    });
    throw e;
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  const latency = Math.round(performance.now() - t0);

  if (typeof window !== "undefined") {
    console.log(`[PulsePoint] ← ${res.status} ${path} (${latency}ms)`, data);
  }

  if (!res.ok) {
    const bodySummary =
      typeof data === "object" && data !== null
        ? (() => {
            const o = data as Record<string, unknown>;
            if (typeof o.detail === "string") return o.detail;
            if (Array.isArray(o.detail))
              return o.detail
                .map((d) =>
                  typeof d === "object" && d && "msg" in d
                    ? `${(d as { loc?: unknown }).loc ? JSON.stringify((d as { loc: unknown }).loc) + ": " : ""}${(d as { msg: string }).msg}`
                    : JSON.stringify(d),
                )
                .join("; ");
            return JSON.stringify(o).slice(0, 400);
          })()
        : String(data ?? "").slice(0, 400);
    logAudit({
      endpoint: path,
      ok: false,
      latency_ms: latency,
      status: res.status,
      error: bodySummary,
    });
    throw new ApiError(
      res.status,
      data,
      `${res.status} ${res.statusText || "Server error"} — ${bodySummary || "(empty body)"}`,
    );
  }

  const obj = (data ?? {}) as Record<string, unknown>;
  logAudit({
    endpoint: path,
    ok: true,
    latency_ms: latency,
    status: res.status,
    request_id: typeof obj.request_id === "string" ? obj.request_id : undefined,
    model_versions:
      (obj.model_versions as Record<string, string> | undefined) ??
      (typeof obj.model_version === "string"
        ? { primary: obj.model_version as string }
        : undefined),
    hallucination_passed:
      typeof obj.hallucination_check === "object" && obj.hallucination_check
        ? (obj.hallucination_check as { passed?: boolean }).passed
        : undefined,
    hallucination_blocked:
      typeof obj.hallucination_check === "object" && obj.hallucination_check
        ? (obj.hallucination_check as { blocked?: string[] }).blocked
        : undefined,
  });

  return data as TRes;
}

async function getJSON<TRes>(path: string): Promise<TRes> {
  const t0 = performance.now();
  if (typeof window !== "undefined") {
    console.log(`[PulsePoint] → GET ${path}`);
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method: "GET" });
  } catch (e) {
    logAudit({
      endpoint: path,
      ok: false,
      latency_ms: Math.round(performance.now() - t0),
      error: e instanceof Error ? e.message : "network error",
    });
    throw e;
  }
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  const latency = Math.round(performance.now() - t0);
  logAudit({
    endpoint: path,
    ok: res.ok,
    latency_ms: latency,
    status: res.status,
  });
  if (!res.ok) {
    throw new ApiError(res.status, data, `${res.status} ${res.statusText}`);
  }
  return data as TRes;
}

export const api = {
  health: () => getJSON<HealthCheckResponse>("/"),
  triageAssess: (b: TriageAssessRequest) =>
    postJSON<TriageAssessRequest, TriageAssessResponse>("/api/v1/triage/assess", b),
  triageInterview: (b: InterviewerRequest) =>
    postJSON<InterviewerRequest, InterviewerResponse>("/api/v1/triage/interview", b),
  predictDisease: (b: DiseasePredictRequest) =>
    postJSON<DiseasePredictRequest, DiseasePredictResponse>("/api/v1/predict/disease", b),
  analyzeLabs: (b: LabAnalyzeRequest) =>
    postJSON<LabAnalyzeRequest, LabAnalyzeResponse>("/api/v1/predict/labs", b),
  conditionCard: (b: ConditionCardRequest) =>
    postJSON<ConditionCardRequest, ConditionCardResponse>(
      "/api/v1/predict/condition-card",
      b,
    ),
  summarize: (b: MedReachRequest) =>
    postJSON<MedReachRequest, MedReachResponse>("/api/v1/connect/summarize", b),
  translate: (b: TranslationRequest) =>
    postJSON<TranslationRequest, TranslationResponse>("/api/v1/connect/translate", b),
  careLocator: (b: CareLocatorRequest) =>
    postJSON<CareLocatorRequest, CareLocatorResponse>(
      "/api/v1/connect/care-locator",
      b,
    ),
  /** New: extract symptoms + negations from free-form patient text */
  symptomsFromText: (b: SymptomsFromTextRequest) =>
    postJSON<SymptomsFromTextRequest, SymptomsFromTextResponse>(
      "/api/v1/predict/symptoms-from-text",
      b,
    ),
};

export { ApiError };

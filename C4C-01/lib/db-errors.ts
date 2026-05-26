import { NextResponse } from "next/server";

export function isDbColdStart(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /P1001|P1017|connect ECONNREFUSED|reach database/i.test(msg);
}

export function dbErrorResponse(err: unknown, fallbackPrefix = "Request failed"): NextResponse {
  const msg = err instanceof Error ? err.message : "unknown error";
  if (isDbColdStart(err)) {
    return NextResponse.json(
      {
        error:
          "Database is waking up (Neon free-tier cold-start). Try again in 5–10 seconds.",
      },
      { status: 503 },
    );
  }
  return NextResponse.json(
    { error: `${fallbackPrefix}: ${msg}` },
    { status: 500 },
  );
}

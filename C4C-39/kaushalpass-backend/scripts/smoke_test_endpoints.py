#!/usr/bin/env python3
"""Smoke-test all API endpoints against a running server."""

from __future__ import annotations

import io
import json
import sys
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from jose import jwt

from app.config import get_settings

BASE = "http://127.0.0.1:8000"


def make_token(sub: str, secret: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "aud": "authenticated",
        "role": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=1)).timestamp()),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def main() -> int:
    settings = get_settings()
    if not settings.SUPABASE_URL:
        print("ERROR: .env not loaded (SUPABASE_URL empty). Save kaushalpass-backend/.env and restart uvicorn.")
        return 2
    test_user = str(uuid.uuid4())
    token = make_token(test_user, settings.SUPABASE_JWT_SECRET)
    auth = {"Authorization": f"Bearer {token}"}

    rows: list[tuple[str, int | str, str, str]] = []
    skill_id: str | None = None
    passport_id: str | None = None
    doc_id: str | None = None
    job_id: str | None = None
    assessment_id: str | None = None

    def record(name: str, r: httpx.Response, note: str = "") -> None:
        status = "OK" if r.is_success or r.status_code in (401, 404, 422) else "FAIL"
        if r.status_code >= 500:
            status = "FAIL"
        rows.append((name, r.status_code, status, note or r.text[:120].replace("\n", " ")))

    with httpx.Client(base_url=BASE, timeout=60.0) as c:
        # --- Public ---
        r = c.get("/health")
        record("GET /health", r, json.loads(r.text).get("status", ""))

        fake_passport = str(uuid.uuid4())
        r = c.get(f"/api/v1/verify/{fake_passport}")
        record("GET /verify/{id} (missing)", r)

        r = c.get("/api/v1/auth/me")
        record("GET /auth/me (no token)", r, "expect 401")

        # --- Auth + profile ---
        r = c.get("/api/v1/auth/me", headers=auth)
        record("GET /auth/me", r)

        r = c.post(
            "/api/v1/auth/profile",
            headers=auth,
            json={
                "full_name": "Smoke Test User",
                "preferred_language": "hi-IN",
                "phone": "+919999999999",
            },
        )
        record("POST /auth/profile", r)
        if r.is_success:
            passport_id = r.json().get("passport_id")

        r = c.get("/api/v1/auth/me", headers=auth)
        record("GET /auth/me (after profile)", r)

        # --- Passport ---
        r = c.get("/api/v1/passport/me", headers=auth)
        record("GET /passport/me", r)
        if r.is_success:
            passport_id = r.json().get("id")
            skills = r.json().get("skills") or []
            if skills:
                skill_id = skills[0]["id"]

        r = c.post(
            "/api/v1/passport/skills",
            headers=auth,
            json={
                "skill_name": "Welding",
                "skill_level": "intermediate",
                "nsqf_level": 4,
                "confidence_score": 0.75,
            },
        )
        record("POST /passport/skills", r)
        if r.is_success:
            skill_id = r.json().get("id")

        if skill_id:
            r = c.put(
                f"/api/v1/passport/skills/{skill_id}",
                headers=auth,
                json={"skill_level": "expert"},
            )
            record("PUT /passport/skills/{id}", r)

        # --- Verifier ---
        r = c.get("/api/v1/verifier/queue", headers=auth)
        record("GET /verifier/queue", r)

        # --- Certificate ---
        r = c.post("/api/v1/certificate/generate", headers=auth)
        record("POST /certificate/generate", r)
        if r.is_success:
            job_id = r.json().get("job_id")

        if job_id:
            r = c.get(f"/api/v1/certificate/status/{job_id}", headers=auth)
            record("GET /certificate/status/{job_id}", r)

        # --- Documents (tiny PNG) ---
        png = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00"
            b"\x01\x01\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        r = c.post(
            "/api/v1/documents/upload",
            headers=auth,
            files={"file": ("test.png", io.BytesIO(png), "image/png")},
        )
        record("POST /documents/upload", r)
        if r.is_success:
            doc_id = r.json().get("id")

        if doc_id:
            r = c.get(f"/api/v1/documents/{doc_id}/url", headers=auth)
            record("GET /documents/{id}/url", r)

        # --- Voice (minimal webm header bytes — may fail at STT) ---
        r = c.post(
            "/api/v1/voice/assess",
            headers=auth,
            data={"language_code": "hi-IN"},
            files={"audio": ("test.webm", io.BytesIO(b"\x1a\x45\xdf\xa3"), "audio/webm")},
        )
        record("POST /voice/assess", r, "SSE or error expected")

        if passport_id:
            r = c.get(f"/api/v1/verify/{passport_id}", headers=auth)
            record("GET /verify/{id} (real passport)", r)

        if skill_id:
            r = c.delete(f"/api/v1/passport/skills/{skill_id}", headers=auth)
            record("DELETE /passport/skills/{id}", r)

    print(f"\nSmoke test user: {test_user}\n")
    print(f"{'Endpoint':<42} {'Code':>5} {'Result':<6} Notes")
    print("-" * 90)
    fails = 0
    for name, code, status, note in rows:
        if status == "FAIL":
            fails += 1
        print(f"{name:<42} {str(code):>5} {status:<6} {note}")

    print(f"\nTotal: {len(rows)}, Failures (5xx/unexpected): {fails}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())

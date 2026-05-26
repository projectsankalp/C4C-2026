"""Scheme advisor service — wraps the scheme-advisor scraper + Groq AI matcher."""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any

import httpx

from app.config import Settings, get_settings

# ---------------------------------------------------------------------------
# Path setup — allow importing from the sibling scheme-advisor package
# ---------------------------------------------------------------------------
_SCHEME_ADVISOR_DIR = Path(__file__).resolve().parents[3] / "scheme-advisor"
if str(_SCHEME_ADVISOR_DIR) not in sys.path:
    sys.path.insert(0, str(_SCHEME_ADVISOR_DIR))

# MyScheme.gov.in API (same as scheme_scraper.py)
_MYSCHEME_API = "https://api.myscheme.gov.in/search/v5/schemes"
_MYSCHEME_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.myscheme.gov.in",
    "Referer": "https://www.myscheme.gov.in/",
    "x-api-key": "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc",
}

_COLORS = [
    {"color": "#FF6B35", "gradient": ["#FF6B35", "#F7931E"]},
    {"color": "#2E8B57", "gradient": ["#2E8B57", "#3CB371"]},
    {"color": "#4A90E2", "gradient": ["#4A90E2", "#5DADE2"]},
    {"color": "#E91E63", "gradient": ["#E91E63", "#F06292"]},
    {"color": "#9C27B0", "gradient": ["#9C27B0", "#BA68C8"]},
    {"color": "#F44336", "gradient": ["#F44336", "#EF5350"]},
    {"color": "#FF9800", "gradient": ["#FF9800", "#FFB74D"]},
    {"color": "#00BCD4", "gradient": ["#00BCD4", "#4DD0E1"]},
]

_ICON_MAP = {
    "agriculture": "🌾", "education": "🎓", "health": "🏥",
    "business": "💼", "housing": "🏠", "women": "👩",
    "social": "🤝", "skill": "🛠️", "pension": "👴",
    "scholarship": "📚", "loan": "💰", "insurance": "🛡️",
}


def _parse_raw_scheme(raw: dict, idx: int) -> dict:
    """Convert a raw MyScheme API item to our internal format."""
    fields = raw.get("fields", {})
    name = fields.get("schemeName", "Unknown Scheme")
    short_title = fields.get("schemeShortTitle", name)
    name_lower = name.lower()

    icon = next((emoji for key, emoji in _ICON_MAP.items() if key in name_lower), "📋")
    tags = fields.get("tags", [])
    keywords = [t.lower() for t in tags] if tags else []

    benefits_text = fields.get("briefDescription", "Government scheme benefits")
    if isinstance(benefits_text, list):
        benefits_text = " ".join(benefits_text)

    eligibility = fields.get("eligibilityDescription", "Check official website for details")
    if isinstance(eligibility, list):
        eligibility = " ".join(eligibility)

    slug = fields.get("slug", "")
    link = f"https://www.myscheme.gov.in/schemes/{slug}" if slug else "https://www.myscheme.gov.in"
    color_set = _COLORS[idx % len(_COLORS)]

    return {
        "id": idx,
        "name": (short_title or name)[:50],
        "full_name": name,
        "category": fields.get("level", "general").lower(),
        "tagline": fields.get("schemeShortTitle", "Government Welfare Scheme"),
        "keywords": keywords + name_lower.split()[:5],
        "benefits": (benefits_text or "")[:200],
        "eligibility": (eligibility or "")[:300],
        "description": (benefits_text or "")[:400],
        "documents": ["Aadhaar Card", "PAN Card", "Address Proof", "Bank Account"],
        "link": link,
        "color": color_set["color"],
        "gradient": color_set["gradient"],
        "icon": icon,
        "ministry": fields.get("nodalMinistryName", "Government of India"),
        "state": fields.get("state", ["All India"]),
    }


async def _fetch_schemes_from_api(query: str = "", page: int = 0, size: int = 20) -> list[dict]:
    """Async fetch from MyScheme.gov.in."""
    params = {
        "lang": "en",
        "q": json.dumps([]) if not query else json.dumps([{"identifier": "q", "value": query}]),
        "keyword": query,
        "sort": "",
        "from": page * size,
        "size": size,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(_MYSCHEME_API, headers=_MYSCHEME_HEADERS, params=params)
            if resp.status_code == 200:
                data = resp.json()
                hits = data.get("data", {}).get("hits", {}).get("items", [])
                return [_parse_raw_scheme(item, i + 1) for i, item in enumerate(hits)]
    except Exception as exc:
        print(f"[scheme_service] MyScheme fetch error: {exc}")
    return []


def _prefilter(schemes: list[dict], problem: str, top_n: int = 8) -> list[dict]:
    """Keyword pre-filter — no tokens used."""
    words = problem.lower().split()
    scored = []
    for s in schemes:
        text = (s["name"] + " " + s.get("description", "")).lower()
        score = sum(1 for w in words if w in text)
        if score > 0:
            scored.append((score, s))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [s for _, s in scored[:top_n]]


async def _ai_rank(schemes: list[dict], problem: str, settings: Settings) -> dict:
    """Call Groq to pick the best 3 scheme IDs from the pre-filtered list."""
    if not settings.GROQ_API_KEY:
        # No Groq key — fall back to top-3 keyword matches
        return {"analysis": "Top matching schemes", "ids": [s["id"] for s in schemes[:3]]}

    scheme_list = "\n".join(f"{s['id']}|{s['name']}" for s in schemes)
    prompt = (
        f'You are an expert in Indian Government Schemes.\n\n'
        f'User problem:\n"{problem}"\n\n'
        f'Schemes:\n{scheme_list}\n\n'
        f'Select the BEST 3 scheme IDs.\n\n'
        f'Respond ONLY in JSON:\n{{"analysis": "short reason", "ids": [id1, id2, id3]}}'
    )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "Return only valid JSON."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.2,
                    "max_tokens": 200,
                },
            )
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                return json.loads(content)
    except Exception as exc:
        print(f"[scheme_service] Groq error: {exc}")

    return {"analysis": "Here are some helpful schemes", "ids": [s["id"] for s in schemes[:3]]}


async def recommend_schemes(
    problem: str,
    *,
    settings: Settings | None = None,
) -> dict[str, Any]:
    """
    Main entry point.
    1. Fetch schemes from MyScheme.gov.in (async)
    2. Pre-filter by keyword
    3. AI-rank with Groq
    4. Return top 3 with full details
    """
    s = settings or get_settings()

    # Try to load from the scheme-advisor's local cache first (fast path)
    schemes: list[dict] = []
    try:
        from scheme_scraper import get_all_schemes  # type: ignore[import]
        loop = asyncio.get_running_loop()
        schemes = await loop.run_in_executor(None, get_all_schemes)
    except Exception:
        pass

    # Fall back to direct async fetch if cache unavailable
    if not schemes:
        for page in range(3):
            page_schemes = await _fetch_schemes_from_api(page=page, size=20)
            schemes.extend(page_schemes)
            if not page_schemes:
                break

    if not schemes:
        return {"analysis": "Could not load schemes at this time.", "schemes": []}

    # Pre-filter then AI rank
    filtered = _prefilter(schemes, problem)
    if not filtered:
        filtered = schemes[:8]

    ai_result = await _ai_rank(filtered, problem, s)
    selected_ids: list[int] = ai_result.get("ids", [])

    # Build id → scheme map for O(1) lookup
    id_map = {sc["id"]: sc for sc in filtered}
    matched = [id_map[sid] for sid in selected_ids if sid in id_map]

    # Fallback: if AI returned bad IDs, use top keyword matches
    if not matched:
        matched = filtered[:3]

    return {
        "analysis": ai_result.get("analysis", ""),
        "schemes": [
            {
                "id": sc["id"],
                "name": sc["name"],
                "tagline": sc.get("tagline", ""),
                "icon": sc.get("icon", "📋"),
                "benefits": sc.get("benefits", ""),
                "eligibility": sc.get("eligibility", ""),
                "description": sc.get("description", ""),
                "documents": sc.get("documents", []),
                "link": sc["link"],
                "color": sc.get("color", "#4A90E2"),
                "gradient": sc.get("gradient", ["#4A90E2", "#5DADE2"]),
                "ministry": sc.get("ministry", ""),
                "ai_reasoning": ai_result.get("analysis", ""),
            }
            for sc in matched
        ],
    }

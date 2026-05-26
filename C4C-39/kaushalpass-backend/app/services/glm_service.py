"""GLM 5.1 skill assessment via NVIDIA NIM (OpenAI-compatible SSE)."""

from __future__ import annotations

import json
import re
from collections.abc import AsyncGenerator
from pathlib import Path
from typing import Any

import httpx

from app.config import Settings, get_settings
from app.core.exceptions import ServiceError

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "assess_skill.txt"


def load_system_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def _parse_assessment_json(text: str) -> dict[str, Any]:
    """Extract JSON object from model output."""
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if fence:
        text = fence.group(1).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ServiceError("Model did not return valid JSON assessment", 502)
    try:
        parsed: dict[str, Any] = json.loads(text[start : end + 1])
    except json.JSONDecodeError as exc:
        raise ServiceError(f"Invalid assessment JSON: {exc}") from exc

    required = ("skill_name", "level", "confidence", "reasoning", "nsqf_level")
    for key in required:
        if key not in parsed:
            raise ServiceError(f"Assessment missing field: {key}", 502)

    if parsed["level"] not in ("beginner", "intermediate", "expert"):
        raise ServiceError("Invalid skill level in assessment", 502)

    parsed.setdefault("suggested_documents", [])
    parsed["confidence"] = float(parsed["confidence"])
    parsed["nsqf_level"] = int(parsed["nsqf_level"])
    return parsed


async def stream_skill_assessment(
    transcript: str,
    language_code: str,
    *,
    settings: Settings | None = None,
) -> AsyncGenerator[str, None]:
    """
    Stream GLM assessment tokens as SSE data lines.
    Caller collects full text and parses JSON at end.
    """
    s = settings or get_settings()
    system_prompt = load_system_prompt()
    user_content = f"Language code: {language_code}\n\nTranscript:\n{transcript}"

    url = f"{s.NVIDIA_API_BASE.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {s.NVIDIA_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }
    body = {
        "model": s.GLM_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.2,
        "max_tokens": 1024,
        "stream": True,
    }

    full_text: list[str] = []

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", url, headers=headers, json=body) as response:
            if response.status_code != 200:
                body_text = await response.aread()
                raise ServiceError(
                    f"GLM API error {response.status_code}: {body_text.decode()[:500]}",
                    502,
                )
            async for line in response.aiter_lines():
                if not line.startswith("data:"):
                    continue
                payload = line[5:].strip()
                if payload == "[DONE]":
                    break
                try:
                    chunk = json.loads(payload)
                except json.JSONDecodeError:
                    continue
                choices = chunk.get("choices") or []
                if not choices:
                    continue
                delta = choices[0].get("delta") or {}
                content = delta.get("content")
                if content:
                    full_text.append(content)
                    yield content

def parse_streamed_assessment(full_text: str) -> dict[str, Any]:
    return _parse_assessment_json(full_text)


def build_assess_result(
    parsed: dict[str, Any],
    transcript: str,
    tts_audio_url: str,
) -> dict[str, Any]:
    """Shape matching frontend AssessResult type."""
    return {
        "skillName": parsed["skill_name"],
        "level": parsed["level"],
        "confidence": parsed["confidence"],
        "reasoning": parsed["reasoning"],
        "nsqfLevel": parsed["nsqf_level"],
        "suggestedDocuments": parsed.get("suggested_documents", []),
        "transcribedText": transcript,
        "ttsAudioUrl": tts_audio_url,
    }

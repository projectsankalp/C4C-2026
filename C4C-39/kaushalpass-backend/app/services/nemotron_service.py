import base64
import json
import re
from io import BytesIO
from typing import Any

import cv2
import httpx
import numpy as np
from PIL import Image

from app.db.queries.users import get_settings

NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL = "nvidia/nemotron-3-nano-omni-30b"

CRAFT_ANALYSIS_PROMPT = """
Analyze these frames from a 30-second craft skill video.
Return JSON only: {
  "skill_detected": string,
  "technique_quality": 1-5,
  "hands_visible": boolean,
  "active_work": boolean,
  "fraud_signals": string[],
  "confidence": 0.0-1.0
}"""

MAX_FRAMES = 8


def _clahe_preprocess(image: Image.Image) -> Image.Image:
    rgb = np.array(image.convert("RGB"))
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)
    merged = cv2.merge((l_channel, a_channel, b_channel))
    corrected = cv2.cvtColor(merged, cv2.COLOR_LAB2RGB)
    return Image.fromarray(corrected)


def _image_to_base64_jpeg(image: Image.Image) -> str:
    processed = _clahe_preprocess(image)
    buffer = BytesIO()
    processed.save(buffer, format="JPEG", quality=85)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def _extract_frames_from_video(video_bytes: bytes, max_frames: int = MAX_FRAMES) -> list[Image.Image]:
    import tempfile
    from pathlib import Path

    frames: list[Image.Image] = []
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(video_bytes)
        tmp_path = Path(tmp.name)

    capture = cv2.VideoCapture(str(tmp_path))
    try:
        total = int(capture.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
        step = max(1, total // max_frames)
        index = 0
        while len(frames) < max_frames:
            capture.set(cv2.CAP_PROP_POS_FRAMES, index)
            ok, frame = capture.read()
            if not ok:
                break
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(Image.fromarray(rgb))
            index += step
    finally:
        capture.release()
        tmp_path.unlink(missing_ok=True)

    return frames


def _parse_json_response(content: str) -> dict[str, Any]:
    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
        cleaned = re.sub(r"\n?```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise


async def _call_nemotron(images: list[Image.Image], prompt: str) -> dict[str, Any]:
    settings = get_settings()
    if not settings["nvidia_api_key"]:
        return {
            "skill_detected": "unknown",
            "technique_quality": 3,
            "hands_visible": True,
            "active_work": True,
            "fraud_signals": [],
            "confidence": 0.5,
            "_mock": True,
        }

    content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
    for image in images[:MAX_FRAMES]:
        encoded = _image_to_base64_jpeg(image)
        content.append(
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{encoded}"},
            }
        )

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": content}],
        "temperature": 0.2,
        "max_tokens": 512,
    }
    headers = {
        "Authorization": f"Bearer {settings['nvidia_api_key']}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            settings["nvidia_api_url"] or NVIDIA_API_URL,
            json=payload,
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()

    message_content = data["choices"][0]["message"]["content"]
    if isinstance(message_content, list):
        text_parts = [p.get("text", "") for p in message_content if p.get("type") == "text"]
        message_content = "\n".join(text_parts)
    return _parse_json_response(str(message_content))


async def analyze_craft_video(video_bytes: bytes) -> dict[str, Any]:
    frames = _extract_frames_from_video(video_bytes)
    if not frames:
        raise ValueError("Could not extract frames from video")
    return await _call_nemotron(frames, CRAFT_ANALYSIS_PROMPT)


async def analyze_single_image(image_bytes: bytes) -> dict[str, Any]:
    image = Image.open(BytesIO(image_bytes))
    return await _call_nemotron([image], CRAFT_ANALYSIS_PROMPT)

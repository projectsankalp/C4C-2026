"""OpenCV CLAHE, pHash duplicate detection, video frame extraction."""

from __future__ import annotations

import base64
from io import BytesIO
from typing import TYPE_CHECKING

import cv2
import imagehash
import numpy as np
from PIL import Image

if TYPE_CHECKING:
    pass


def apply_clahe(frame: np.ndarray) -> np.ndarray:
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_eq = clahe.apply(l)
    return cv2.cvtColor(cv2.merge([l_eq, a, b]), cv2.COLOR_LAB2BGR)


def compute_phash(image_bytes: bytes) -> str:
    """Perceptual hash for duplicate media detection."""
    img = Image.open(BytesIO(image_bytes))
    return str(imagehash.phash(img))


def check_phash_duplicate(new_hash: str, existing_hashes: list[str], threshold: int = 5) -> bool:
    """Return True if new_hash is duplicate of any existing (Hamming distance <= threshold)."""
    new = imagehash.hex_to_hash(new_hash)
    for existing in existing_hashes:
        if new - imagehash.hex_to_hash(existing) <= threshold:
            return True
    return False


def extract_video_frames(
    video_bytes: bytes,
    max_frames: int = 8,
) -> list[np.ndarray]:
    """
    Extract up to max_frames evenly spaced frames from video bytes.
    Returns BGR numpy arrays (CLAHE not applied — caller should apply).
    """
    import tempfile
    from pathlib import Path

    frames: list[np.ndarray] = []
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(video_bytes)
        path = tmp.name

    try:
        cap = cv2.VideoCapture(path)
        if not cap.isOpened():
            return frames
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
        indices = np.linspace(0, max(total - 1, 0), num=min(max_frames, total), dtype=int)
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            ok, frame = cap.read()
            if ok and frame is not None:
                frames.append(frame)
        cap.release()
    finally:
        Path(path).unlink(missing_ok=True)

    return frames


def frame_to_base64_jpeg(frame: np.ndarray, quality: int = 85) -> str:
    """CLAHE-preprocessed frame as base64 JPEG for Nemotron (Person 2)."""
    enhanced = apply_clahe(frame)
    ok, buf = cv2.imencode(
        ".jpg",
        enhanced,
        [int(cv2.IMWRITE_JPEG_QUALITY), quality],
    )
    if not ok:
        raise ValueError("Failed to encode frame")
    return base64.b64encode(buf.tobytes()).decode("ascii")

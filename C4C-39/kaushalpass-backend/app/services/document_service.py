import hashlib
import io
from pathlib import Path
from uuid import UUID, uuid4

import imagehash
from PIL import Image, ExifTags

from fastapi import HTTPException, status

from app.db.queries import documents as documents_queries
from app.db.queries.users import get_settings, get_supabase_admin
from app.services import nemotron_service

VIDEO_TYPES = {"video/webm", "video/mp4", "video/quicktime"}
IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


def compute_phash(file_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(file_bytes))
    return str(imagehash.phash(image))


def compute_content_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()


def extract_exif_metadata(file_bytes: bytes) -> dict:
    try:
        image = Image.open(io.BytesIO(file_bytes))
        raw_exif = image._getexif() or {}
        decoded: dict = {}
        for tag_id, value in raw_exif.items():
            tag = ExifTags.TAGS.get(tag_id, tag_id)
            if isinstance(value, bytes):
                try:
                    value = value.decode("utf-8", errors="ignore")
                except Exception:
                    value = str(value)
            decoded[str(tag)] = value
        return decoded
    except Exception:
        return {}


async def upload_to_storage(
    bucket: str,
    storage_path: str,
    file_bytes: bytes,
    content_type: str,
) -> str:
    client = get_supabase_admin()
    client.storage.from_(bucket).upload(
        storage_path,
        file_bytes,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return storage_path


async def get_signed_url(bucket: str, storage_path: str, expires_in: int = 3600) -> str:
    client = get_supabase_admin()
    signed = client.storage.from_(bucket).create_signed_url(storage_path, expires_in)
    return signed["signedURL"]


async def process_and_upload_document(
    user_id: UUID,
    file_bytes: bytes,
    content_type: str,
    *,
    skill_id: UUID | None = None,
    filename: str | None = None,
) -> dict:
    settings = get_settings()
    existing_phashes = await documents_queries.get_phashes_for_user(user_id)
    content_hash = compute_content_hash(file_bytes)
    content_marker = f"sha256:{content_hash}"
    if any(p and content_marker in p for p in existing_phashes):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate media already uploaded")

    phash: str | None = None
    nemotron_analysis: dict | None = None
    exif_data: dict = {}

    if content_type in IMAGE_TYPES:
        phash = compute_phash(file_bytes)
        if phash in existing_phashes:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate media already uploaded")
        exif_data = extract_exif_metadata(file_bytes)
        nemotron_analysis = await nemotron_service.analyze_single_image(file_bytes)
    elif content_type in VIDEO_TYPES:
        phash = f"{content_marker}:video"
        nemotron_analysis = await nemotron_service.analyze_craft_video(file_bytes)
        if nemotron_analysis.get("hands_visible") is False:
            fraud = list(nemotron_analysis.get("fraud_signals") or [])
            if "no hands visible" not in fraud:
                fraud.append("no hands visible")
            nemotron_analysis["fraud_signals"] = fraud
    else:
        raise ValueError(f"Unsupported file type: {content_type}")

    if nemotron_analysis is not None:
        nemotron_analysis["exif"] = exif_data

    ext = Path(filename or "upload.bin").suffix or ".bin"
    doc_id = uuid4()
    storage_path = f"{user_id}/{doc_id}{ext}"

    await upload_to_storage(
        settings["storage_bucket_documents"],
        storage_path,
        file_bytes,
        content_type,
    )

    document = await documents_queries.insert_document(
        user_id,
        storage_path=storage_path,
        file_type=content_type,
        file_size_bytes=len(file_bytes),
        phash=phash,
        nemotron_analysis=nemotron_analysis,
        skill_id=skill_id,
    )
    return document

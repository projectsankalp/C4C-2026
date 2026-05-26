from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class NemotronAnalysis(BaseModel):
    skill_detected: str | None = None
    technique_quality: int | None = None
    hands_visible: bool | None = None
    active_work: bool | None = None
    fraud_signals: list[str] = []
    confidence: float | None = None


class DocumentUploadResponse(BaseModel):
    id: UUID
    storage_path: str
    file_type: str
    file_size_bytes: int | None
    phash: str | None
    nemotron_analysis: NemotronAnalysis | dict
    created_at: datetime | None = None

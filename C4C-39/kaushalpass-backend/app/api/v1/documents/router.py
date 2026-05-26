from uuid import UUID

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.api.v1.documents.schemas import DocumentUploadResponse
from app.api.v1.auth.router import CurrentUserId
from app.services import document_service
from app.db.queries import documents as documents_queries
from app.api.deps import get_settings_dep
from fastapi import Depends
from app.config import Settings

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentUrlResponse(BaseModel):
    document_id: str
    signed_url: str


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    user_id: CurrentUserId,
    file: UploadFile = File(...),
    skill_id: UUID | None = Form(default=None),
) -> DocumentUploadResponse:
    content_type = file.content_type or "application/octet-stream"
    file_bytes = await file.read()
    try:
        document = await document_service.process_and_upload_document(
            user_id,
            file_bytes,
            content_type,
            skill_id=skill_id,
            filename=file.filename,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return DocumentUploadResponse(
        id=UUID(document["id"]),
        storage_path=document["storage_path"],
        file_type=document["file_type"],
        file_size_bytes=document.get("file_size_bytes"),
        phash=document.get("phash"),
        nemotron_analysis=document.get("nemotron_analysis") or {},
        created_at=document.get("created_at"),
    )


@router.get("/{document_id}/url", response_model=DocumentUrlResponse)
async def get_document_url(
    document_id: UUID,
    user_id: CurrentUserId,
    settings: Settings = Depends(get_settings_dep),
) -> DocumentUrlResponse:
    document = await documents_queries.get_document_by_id(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if document["user_id"] != str(user_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    signed_url = await document_service.get_signed_url(
        settings.STORAGE_BUCKET_DOCUMENTS,
        document["storage_path"],
    )
    return DocumentUrlResponse(document_id=str(document_id), signed_url=signed_url)

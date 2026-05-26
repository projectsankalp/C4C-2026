from fastapi import APIRouter

from app.api.v1.certificate.schemas import (
    CertificateGenerateResponse,
    CertificateStatusResponse,
)
from fastapi import HTTPException

from app.api.v1.auth.router import CurrentUserId
from app.services import certificate_service

router = APIRouter(prefix="/certificate", tags=["certificate"])


@router.post("/generate", response_model=CertificateGenerateResponse)
async def generate_certificate(user_id: CurrentUserId) -> CertificateGenerateResponse:
    result = await certificate_service.generate_certificate(user_id)
    return CertificateGenerateResponse(**result)


@router.get("/status/{job_id}", response_model=CertificateStatusResponse)
async def certificate_status(job_id: str) -> CertificateStatusResponse:
    status = certificate_service.get_certificate_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Certificate job not found")
    return CertificateStatusResponse(**status)

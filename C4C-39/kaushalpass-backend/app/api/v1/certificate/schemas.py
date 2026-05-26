from pydantic import BaseModel


class CertificateGenerateResponse(BaseModel):
    job_id: str
    status: str
    download_url: str
    passport_code: str


class CertificateStatusResponse(BaseModel):
    job_id: str
    status: str
    download_url: str | None = None
    passport_id: str | None = None

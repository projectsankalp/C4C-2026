from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.dependencies import get_db
from src.models import Certificate, User, Submission
from src.schemas import CertificateResponse

router = APIRouter(prefix="/api/public", tags=["public"])

@router.get("/verify/{cert_code}")
def verify_certificate(cert_code: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.certCode == cert_code).first()
    if not cert:
        # Try by hash
        cert = db.query(Certificate).filter(Certificate.hash == cert_code).first()
    
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    user = db.query(User).filter(User.id == cert.userId).first()
    submission = db.query(Submission).filter(Submission.id == cert.submissionId).first()
    
    return {
        "status": "valid",
        "certificate": {
            "code": cert.certCode,
            "hash": cert.hash,
            "issuedAt": cert.issuedAt,
            "skillScore": cert.skillScore,
            "professionalismScore": cert.professionalismScore
        },
        "artisan": {
            "phone": user.phone,
            "trade": submission.trade
        }
    }

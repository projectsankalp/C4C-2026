from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import hashlib
import uuid

from src.dependencies import get_current_validator, get_db
from src.schemas import AdminLoginRequest, Token, SubmissionResponse
from src.models import Submission, Certificate, User, Validator
from src.core.config import settings
from src.core.security import create_access_token, verify_password

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/login", response_model=Token)
def admin_login(login_data: AdminLoginRequest, db: Session = Depends(get_db)):
    # Check if it's super admin
    if login_data.username == settings.ADMIN_USERNAME and login_data.password == settings.ADMIN_PASSWORD:
        access_token = create_access_token(data={"id": "admin", "role": "admin"})
        return {"access_token": access_token, "token_type": "bearer"}
    
    # Check if it's a validator
    validator = db.query(Validator).filter(Validator.email == login_data.username).first()
    if validator and verify_password(login_data.password, validator.passwordHash):
        access_token = create_access_token(data={"id": str(validator.id), "role": "validator"})
        return {"access_token": access_token, "token_type": "bearer"}

    raise HTTPException(status_code=401, detail="Incorrect username or password")

@router.get("/submissions/pending", response_model=List[SubmissionResponse])
def get_pending_submissions(
    db: Session = Depends(get_db), 
    current_validator: dict = Depends(get_current_validator)
):
    submissions = db.query(Submission).filter(Submission.status == "pending").all()
    results = []
    for sub in submissions:
        user = db.query(User).filter(User.id == sub.userId).first()
        sub_dict = {
            "id": sub.id,
            "userId": sub.userId,
            "trade": sub.trade,
            "mediaUrl": sub.mediaUrl,
            "transcript": sub.transcript,
            "aiScore": sub.aiScore,
            "status": sub.status,
            "createdAt": sub.createdAt,
            "phone": user.phone if user else "Unknown"
        }
        results.append(sub_dict)
    return results

@router.post("/submissions/{id}/approve")
def approve_submission(
    id: uuid.UUID, 
    skillScore: float,
    professionalismScore: float,
    db: Session = Depends(get_db), 
    current_validator: dict = Depends(get_current_validator)
):
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.status = "approved"
    
    # Generate Certificate
    cert_code = f"CERT-{str(uuid.uuid4())[:8].upper()}"
    payload = f"{submission.id}-{submission.transcript}-{cert_code}"
    cert_hash = hashlib.sha3_256(payload.encode()).hexdigest()
    
    certificate = Certificate(
        userId=submission.userId,
        submissionId=submission.id,
        certCode=cert_code,
        hash=cert_hash,
        skillScore=skillScore,
        professionalismScore=professionalismScore
    )
    db.add(certificate)
    
    # Update user's trade status to certified
    user = db.query(User).filter(User.id == submission.userId).first()
    if user:
        user.trade = f"certified_{submission.trade}"
    
    db.commit()
    
    return {"message": "Submission approved and certificate issued", "certificate_id": str(certificate.id)}

@router.post("/submissions/{id}/reject")
def reject_submission(
    id: uuid.UUID, 
    db: Session = Depends(get_db), 
    current_validator: dict = Depends(get_current_validator)
):
    submission = db.query(Submission).filter(Submission.id == id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.status = "rejected"
    db.commit()
    return {"message": "Submission rejected"}

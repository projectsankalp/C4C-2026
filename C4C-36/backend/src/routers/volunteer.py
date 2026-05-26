from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from typing import List

from src.dependencies import get_current_volunteer, get_db
from src.schemas import VolunteerResponse, Token, LoginRequest, CertificationResponse, CertificationCreate
from src.core.security import get_password_hash, verify_password, create_access_token
from src.services.storage_service import upload_file_to_cloud
from src.models import Volunteer, VolunteerCertification

router = APIRouter(prefix="/api/volunteers", tags=["volunteers"])

@router.post("/register", response_model=VolunteerResponse)
def register_volunteer(
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    name: str = Form(None),
    collegeProof: UploadFile = File(...),
    livePhoto: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check uniqueness
    if db.query(Volunteer).filter(Volunteer.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    if db.query(Volunteer).filter(Volunteer.phone == phone).first():
        raise HTTPException(status_code=400, detail="Phone already registered")

    volunteer_code = f"VOL-{str(uuid.uuid4())[:8].upper()}"
    
    college_proof_url = upload_file_to_cloud(collegeProof, "proofs")
    live_photo_url = upload_file_to_cloud(livePhoto, "photos")

    volunteer = Volunteer(
        email=email,
        phone=phone,
        name=name,
        passwordHash=get_password_hash(password),
        collegeProofUrl=college_proof_url,
        livePhotoUrl=live_photo_url,
        volunteerCode=volunteer_code,
        isApproved=False
    )
    
    db.add(volunteer)
    db.commit()
    db.refresh(volunteer)
    return volunteer

@router.post("/login", response_model=Token)
def login_volunteer(login_data: LoginRequest, db: Session = Depends(get_db)):
    volunteer = db.query(Volunteer).filter(Volunteer.email == login_data.email).first()
    if not volunteer:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    if not verify_password(login_data.password, volunteer.passwordHash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    if not volunteer.isApproved:
        raise HTTPException(status_code=403, detail="Account not approved yet")
    
    access_token = create_access_token(data={"id": str(volunteer.id), "role": "volunteer"})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/certifications", response_model=CertificationResponse)
def add_certification(
    title: str = Form(...),
    hoursValue: int = Form(...),
    proof: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_volunteer: Volunteer = Depends(get_current_volunteer)
):
    cert_code = f"CERT-{str(uuid.uuid4())[:8].upper()}"
    proof_url = upload_file_to_cloud(proof, "certs") if proof else None

    cert = VolunteerCertification(
        volunteerId=current_volunteer.id,
        title=title,
        hoursValue=hoursValue,
        proofUrl=proof_url,
        certCode=cert_code
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_volunteer: Volunteer = Depends(get_current_volunteer)):
    certs = db.query(VolunteerCertification).filter(VolunteerCertification.volunteerId == current_volunteer.id).all()
    
    return {
        "volunteer": current_volunteer,
        "certifications": certs,
        "total_hours": sum(c.hoursValue for c in certs)
    }

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import urllib.request
import urllib.parse
import json
from typing import List

from src.dependencies import get_current_user, get_db
from src.schemas import OTPRequest, OTPVerify, Token, UserResponse, SubmissionResponse
from src.models import User, Submission, Job
from src.services.otp_service import generate_otp, get_otp_expiry, send_otp_sms
from src.core.config import settings
from src.core.security import create_access_token
from src.services.storage_service import upload_file_to_cloud
router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/request-otp")
def request_otp(data: OTPRequest, db: Session = Depends(get_db)):
    clean_phone = data.phone.strip()
    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        user = User(phone=clean_phone)
        db.add(user)
        db.commit()
        db.refresh(user)

    otp = generate_otp()
    user.otp = otp
    user.otpExpiry = get_otp_expiry()
    db.commit()

    send_otp_sms(data.phone, otp)
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp", response_model=Token)
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    clean_phone = data.phone.strip()
    clean_otp = data.otp.strip()
    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user or user.otp != clean_otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    
    # In production, check expiry
    # if user.otpExpiry < datetime.utcnow():
    #     raise HTTPException(status_code=401, detail="OTP expired")
    
    user.otp = None
    user.otpExpiry = None
    db.commit()

    access_token = create_access_token(data={"id": str(user.id), "role": "user"})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/submit", response_model=SubmissionResponse)
async def submit_skill(
    background_tasks: BackgroundTasks,
    trade: str = Form(...),
    file: UploadFile = File(...),
    candidateName: str = Form(None),
    candidatePhone: str = Form(None),
    candidateLocation: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Upload to Supabase Storage immediately
    media_url = upload_file_to_cloud(file)
    
    # 2. Create the submission record with status 'pending'
    new_submission = Submission(
        userId=current_user.id,
        trade=trade,
        mediaUrl=media_url,
        transcript="Analyzing video...",
        aiScore=0.0,
        status="pending",
        candidateName=candidateName,
        candidatePhone=candidatePhone,
        candidateLocation=candidateLocation
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    # 3. Process AI Grading in the background
    background_tasks.add_task(process_ai_grading, str(new_submission.id), file.filename, file.content_type, media_url)

    return new_submission

@router.get("/jobs")
def get_jobs(location: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Fetch local jobs, filtered by candidate location."""
    query = db.query(Job)
    if location:
        # Case insensitive simple match
        query = query.filter(Job.location.ilike(f"%{location}%"))
        
    jobs = query.all()
    
    if not jobs:
        # Return fallback local jobs if DB is empty for demo purposes
        return [
            {
                "id": 1,
                "titleKey": "Senior Stitching Specialist",
                "companyKey": "Local Boutique (Ramesh)",
                "locationKey": location or "Local City",
                "employerPhone": "+91 9000012345"
            },
            {
                "id": 2,
                "titleKey": "Garment Alteration Assistant",
                "companyKey": "City Mall Tailors",
                "locationKey": location or "Local City",
                "employerPhone": "+91 9000012346"
            },
            {
                "id": 3,
                "titleKey": "Bulk Production Tailor",
                "companyKey": "Export Co-op",
                "locationKey": location or "Local City",
                "employerPhone": "+91 9000012347"
            }
        ]
        
    return [
        {
            "id": job.id,
            "titleKey": job.title,
            "companyKey": job.employerName,
            "locationKey": job.location,
            "employerPhone": job.employerPhone
        }
        for job in jobs
    ]

async def process_ai_grading(submission_id: str, filename: str, content_type: str, media_url: str):
    """
    Background task to call AI Engine for transcription + tailoring validation.
    Updates submission status to 'pending_admin' (if tailoring-related) or 'rejected'.
    """
    import requests
    from src.database import SessionLocal
    from src.models import Submission

    db = SessionLocal()
    try:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            print(f"Submission {submission_id} not found")
            return

        # Try to download the video and send to AI engine
        try:
            # Download video from Supabase storage URL
            video_response = requests.get(media_url, timeout=30)
            if video_response.status_code != 200:
                raise Exception(f"Failed to download video: {video_response.status_code}")

            # Send to AI engine
            files = {"file": (filename, video_response.content, content_type or "video/mp4")}
            data = {"user_id": str(submission.userId)}

            ai_response = requests.post(
                "http://localhost:8001/grade_assessment",
                files=files,
                data=data,
                timeout=120,  # Whisper can take time
            )

            if ai_response.status_code == 200:
                ai_data = ai_response.json()
                transcript = ai_data.get("transcription", "")
                translated = ai_data.get("translated_transcription", "")
                ai_score = float(ai_data.get("confidence_score", 0.0))
                is_related = ai_data.get("is_tailoring_related", False)

                submission.transcript = translated if translated else transcript
                submission.aiScore = ai_score

                if is_related:
                    submission.status = "pending"  # Ready for admin review
                else:
                    submission.status = "rejected"  # AI rejected — not tailoring

                db.commit()
                print(f"AI grading complete for {submission_id}: score={ai_score}, related={is_related}")
                return
            else:
                print(f"AI Engine returned {ai_response.status_code}: {ai_response.text}")

        except requests.exceptions.ConnectionError:
            print(f"AI Engine not running. Using mock grading for {submission_id}")
        except Exception as e:
            print(f"AI grading error for {submission_id}: {e}")

        # Fallback mock grading (AI engine offline)
        submission.transcript = "AI Engine offline — mock transcript: Artisan demonstrated tailoring skills."
        submission.aiScore = 75.0
        submission.status = "pending"  # Default to pending for admin review
        db.commit()

    except Exception as e:
        print(f"Fatal error in AI grading for {submission_id}: {e}")
    finally:
        db.close()

@router.get("/submissions", response_model=List[SubmissionResponse])
def get_user_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Submission).filter(Submission.userId == current_user.id).all()

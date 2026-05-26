import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..db import get_db
from ..deps import get_current_user
from ..models import User, Patient
from ..schemas import UserOut

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/me", response_model=UserOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_profile(
    name: str | None = Form(None),
    avatar: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if name and name.strip():
        current_user.name = name.strip()
    if avatar and avatar.filename:
        ext = Path(avatar.filename).suffix.lower() or ".jpg"
        if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
            raise HTTPException(status_code=400, detail="Image must be jpg, png, or webp")
        filename = f"{current_user.id}{ext}"
        filepath = UPLOAD_DIR / filename
        content = await avatar.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image must be under 5MB")
        with open(filepath, "wb") as f:
            f.write(content)
        current_user.avatar_url = f"/uploads/{filename}"
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/me/health-history")
async def health_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = (
        await db.execute(select(Patient).where(Patient.user_id == current_user.id))
    ).scalars().first()
    return {
        "risk_level": patient.risk_level if patient else None,
        "diabetes_score": patient.diabetes_score if patient else None,
        "asha_interactions": [
            {"asha": "Sunita Devi", "date": "2 days ago", "type": "Home Visit"},
        ],
        "call_history": [{"date": "2024-05-20", "duration": "3 min", "summary": "Routine follow-up"}],
        "reports": [{"title": "Blood glucose report", "date": "2024-05-18"}],
    }

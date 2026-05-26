from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..db import get_db
from ..deps import get_current_user
from ..models import User, Doctor, Patient

router = APIRouter()


@router.get("/user/me")
async def get_user_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("USER", "ADMIN"):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="User dashboard only")

    doc_count = len((await db.execute(select(Doctor))).scalars().all())
    patient = (
        await db.execute(select(Patient).where(Patient.user_id == current_user.id))
    ).scalars().first()

    has_analysis = patient is not None and patient.diabetes_score is not None
    risk = {
        "has_analysis": has_analysis,
        "level": patient.risk_level if has_analysis else None,
        "score": int(patient.diabetes_score) if has_analysis else None,
        "last_checked": "Vitals analysis" if has_analysis else None,
    }

    return {
        "status": "success",
        "data": {
            "upcoming_appointments": [
                {"id": 1, "doctor": "Dr. Sharma", "date": "Tomorrow, 10:00 AM", "type": "Checkup"},
                {"id": 2, "doctor": "Dr. Gupta", "date": "Next Monday, 2:30 PM", "type": "Follow-up"},
            ],
            "diabetes_risk_status": risk,
            "nearby_doctors": doc_count or 3,
            "recent_asha_interactions": [
                {"id": 1, "asha": "Sunita Devi", "date": "2 days ago", "type": "Home Visit"},
                {"id": 2, "asha": "Priya Devi", "date": "1 week ago", "type": "Phone Call"},
            ],
        },
    }


@router.get("/asha/me")
async def get_asha_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role != "ASHA":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="ASHA dashboard only")

    from .patients import MOCK_PATIENTS

    recent_call = {
        "patient_name": "Rajesh Kumar",
        "duration": "4 min 32 sec",
        "timestamp": "Today, 10:15 AM",
        "key_concerns": "Hypoglycemia risk, irregular meals",
        "follow_up": "Schedule home visit within 48 hours",
    }

    return {
        "status": "success",
        "data": {
            "asha_name": current_user.name,
            "village": current_user.village or "Kalyanpur Village",
            "total_patients": 142,
            "calls_completed": 128,
            "home_visits": 28,
            "pending_followups": 6,
            "attendance_stats": {"present": 22, "absent": 2, "total_days_this_month": 24},
            "patients": MOCK_PATIENTS,
            "recent_calls": [recent_call],
        },
    }


@router.get("/user/{user_id}")
async def get_user_dashboard_legacy(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return await get_user_dashboard(db=db, current_user=user)


@router.get("/asha/{user_id}")
async def get_asha_dashboard_legacy(user_id: str, current_user: User = Depends(get_current_user)):
    return await get_asha_dashboard(current_user=current_user)

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..db import get_db
from ..deps import get_current_user
from ..models import Doctor, User

router = APIRouter()


@router.get("/")
async def list_doctors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Doctor))
    doctors = result.scalars().all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "specialization": d.specialization,
            "qualification": d.qualification or "MBBS",
            "location": "New Delhi, India",
            "location_lat": d.location_lat,
            "location_lng": d.location_lng,
            "availability": d.availability,
            "timings": "9:00 AM – 5:00 PM",
            "contact": "+91 98765 43210",
            "languages": d.languages or ["Hindi", "English"],
            "rating": d.rating or 4.5,
            "experience": d.experience or 5,
        }
        for d in doctors
    ]

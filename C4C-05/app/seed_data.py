from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .models import Doctor


DOCTORS = [
    {
        "name": "Dr. Ananya Sharma",
        "specialization": "Cardiologist",
        "qualification": "MBBS, MD",
        "location_lat": 28.6139,
        "location_lng": 77.2090,
        "availability": True,
        "rating": 4.8,
        "experience": 12,
        "languages": ["Hindi", "English"],
    },
    {
        "name": "Dr. Rajesh Verma",
        "specialization": "General Physician",
        "qualification": "MBBS",
        "location_lat": 28.6200,
        "location_lng": 77.2200,
        "availability": True,
        "rating": 4.5,
        "experience": 8,
        "languages": ["Hindi"],
    },
    {
        "name": "Dr. Meena Singh",
        "specialization": "Diabetologist",
        "qualification": "MBBS, DM",
        "location_lat": 28.6050,
        "location_lng": 77.1950,
        "availability": False,
        "rating": 4.9,
        "experience": 15,
        "languages": ["Hindi", "English", "Punjabi"],
    },
]


async def seed_doctors(db: AsyncSession) -> None:
    result = await db.execute(select(Doctor))
    if result.scalars().first():
        return
    for doc in DOCTORS:
        db.add(Doctor(**doc))
    await db.commit()

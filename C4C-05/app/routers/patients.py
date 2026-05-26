from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from ..db import get_db
from ..deps import get_current_user
from ..models import Patient, User

router = APIRouter()

class PatientEntry(BaseModel):
    name: str
    age: int
    gender: str
    glucose: float
    bp_sys: float
    bp_dia: float
    village: str
    door_no: str
    visit_date: str
    temperature: float
    heart_rate: float
    spo2: float
    weight: float
    height: float
    symptoms: str


MOCK_PATIENTS = [
    {
        "id": "p1",
        "name": "Rajesh Kumar",
        "village": "Kalyanpur",
        "risk_status": "High Risk",
        "last_interaction": "Oct 24, 2023",
        "call_count": 12,
        "visit_count": 4,
        "condition": "Elevated glucose",
    },
    {
        "id": "p2",
        "name": "Meena Singh",
        "village": "Kalyanpur",
        "risk_status": "Normal",
        "last_interaction": "Oct 26, 2023",
        "call_count": 5,
        "visit_count": 2,
        "condition": "Stable",
    },
    {
        "id": "p3",
        "name": "Amit Yadav",
        "village": "Rampur",
        "risk_status": "Moderate",
        "last_interaction": "Oct 25, 2023",
        "call_count": 8,
        "visit_count": 3,
        "condition": "Hypertension monitoring",
    },
]


@router.get("/")
async def list_patients(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "ASHA":
        result = await db.execute(select(Patient).where(Patient.user_id == current_user.id))
        patient = result.scalars().first()
        if patient:
            return [
                {
                    "id": patient.id,
                    "name": current_user.name,
                    "village": current_user.village or "—",
                    "risk_status": patient.risk_level or "Low Risk",
                    "last_interaction": "Today",
                    "call_count": 0,
                    "visit_count": 0,
                    "condition": "Your health profile",
                }
            ]
        return []
    return MOCK_PATIENTS


@router.post("/analyze")
async def add_and_analyze_patient(
    entry: PatientEntry, current_user: User = Depends(get_current_user)
):
    # Analyze the data
    risk_score = 0
    if entry.glucose > 140:
        risk_score += 40
    elif entry.glucose > 100:
        risk_score += 20
        
    if entry.bp_sys > 130 or entry.bp_dia > 85:
        risk_score += 20
    elif entry.bp_sys > 120:
        risk_score += 10
        
    bmi = round(entry.weight / ((entry.height / 100) ** 2), 1) if entry.height else 0
    if bmi > 30:
        risk_score += 15
    elif bmi > 25:
        risk_score += 8
        
    if entry.age > 45:
        risk_score += 10

    if risk_score > 50:
        risk_level = "High Risk"
    elif risk_score > 25:
        risk_level = "Moderate"
    else:
        risk_level = "Normal"

    new_patient = {
        "id": f"p{len(MOCK_PATIENTS) + 1}",
        "name": entry.name,
        "village": entry.village,
        "risk_status": risk_level,
        "last_interaction": entry.visit_date,
        "call_count": 0,
        "visit_count": 1,
        "condition": entry.symptoms or "New checkup",
    }
    
    MOCK_PATIENTS.insert(0, new_patient)
    return {"status": "success", "data": new_patient, "risk_score": risk_score}



@router.get("/{patient_id}")
async def get_patient(patient_id: str, current_user: User = Depends(get_current_user)):
    patient = next((p for p in MOCK_PATIENTS if p["id"] == patient_id), MOCK_PATIENTS[0])
    return {
        **patient,
        "personal": {"phone": "+91 90000 00001", "age": 45, "gender": "Male"},
        "health": {"glucose": 142, "bp": "130/85", "diabetes_score": 18},
        "reports": [{"title": "Diabetes screening", "date": "2024-05-20"}],
        "calls": [
            {
                "duration": "4:32",
                "timestamp": "Today, 10:15 AM",
                "summary": "Patient reported dizziness.",
                "key_concerns": "Low blood sugar symptoms",
                "follow_up": "Home visit within 48 hours",
            }
        ],
        "visits": [{"date": "2024-05-18", "notes": "Routine checkup completed"}],
    }

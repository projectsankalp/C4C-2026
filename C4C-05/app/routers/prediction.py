from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..db import get_db
from ..deps import get_current_user
from ..models import User, Patient

router = APIRouter()


class PredictionRequest(BaseModel):
    name: Optional[str] = None
    age: int = 30
    gender: str = "other"
    blood_group: Optional[str] = None
    weight: float = 0
    height: float = 170
    bp: float = 0
    glucose: float = 0
    family_history: bool = False
    smoking: bool = False
    activity: str = "moderate"


class PredictionResponse(BaseModel):
    score: str
    risk_percentage: int
    level: str
    desc: str
    recommendations: list[str] = []
    lifestyle_suggestions: list[str] = []
    health_stats: dict = {}


def _compute_risk(request: PredictionRequest) -> tuple[int, dict]:
    factors = {"glucose": 0, "blood_pressure": 0, "bmi": 0, "age": 0, "lifestyle": 0, "family_history": 0}
    risk_score = 0

    if request.glucose > 140:
        risk_score += 40
        factors["glucose"] = 40
    elif request.glucose > 100:
        risk_score += 20
        factors["glucose"] = 20

    if request.bp > 130:
        risk_score += 20
        factors["blood_pressure"] = 20
    elif request.bp > 120:
        risk_score += 10
        factors["blood_pressure"] = 10

    bmi = round(request.weight / ((request.height / 100) ** 2), 1) if request.height else 0
    if bmi > 30:
        risk_score += 15
        factors["bmi"] = 15
    elif bmi > 25:
        risk_score += 8
        factors["bmi"] = 8

    if request.age > 45:
        risk_score += 10
        factors["age"] = 10

    if request.family_history:
        risk_score += 15
        factors["family_history"] = 15

    if request.smoking:
        risk_score += 10
        factors["lifestyle"] += 10

    if request.activity in ("low", "sedentary"):
        risk_score += 10
        factors["lifestyle"] += 10

    risk_score = min(risk_score, 95)

    bmi_label = "Underweight" if bmi and bmi < 18.5 else "Normal" if bmi and bmi < 25 else "Overweight" if bmi and bmi < 30 else "Obese" if bmi else "—"
    glucose_label = "High" if request.glucose > 140 else "Elevated" if request.glucose > 100 else "Normal" if request.glucose else "—"
    bp_label = "High" if request.bp > 130 else "Elevated" if request.bp > 120 else "Normal" if request.bp else "—"

    stats = {
        "bmi": bmi,
        "bmi_category": bmi_label,
        "glucose": request.glucose,
        "glucose_status": glucose_label,
        "bp": request.bp,
        "bp_status": bp_label,
        "age": request.age,
        "risk_factors": factors,
    }
    return risk_score, stats


async def _save_patient_risk(db: AsyncSession, user_id: str, score: int, level: str) -> None:
    result = await db.execute(select(Patient).where(Patient.user_id == user_id))
    patient = result.scalars().first()
    if patient:
        patient.diabetes_score = float(score)
        patient.risk_level = level
        await db.commit()


@router.post("/", response_model=PredictionResponse)
async def predict_diabetes(
    request: PredictionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    risk_score, stats = _compute_risk(request)

    lifestyle = [
        "Maintain a balanced diet rich in vegetables and whole grains",
        "Stay physically active at least 30 minutes per day",
        "Get 7–8 hours of sleep nightly",
        "Limit sugary drinks and processed snacks",
    ]

    if risk_score > 50:
        level = "High Risk"
        response = PredictionResponse(
            score=f"{risk_score}%",
            risk_percentage=risk_score,
            level=level,
            desc="Your metrics indicate a high risk of diabetes. Please consult a doctor immediately and monitor your health closely.",
            recommendations=[
                "Monitor blood glucose daily",
                "Schedule a doctor consultation within 1 week",
                "Request ASHA worker home visit",
                "Reduce refined carbohydrate intake",
            ],
            lifestyle_suggestions=lifestyle[:3] + ["Avoid smoking and alcohol completely"],
            health_stats=stats,
        )
    elif risk_score > 25:
        level = "Medium Risk"
        response = PredictionResponse(
            score=f"{risk_score}%",
            risk_percentage=risk_score,
            level=level,
            desc="Based on your metrics, you are at moderate diabetes risk. Lifestyle changes can significantly lower your risk.",
            recommendations=[
                "Follow a low-sugar, high-fiber diet",
                "Walk at least 5,000 steps daily",
                "Recheck vitals in 30 days",
                "Track blood pressure weekly",
            ],
            lifestyle_suggestions=lifestyle,
            health_stats=stats,
        )
    else:
        level = "Low Risk"
        response = PredictionResponse(
            score=f"{risk_score}%",
            risk_percentage=risk_score,
            level=level,
            desc="Your metrics look healthy. Continue your current lifestyle and get screened annually.",
            recommendations=[
                "Maintain current healthy habits",
                "Annual diabetes screening recommended",
                "Keep hydrated and active",
            ],
            lifestyle_suggestions=lifestyle,
            health_stats=stats,
        )

    await _save_patient_risk(db, current_user.id, risk_score, level)
    return response

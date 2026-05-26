from fastapi import APIRouter
from apps.ai.services import AIService

router = APIRouter()

@router.get("/predict")

async def predict(

    city: str,

    district: str,

    state: str

):

    return AIService.predict(
        city,
        district,
        state
    )
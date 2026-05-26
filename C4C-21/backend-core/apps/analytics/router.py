from fastapi import APIRouter

router = APIRouter()

@router.get("/summary")
async def get_summary():
    return {"total_units": 100, "alert_zones": 5}

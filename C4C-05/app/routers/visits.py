from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def visits_root():
    return {"router": "visits", "status": "ok"}

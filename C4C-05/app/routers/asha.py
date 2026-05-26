from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def asha_root():
    return {"router": "asha", "status": "ok"}

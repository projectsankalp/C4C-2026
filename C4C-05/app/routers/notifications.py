from fastapi import APIRouter, Depends
from datetime import datetime

from ..deps import get_current_user
from ..models import User

router = APIRouter()


@router.get("/")
async def list_notifications(current_user: User = Depends(get_current_user)):
    return [
        {
            "id": "n1",
            "type": "appointment",
            "message": "Upcoming checkup with Dr. Sharma tomorrow at 10 AM",
            "read_status": False,
            "timestamp": datetime.utcnow().isoformat(),
        },
        {
            "id": "n2",
            "type": "health",
            "message": "Your diabetes risk analysis is ready to view",
            "read_status": False,
            "timestamp": datetime.utcnow().isoformat(),
        },
    ]

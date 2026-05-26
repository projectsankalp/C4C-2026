from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..models import User

router = APIRouter()


@router.get("/")
async def list_calls(current_user: User = Depends(get_current_user)):
    return [
        {
            "id": "c1",
            "patient_name": "Rajesh Kumar",
            "duration": "4 min 32 sec",
            "timestamp": "Today, 10:15 AM",
            "summary": "Patient reported dizziness after skipping breakfast.",
            "key_concerns": "Hypoglycemia risk, irregular meals",
            "follow_up": "Schedule home visit within 48 hours",
            "recording_url": None,
        },
        {
            "id": "c2",
            "patient_name": "Meena Singh",
            "duration": "2 min 10 sec",
            "timestamp": "Yesterday, 4:00 PM",
            "summary": "Follow-up on blood pressure medication.",
            "key_concerns": "Mild headache",
            "follow_up": "Continue current medication",
            "recording_url": None,
        },
    ]

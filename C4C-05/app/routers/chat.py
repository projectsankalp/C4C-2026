from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..deps import get_current_user
from ..models import User

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, current_user: User = Depends(get_current_user)):
    message = request.message.lower()
    response_text = "I'm a prototype AI. I received your message."
    
    if "symptom" in message or "diabetes" in message:
        response_text = "Common symptoms of diabetes include frequent urination, increased thirst, and unexplained weight loss. Please consult a doctor for proper diagnosis."
    elif "reduce" in message or "sugar" in message:
        response_text = "To reduce blood sugar naturally, exercise regularly, manage your carb intake, eat more fiber, and stay hydrated."
    elif "doctor" in message:
        response_text = "You can find nearby available doctors on the dashboard map."
        
    return {"response": response_text}

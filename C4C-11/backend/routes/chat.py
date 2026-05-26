from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.chat_service import get_chat_response

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Convert history objects to dicts
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        system_prompt = (
            "You are a helpful assistant for ToxCore, a platform that analyzes YouTube comments for toxicity. "
            "Help the user understand toxicity results, how to handle cyberbullying, or provide general guidance."
        )
        
        # Inject system prompt into history if it's the first message, or we can just append it to the current message internally if needed.
        # But Gemini 1.5 allows system instructions. For simplicity, if history is empty, we just prepend it.
        # It's better to just include context if needed, but we'll stick to a simple chat for now.
        
        reply = get_chat_response(request.message, history=history_dicts)
        return ChatResponse(response=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found in .env")

# Basic model setup
try:
    model = genai.GenerativeModel('gemini-2.5-flash')
except Exception:
    model = None

def get_chat_response(message: str, history: list = None) -> str:
    """
    history format expected: [{"role": "user"|"model", "parts": "message"}]
    """
    if not GEMINI_API_KEY or not model:
        return "Chat functionality is currently unavailable (API key missing or invalid)."

    try:
        if history:
            # Format history for Gemini
            formatted_history = []
            for msg in history:
                role = msg.get("role", "user")
                if role == "assistant":
                    role = "model"
                formatted_history.append({"role": role, "parts": [msg.get("content", "")]})
            
            chat = model.start_chat(history=formatted_history)
            response = chat.send_message(message)
        else:
            response = model.generate_content(message)
            
        return response.text
    except Exception as e:
        return f"Error connecting to AI: {str(e)}"

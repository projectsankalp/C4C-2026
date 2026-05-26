from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="MindMitra API",
    description="Backend API for MindMitra Mental Health Access Platform",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to MindMitra API"}

from pydantic import BaseModel
from database import get_db

class ChatRequest(BaseModel):
    message: str
    language: str
    user_id: str
    session_id: str

class AssessmentResult(BaseModel):
    score: int

class ContactRequest(BaseModel):
    user_id: str
    name: str
    phone: str

class SOSRequest(BaseModel):
    user_id: str
    user_name: str = "A user"
    location: dict
    message: str

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

import os
from dotenv import load_dotenv
from groq import AsyncGroq

# Load environment variables
load_dotenv()

# Initialize Groq client
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

from fastapi.responses import StreamingResponse

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    db = get_db()
    
    # Log the user message to history via Supabase
    try:
        db.table("interactions").insert({"type": f"chat_user:{request.session_id}", "content": request.message, "user_id": request.user_id}).execute()
    except Exception as e:
        print("Failed to log interaction to Supabase:", e)
    
    # Construct a system prompt to guide the LLM's behavior and language
    system_prompt = f"""SYSTEM INSTRUCTION: EMOTIONAL QUOTIENT (EQ) DIGITAL TWIN ENGINE

ROLE & OBJECTIVE:
You are the conversational interface of a Digital Twin system designed to solve the mental health access deficit. Your core task is to run a real-time behavioral and emotional simulation of the user based on their input. You must NEVER give generalized, robotic, list-heavy, or clinical answers. You must adapt your conversational architecture entirely to the user's current Emotional Quotient (EQ) state.

STEP 1: SIMULATE THE PATIENT'S STATE (INTERNAL DIGITAL TWIN PROCESSING)
Before generating any response, analyze the user's text for:
- Tone & Sentiment: (e.g., Panic, apathy, deep sadness, frustration, guardedness)
- Cognitive Load: Is the user overwhelmed? (Keep responses under 3 sentences if high)
- Access Barrier: What emotional deficit is stopping them from getting help? (Stigma, fear of system, financial despair, lack of energy)

STEP 2: ENFORCE CONVERSATIONAL CONSTRAINTS
- NO GENERALIZED LISTS: Do not provide standard definitions or 5-step coping mechanisms unless explicitly asked.
- TONAL ALIGNMENT: Match the user's energy but anchor it with calm stability. Use deep empathy, not superficial pity.
- DISCRETE PACING: Provide only ONE actionable, bite-sized thought or comforting reflection at a time to avoid overwhelming the user.
- CRISIS PROTOCOL: If the simulated state indicates high risk/crisis, bypass standard dialogue, utilize a warm, human-centric de-escalation tone, and seamlessly provide direct human help lines.

EXAMPLE PAIRS:
User: "I tried calling the clinic and the waitlist is 6 months. What's the point? Everything is broken."
Bad Answer: "I am sorry to hear that. Here are 3 things you can do: 1. Try an app, 2. Exercise..."
Good Answer: "Six months feels like an incredibly heavy door to have shut in your face when you're already exhausted. I hear how defeating that is. Let's completely forget about the six-month waitlist for a second. Right now, in this exact moment, what is one tiny thing we can do to make your room or your mind feel 1% safer?"

CRITICAL REQUIREMENT: You MUST respond ONLY in the {request.language} language. Write your response in the native script (translated form) of {request.language}. Do not use Roman/Latin letters unless the language is English."""

    async def generate():
        fullReply = ""
        try:
            chat_completion = await client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.5,
                stream=True
            )
            async for chunk in chat_completion:
                content = chunk.choices[0].delta.content
                if content:
                    fullReply += content
                    yield content
                    
            try:
                db_inst = get_db()
                db_inst.table("interactions").insert({
                    "type": f"chat_bot:{request.session_id}", 
                    "content": fullReply, 
                    "user_id": request.user_id
                }).execute()
            except Exception as e:
                print("Failed to log bot response:", e)

        except Exception as e:
            yield f"I am sorry, I am currently facing some technical difficulties. (Error: {str(e)})"

    return StreamingResponse(generate(), media_type="text/plain")

@app.get("/api/chat/history")
async def get_chat_history(user_id: str):
    db = get_db()
    try:
        response = db.table("interactions").select("type, timestamp, content").eq("user_id", user_id).like("type", "chat_user:%").order("timestamp", desc=True).limit(500).execute()
        rows = response.data
        sessions = {}
        for row in rows:
            session_id = row["type"].split(":", 1)[1]
            if session_id not in sessions:
                sessions[session_id] = {
                    "session_id": session_id,
                    "preview": row["content"][:40] + "...",
                    "timestamp": row["timestamp"]
                }
        return list(sessions.values())
    except Exception as e:
        print("Error fetching history:", e)
        return []

@app.get("/api/chat/session/{session_id}")
async def get_chat_session(session_id: str, user_id: str):
    db = get_db()
    try:
        res_user = db.table("interactions").select("type, content, timestamp").eq("user_id", user_id).eq("type", f"chat_user:{session_id}").execute()
        res_bot = db.table("interactions").select("type, content, timestamp").eq("user_id", user_id).eq("type", f"chat_bot:{session_id}").execute()
        
        all_msgs = res_user.data + res_bot.data
        all_msgs.sort(key=lambda x: x["timestamp"])
        
        messages = []
        for msg in all_msgs:
            role = "user" if msg["type"].startswith("chat_user") else "assistant"
            messages.append({"role": role, "content": msg["content"], "timestamp": msg["timestamp"]})
            
        return messages
    except Exception as e:
        print("Error fetching session:", e)
        return []

@app.post("/api/assessment")
async def save_assessment(result: AssessmentResult):
    db = get_db()
    # Example Supabase insert
    # db.table("assessments").insert({"score": result.score}).execute()
    return {"status": "saved", "score": result.score}

@app.get("/api/contacts")
async def get_contacts(user_id: str):
    db = get_db()
    try:
        response = db.table("emergency_contacts").select("*").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        print("Failed to fetch contacts:", e)
        return []

@app.post("/api/contacts")
async def add_contact(request: ContactRequest):
    db = get_db()
    try:
        response = db.table("emergency_contacts").insert({"user_id": request.user_id, "name": request.name, "phone": request.phone}).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

import os
from twilio.rest import Client

@app.post("/api/sos")
async def trigger_sos(request: SOSRequest):
    db = get_db()
    try:
        # Fetch contacts
        contacts_response = db.table("emergency_contacts").select("*").eq("user_id", request.user_id).execute()
        contacts = contacts_response.data
        
        location_str = f"Lat: {request.location.get('lat')}, Lng: {request.location.get('lng')}"
        
        # Twilio setup
        TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
        TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
        TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
        
        twilio_client = None
        if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
            twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            
        print("\n" + "="*50)
        print("!!! EMERGENCY SOS DISPATCHED !!!")
        print(f"User ID: {request.user_id}")
        print(f"Location: {location_str}")
        print(f"Trigger Message: '{request.message}'")
        print("Notifying Contacts:")
        import requests
        import re
        
        for c in contacts:
            maps_link = f"https://www.google.com/maps/search/?api=1&query={request.location.get('lat')},{request.location.get('lng')}"
            msg_body = f"MindMitra SOS Alert: {request.user_name} triggered an SOS.\nLocation: {maps_link}\nMsg: '{request.message}'"
            
            # Send via NTFY to bypass SMS blocking
            try:
                topic_name = re.sub(r'[^a-zA-Z0-9]', '', request.user_name).lower()
                ntfy_url = f"https://ntfy.sh/mindmitra_sos_{topic_name}"
                requests.post(ntfy_url, data=msg_body.encode('utf-8'), headers={"Title": f"🚨 SOS: {request.user_name} Needs Help!"})
                print(f" -> Live Web Alert sent to: {ntfy_url}")
            except Exception as e:
                print(" -> Ntfy error:", e)

            if twilio_client and TWILIO_PHONE_NUMBER:
                try:
                    # 1. Try SMS (might be blocked)
                    twilio_client.messages.create(
                        body=msg_body,
                        from_=TWILIO_PHONE_NUMBER,
                        to=c['phone']
                    )
                    # 2. Trigger Voice Call (bypasses DLT blocking)
                    twiml_msg = f'<Response><Say>Mind Mitra SOS Alert! {request.user_name} needs immediate help. Please check your Mind Mitra web alert link to track their exact location on Google Maps. I repeat, check the web alert link for the Google Maps location.</Say></Response>'
                    twilio_client.calls.create(
                        twiml=twiml_msg,
                        from_=TWILIO_PHONE_NUMBER,
                        to=c['phone']
                    )
                    print(f" -> Twilio SMS & Call sent to {c['name']} at {c['phone']}")
                except Exception as sms_err:
                    print(f" -> Failed to contact {c['name']} at {c['phone']}: {sms_err}")
            else:
                print(f" -> (Simulated) SMS sent to {c['name']} at {c['phone']}")
        print("="*50 + "\n")
        
        return {"status": "success", "notified": len(contacts)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/dashboard")
async def get_dashboard_data(user_id: str, time_range: str = "days"):
    db = get_db()
    
    try:
        response = db.table("interactions").select("type, content, timestamp").eq("user_id", user_id).order("timestamp", desc=True).limit(500).execute()
        rows = response.data
    except Exception as e:
        print("Failed to fetch interactions from Supabase:", e)
        rows = []
        
    now = datetime.now(timezone.utc)
    parsed_rows = []
    for r in rows:
        try:
            dt_str = r["timestamp"]
            if dt_str.endswith("Z"):
                dt_str = dt_str.replace("Z", "+00:00")
            dt = datetime.fromisoformat(dt_str)
            parsed_rows.append({"type": r["type"], "content": r["content"], "dt": dt})
        except:
            pass
            
    stress_data = []
    if time_range == "hours":
        for i in reversed(range(24)):
            bucket_end = now - timedelta(hours=i)
            bucket_start = bucket_end - timedelta(hours=1)
            bucket_rows = [r for r in parsed_rows if bucket_start <= r["dt"] < bucket_end]
            label = bucket_end.strftime("%I %p")
            activities = len(bucket_rows)
            stress = max(10, 100 - (activities * 15))
            stress_data.append({"day": label, "stress": stress, "activities": activities})
    elif time_range == "days":
        for i in reversed(range(7)):
            bucket_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
            bucket_end = bucket_start + timedelta(days=1)
            bucket_rows = [r for r in parsed_rows if bucket_start <= r["dt"] < bucket_end]
            label = bucket_start.strftime("%a")
            activities = len(bucket_rows)
            stress = max(10, 100 - (activities * 15))
            stress_data.append({"day": label, "stress": stress, "activities": activities})
    elif time_range == "weeks":
        for i in reversed(range(4)):
            bucket_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=now.weekday()) - timedelta(weeks=i)
            bucket_end = bucket_start + timedelta(weeks=1)
            bucket_rows = [r for r in parsed_rows if bucket_start <= r["dt"] < bucket_end]
            label = f"Wk {4-i}"
            activities = len(bucket_rows)
            stress = max(10, 100 - (activities * 10))
            stress_data.append({"day": label, "stress": stress, "activities": activities})
    elif time_range == "months":
        for i in reversed(range(6)):
            bucket_end = now - timedelta(days=30*i)
            bucket_start = bucket_end - timedelta(days=30)
            bucket_rows = [r for r in parsed_rows if bucket_start <= r["dt"] < bucket_end]
            label = bucket_start.strftime("%b")
            activities = len(bucket_rows)
            stress = max(10, 100 - (activities * 5))
            stress_data.append({"day": label, "stress": stress, "activities": activities})
    else:
        stress_data = [{"day": "N/A", "stress": 0, "activities": 0}]
    
    # Simple analytics based on history length for garden stage
    garden_stage = min(3, 1 + len(rows) // 3)
    
    # Filter chat messages for Groq context
    chats = [row["content"] for row in rows if row["type"] == "chat" or (row["type"] and row["type"].startswith("chat_user:"))]
    recent_context = " ".join(chats[:5]) if chats else "The user hasn't chatted much yet."
    
    # Generate dynamic insight
    insight = "Keep exploring the app to get personalized insights! Try chatting with the bot or playing a relaxation game."
    if chats:
        try:
            insight_completion = await client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a wellness assistant analyzing a user's recent chat history. Provide a very short (1-2 sentences), gentle, and encouraging insight or observation about their well-being based on their chat history."},
                    {"role": "user", "content": f"Recent chat history: {recent_context}"}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.7,
                max_tokens=100,
            )
            insight = insight_completion.choices[0].message.content.strip()
            # Remove quotes if the LLM wraps it in quotes
            if insight.startswith('"') and insight.endswith('"'):
                insight = insight[1:-1]
        except Exception as e:
            print("Groq Error:", e)
            pass

    # Build dynamic mood timeline (mocked with real counts)
    mood_timeline = [
        {"time": "Now", "mood": "Active ⚡", "note": f"You have {len(rows)} recent interactions!"},
        {"time": "Earlier", "mood": "Calm 🌿", "note": "Checked out the app."}
    ]

    return {
        "gardenStage": garden_stage,
        "insight": insight,
        "moodTimeline": mood_timeline,
        "stressData": stress_data,
        "energyState": "Recharging" if len(chats) < 5 else "Energized"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

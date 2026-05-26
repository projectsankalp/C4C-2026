import os
import shutil
import subprocess
import uuid
import hashlib
import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, Float, DateTime, Text, select
from sqlalchemy import Uuid as SA_UUID

from dotenv import load_dotenv
load_dotenv()

# ─── Database Setup (Unified Supabase) ───────────────────────────────────────

Base = declarative_base()

class User(Base):
    """Mirror of the main backend's users table."""
    __tablename__ = "users"
    id = Column(SA_UUID(as_uuid=True), primary_key=True)
    phone = Column(String)
    name = Column(String, nullable=True)
    trade = Column(String, nullable=True)

class Submission(Base):
    """Mirror of the main backend's submissions table."""
    __tablename__ = "submissions"
    id = Column(SA_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    userId = Column("userId", SA_UUID(as_uuid=True), nullable=False)
    trade = Column(String, nullable=False)
    mediaUrl = Column("mediaUrl", String, nullable=False)
    transcript = Column(String, nullable=True)
    aiScore = Column("aiScore", Float, default=0.0)
    status = Column(String, default="pending")
    createdAt = Column("createdAt", DateTime, default=datetime.datetime.utcnow)
    
    # Proxy submission fields
    candidateName = Column("candidateName", String, nullable=True)
    candidatePhone = Column("candidatePhone", String, nullable=True)
    candidateLocation = Column("candidateLocation", String, nullable=True)

class Certificate(Base):
    """Mirror of the main backend's certificates table."""
    __tablename__ = "certificates"
    id = Column(SA_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    userId = Column("userId", SA_UUID(as_uuid=True), nullable=False)
    submissionId = Column("submissionId", SA_UUID(as_uuid=True), nullable=False)
    certCode = Column("certCode", String, unique=True, nullable=False)
    hash = Column(String, nullable=False)
    issuedAt = Column("issuedAt", DateTime, default=datetime.datetime.utcnow)
    skillScore = Column("skillScore", Float, nullable=False)
    professionalismScore = Column("professionalismScore", Float, nullable=False)

DATABASE_URL = os.getenv("DATABASE_URL", "")
engine = None
AsyncSessionLocal = None

if DATABASE_URL:
    # Convert standard postgres:// to async driver
    async_url = DATABASE_URL
    if async_url.startswith("postgres://"):
        async_url = async_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif async_url.startswith("postgresql://"):
        async_url = async_url.replace("postgresql://", "postgresql+psycopg://", 1)
    
    # Strip pgbouncer params
    if "?" in async_url:
        async_url = async_url.split("?")[0]

    engine = create_async_engine(async_url, echo=False, pool_size=5, max_overflow=10)
    AsyncSessionLocal = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )

async def get_db():
    if AsyncSessionLocal is None:
        raise HTTPException(status_code=500, detail="Database not configured.")
    async with AsyncSessionLocal() as session:
        yield session

# ─── Whisper Model ────────────────────────────────────────────────────────────

transcriber = None

def load_whisper():
    global transcriber
    try:
        import torch
        from transformers import pipeline
        print("Loading Whisper-Tiny pipeline...")
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        transcriber = pipeline(
            "automatic-speech-recognition",
            model="openai/whisper-tiny",
            device=device,
        )
        print(f"Whisper loaded on {device}")
    except Exception as e:
        print(f"WARNING: Could not load Whisper model: {e}")
        print("AI grading will use mock transcription mode.")

# ─── Tailoring Keyword Engine ─────────────────────────────────────────────────

KEYWORDS_MAPPING = {
    "bobbin": ["bobbin", "bobin", "babin", "बोबिन", "ಬಾಬಿನ್"],
    "seam": ["seam", "seem", "sima", "seema", "सीम", "ಸೀಮ್"],
    "stitch": ["stitch", "silai", "tanka", "holige", "holigay", "सिलाई", "टांका", "ಹೊಲಿಗೆ"],
    "needle": ["needle", "sui", "suji", "sooji", "सुई", "ಸೂಜಿ"],
    "fabric": ["fabric", "kapada", "kapda", "kapade", "batte", "कपड़ा", "ಬಟ್ಟೆ"],
    "measure": ["measure", "map", "nap", "maap", "naap", "alate", "माप", "नाप", "ಅಳತೆ"],
    "hemming": ["hemming", "turpai", "तूरपाई", "ಹೆಮ್ಮಿಂಗ್"],
    "pattern": ["pattern", "patan", "vinyasa", "पैटर्न", "ವಿನ್ಯಾಸ"],
    "tailor": ["tailor", "darji", "darjee", "dharji", "darzi", "दर्जी", "ದರ್ಜಿ"],
    "cut": ["cut", "katna", "kata", "kattari", "काटना", "ಕತ್ತರಿಸು"],
    "blouse": ["blouse", "choli", "kanchala", "चोली", "ಬ್ಲೌಸ್"],
    "thread": ["thread", "dhaga", "dhaaga", "noolu", "धागा", "ದಾರ"],
    "sewing machine": ["machine", "silai machine", "mishin", "yantra", "सिलाई मशीन", "ಯಂತ್ರ"],
    "lining": ["lining", "astar", "स्तर", "ಲೈನಿಂಗ್"],
    "pleats": ["pleats", "plate", "chunnat", "चुन्नट", "ಪ್ಲೀಟ್ಸ್"],
}

KEYWORD_WEIGHTS = {
    "bobbin": 1.5, "seam": 1.5, "hemming": 1.5, "lining": 1.5, "pleats": 1.5,
    "pattern": 1.2, "measure": 1.2,
    "stitch": 1.0, "needle": 1.0, "fabric": 1.0, "cut": 1.0,
    "thread": 0.8, "blouse": 0.8,
    "tailor": 0.5, "sewing machine": 0.5,
}

def validate_tailoring(text: str) -> dict:
    """Check if transcribed text is related to tailoring."""
    combined = text.lower()
    keywords_found = []
    weighted_score = 0.0
    max_weight = sum(KEYWORD_WEIGHTS.values())

    for key, variants in KEYWORDS_MAPPING.items():
        for v in variants:
            if v.lower() in combined:
                keywords_found.append(key)
                weighted_score += KEYWORD_WEIGHTS.get(key, 1.0)
                break

    score = round((weighted_score / max_weight) * 100, 2) if max_weight > 0 else 0
    # Boost for technical terms
    if any(kw in keywords_found for kw in ["bobbin", "seam", "hemming", "lining", "pleats"]):
        score = min(100.0, score * 1.1)

    is_related = score >= 15.0 or len(keywords_found) >= 2

    return {
        "is_related": is_related,
        "keywords_found": keywords_found,
        "confidence_score": score,
    }

# ─── Audio Extraction ────────────────────────────────────────────────────────

def extract_audio(video_path: str, audio_path: str) -> bool:
    """Extract audio from video using ffmpeg."""
    try:
        result = subprocess.run(
            ["ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le",
             "-ar", "16000", "-ac", "1", audio_path, "-y"],
            capture_output=True, timeout=60,
        )
        return result.returncode == 0 and os.path.exists(audio_path)
    except Exception as e:
        print(f"FFmpeg error: {e}")
        return False

# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    model: str
    device: str
    whisper_loaded: bool
    supported_keywords: List[str]

class GradingResponse(BaseModel):
    submission_id: Optional[str] = None
    filename: str
    transcription: str
    translated_transcription: str
    keywords_found: List[str]
    confidence_score: float
    is_tailoring_related: bool
    status: str

class GovernmentScheme(BaseModel):
    id: int
    name: str
    description: str
    benefits: List[str]
    eligibility: str
    apply_link: str

class SchemesResponse(BaseModel):
    certificate_detected: bool
    status_message: str
    schemes: List[GovernmentScheme]

# ─── App Lifespan ─────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_whisper()
    yield
    if engine:
        await engine.dispose()

app = FastAPI(
    title="AI Engine — Video Verification & Grading",
    description="Whisper-Tiny powered video transcription and tailoring validation service.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
def health():
    import torch
    return {
        "status": "healthy",
        "model": "whisper-tiny",
        "device": "cuda:0" if torch.cuda.is_available() else "cpu",
        "whisper_loaded": transcriber is not None,
        "supported_keywords": list(KEYWORDS_MAPPING.keys()),
    }

@app.post("/grade_assessment", response_model=GradingResponse)
async def grade_assessment(
    file: UploadFile = File(..., description="Video or audio file to grade"),
    language: Optional[str] = Form(None, description="'hi', 'kn', or 'en'. Auto-detect if blank."),
    user_id: Optional[str] = Form(None, description="UUID of the artisan user."),
):
    """
    Full AI pipeline:
    1. Receive video upload
    2. Extract audio via ffmpeg
    3. Transcribe with Whisper-Tiny (supports Hindi, Kannada, English)
    4. Validate tailoring relevance
    5. If related → save to Supabase as pending_admin
    6. If not → reject and return error
    """
    temp_dir = f"temp_{uuid.uuid4().hex[:8]}"
    os.makedirs(temp_dir, exist_ok=True)
    video_path = os.path.join(temp_dir, file.filename or "upload.mp4")
    audio_path = os.path.join(temp_dir, "extracted_audio.wav")

    try:
        # Save uploaded file
        with open(video_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        # Extract audio (skip if already audio)
        is_video = file.content_type and file.content_type.startswith("video")
        if is_video:
            success = extract_audio(video_path, audio_path)
            if not success:
                raise HTTPException(status_code=422, detail="Failed to extract audio from video. Ensure the file is a valid video.")
            process_path = audio_path
        else:
            process_path = video_path

        # Transcribe
        raw_text = ""
        translated_text = ""

        if transcriber is not None:
            gen_kwargs = {}
            if language and language.strip().lower() in ["hi", "kn", "en"]:
                gen_kwargs["language"] = language.strip().lower()

            # Transcribe (native language)
            res1 = transcriber(process_path, generate_kwargs={"task": "transcribe", **gen_kwargs})
            raw_text = res1.get("text", "")

            # Translate to English
            res2 = transcriber(process_path, generate_kwargs={
                "task": "translate",
                "num_beams": 5,
                "repetition_penalty": 1.2,
                **gen_kwargs,
            })
            translated_text = res2.get("text", "")
        else:
            # Mock mode when Whisper isn't loaded
            raw_text = "Mock: कपड़ा काटना और सिलाई करना सीखें। stitching and tailoring demonstration."
            translated_text = "Mock: Learn fabric cutting and stitching. Stitching and tailoring demonstration."

        # Validate tailoring relevance
        combined = raw_text + " " + translated_text
        validation = validate_tailoring(combined)

        if not validation["is_related"]:
            # NOT tailoring — reject
            return GradingResponse(
                submission_id=None,
                filename=file.filename or "",
                transcription=raw_text,
                translated_transcription=translated_text,
                keywords_found=validation["keywords_found"],
                confidence_score=validation["confidence_score"],
                is_tailoring_related=False,
                status="rejected",
            )

        # IS tailoring — save to Supabase as pending_admin
        submission_id = None
        if user_id and AsyncSessionLocal:
            async with AsyncSessionLocal() as db:
                user_uuid = uuid.UUID(user_id)
                user = (await db.execute(select(User).filter(User.id == user_uuid))).scalars().first()
                if not user:
                    raise HTTPException(status_code=404, detail=f"User {user_id} not found.")

                new_sub = Submission(
                    id=uuid.uuid4(),
                    userId=user_uuid,
                    trade="tailoring",
                    mediaUrl=f"/uploads/{file.filename}",
                    transcript=raw_text,
                    aiScore=validation["confidence_score"],
                    status="pending",  # pending_admin review
                )
                db.add(new_sub)
                await db.commit()
                await db.refresh(new_sub)
                submission_id = str(new_sub.id)

        return GradingResponse(
            submission_id=submission_id,
            filename=file.filename or "",
            transcription=raw_text,
            translated_transcription=translated_text,
            keywords_found=validation["keywords_found"],
            confidence_score=validation["confidence_score"],
            is_tailoring_related=True,
            status="pending_admin",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)

@app.get("/get_schemes", response_model=SchemesResponse)
async def get_schemes(user_id: str):
    """Return curated government schemes if the user has an approved certificate."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=500, detail="Database not configured.")

    ALL_SCHEMES = [
        {
            "id": 1,
            "name": "Pradhan Mantri Vishwakarma Yojana (PM-VY)",
            "description": "Collateral-free credit support, skill training, and toolkits for traditional tailors (Darjis) and artisans.",
            "benefits": [
                "Collateral-free loan up to ₹3,00,000 at 5% interest.",
                "Advanced tailoring toolkit incentive of ₹15,000.",
                "Stipend of ₹500/day during advanced skill training.",
            ],
            "eligibility": "Certified traditional tailors and artisans aged 18+.",
            "apply_link": "https://pmvishwakarma.gov.in/",
        },
        {
            "id": 2,
            "name": "PM Mudra Scheme (Tailoring Enterprise Grant)",
            "description": "Micro-loans for certified tailoring practitioners to establish boutiques and retail units.",
            "benefits": [
                "Shishu Loans up to ₹50,000 with 0% processing fees.",
                "Kishor Loans up to ₹5,00,000 for industrial sewing machines.",
                "Flexible tenure 3-5 years.",
            ],
            "eligibility": "Skilled tailors with a recognized assessment certificate.",
            "apply_link": "https://www.mudra.org.in/",
        },
        {
            "id": 3,
            "name": "Deendayal Antyodaya Yojana (DAY-NULM)",
            "description": "Supports urban/rural tailoring collectives and SHGs with interest subvention loans.",
            "benefits": [
                "7% interest subvention on SHG tailoring loans.",
                "Free stalls at regional Saras Melas.",
                "Direct raw material supply chains.",
            ],
            "eligibility": "Certified tailoring professionals in registered SHGs.",
            "apply_link": "https://nulm.gov.in/",
        },
    ]

    async with AsyncSessionLocal() as db:
        user_uuid = uuid.UUID(user_id)
        cert = (await db.execute(
            select(Certificate).filter(Certificate.userId == user_uuid)
        )).scalars().first()

        if cert:
            return SchemesResponse(
                certificate_detected=True,
                status_message="Valid certificate found. You have unlocked government schemes.",
                schemes=ALL_SCHEMES,
            )
        return SchemesResponse(
            certificate_detected=False,
            status_message="No certificate found. Complete your assessment to unlock schemes.",
            schemes=[],
        )

# ─── RPL Chatbot ──────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)

class ChatResponse(BaseModel):
    response: str
    confidence: float

RPL_KNOWLEDGE = {
    "assessment": "An RPL assessment evaluates your existing skills through practical demonstrations like video submissions.",
    "certification": "Upon successful assessment, you receive a vocational certificate that unlocks government schemes.",
    "skills": "We assess tailoring, handicrafts, food prep, beauty, domestic work, and manufacturing.",
    "government_schemes": "Once certified, access PM Vishwakarma Yojana, PM Mudra, and DAY-NULM for loans and support.",
    "process": "Log in → Select your skill → Upload a video → AI assessment → Admin review → Certification.",
}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    query = request.query.lower().strip()
    for keyword, answer in RPL_KNOWLEDGE.items():
        if keyword in query:
            return ChatResponse(response=answer, confidence=0.9)
    return ChatResponse(
        response="I can help with RPL assessments, certifications, and government schemes. What would you like to know?",
        confidence=0.6,
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

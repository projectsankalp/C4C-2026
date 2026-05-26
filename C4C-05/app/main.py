from pathlib import Path
import contextlib

from sqlalchemy import text
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .config import settings
from .routers import auth, users, asha, doctors, patients, chat, prediction, calls, ai, dashboard, notifications, visits
from .db import engine, Base, AsyncSessionLocal
from .seed_data import seed_doctors

WEB_DIR = Path(__file__).resolve().parent.parent / "web"
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR"))
        except Exception:
            pass
    async with AsyncSessionLocal() as session:
        await seed_doctors(session)
    yield


app = FastAPI(title="Health Seva Rural Platform", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(asha.router, prefix="/api/v1/asha", tags=["asha"])
app.include_router(doctors.router, prefix="/api/v1/doctors", tags=["doctors"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["patients"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(prediction.router, prefix="/api/v1/prediction", tags=["prediction"])
app.include_router(calls.router, prefix="/api/v1/calls", tags=["calls"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(visits.router, prefix="/api/v1/visits", tags=["visits"])

app.mount("/js", StaticFiles(directory=WEB_DIR / "js"), name="js")
app.mount("/css", StaticFiles(directory=WEB_DIR / "css"), name="css")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
async def landing():
    return FileResponse(WEB_DIR / "index.html")


@app.get("/login.html")
async def login_page():
    return FileResponse(WEB_DIR / "login.html")


@app.get("/signup-user.html")
async def signup_user_page():
    return FileResponse(WEB_DIR / "signup-user.html")


@app.get("/signup-asha.html")
async def signup_asha_page():
    return FileResponse(WEB_DIR / "signup-asha.html")


@app.get("/dashboard/{page}")
async def dashboard_pages(page: str):
    # Accept both /dashboard/user and /dashboard/user.html
    name = page.removesuffix(".html") if page.endswith(".html") else page
    path = WEB_DIR / "dashboard" / f"{name}.html"
    if path.exists():
        return FileResponse(path)
    return FileResponse(WEB_DIR / "index.html")

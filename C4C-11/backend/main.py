from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router as analyze_router
from routes.chat import router as chat_router

app = FastAPI(title="ToxCore API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")
app.include_router(chat_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to ToxCore API"}

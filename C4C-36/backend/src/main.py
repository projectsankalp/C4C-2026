from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from src.routers import admin, user, public, volunteer


app = FastAPI(title="NSS Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"message": "Database error occurred", "details": str(exc)},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred", "details": str(exc)},
    )

app.include_router(admin.router)
app.include_router(user.router)
app.include_router(public.router)
app.include_router(volunteer.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to NSS Backend API"}

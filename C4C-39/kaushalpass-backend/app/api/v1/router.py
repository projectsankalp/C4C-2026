"""API v1 router — registers all sub-routers."""

from fastapi import APIRouter

from app.api.v1.auth.router import router as auth_router
from app.api.v1.certificate.router import router as certificate_router
from app.api.v1.documents.router import router as documents_router
from app.api.v1.passport.router import router as passport_router
from app.api.v1.schemes.router import router as schemes_router
from app.api.v1.verifier.router import router as verifier_router
from app.api.v1.verify.router import router as verify_router
from app.api.v1.voice.router import router as voice_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(voice_router)
api_v1_router.include_router(passport_router)
api_v1_router.include_router(documents_router)
api_v1_router.include_router(certificate_router)
api_v1_router.include_router(verifier_router)
api_v1_router.include_router(verify_router)
api_v1_router.include_router(schemes_router)

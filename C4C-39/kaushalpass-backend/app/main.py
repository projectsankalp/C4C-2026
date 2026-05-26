"""FastAPI application factory."""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.config import get_settings
from app.core.middleware import RequestLoggingMiddleware

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logging.warning("Supabase not configured — database and storage routes will fail")
    if not settings.SARVAM_API_KEY:
        logging.warning("SARVAM_API_KEY not set — voice pipeline will fail")
    if not settings.NVIDIA_API_KEY:
        logging.warning("NVIDIA_API_KEY not set — GLM / Nemotron will fail")
    if not settings.GROQ_API_KEY:
        logging.warning("GROQ_API_KEY not set — scheme AI ranking will use keyword fallback")
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "version": settings.APP_VERSION}

    app.include_router(api_v1_router)

    return app


app = create_app()

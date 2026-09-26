"""
main.py — FastAPI application entrypoint.
"""
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import AppError, app_error_handler, generic_error_handler, validation_error_handler
from app.core.logging import configure_logging, get_logger
from app.api.routes import health, diagnostic, path, quiz, mastery, ai_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown hook."""
    logger = get_logger("startup")
    try:
        settings = get_settings()
        logger.info("config_loaded", port=settings.PORT)
    except Exception as exc:
        print(f"[FATAL] Config validation failed: {exc}", file=sys.stderr)
        sys.exit(1)

    # Verify DB connection at startup — warn loudly but don't crash
    # /health must always respond; DB errors surface on first actual request
    try:
        from app.db.client import get_supabase
        get_supabase()
        logger.info("db_startup_ok")
    except Exception as exc:
        logger.error("db_startup_failed", error=str(exc), action="continuing — DB calls will fail until credentials are set")
        print(f"[WARNING] Database connection failed at startup: {exc}", file=sys.stderr)
        print("[WARNING] Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to a valid Supabase project.", file=sys.stderr)

    logger.info("startup_complete")
    yield
    logger.info("shutdown")


configure_logging()

app = FastAPI(
    title="Adaptive Learning Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Error handlers ────────────────────────────────────────────────────────────
from fastapi.exceptions import RequestValidationError
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(Exception, generic_error_handler)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(diagnostic.router)
app.include_router(path.router)
app.include_router(quiz.router)
app.include_router(mastery.router)
app.include_router(ai_routes.router)

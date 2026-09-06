import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.audit import router as audit_router
from app.api.routes.auth import router as auth_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.health import router as health_router
from app.api.routes.incidents import router as incidents_router
from app.api.routes.knowledge import router as knowledge_router
from app.api.routes.servicenow import (
    router as servicenow_router,
)

from app.config import settings
from app.core.exceptions import (
    global_exception_handler,
)
from app.core.logging import configure_logging
from app.core.middleware import RequestIDMiddleware


# ---------------------------------------------------------
# LOGGING
# ---------------------------------------------------------

configure_logging()

logger = logging.getLogger(
    "ai_sre_triage"
)


# ---------------------------------------------------------
# FASTAPI APPLICATION
# ---------------------------------------------------------

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Enterprise AI SRE Incident Triage Copilot"
    ),
)


# ---------------------------------------------------------
# GLOBAL EXCEPTION HANDLER
# ---------------------------------------------------------

app.add_exception_handler(
    Exception,
    global_exception_handler,
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# REQUEST ID MIDDLEWARE
# ---------------------------------------------------------

app.add_middleware(
    RequestIDMiddleware
)


# ---------------------------------------------------------
# API ROUTERS
# ---------------------------------------------------------

app.include_router(
    health_router
)

app.include_router(
    auth_router
)

app.include_router(
    incidents_router
)

app.include_router(
    dashboard_router
)

app.include_router(
    knowledge_router
)

app.include_router(
    audit_router
)

app.include_router(
    servicenow_router
)


# ---------------------------------------------------------
# REQUEST LOGGING
# ---------------------------------------------------------

@app.middleware("http")
async def request_logging_middleware(
    request: Request,
    call_next,
):
    request_id = getattr(
        request.state,
        "request_id",
        "unknown",
    )

    logger.info(
        "request_started "
        "method=%s path=%s request_id=%s",
        request.method,
        request.url.path,
        request_id,
    )

    try:
        response = await call_next(
            request
        )

        logger.info(
            "request_completed "
            "method=%s path=%s status=%s request_id=%s",
            request.method,
            request.url.path,
            response.status_code,
            request_id,
        )

        return response

    except Exception:
        logger.exception(
            "request_failed "
            "method=%s path=%s request_id=%s",
            request.method,
            request.url.path,
            request_id,
        )

        raise


# ---------------------------------------------------------
# ROOT ENDPOINT
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "application": settings.app_name,
        "version": settings.app_version,
        "status": "running",
    }
import logging

from fastapi import Request
from fastapi.responses import JSONResponse


logger = logging.getLogger(
    "ai_sre_triage"
)


async def global_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:

    request_id = getattr(
        request.state,
        "request_id",
        "unknown",
    )

    logger.exception(
        "unhandled_exception "
        "method=%s path=%s request_id=%s",
        request.method,
        request.url.path,
        request_id,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "request_id": request_id,
        },
    )
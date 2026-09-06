from typing import Callable

from fastapi import (
    Depends,
    HTTPException,
    status,
)
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlalchemy.orm import Session

from app.core.auth import decode_access_token
from app.db.database import get_db
from app.db.models.user import UserDB
from app.rag.rag_service import RAGService
from app.services.ai_service import AIService
from app.services.ai_triage_service import (
    AITriageService,
)

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db),
) -> UserDB:
    try:
        payload = decode_access_token(
            credentials.credentials
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        ) from exc

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    try:
        user = (
            db.query(UserDB)
            .filter(
                UserDB.id == int(user_id)
            )
            .first()
        )

    except (TypeError, ValueError):
        user = None

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    return user


def require_roles(
    *allowed_roles: str,
) -> Callable:
    def role_checker(
        current_user: UserDB = Depends(
            get_current_user
        ),
    ) -> UserDB:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return role_checker


def get_ai_triage_service() -> AITriageService:
    ai_service = AIService()

    rag_service = RAGService()

    return AITriageService(
        ai_service=ai_service,
        rag_service=rag_service,
    )
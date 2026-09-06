from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.db.database import get_db
from app.db.models.user import UserDB
from app.db.repositories.user_repository import (
    UserRepository,
)
from app.models.auth import (
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
)
from app.services.audit_service import AuditService


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    repository = UserRepository(db)

    existing_user = repository.get_by_username(
        user.username
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Username already exists",
        )

    existing_email = repository.get_by_email(
        user.email
    )

    if existing_email:
        raise HTTPException(
            status_code=409,
            detail="Email already exists",
        )

    user_db = UserDB(
        username=user.username,
        email=user.email,
        password_hash=hash_password(
            user.password
        ),
        role="viewer",
        is_active=True,
    )

    created_user = repository.create(user_db)

    AuditService.log(
        db,
        user_id=created_user.id,
        action="user.registered",
        resource_type="user",
        resource_id=str(created_user.id),
        outcome="success",
        details="User registered",
    )

    return created_user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    repository = UserRepository(db)

    user = repository.get_by_username(
        credentials.username
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    if not verify_password(
        credentials.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = create_access_token(
        subject=str(user.id),
        role=user.role,
    )

    AuditService.log(
        db,
        user_id=user.id,
        action="user.login",
        resource_type="user",
        resource_id=str(user.id),
        outcome="success",
        details="User login successful",
    )

    return TokenResponse(
        access_token=access_token,
    )
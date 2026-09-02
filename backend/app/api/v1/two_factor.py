import hashlib
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_not_demo
from app.core.security import generate_otp_code
from app.models.user import User
from app.schemas.auth import (
    TwoFactorEmailConfirmRequest,
    TwoFactorEmailSetupRequest,
    TwoFactorToggleRequest,
    UserResponse,
)
from app.services.email_service import send_2fa_otp_email

router = APIRouter(prefix="/2fa", tags=["two-factor"])

OTP_EXPIRE_MINUTES = 3


@router.post("/email/setup", status_code=status.HTTP_204_NO_CONTENT)
def setup_two_factor_email(
    payload: TwoFactorEmailSetupRequest,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    raw_code, code_hash = generate_otp_code()
    current_user.two_factor_pending_email = payload.email
    current_user.two_factor_otp_hash = code_hash
    current_user.two_factor_otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    current_user.two_factor_otp_purpose = "email_verify"
    db.commit()

    send_2fa_otp_email(
        payload.email, current_user, raw_code, purpose="email_verify", expire_minutes=OTP_EXPIRE_MINUTES
    )


@router.post("/email/confirm", response_model=UserResponse)
def confirm_two_factor_email(
    payload: TwoFactorEmailConfirmRequest,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if current_user.two_factor_otp_purpose != "email_verify" or current_user.two_factor_pending_email is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bekleyen bir e-posta doğrulaması yok")

    now = datetime.now(timezone.utc)
    expires_at = current_user.two_factor_otp_expires_at
    if expires_at is not None and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at is None or expires_at < now:
        current_user.two_factor_pending_email = None
        current_user.two_factor_otp_hash = None
        current_user.two_factor_otp_expires_at = None
        current_user.two_factor_otp_purpose = None
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Doğrulama kodunun süresi doldu, lütfen tekrar deneyin")

    if hashlib.sha256(payload.code.encode()).hexdigest() != current_user.two_factor_otp_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Doğrulama kodu hatalı")

    current_user.two_factor_email = current_user.two_factor_pending_email
    current_user.two_factor_pending_email = None
    current_user.two_factor_otp_hash = None
    current_user.two_factor_otp_expires_at = None
    current_user.two_factor_otp_purpose = None
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/toggle", response_model=UserResponse)
def toggle_two_factor(
    payload: TwoFactorToggleRequest,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if payload.enabled and not current_user.two_factor_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="İki adımlı doğrulamayı etkinleştirmeden önce bir e-posta adresi doğrulamalısınız",
        )

    current_user.is_2fa_enabled = payload.enabled
    db.commit()
    db.refresh(current_user)
    return current_user

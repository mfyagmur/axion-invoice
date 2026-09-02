import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_two_factor_token,
    decode_token,
    generate_otp_code,
    generate_reset_token,
    hash_password,
    hash_reset_token,
    verify_password,
)
from app.models.invoice import Invoice
from app.models.password_reset_token import PasswordResetToken
from app.models.session import UserSession
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    LoginResponse,
    ResendTwoFactorRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
    VerifyTwoFactorRequest,
)
from app.services.email_service import send_2fa_otp_email, send_password_reset_email
from app.services.google_oauth import GoogleTokenError, verify_google_id_token
from app.services.subscription_service import ensure_default_subscription
from app.tasks.pdf_tasks import generate_invoice_pdf_task

router = APIRouter(prefix="/auth", tags=["auth"])

RESET_TOKEN_EXPIRE_MINUTES = 30
OTP_EXPIRE_MINUTES = 3
OTP_RESEND_COOLDOWN_SECONDS = 30
# OTP kodu 3 dakikada geçersiz olur ama doğrulama oturumu (two_factor_token) daha uzun yaşamalı,
# yoksa kod süresi dolduğunda "Kodu Tekrar Gönder" de aynı JWT süresi dolduğu için 401 ile başarısız olur.
TWO_FACTOR_SESSION_EXPIRE_MINUTES = 15


def _set_refresh_cookie(response: Response, user_id: str, request: Request, db: Session) -> None:
    token, jti = create_refresh_token(user_id)
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        path=settings.refresh_cookie_path,
    )
    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None
    session = UserSession(
        user_id=uuid.UUID(user_id),
        refresh_token_jti=jti,
        user_agent=user_agent,
        ip_address=ip_address,
    )
    db.add(session)
    db.commit()


def _mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    if len(local) <= 2:
        masked_local = local[:1] + "*"
    else:
        masked_local = local[0] + "*" * (len(local) - 2) + local[-1]
    return f"{masked_local}@{domain}"


def _issue_login_otp(user: User, db: Session) -> tuple[str, datetime]:
    raw_code, code_hash = generate_otp_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    user.two_factor_otp_hash = code_hash
    user.two_factor_otp_expires_at = expires_at
    user.two_factor_otp_purpose = "login"
    db.commit()
    send_2fa_otp_email(user.two_factor_email, user, raw_code, purpose="login", expire_minutes=OTP_EXPIRE_MINUTES)
    return create_two_factor_token(str(user.id), TWO_FACTOR_SESSION_EXPIRE_MINUTES), expires_at


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, request: Request, response: Response, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu e-posta zaten kayıtlı")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        account_type=payload.account_type,
        company_name=payload.company_name,
    )
    db.add(user)
    db.flush()
    ensure_default_subscription(db, user)
    db.commit()
    db.refresh(user)

    _set_refresh_cookie(response, str(user.id), request, db)
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: Annotated[Session, Depends(get_db)]) -> LoginResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or user.password_hash is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-posta veya şifre hatalı")

    if user.is_2fa_enabled and user.two_factor_email:
        two_factor_token, expires_at = _issue_login_otp(user, db)
        return LoginResponse(
            requires_2fa=True,
            two_factor_token=two_factor_token,
            two_factor_email_hint=_mask_email(user.two_factor_email),
            two_factor_otp_expires_at=expires_at,
        )

    _set_refresh_cookie(response, str(user.id), request, db)
    return LoginResponse(access_token=create_access_token(str(user.id)))


@router.post("/verify-2fa", response_model=TokenResponse)
def verify_two_factor(
    payload: VerifyTwoFactorRequest, request: Request, response: Response, db: Annotated[Session, Depends(get_db)]
) -> TokenResponse:
    token_payload = decode_token(payload.two_factor_token)
    if token_payload is None or token_payload.get("type") != "two_factor":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz veya süresi dolmuş doğrulama oturumu")

    try:
        user_id = uuid.UUID(token_payload["sub"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz doğrulama oturumu")

    user = db.get(User, user_id)
    if user is None or user.two_factor_otp_purpose != "login" or user.two_factor_otp_hash is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Doğrulama kodu bulunamadı, lütfen tekrar giriş yapın")

    now = datetime.now(timezone.utc)
    expires_at = user.two_factor_otp_expires_at
    if expires_at is not None and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at is None or expires_at < now:
        user.two_factor_otp_hash = None
        user.two_factor_otp_expires_at = None
        user.two_factor_otp_purpose = None
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Doğrulama kodunun süresi doldu, lütfen tekrar giriş yapın")

    if hashlib.sha256(payload.code.encode()).hexdigest() != user.two_factor_otp_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Doğrulama kodu hatalı")

    user.two_factor_otp_hash = None
    user.two_factor_otp_expires_at = None
    user.two_factor_otp_purpose = None
    db.commit()

    _set_refresh_cookie(response, str(user.id), request, db)
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/resend-2fa-otp", response_model=LoginResponse)
def resend_two_factor_otp(
    payload: ResendTwoFactorRequest, db: Annotated[Session, Depends(get_db)]
) -> LoginResponse:
    token_payload = decode_token(payload.two_factor_token)
    if token_payload is None or token_payload.get("type") != "two_factor":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz veya süresi dolmuş doğrulama oturumu")

    try:
        user_id = uuid.UUID(token_payload["sub"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz doğrulama oturumu")

    user = db.get(User, user_id)
    if user is None or not user.two_factor_email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Doğrulama oturumu geçersiz")

    if user.two_factor_otp_expires_at is not None:
        expires_at = user.two_factor_otp_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        last_sent_at = expires_at - timedelta(minutes=OTP_EXPIRE_MINUTES)
        elapsed_seconds = (datetime.now(timezone.utc) - last_sent_at).total_seconds()
        if elapsed_seconds < OTP_RESEND_COOLDOWN_SECONDS:
            remaining = max(int(OTP_RESEND_COOLDOWN_SECONDS - elapsed_seconds), 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Lütfen tekrar göndermeden önce biraz bekleyin",
                headers={"Retry-After": str(remaining)},
            )

    two_factor_token, expires_at = _issue_login_otp(user, db)
    return LoginResponse(
        requires_2fa=True,
        two_factor_token=two_factor_token,
        two_factor_email_hint=_mask_email(user.two_factor_email),
        two_factor_otp_expires_at=expires_at,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    refresh_token: Annotated[str | None, Cookie()] = None,
) -> TokenResponse:
    if refresh_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Oturum bulunamadı")

    token_payload = decode_token(refresh_token)
    if token_payload is None or token_payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz refresh token")

    try:
        user_id = uuid.UUID(token_payload["sub"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz refresh token")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı bulunamadı")

    jti = token_payload.get("jti")
    if jti:
        session = db.query(UserSession).filter(UserSession.refresh_token_jti == jti).first()
        if session is None or session.revoked_at is not None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Oturum iptal edildi")
        session.last_used_at = func.now()
        db.commit()
    else:
        token, new_jti = create_refresh_token(str(user.id))
        user_agent = request.headers.get("user-agent")
        ip_address = request.client.host if request.client else None
        new_session = UserSession(
            user_id=user.id,
            refresh_token_jti=new_jti,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        db.add(new_session)
        db.commit()
        response.set_cookie(
            key=settings.refresh_cookie_name,
            value=token,
            httponly=True,
            samesite="lax",
            secure=settings.cookie_secure,
            path=settings.refresh_cookie_path,
        )
        return TokenResponse(access_token=create_access_token(str(user.id)))

    _set_refresh_cookie(response, str(user.id), request, db)
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    db: Annotated[Session, Depends(get_db)],
    refresh_token: Annotated[str | None, Cookie()] = None,
) -> None:
    if refresh_token:
        token_payload = decode_token(refresh_token)
        if token_payload and token_payload.get("type") == "refresh":
            jti = token_payload.get("jti")
            if jti:
                session = db.query(UserSession).filter(UserSession.refresh_token_jti == jti).first()
                if session:
                    session.revoked_at = func.now()
                    db.commit()
    response.delete_cookie(settings.refresh_cookie_name, path=settings.refresh_cookie_path)


@router.post("/google", response_model=TokenResponse)
def google_login(
    payload: GoogleAuthRequest, request: Request, response: Response, db: Annotated[Session, Depends(get_db)]
) -> TokenResponse:
    try:
        claims = verify_google_id_token(payload.id_token)
    except GoogleTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    google_id = claims["sub"]
    email = claims["email"]

    user = db.query(User).filter(User.google_id == google_id).first()
    if user is None:
        user = db.query(User).filter(User.email == email).first()
        if user is not None:
            user.google_id = google_id
        else:
            user = User(
                email=email,
                google_id=google_id,
                full_name=claims.get("name", email),
                account_type=payload.account_type,
            )
            db.add(user)
            db.flush()
            ensure_default_subscription(db, user)
        db.commit()
        db.refresh(user)

    _set_refresh_cookie(response, str(user.id), request, db)
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/demo", response_model=TokenResponse)
def demo_login(request: Request, response: Response, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    user = db.query(User).filter(User.is_demo.is_(True)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Demo hesabı mevcut değil")

    # Seed data can't run Playwright inside an Alembic migration, so the demo invoice's PDF
    # is generated lazily on first demo login instead of at seed time.
    pending_invoice = (
        db.query(Invoice).filter(Invoice.user_id == user.id, Invoice.pdf_url.is_(None)).first()
    )
    if pending_invoice is not None:
        generate_invoice_pdf_task.delay(str(pending_invoice.id))

    _set_refresh_cookie(response, str(user.id), request, db)
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.get("/me", response_model=UserResponse)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user


@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
def forgot_password(payload: ForgotPasswordRequest, db: Annotated[Session, Depends(get_db)]) -> None:
    user = db.query(User).filter(User.email == payload.email).first()
    # Kullanıcı yoksa veya sadece Google ile giriş yapıyorsa da 204 döner —
    # email enumeration'ı önlemek için (var/yok fark etmez, sessiz).
    if user is not None and user.password_hash is not None:
        raw_token, token_hash = generate_reset_token()
        db.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=token_hash,
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
            )
        )
        db.commit()
        send_password_reset_email(user.email, user, raw_token)


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(payload: ResetPasswordRequest, db: Annotated[Session, Depends(get_db)]) -> None:
    token_hash = hash_reset_token(payload.token)
    record = db.query(PasswordResetToken).filter(PasswordResetToken.token_hash == token_hash).first()
    if (
        record is None
        or record.used_at is not None
        or record.expires_at < datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bağlantı geçersiz veya süresi dolmuş")

    user = db.get(User, record.user_id)
    user.password_hash = hash_password(payload.new_password)
    record.used_at = func.now()
    db.query(UserSession).filter(UserSession.user_id == user.id, UserSession.revoked_at.is_(None)).update(
        {"revoked_at": func.now()}
    )
    db.commit()

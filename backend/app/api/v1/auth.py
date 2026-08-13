import uuid
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.invoice import Invoice
from app.models.session import UserSession
from app.models.user import User
from app.schemas.auth import (
    GoogleAuthRequest,
    LoginRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)
from app.services.google_oauth import GoogleTokenError, verify_google_id_token
from app.services.subscription_service import ensure_default_subscription
from app.tasks.pdf_tasks import generate_invoice_pdf_task

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_refresh_cookie(response: Response, user_id: str, request: Request, db: Session) -> None:
    token, jti = create_refresh_token(user_id)
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=settings.refresh_token_expire_days * 24 * 3600,
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


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: Annotated[Session, Depends(get_db)]) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or user.password_hash is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-posta veya şifre hatalı")

    _set_refresh_cookie(response, str(user.id), request, db)
    return TokenResponse(access_token=create_access_token(str(user.id)))


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
        session.last_used_at = db.func.now()
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
            max_age=settings.refresh_token_expire_days * 24 * 3600,
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
                    session.revoked_at = db.func.now()
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
def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        account_type=current_user.account_type,
        company_name=current_user.company_name,
        address=current_user.address,
        city=current_user.city,
        postal_code=current_user.postal_code,
        country=current_user.country,
        phone=current_user.phone,
        tax_office=current_user.tax_office,
        tax_number=current_user.tax_number,
        locale=current_user.locale,
        notify_invoice_reminders=current_user.notify_invoice_reminders,
        notify_product_updates=current_user.notify_product_updates,
        notify_billing_emails=current_user.notify_billing_emails,
        is_demo=current_user.is_demo,
        is_admin=current_user.is_admin,
        has_password=current_user.password_hash is not None,
    )

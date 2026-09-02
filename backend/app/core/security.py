import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def _create_token(subject: str, expires_delta: timedelta, token_type: Literal["access", "refresh", "two_factor"], jti: str | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    if jti:
        payload["jti"] = jti
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: str) -> str:
    return _create_token(
        user_id,
        timedelta(minutes=settings.access_token_expire_minutes),
        "access",
    )


def create_refresh_token(user_id: str, jti: str | None = None) -> tuple[str, str]:
    if jti is None:
        jti = uuid.uuid4().hex
    token = _create_token(
        user_id,
        timedelta(days=settings.refresh_token_expire_days),
        "refresh",
        jti=jti,
    )
    return token, jti


def create_two_factor_token(user_id: str, expire_minutes: int) -> str:
    return _create_token(user_id, timedelta(minutes=expire_minutes), "two_factor")


def generate_otp_code() -> tuple[str, str]:
    """Returns (raw_6_digit_code, code_hash). The raw code is emailed to the user; only the hash is stored."""
    raw = f"{secrets.randbelow(1_000_000):06d}"
    return raw, hashlib.sha256(raw.encode()).hexdigest()


def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None


def hash_reset_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()


def generate_reset_token() -> tuple[str, str]:
    """Returns (raw_token, token_hash). The raw token goes in the email link; only the hash is stored."""
    raw = secrets.token_urlsafe(32)
    return raw, hash_reset_token(raw)

import hashlib
from datetime import datetime, timedelta, timezone

from app.core.security import create_two_factor_token
from app.models.user import User


def test_signup_creates_user_and_returns_token(client):
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "newuser@example.com",
            "password": "supersecret1",
            "full_name": "New User",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert "access_token" in body
    assert response.cookies.get("refresh_token") is not None


def test_signup_duplicate_email_returns_409(client, test_user: User):
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": test_user.email,
            "password": "supersecret1",
            "full_name": "Duplicate",
        },
    )
    assert response.status_code == 409


def test_login_success(client, test_user: User):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "testpassword123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password_returns_401(client, test_user: User):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_me_without_token_returns_403(client):
    # FastAPI's HTTPBearer dependency rejects a missing Authorization header with 403,
    # distinct from the 401 get_current_user raises for a present-but-invalid token.
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403


def test_me_with_invalid_token_returns_401(client):
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert response.status_code == 401


def test_me_with_token_returns_current_user(client, test_user: User, auth_headers: dict[str, str]):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email


def _enable_2fa(db_session, user: User, email: str = "otp-target@example.com") -> None:
    user.two_factor_email = email
    user.is_2fa_enabled = True
    db_session.commit()


def test_login_with_2fa_enabled_returns_pending_challenge(client, db_session, test_user: User):
    _enable_2fa(db_session, test_user)

    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "testpassword123"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["requires_2fa"] is True
    assert body["access_token"] is None
    assert body["two_factor_token"]
    assert body["two_factor_otp_expires_at"]
    assert response.cookies.get("refresh_token") is None


def test_resend_2fa_otp_within_cooldown_returns_429_with_retry_after(client, db_session, test_user: User):
    _enable_2fa(db_session, test_user)
    test_user.two_factor_otp_hash = hashlib.sha256(b"123456").hexdigest()
    test_user.two_factor_otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=3)
    test_user.two_factor_otp_purpose = "login"
    db_session.commit()
    two_factor_token = create_two_factor_token(str(test_user.id), 3)

    response = client.post("/api/v1/auth/resend-2fa-otp", json={"two_factor_token": two_factor_token})
    assert response.status_code == 429
    assert response.headers.get("retry-after")
    assert int(response.headers["retry-after"]) > 0


def test_resend_2fa_otp_after_cooldown_returns_new_challenge(client, db_session, test_user: User):
    _enable_2fa(db_session, test_user)
    test_user.two_factor_otp_hash = hashlib.sha256(b"123456").hexdigest()
    test_user.two_factor_otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=2, seconds=25)
    test_user.two_factor_otp_purpose = "login"
    db_session.commit()
    two_factor_token = create_two_factor_token(str(test_user.id), 3)

    response = client.post("/api/v1/auth/resend-2fa-otp", json={"two_factor_token": two_factor_token})
    assert response.status_code == 200
    assert response.json()["two_factor_otp_expires_at"]


def test_resend_2fa_otp_after_otp_expiry_still_succeeds(client, db_session, test_user: User):
    # OTP kodu süresi dolmuş olsa bile (3dk), doğrulama oturumu (two_factor_token) daha uzun
    # yaşadığı için "Kodu Tekrar Gönder" 401 yerine yeni bir kod göndermeli.
    _enable_2fa(db_session, test_user)
    test_user.two_factor_otp_hash = hashlib.sha256(b"123456").hexdigest()
    test_user.two_factor_otp_expires_at = datetime.now(timezone.utc) - timedelta(seconds=5)
    test_user.two_factor_otp_purpose = "login"
    db_session.commit()
    two_factor_token = create_two_factor_token(str(test_user.id), 15)

    response = client.post("/api/v1/auth/resend-2fa-otp", json={"two_factor_token": two_factor_token})
    assert response.status_code == 200
    assert response.json()["two_factor_otp_expires_at"]


def test_verify_2fa_with_correct_code_issues_tokens(client, db_session, test_user: User):
    _enable_2fa(db_session, test_user)
    raw_code = "123456"
    test_user.two_factor_otp_hash = hashlib.sha256(raw_code.encode()).hexdigest()
    test_user.two_factor_otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=3)
    test_user.two_factor_otp_purpose = "login"
    db_session.commit()
    two_factor_token = create_two_factor_token(str(test_user.id), 3)

    response = client.post(
        "/api/v1/auth/verify-2fa",
        json={"two_factor_token": two_factor_token, "code": raw_code},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.cookies.get("refresh_token") is not None

    db_session.refresh(test_user)
    assert test_user.two_factor_otp_hash is None
    assert test_user.two_factor_otp_expires_at is None
    assert test_user.two_factor_otp_purpose is None


def test_verify_2fa_with_wrong_code_returns_401_and_keeps_otp(client, db_session, test_user: User):
    _enable_2fa(db_session, test_user)
    test_user.two_factor_otp_hash = hashlib.sha256(b"123456").hexdigest()
    test_user.two_factor_otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=3)
    test_user.two_factor_otp_purpose = "login"
    db_session.commit()
    two_factor_token = create_two_factor_token(str(test_user.id), 3)

    response = client.post(
        "/api/v1/auth/verify-2fa",
        json={"two_factor_token": two_factor_token, "code": "000000"},
    )
    assert response.status_code == 401

    db_session.refresh(test_user)
    assert test_user.two_factor_otp_hash is not None


def test_verify_2fa_with_expired_code_returns_400_and_clears_otp(client, db_session, test_user: User):
    _enable_2fa(db_session, test_user)
    raw_code = "123456"
    test_user.two_factor_otp_hash = hashlib.sha256(raw_code.encode()).hexdigest()
    test_user.two_factor_otp_expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    test_user.two_factor_otp_purpose = "login"
    db_session.commit()
    two_factor_token = create_two_factor_token(str(test_user.id), 3)

    response = client.post(
        "/api/v1/auth/verify-2fa",
        json={"two_factor_token": two_factor_token, "code": raw_code},
    )
    assert response.status_code == 400

    db_session.refresh(test_user)
    assert test_user.two_factor_otp_hash is None
    assert test_user.two_factor_otp_expires_at is None


def test_toggle_2fa_without_confirmed_email_returns_400(client, test_user: User, auth_headers: dict[str, str]):
    response = client.post("/api/v1/2fa/toggle", json={"enabled": True}, headers=auth_headers)
    assert response.status_code == 400


def test_setup_and_confirm_2fa_email_happy_path(client, db_session, test_user: User, auth_headers: dict[str, str]):
    setup_response = client.post(
        "/api/v1/2fa/email/setup", json={"email": "new-2fa@example.com"}, headers=auth_headers
    )
    assert setup_response.status_code == 204

    db_session.refresh(test_user)
    assert test_user.two_factor_pending_email == "new-2fa@example.com"
    raw_code = "654321"
    test_user.two_factor_otp_hash = hashlib.sha256(raw_code.encode()).hexdigest()
    db_session.commit()

    confirm_response = client.post("/api/v1/2fa/email/confirm", json={"code": raw_code}, headers=auth_headers)
    assert confirm_response.status_code == 200
    body = confirm_response.json()
    assert body["two_factor_email"] == "new-2fa@example.com"
    assert body["two_factor_pending_email"] is None

    toggle_response = client.post("/api/v1/2fa/toggle", json={"enabled": True}, headers=auth_headers)
    assert toggle_response.status_code == 200
    assert toggle_response.json()["is_2fa_enabled"] is True


def test_demo_user_cannot_manage_2fa(client, db_session, test_user: User, auth_headers: dict[str, str]):
    test_user.is_demo = True
    db_session.commit()

    response = client.post(
        "/api/v1/2fa/email/setup", json={"email": "demo-2fa@example.com"}, headers=auth_headers
    )
    assert response.status_code == 403

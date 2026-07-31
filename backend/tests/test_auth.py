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

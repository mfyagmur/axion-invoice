import os
import uuid

os.environ["DATABASE_URL"] = "postgresql+psycopg2://axion:axion@postgres:5432/axion_invoice_test"

import psycopg2
import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from psycopg2 import sql
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import engine, get_db
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.user import AccountType, User
from app.services.subscription_service import ensure_default_subscription

TEST_DB_NAME = "axion_invoice_test"
ADMIN_DATABASE_URL = "postgresql://axion:axion@postgres:5432/postgres"


def _ensure_test_database_exists() -> None:
    conn = psycopg2.connect(ADMIN_DATABASE_URL)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (TEST_DB_NAME,))
            if cur.fetchone() is None:
                cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(TEST_DB_NAME)))
    finally:
        conn.close()


@pytest.fixture(scope="session", autouse=True)
def _prepare_test_database():
    _ensure_test_database_exists()
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
    command.upgrade(alembic_cfg, "head")
    yield


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    # join_transaction_mode="create_savepoint" makes business-logic-level db.commit() calls
    # (invoked deep inside services/endpoints under test) commit a SAVEPOINT instead of the
    # outer transaction, so the final rollback below still discards everything the test wrote.
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session):
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.pop(get_db, None)


@pytest.fixture
def test_user(db_session) -> User:
    user = User(
        email=f"{uuid.uuid4()}@example.com",
        password_hash=hash_password("testpassword123"),
        full_name="Test User",
        account_type=AccountType.BIREYSEL,
    )
    db_session.add(user)
    db_session.flush()
    ensure_default_subscription(db_session, user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    token = create_access_token(str(test_user.id))
    return {"Authorization": f"Bearer {token}"}

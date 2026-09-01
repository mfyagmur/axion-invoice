"""set_demo_user_password

Revision ID: e5f6a7b8c9d0
Revises: dab620bb915b
Create Date: 2026-09-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
from passlib.context import CryptContext
import sqlalchemy as sa


revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = 'dab620bb915b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEMO_USER_ID = "00000000-0000-0000-0000-0000000000d1"
DEMO_PASSWORD = "Demo.12345"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def upgrade() -> None:
    bind = op.get_bind()
    bind.execute(
        sa.text("UPDATE users SET password_hash = :password_hash WHERE id = :user_id"),
        {"password_hash": pwd_context.hash(DEMO_PASSWORD), "user_id": DEMO_USER_ID},
    )


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(
        sa.text("UPDATE users SET password_hash = NULL WHERE id = :user_id"),
        {"user_id": DEMO_USER_ID},
    )

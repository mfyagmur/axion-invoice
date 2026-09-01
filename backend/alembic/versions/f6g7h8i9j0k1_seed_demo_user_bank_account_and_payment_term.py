"""seed_demo_user_bank_account_and_payment_term

Revision ID: f6g7h8i9j0k1
Revises: e5f6a7b8c9d0
Create Date: 2026-09-01 00:00:00.000000

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa


revision: str = 'f6g7h8i9j0k1'
down_revision: Union[str, None] = 'e5f6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEMO_USER_ID = "00000000-0000-0000-0000-0000000000d1"
BANK_ACCOUNT_ID = str(uuid.uuid4())
PAYMENT_TERM_ID = str(uuid.uuid4())


def upgrade() -> None:
    bind = op.get_bind()

    # Insert demo bank account (Ziraat Bankası)
    bind.execute(
        sa.text("""
            INSERT INTO definition_bank_accounts
            (id, user_id, bank_name, branch_name, branch_code, currency, account_number, iban, is_active, created_at)
            VALUES (:id, :user_id, :bank_name, :branch_name, :branch_code, :currency, :account_number, :iban, :is_active, NOW())
        """),
        {
            "id": BANK_ACCOUNT_ID,
            "user_id": DEMO_USER_ID,
            "bank_name": "Ziraat Bankası",
            "branch_name": "İstanbul Şubesi",
            "branch_code": "0001",
            "currency": "TRY",
            "account_number": "1234567890",
            "iban": "TR330006100519786457844952",
            "is_active": True,
        },
    )

    # Insert demo payment term (30 days)
    bind.execute(
        sa.text("""
            INSERT INTO definition_payment_terms
            (id, user_id, label, days, is_active, created_at)
            VALUES (:id, :user_id, :label, :days, :is_active, NOW())
        """),
        {
            "id": PAYMENT_TERM_ID,
            "user_id": DEMO_USER_ID,
            "label": "Net 30",
            "days": 30,
            "is_active": True,
        },
    )


def downgrade() -> None:
    bind = op.get_bind()

    # Delete demo payment term
    bind.execute(
        sa.text("DELETE FROM definition_payment_terms WHERE id = :id"),
        {"id": PAYMENT_TERM_ID},
    )

    # Delete demo bank account
    bind.execute(
        sa.text("DELETE FROM definition_bank_accounts WHERE id = :id"),
        {"id": BANK_ACCOUNT_ID},
    )

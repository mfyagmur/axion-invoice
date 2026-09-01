"""seed demo user profile

Revision ID: c9d8e7f6a5b4
Revises: a6b7c8d9e0f1
Create Date: 2026-09-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c9d8e7f6a5b4'
down_revision: Union[str, None] = 'a6b7c8d9e0f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


users = sa.table(
    "users",
    sa.column("id", sa.UUID()),
    sa.column("company_name", sa.String()),
    sa.column("sector", sa.String()),
    sa.column("tax_office", sa.String()),
    sa.column("tax_number", sa.String()),
    sa.column("trade_registry_no", sa.String()),
    sa.column("address", sa.String()),
    sa.column("country", sa.String()),
    sa.column("city", sa.String()),
    sa.column("corporate_email", sa.String()),
    sa.column("phone", sa.String()),
)

DEMO_USER_ID = "00000000-0000-0000-0000-0000000000d1"


def upgrade() -> None:
    bind = op.get_bind()

    # Update demo user profile with provided company information
    bind.execute(
        users.update()
        .where(users.c.id == DEMO_USER_ID)
        .values(
            company_name="Test Demo A.Ş.",
            sector="Bilgi Teknolojileri",
            tax_office="Yenibosna",
            tax_number="111111111111",
            trade_registry_no="1234567891011",
            address="Merkez Mah. 12345 Sokak No: 11",
            country="Turkiye",
            city="İstanbul",
            corporate_email="demo@axioninvoice.app",
            phone="212 1234578",
        )
    )


def downgrade() -> None:
    bind = op.get_bind()

    # Reset demo user profile
    bind.execute(
        users.update()
        .where(users.c.id == DEMO_USER_ID)
        .values(
            company_name=None,
            sector=None,
            tax_office=None,
            tax_number=None,
            trade_registry_no=None,
            address=None,
            country=None,
            city=None,
            corporate_email=None,
            phone=None,
        )
    )

"""add invoice notes field

Revision ID: n9o0p1q2r3
Revises: m8n9o0p1q2r3
Create Date: 2026-08-06 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'n9o0p1q2r3'
down_revision: Union[str, None] = 'm8n9o0p1q2r3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoices', sa.Column('notes', sa.String(length=2000), nullable=True))


def downgrade() -> None:
    op.drop_column('invoices', 'notes')

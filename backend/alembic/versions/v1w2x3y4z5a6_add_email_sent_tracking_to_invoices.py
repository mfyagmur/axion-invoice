"""add email_sent_at/email_sent_to to invoices

Revision ID: v1w2x3y4z5a6
Revises: a1b2c3d4e5f6
Create Date: 2026-08-25 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'v1w2x3y4z5a6'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoices', sa.Column('email_sent_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        'invoices',
        sa.Column('email_sent_to', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('invoices', 'email_sent_to')
    op.drop_column('invoices', 'email_sent_at')

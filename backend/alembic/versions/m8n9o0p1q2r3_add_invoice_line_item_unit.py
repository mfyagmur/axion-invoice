"""add invoice line item unit field

Revision ID: m8n9o0p1q2r3
Revises: k5l6m7n8o9p0
Create Date: 2026-08-06 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'm8n9o0p1q2r3'
down_revision: Union[str, None] = 'k5l6m7n8o9p0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoice_line_items', sa.Column('unit', sa.String(length=20), nullable=False, server_default='adet'))


def downgrade() -> None:
    op.drop_column('invoice_line_items', 'unit')

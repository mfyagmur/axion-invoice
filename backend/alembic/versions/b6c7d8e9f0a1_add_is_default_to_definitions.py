"""add is_default to definition units, tax rates, and notes

Revision ID: b6c7d8e9f0a1
Revises: a5b6c7d8e9f0
Create Date: 2026-08-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b6c7d8e9f0a1'
down_revision: Union[str, None] = 'a5b6c7d8e9f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('definition_units', sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('definition_tax_rates', sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('definition_notes', sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('definition_notes', 'is_default')
    op.drop_column('definition_tax_rates', 'is_default')
    op.drop_column('definition_units', 'is_default')

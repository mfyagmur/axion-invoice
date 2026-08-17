"""add session timeout to users

Revision ID: d7e9f0a1b2c3
Revises: c1d2e3f4a5b6
Create Date: 2026-08-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd7e9f0a1b2c3'
down_revision: Union[str, None] = 'c1d2e3f4a5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('session_timeout_minutes', sa.Integer(), nullable=False, server_default='5'))


def downgrade() -> None:
    op.drop_column('users', 'session_timeout_minutes')

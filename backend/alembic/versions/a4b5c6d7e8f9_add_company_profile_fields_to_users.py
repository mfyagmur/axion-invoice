"""add company profile fields to users

Revision ID: a4b5c6d7e8f9
Revises: a3b4c5d6e7f8
Create Date: 2026-08-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a4b5c6d7e8f9'
down_revision: Union[str, None] = 'a3b4c5d6e7f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('sector', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('trade_registry_no', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('corporate_email', sa.String(255), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'corporate_email')
    op.drop_column('users', 'trade_registry_no')
    op.drop_column('users', 'sector')

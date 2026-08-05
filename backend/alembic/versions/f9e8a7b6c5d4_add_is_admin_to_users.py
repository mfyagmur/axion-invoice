"""add is_admin to users

Revision ID: f9e8a7b6c5d4
Revises: e8f7g6h5i4j3
Create Date: 2026-08-05 10:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f9e8a7b6c5d4'
down_revision: Union[str, None] = 'e8f7g6h5i4j3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('users', 'is_admin')

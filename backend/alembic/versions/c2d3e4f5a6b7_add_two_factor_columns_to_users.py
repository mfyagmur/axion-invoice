"""add_two_factor_columns_to_users

Merges the two pre-existing migration heads (a1218f0ebf82, c9d8e7f6a5b4) that had
diverged from a common ancestor, then adds the 2FA columns on top.

Revision ID: c2d3e4f5a6b7
Revises: a1218f0ebf82, c9d8e7f6a5b4
Create Date: 2026-09-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c2d3e4f5a6b7'
down_revision: Union[str, Sequence[str], None] = ('a1218f0ebf82', 'c9d8e7f6a5b4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_2fa_enabled', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('users', sa.Column('two_factor_email', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('two_factor_pending_email', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('two_factor_otp_hash', sa.String(length=64), nullable=True))
    op.add_column('users', sa.Column('two_factor_otp_expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('two_factor_otp_purpose', sa.String(length=20), nullable=True))
    op.alter_column('users', 'is_2fa_enabled', server_default=None)


def downgrade() -> None:
    op.drop_column('users', 'two_factor_otp_purpose')
    op.drop_column('users', 'two_factor_otp_expires_at')
    op.drop_column('users', 'two_factor_otp_hash')
    op.drop_column('users', 'two_factor_pending_email')
    op.drop_column('users', 'two_factor_email')
    op.drop_column('users', 'is_2fa_enabled')

"""create login_attempts table

Revision ID: d4e5f6a7b8c9
Revises: c2d3e4f5a6b7
Create Date: 2026-09-09 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c2d3e4f5a6b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'login_attempts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('status', sa.Enum('success', 'failed', 'suspicious', name='login_attempt_status'), nullable=False),
        sa.Column('ip_address', sa.String(64), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('country', sa.String(100), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('failure_reason', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_login_attempts_user_id', 'login_attempts', ['user_id'])
    op.create_index('ix_login_attempts_created_at', 'login_attempts', ['created_at'])
    op.create_index('ix_login_attempts_email_created_at', 'login_attempts', ['email', 'created_at'])
    op.create_index('ix_login_attempts_ip_created_at', 'login_attempts', ['ip_address', 'created_at'])


def downgrade() -> None:
    op.drop_index('ix_login_attempts_ip_created_at', table_name='login_attempts')
    op.drop_index('ix_login_attempts_email_created_at', table_name='login_attempts')
    op.drop_index('ix_login_attempts_created_at', table_name='login_attempts')
    op.drop_index('ix_login_attempts_user_id', table_name='login_attempts')
    op.drop_table('login_attempts')
    sa.Enum(name='login_attempt_status').drop(op.get_bind(), checkfirst=True)

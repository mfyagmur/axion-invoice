"""create audit_logs table

Revision ID: e5f6a7b8c9d1
Revises: d4e5f6a7b8c9
Create Date: 2026-09-09 09:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'e5f6a7b8c9d1'
down_revision: Union[str, None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('actor_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('target_type', sa.String(100), nullable=True),
        sa.Column('target_id', sa.String(100), nullable=True),
        sa.Column('ip_address', sa.String(64), nullable=True),
        sa.Column('metadata_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_audit_logs_actor_user_id', 'audit_logs', ['actor_user_id'])
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'])
    op.create_index('ix_audit_logs_action_created_at', 'audit_logs', ['action', 'created_at'])


def downgrade() -> None:
    op.drop_index('ix_audit_logs_action_created_at', table_name='audit_logs')
    op.drop_index('ix_audit_logs_created_at', table_name='audit_logs')
    op.drop_index('ix_audit_logs_actor_user_id', table_name='audit_logs')
    op.drop_table('audit_logs')

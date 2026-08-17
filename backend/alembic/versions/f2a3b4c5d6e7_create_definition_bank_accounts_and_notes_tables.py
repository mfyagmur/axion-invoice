"""create definition_bank_accounts and definition_notes tables

Revision ID: f2a3b4c5d6e7
Revises: e1f2a3b4c5d6
Create Date: 2026-08-17 01:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'f2a3b4c5d6e7'
down_revision: Union[str, None] = 'e1f2a3b4c5d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'definition_bank_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('bank_name', sa.String(100), nullable=False),
        sa.Column('iban', sa.String(34), nullable=False),
        sa.Column('account_holder', sa.String(150), nullable=False),
        sa.Column('branch', sa.String(100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_definition_bank_accounts_user_id', 'definition_bank_accounts', ['user_id'])

    op.create_table(
        'definition_notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('label', sa.String(100), nullable=False),
        sa.Column('content', sa.String(1000), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_definition_notes_user_id', 'definition_notes', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_definition_notes_user_id', table_name='definition_notes')
    op.drop_table('definition_notes')
    op.drop_index('ix_definition_bank_accounts_user_id', table_name='definition_bank_accounts')
    op.drop_table('definition_bank_accounts')

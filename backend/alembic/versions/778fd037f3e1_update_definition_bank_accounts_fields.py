"""update_definition_bank_accounts_fields

Revision ID: 778fd037f3e1
Revises: f2a3b4c5d6e7
Create Date: 2026-08-17 16:01:39.492876

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '778fd037f3e1'
down_revision: Union[str, None] = 'f2a3b4c5d6e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update definition_bank_accounts table schema
    # Add new columns with defaults for existing data
    op.add_column('definition_bank_accounts', sa.Column('branch_code', sa.String(length=20), server_default='', nullable=False))
    op.add_column('definition_bank_accounts', sa.Column('currency', sa.String(length=3), server_default='TRY', nullable=False))
    op.add_column('definition_bank_accounts', sa.Column('account_number', sa.String(length=50), server_default='', nullable=False))

    # Rename branch to branch_name and set non-NULL for existing NULLs
    op.execute("UPDATE definition_bank_accounts SET branch = '' WHERE branch IS NULL")
    op.alter_column('definition_bank_accounts', 'branch',
               new_column_name='branch_name',
               existing_type=sa.String(length=100),
               existing_nullable=True,
               nullable=False)

    # Remove account_holder column
    op.drop_column('definition_bank_accounts', 'account_holder')

    # Remove server defaults after data is populated
    op.alter_column('definition_bank_accounts', 'branch_code',
               existing_type=sa.String(length=20),
               existing_server_default='',
               server_default=None)
    op.alter_column('definition_bank_accounts', 'account_number',
               existing_type=sa.String(length=50),
               existing_server_default='',
               server_default=None)
    op.alter_column('definition_bank_accounts', 'currency',
               existing_type=sa.String(length=3),
               existing_server_default='TRY')


def downgrade() -> None:
    # Reverse definition_bank_accounts schema changes
    op.add_column('definition_bank_accounts', sa.Column('account_holder', sa.String(length=150), autoincrement=False, nullable=True))

    # Rename branch_name back to branch
    op.alter_column('definition_bank_accounts', 'branch_name',
               new_column_name='branch',
               existing_type=sa.String(length=100),
               existing_nullable=False,
               nullable=True)

    # Remove new columns
    op.drop_column('definition_bank_accounts', 'account_number')
    op.drop_column('definition_bank_accounts', 'currency')
    op.drop_column('definition_bank_accounts', 'branch_code')

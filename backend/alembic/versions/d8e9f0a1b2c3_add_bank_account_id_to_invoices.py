"""Add bank_account_id to invoices table.

Revision ID: d8e9f0a1b2c3
Revises: c7d8e9f0a1b2
Create Date: 2026-08-19 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd8e9f0a1b2c3'
down_revision: Union[str, None] = 'c7d8e9f0a1b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoices', sa.Column('bank_account_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_invoices_bank_account_id', 'invoices', 'definition_bank_accounts', ['bank_account_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    op.drop_constraint('fk_invoices_bank_account_id', 'invoices', type_='foreignkey')
    op.drop_column('invoices', 'bank_account_id')

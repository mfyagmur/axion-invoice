"""Add bank_account_id_2 and bank_account_id_3 to invoices table.

Revision ID: e9f0a1b2c3d4
Revises: d8e9f0a1b2c3
Create Date: 2026-08-20 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e9f0a1b2c3d4'
down_revision: Union[str, None] = 'd8e9f0a1b2c3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoices', sa.Column('bank_account_id_2', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('invoices', sa.Column('bank_account_id_3', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_invoices_bank_account_id_2', 'invoices', 'definition_bank_accounts', ['bank_account_id_2'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_invoices_bank_account_id_3', 'invoices', 'definition_bank_accounts', ['bank_account_id_3'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    op.drop_constraint('fk_invoices_bank_account_id_3', 'invoices', type_='foreignkey')
    op.drop_constraint('fk_invoices_bank_account_id_2', 'invoices', type_='foreignkey')
    op.drop_column('invoices', 'bank_account_id_3')
    op.drop_column('invoices', 'bank_account_id_2')

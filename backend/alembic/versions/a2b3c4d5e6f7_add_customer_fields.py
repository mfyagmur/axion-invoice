"""add customer phone/fax/tax_office/mersis_no fields

Revision ID: a2b3c4d5e6f7
Revises: f1a2b3c4d5e6
Create Date: 2026-08-03 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoice_customers', sa.Column('phone', sa.String(length=50), nullable=True))
    op.add_column('invoice_customers', sa.Column('fax', sa.String(length=50), nullable=True))
    op.add_column('invoice_customers', sa.Column('tax_office', sa.String(length=255), nullable=True))
    op.add_column('invoice_customers', sa.Column('mersis_no', sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column('invoice_customers', 'mersis_no')
    op.drop_column('invoice_customers', 'tax_office')
    op.drop_column('invoice_customers', 'fax')
    op.drop_column('invoice_customers', 'phone')

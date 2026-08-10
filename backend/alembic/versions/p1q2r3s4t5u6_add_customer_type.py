"""add customer_type (bireysel/kurumsal) to invoice_customers, backfill from company_name

Revision ID: p1q2r3s4t5u6
Revises: o0p1q2r3s4t5
Create Date: 2026-08-10 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'p1q2r3s4t5u6'
down_revision: Union[str, None] = 'o0p1q2r3s4t5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'invoice_customers',
        sa.Column('customer_type', sa.String(length=20), nullable=False, server_default='kurumsal'),
    )
    op.execute(
        "UPDATE invoice_customers SET customer_type = 'bireysel' "
        "WHERE company_name IS NULL OR company_name = ''"
    )


def downgrade() -> None:
    op.drop_column('invoice_customers', 'customer_type')

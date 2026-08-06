"""add invoice line item detail fields: item_code, discount_rate, discount_amount, tax_rate, tax_amount, other_tax_amount

Revision ID: i3j4k5l6m7n8
Revises: h2i3j4k5l6m7
Create Date: 2026-08-06 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'i3j4k5l6m7n8'
down_revision: Union[str, None] = 'h2i3j4k5l6m7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoice_line_items', sa.Column('item_code', sa.String(length=100), nullable=True))
    op.add_column(
        'invoice_line_items',
        sa.Column('discount_rate', sa.Numeric(5, 2), nullable=False, server_default='0'),
    )
    op.add_column(
        'invoice_line_items',
        sa.Column('discount_amount', sa.Numeric(12, 2), nullable=False, server_default='0'),
    )
    op.add_column(
        'invoice_line_items',
        sa.Column('tax_rate', sa.Numeric(5, 2), nullable=False, server_default='0'),
    )
    op.add_column(
        'invoice_line_items',
        sa.Column('tax_amount', sa.Numeric(12, 2), nullable=False, server_default='0'),
    )
    op.add_column(
        'invoice_line_items',
        sa.Column('other_tax_amount', sa.Numeric(12, 2), nullable=False, server_default='0'),
    )


def downgrade() -> None:
    op.drop_column('invoice_line_items', 'other_tax_amount')
    op.drop_column('invoice_line_items', 'tax_amount')
    op.drop_column('invoice_line_items', 'tax_rate')
    op.drop_column('invoice_line_items', 'discount_amount')
    op.drop_column('invoice_line_items', 'discount_rate')
    op.drop_column('invoice_line_items', 'item_code')

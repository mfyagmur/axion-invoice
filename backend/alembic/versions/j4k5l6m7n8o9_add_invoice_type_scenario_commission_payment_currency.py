"""add invoice_type, scenario, commission_payer, payment_currency, recipient_contact_ids

Revision ID: j4k5l6m7n8o9
Revises: i3j4k5l6m7n8
Create Date: 2026-08-06 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'j4k5l6m7n8o9'
down_revision: Union[str, None] = 'i3j4k5l6m7n8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    invoice_type_enum = sa.Enum('sale', 'purchase', name='invoice_type')
    invoice_scenario_enum = sa.Enum('commercial', name='invoice_scenario')
    commission_payer_enum = sa.Enum('self', 'customer', name='commission_payer')

    invoice_type_enum.create(op.get_bind())
    invoice_scenario_enum.create(op.get_bind())
    commission_payer_enum.create(op.get_bind())

    op.add_column('invoices', sa.Column('payment_currency', sa.String(3), nullable=False, server_default='TRY'))
    op.add_column('invoices', sa.Column('invoice_type', sa.Enum('sale', 'purchase', name='invoice_type'), nullable=False, server_default='sale'))
    op.add_column('invoices', sa.Column('scenario', sa.Enum('commercial', name='invoice_scenario'), nullable=False, server_default='commercial'))
    op.add_column('invoices', sa.Column('commission_payer', sa.Enum('self', 'customer', name='commission_payer'), nullable=False, server_default='self'))
    op.add_column('invoices', sa.Column('recipient_contact_ids', sa.JSON(), nullable=False, server_default='[]'))


def downgrade() -> None:
    op.drop_column('invoices', 'recipient_contact_ids')
    op.drop_column('invoices', 'commission_payer')
    op.drop_column('invoices', 'scenario')
    op.drop_column('invoices', 'invoice_type')
    op.drop_column('invoices', 'payment_currency')

    commission_payer_enum = sa.Enum('self', 'customer', name='commission_payer')
    invoice_scenario_enum = sa.Enum('commercial', name='invoice_scenario')
    invoice_type_enum = sa.Enum('sale', 'purchase', name='invoice_type')

    commission_payer_enum.drop(op.get_bind())
    invoice_scenario_enum.drop(op.get_bind())
    invoice_type_enum.drop(op.get_bind())

"""add company settings to users

Revision ID: e1f2a3b4c5d6
Revises: d7e9f0a1b2c3
Create Date: 2026-08-17 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e1f2a3b4c5d6'
down_revision: Union[str, None] = 'd7e9f0a1b2c3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('default_currency', sa.String(3), nullable=False, server_default='TRY'))
    op.add_column('users', sa.Column('date_format', sa.String(20), nullable=False, server_default='DD.MM.YYYY'))
    op.add_column('users', sa.Column('tax_year_start_month', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('users', sa.Column('invoice_prefix', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('invoice_number_padding', sa.Integer(), nullable=False, server_default='4'))


def downgrade() -> None:
    op.drop_column('users', 'invoice_number_padding')
    op.drop_column('users', 'invoice_prefix')
    op.drop_column('users', 'tax_year_start_month')
    op.drop_column('users', 'date_format')
    op.drop_column('users', 'default_currency')

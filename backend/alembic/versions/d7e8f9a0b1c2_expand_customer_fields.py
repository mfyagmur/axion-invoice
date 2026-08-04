"""expand customer fields: first_name, last_name, company_name, country, city, postal_code, website

Revision ID: d7e8f9a0b1c2
Revises: c9d2e3f4a5b6
Create Date: 2026-08-04 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd7e8f9a0b1c2'
down_revision: Union[str, None] = 'c9d2e3f4a5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoice_customers', sa.Column('first_name', sa.String(length=255), nullable=True))
    op.add_column('invoice_customers', sa.Column('last_name', sa.String(length=255), nullable=True))
    op.add_column('invoice_customers', sa.Column('company_name', sa.String(length=255), nullable=True))
    op.add_column('invoice_customers', sa.Column('country', sa.String(length=100), nullable=True))
    op.add_column('invoice_customers', sa.Column('city', sa.String(length=100), nullable=True))
    op.add_column('invoice_customers', sa.Column('postal_code', sa.String(length=20), nullable=True))
    op.add_column('invoice_customers', sa.Column('website', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('invoice_customers', 'website')
    op.drop_column('invoice_customers', 'postal_code')
    op.drop_column('invoice_customers', 'city')
    op.drop_column('invoice_customers', 'country')
    op.drop_column('invoice_customers', 'company_name')
    op.drop_column('invoice_customers', 'last_name')
    op.drop_column('invoice_customers', 'first_name')

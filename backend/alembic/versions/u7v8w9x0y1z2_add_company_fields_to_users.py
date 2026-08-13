"""add company/address/tax fields to users

Revision ID: u7v8w9x0y1z2
Revises: t6u7v8w9x0y1
Create Date: 2026-08-13 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'u7v8w9x0y1z2'
down_revision: Union[str, None] = 't6u7v8w9x0y1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('address', sa.String(1000), nullable=True))
    op.add_column('users', sa.Column('city', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('postal_code', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('country', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('phone', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('tax_office', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('tax_number', sa.String(50), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'tax_number')
    op.drop_column('users', 'tax_office')
    op.drop_column('users', 'phone')
    op.drop_column('users', 'country')
    op.drop_column('users', 'postal_code')
    op.drop_column('users', 'city')
    op.drop_column('users', 'address')

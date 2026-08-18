"""remove product updates and billing emails notification prefs

Revision ID: a5b6c7d8e9f0
Revises: 778fd037f3e1
Create Date: 2026-08-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a5b6c7d8e9f0'
down_revision: Union[str, None] = '778fd037f3e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('users', 'notify_product_updates')
    op.drop_column('users', 'notify_billing_emails')


def downgrade() -> None:
    op.add_column('users', sa.Column('notify_product_updates', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('notify_billing_emails', sa.Boolean(), nullable=False, server_default='true'))

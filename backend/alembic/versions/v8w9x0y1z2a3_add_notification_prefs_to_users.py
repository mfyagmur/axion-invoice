"""add notification preferences to users

Revision ID: v8w9x0y1z2a3
Revises: u7v8w9x0y1z2
Create Date: 2026-08-13 10:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'v8w9x0y1z2a3'
down_revision: Union[str, None] = 'u7v8w9x0y1z2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('notify_invoice_reminders', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('notify_product_updates', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('notify_billing_emails', sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    op.drop_column('users', 'notify_billing_emails')
    op.drop_column('users', 'notify_product_updates')
    op.drop_column('users', 'notify_invoice_reminders')

"""add is_active column to invoice_templates

Revision ID: o0p1q2r3s4t5
Revises: n9o0p1q2r3
Create Date: 2026-08-07 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'o0p1q2r3s4t5'
down_revision: Union[str, None] = 'n9o0p1q2r3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoice_templates', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))

    # Mark the 3 original system templates as inactive
    bind = op.get_bind()
    bind.execute(
        sa.text(
            "UPDATE invoice_templates SET is_active = false WHERE id IN "
            "('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003')"
        )
    )


def downgrade() -> None:
    op.drop_column('invoice_templates', 'is_active')

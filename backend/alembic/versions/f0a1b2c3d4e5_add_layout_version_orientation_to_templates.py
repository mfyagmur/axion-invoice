"""Add layout_version and orientation to invoice_templates table.

Revision ID: f0a1b2c3d4e5
Revises: e9f0a1b2c3d4
Create Date: 2026-08-20 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'f0a1b2c3d4e5'
down_revision: Union[str, None] = 'e9f0a1b2c3d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Existing rows (including the 3 seeded system templates) predate the v2 element-based
    # layout_json format, so they backfill as layout_version=1 and keep rendering through the
    # legacy single-field-entry Jinja path; only templates saved by the new designer get 2.
    op.add_column('invoice_templates', sa.Column('layout_version', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('invoice_templates', sa.Column('orientation', sa.String(20), nullable=False, server_default='portrait'))


def downgrade() -> None:
    op.drop_column('invoice_templates', 'orientation')
    op.drop_column('invoice_templates', 'layout_version')

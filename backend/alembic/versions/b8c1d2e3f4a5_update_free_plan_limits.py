"""update free plan limits

Revision ID: b8c1d2e3f4a5
Revises: a2b3c4d5e6f7
Create Date: 2026-08-03 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b8c1d2e3f4a5'
down_revision: Union[str, None] = 'a2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


plans = sa.table(
    "plans",
    sa.column("key", sa.String()),
    sa.column("max_invoices_per_month", sa.Integer()),
    sa.column("max_templates", sa.Integer()),
)


def upgrade() -> None:
    op.execute(
        plans.update()
        .where(plans.c.key == "free")
        .values(max_invoices_per_month=3, max_templates=1)
    )


def downgrade() -> None:
    op.execute(
        plans.update()
        .where(plans.c.key == "free")
        .values(max_invoices_per_month=5, max_templates=0)
    )

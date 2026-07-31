"""seed plans

Revision ID: c4a8b9e2f6d1
Revises: b3f2a7c1d4e5
Create Date: 2026-07-31 12:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'c4a8b9e2f6d1'
down_revision: Union[str, None] = 'b3f2a7c1d4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


plans = sa.table(
    "plans",
    sa.column("id", sa.UUID()),
    sa.column("key", sa.String()),
    sa.column("name", sa.String()),
    sa.column("price_monthly", sa.Numeric()),
    sa.column("price_yearly", sa.Numeric()),
    sa.column("max_invoices_per_month", sa.Integer()),
    sa.column("max_templates", sa.Integer()),
)

FREE_PLAN_ID = "00000000-0000-0000-0000-0000000000f1"
PRO_PLAN_ID = "00000000-0000-0000-0000-0000000000f2"
BUSINESS_PLAN_ID = "00000000-0000-0000-0000-0000000000f3"


def upgrade() -> None:
    op.bulk_insert(
        plans,
        [
            {
                "id": FREE_PLAN_ID,
                "key": "free",
                "name": "Free",
                "price_monthly": 0,
                "price_yearly": 0,
                "max_invoices_per_month": 5,
                "max_templates": 0,
            },
            {
                "id": PRO_PLAN_ID,
                "key": "pro",
                "name": "Pro",
                "price_monthly": 149,
                "price_yearly": 1490,
                "max_invoices_per_month": 100,
                "max_templates": 10,
            },
            {
                "id": BUSINESS_PLAN_ID,
                "key": "business",
                "name": "Business",
                "price_monthly": 399,
                "price_yearly": 3990,
                "max_invoices_per_month": None,
                "max_templates": None,
            },
        ],
    )


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(plans.delete().where(plans.c.id.in_([FREE_PLAN_ID, PRO_PLAN_ID, BUSINESS_PLAN_ID])))
